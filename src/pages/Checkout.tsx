import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  ArrowLeft,
  ArrowRight,
  Check,
  ChevronRight,
  Loader2,
  Lock,
  MapPin,
  Phone,
  ShieldCheck,
  Truck,
  User as UserIcon,
} from 'lucide-react'
import { useCart, useCartTotal, type CartLine } from '@/store/cart'
import { formatPrice } from '@/lib/utils'
import {
  PAYMENT_LABELS,
  SHIPPING_FREE_ABOVE_TSH,
  calcShipping,
  calcTax,
  createOrder,
  type PaymentMethod,
  type ShippingAddress,
} from '@/lib/orders'
import { useSession } from '@/lib/useSession'

type Step = 1 | 2 | 3
type FormErrors = Partial<Record<keyof ShippingAddress, string>> & {
  payment_method?: string
}

const TANZANIA_REGIONS = [
  'Dar es Salaam',
  'Dodoma',
  'Arusha',
  'Mwanza',
  'Mbeya',
  'Tanga',
  'Morogoro',
  'Zanzibar',
  'Mtwara',
  'Iringa',
  'Kagera',
  'Kilimanjaro',
  'Lindi',
  'Manyara',
  'Mara',
  'Pwani',
  'Rukwa',
  'Ruvuma',
  'Shinyanga',
  'Singida',
  'Tabora',
]

const initialShipping: ShippingAddress = {
  recipient_name: '',
  phone: '',
  line1: '',
  line2: '',
  city: '',
  region: 'Dar es Salaam',
  postal_code: '',
  country: 'Tanzania',
}

export default function Checkout() {
  const navigate = useNavigate()
  const lines = useCart((s) => s.lines)
  const subtotal = useCartTotal()
  const clearCart = useCart((s) => s.clear)
  const { user, loading: authLoading, configured } = useSession()

  const [step, setStep] = useState<Step>(1)
  const [shipping, setShipping] = useState<ShippingAddress>(initialShipping)
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('mpesa')
  const [customerNote, setCustomerNote] = useState('')
  const [errors, setErrors] = useState<FormErrors>({})
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)

  // Prefill recipient_name + phone from the auth profile once loaded
  useEffect(() => {
    if (!user) return
    const meta = user.user_metadata ?? {}
    setShipping((s) => ({
      ...s,
      recipient_name: s.recipient_name || (meta.full_name as string) || '',
      phone: s.phone || (meta.phone as string) || '',
    }))
  }, [user])

  const shippingCost = useMemo(
    () => calcShipping(subtotal, shipping.city),
    [subtotal, shipping.city]
  )
  const tax = useMemo(() => calcTax(subtotal), [subtotal])
  const total = subtotal + shippingCost + tax

  // ---------- guards ----------

  if (lines.length === 0) {
    return (
      <section className="max-w-2xl mx-auto px-6 py-24 text-center">
        <h1 className="font-display text-3xl mb-4">Cart ni tupu</h1>
        <p className="text-ink-600 mb-8">
          Ongeza bidhaa kwenye cart kwanza, kisha urudi hapa ulipe.
        </p>
        <Link
          to="/shop"
          className="inline-flex items-center gap-2 bg-ink-900 text-cream-50 font-medium text-sm px-7 py-3.5 rounded-full hover:bg-flame-500 transition-colors"
        >
          <ArrowLeft size={16} />
          Nenda dukani
        </Link>
      </section>
    )
  }

  if (!authLoading && !user) {
    return (
      <section className="max-w-2xl mx-auto px-6 py-24 text-center">
        <Lock className="mx-auto mb-6 text-ink-400" size={48} />
        <h1 className="font-display text-3xl mb-4">Ingia kwanza</h1>
        <p className="text-ink-600 mb-8">
          Unahitaji akaunti kuweka order. Ni sekunde chache tu — magic link
          tutakutumia email yako.
        </p>
        <div className="flex items-center justify-center gap-3">
          <Link
            to="/signin?next=/checkout"
            className="inline-flex items-center gap-2 bg-ink-900 text-cream-50 font-medium text-sm px-7 py-3.5 rounded-full hover:bg-flame-500 transition-colors"
          >
            Ingia / Sajili
            <ArrowRight size={16} />
          </Link>
          <Link
            to="/cart"
            className="text-sm text-ink-500 hover:text-ink-900 transition-colors"
          >
            Rudi kwenye cart
          </Link>
        </div>
      </section>
    )
  }

  if (!configured) {
    return (
      <section className="max-w-2xl mx-auto px-6 py-24 text-center">
        <h1 className="font-display text-3xl mb-4">Backend haijasanidiwa</h1>
        <p className="text-ink-600 mb-2">
          Checkout inahitaji Supabase credentials. Set{' '}
          <code className="bg-ink-100 px-2 py-0.5 rounded">VITE_SUPABASE_URL</code>{' '}
          na{' '}
          <code className="bg-ink-100 px-2 py-0.5 rounded">VITE_SUPABASE_ANON_KEY</code>{' '}
          katika <code className="bg-ink-100 px-2 py-0.5 rounded">.env</code> —
          angalia <code className="bg-ink-100 px-2 py-0.5 rounded">supabase/README.md</code>.
        </p>
      </section>
    )
  }

  // ---------- validation ----------

  function validateAddress(): boolean {
    const e: FormErrors = {}
    if (!shipping.recipient_name.trim()) e.recipient_name = 'Jina linahitajika'
    if (!/^\+?[\d\s-]{7,15}$/.test(shipping.phone.trim()))
      e.phone = 'Nambari ya simu si sahihi'
    if (!shipping.line1.trim()) e.line1 = 'Anwani inahitajika'
    if (!shipping.city.trim()) e.city = 'Mji unahitajika'
    if (!shipping.region) e.region = 'Mkoa unahitajika'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  async function handlePlaceOrder() {
    if (!user) return
    if (!validateAddress()) {
      setStep(1)
      return
    }
    setSubmitting(true)
    setSubmitError(null)

    const result = await createOrder({
      userId: user.id,
      lines,
      shipping,
      paymentMethod,
      customerNote,
    })

    if (!result.ok) {
      setSubmitError(result.message)
      setSubmitting(false)
      return
    }

    clearCart()
    navigate(`/order/${result.order.id}`, { replace: true })
  }

  // ---------- UI ----------

  return (
    <section className="min-h-screen bg-cream-50">
      <div className="max-w-6xl mx-auto px-6 py-12 md:py-16">
        <Link
          to="/cart"
          className="inline-flex items-center gap-2 text-sm font-mono uppercase tracking-[0.2em] text-ink-500 hover:text-flame-600 transition-colors mb-8"
        >
          <ArrowLeft size={14} />
          Rudi kwenye cart
        </Link>

        <h1 className="font-display text-4xl md:text-5xl mb-2">Checkout</h1>
        <p className="text-ink-600 mb-10">
          Malipo yako salama — hatuhifadhi maelezo ya kadi.
        </p>

        {/* Stepper */}
        <Stepper step={step} onStep={setStep} />

        <div className="grid lg:grid-cols-[1fr_380px] gap-10 mt-10">
          {/* LEFT: form column */}
          <div className="space-y-8">
            {step === 1 && (
              <AddressStep
                value={shipping}
                onChange={setShipping}
                errors={errors}
                onNext={() => {
                  if (validateAddress()) setStep(2)
                }}
              />
            )}

            {step === 2 && (
              <PaymentStep
                value={paymentMethod}
                onChange={setPaymentMethod}
                onBack={() => setStep(1)}
                onNext={() => setStep(3)}
                phone={shipping.phone}
              />
            )}

            {step === 3 && (
              <ReviewStep
                lines={lines}
                shipping={shipping}
                paymentMethod={paymentMethod}
                customerNote={customerNote}
                onNoteChange={setCustomerNote}
                onBack={() => setStep(2)}
                onSubmit={handlePlaceOrder}
                submitting={submitting}
                error={submitError}
              />
            )}
          </div>

          {/* RIGHT: order summary */}
          <aside className="lg:sticky lg:top-24 lg:self-start">
            <Summary
              lines={lines}
              subtotal={subtotal}
              shipping={shippingCost}
              tax={tax}
              total={total}
            />
          </aside>
        </div>
      </div>
    </section>
  )
}

// ---------------------------------------------------------------------------
// Stepper
// ---------------------------------------------------------------------------

function Stepper({ step, onStep }: { step: Step; onStep: (s: Step) => void }) {
  const steps: { id: Step; label: string; icon: typeof MapPin }[] = [
    { id: 1, label: 'Anwani', icon: MapPin },
    { id: 2, label: 'Malipo', icon: ShieldCheck },
    { id: 3, label: 'Hakiki', icon: Check },
  ]
  return (
    <ol className="flex items-center gap-2 sm:gap-4">
      {steps.map((s, idx) => {
        const active = s.id === step
        const done = s.id < step
        const Icon = s.icon
        return (
          <li key={s.id} className="flex items-center gap-2 sm:gap-4 flex-1">
            <button
              type="button"
              onClick={() => done && onStep(s.id)}
              disabled={!done}
              className={`flex items-center gap-2 transition-colors ${
                done
                  ? 'text-ink-900 hover:text-flame-600 cursor-pointer'
                  : active
                    ? 'text-ink-900'
                    : 'text-ink-400 cursor-not-allowed'
              }`}
            >
              <span
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors ${
                  done
                    ? 'bg-ink-900 text-cream-50'
                    : active
                      ? 'bg-flame-500 text-cream-50'
                      : 'bg-ink-100 text-ink-400'
                }`}
              >
                {done ? <Check size={14} /> : <Icon size={14} />}
              </span>
              <span className="text-xs sm:text-sm font-mono uppercase tracking-[0.2em] hidden sm:inline">
                {s.label}
              </span>
            </button>
            {idx < steps.length - 1 && (
              <ChevronRight size={16} className="text-ink-300 shrink-0" />
            )}
          </li>
        )
      })}
    </ol>
  )
}

// ---------------------------------------------------------------------------
// Step 1 — Address
// ---------------------------------------------------------------------------

function AddressStep({
  value,
  onChange,
  errors,
  onNext,
}: {
  value: ShippingAddress
  onChange: (v: ShippingAddress) => void
  errors: FormErrors
  onNext: () => void
}) {
  function set<K extends keyof ShippingAddress>(k: K, v: ShippingAddress[K]) {
    onChange({ ...value, [k]: v })
  }
  return (
    <div className="bg-white rounded-3xl p-6 md:p-8 border border-ink-100">
      <h2 className="font-display text-2xl mb-6 flex items-center gap-3">
        <MapPin size={20} className="text-flame-500" />
        Anwani ya kupelekea
      </h2>
      <div className="grid sm:grid-cols-2 gap-4">
        <Field label="Jina la mpokeaji" error={errors.recipient_name}>
          <div className="relative">
            <UserIcon
              size={14}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-400"
            />
            <input
              type="text"
              autoComplete="name"
              value={value.recipient_name}
              onChange={(e) => set('recipient_name', e.target.value)}
              className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-ink-200 focus:border-flame-500 focus:outline-none transition-colors text-sm"
              placeholder="Mfano: Mwijay Davie"
            />
          </div>
        </Field>
        <Field label="Simu" error={errors.phone}>
          <div className="relative">
            <Phone
              size={14}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-400"
            />
            <input
              type="tel"
              autoComplete="tel"
              value={value.phone}
              onChange={(e) => set('phone', e.target.value)}
              className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-ink-200 focus:border-flame-500 focus:outline-none transition-colors text-sm"
              placeholder="+255 7XX XXX XXX"
            />
          </div>
        </Field>
        <Field label="Mtaa / Nyumba" error={errors.line1} wide>
          <input
            type="text"
            autoComplete="address-line1"
            value={value.line1}
            onChange={(e) => set('line1', e.target.value)}
            className="w-full px-3 py-2.5 rounded-xl border border-ink-200 focus:border-flame-500 focus:outline-none transition-colors text-sm"
            placeholder="Mfano: House No. 12, Mwenge"
          />
        </Field>
        <Field label="Mtaa wa ziada (optional)">
          <input
            type="text"
            autoComplete="address-line2"
            value={value.line2 ?? ''}
            onChange={(e) => set('line2', e.target.value)}
            className="w-full px-3 py-2.5 rounded-xl border border-ink-200 focus:border-flame-500 focus:outline-none transition-colors text-sm"
            placeholder="Kituo cha polisi karibu, n.k."
          />
        </Field>
        <Field label="Mji" error={errors.city}>
          <input
            type="text"
            autoComplete="address-level2"
            value={value.city}
            onChange={(e) => set('city', e.target.value)}
            className="w-full px-3 py-2.5 rounded-xl border border-ink-200 focus:border-flame-500 focus:outline-none transition-colors text-sm"
            placeholder="Mfano: Dar es Salaam"
          />
        </Field>
        <Field label="Mkoa" error={errors.region}>
          <select
            value={value.region}
            onChange={(e) => set('region', e.target.value)}
            className="w-full px-3 py-2.5 rounded-xl border border-ink-200 focus:border-flame-500 focus:outline-none transition-colors text-sm bg-white"
          >
            {TANZANIA_REGIONS.map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Code ya posta (optional)">
          <input
            type="text"
            inputMode="numeric"
            value={value.postal_code ?? ''}
            onChange={(e) => set('postal_code', e.target.value)}
            className="w-full px-3 py-2.5 rounded-xl border border-ink-200 focus:border-flame-500 focus:outline-none transition-colors text-sm"
            placeholder="11101"
          />
        </Field>
      </div>
      <p className="mt-4 text-xs text-ink-500 flex items-center gap-1.5">
        <Truck size={12} />
        Usafirishaji ni bure kwa Dar es Salaam & Dodoma. Mikoa mingine TSh{' '}
        {formatPrice(5000).replace('TSh ', '')}.
      </p>
      <div className="mt-6 flex justify-end">
        <button
          type="button"
          onClick={onNext}
          className="group inline-flex items-center gap-2 bg-ink-900 text-cream-50 font-medium text-sm px-7 py-3.5 rounded-full hover:bg-flame-500 transition-colors"
        >
          Endelea kwenye malipo
          <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
        </button>
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Step 2 — Payment
// ---------------------------------------------------------------------------

function PaymentStep({
  value,
  onChange,
  onBack,
  onNext,
  phone,
}: {
  value: PaymentMethod
  onChange: (v: PaymentMethod) => void
  onBack: () => void
  onNext: () => void
  phone: string
}) {
  const methods: { id: PaymentMethod; logo: string; hint: string }[] = [
    { id: 'mpesa',        logo: 'M-Pesa',     hint: 'Tuma kwenda 151515' },
    { id: 'tigopesa',     logo: 'Tigo Pesa',  hint: 'Tuma kwenda 151515' },
    { id: 'airtel_money', logo: 'Airtel',     hint: 'Tuma kwenda 151515' },
    { id: 'card',         logo: 'Card',       hint: 'Visa / Mastercard' },
    { id: 'cod',          logo: 'COD',        hint: 'Lipa pale unapopokea' },
  ]
  return (
    <div className="bg-white rounded-3xl p-6 md:p-8 border border-ink-100">
      <h2 className="font-display text-2xl mb-6 flex items-center gap-3">
        <ShieldCheck size={20} className="text-flame-500" />
        Njia ya malipo
      </h2>
      <div className="grid sm:grid-cols-2 gap-3">
        {methods.map((m) => {
          const active = value === m.id
          return (
            <label
              key={m.id}
              className={`flex items-center gap-4 p-4 rounded-2xl border-2 cursor-pointer transition-colors ${
                active
                  ? 'border-flame-500 bg-flame-50/40'
                  : 'border-ink-100 hover:border-ink-300'
              }`}
            >
              <input
                type="radio"
                name="payment"
                value={m.id}
                checked={active}
                onChange={() => onChange(m.id)}
                className="sr-only"
              />
              <span
                className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${
                  active ? 'border-flame-500' : 'border-ink-300'
                }`}
              >
                {active && <span className="w-2.5 h-2.5 rounded-full bg-flame-500" />}
              </span>
              <div className="flex-1 min-w-0">
                <div className="font-medium text-sm">{PAYMENT_LABELS[m.id]}</div>
                <div className="text-xs text-ink-500">{m.hint}</div>
              </div>
            </label>
          )
        })}
      </div>

      {value !== 'cod' && value !== 'card' && (
        <div className="mt-6 p-4 rounded-2xl bg-ink-50 border border-ink-100">
          <p className="text-sm text-ink-700">
            Utatumiwa maelekezo ya malipo kwa{' '}
            <span className="font-medium">{phone || 'simu yako'}</span>{' '}
            mara tu order itakapowekwa. Thibitisha kwa kuingiza PIN yako
          </p>
        </div>
      )}
      {value === 'cod' && (
        <div className="mt-6 p-4 rounded-2xl bg-amber-50 border border-amber-200">
          <p className="text-sm text-amber-900">
            Utalipa pale unapopokea bidhaa. Tunakuongeza TSh{' '}
            {formatPrice(3000).replace('TSh ', '')} ada ya ziada kwa COD.
          </p>
        </div>
      )}

      <div className="mt-8 flex items-center justify-between">
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center gap-2 text-sm font-mono uppercase tracking-[0.2em] text-ink-500 hover:text-ink-900 transition-colors"
        >
          <ArrowLeft size={14} />
          Rudi
        </button>
        <button
          type="button"
          onClick={onNext}
          className="group inline-flex items-center gap-2 bg-ink-900 text-cream-50 font-medium text-sm px-7 py-3.5 rounded-full hover:bg-flame-500 transition-colors"
        >
          Hakiki order
          <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
        </button>
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Step 3 — Review & place
// ---------------------------------------------------------------------------

function ReviewStep({
  lines,
  shipping,
  paymentMethod,
  customerNote,
  onNoteChange,
  onBack,
  onSubmit,
  submitting,
  error,
}: {
  lines: CartLine[]
  shipping: ShippingAddress
  paymentMethod: PaymentMethod
  customerNote: string
  onNoteChange: (v: string) => void
  onBack: () => void
  onSubmit: () => void
  submitting: boolean
  error: string | null
}) {
  return (
    <div className="bg-white rounded-3xl p-6 md:p-8 border border-ink-100">
      <h2 className="font-display text-2xl mb-6 flex items-center gap-3">
        <Check size={20} className="text-flame-500" />
        Hakiki order yako
      </h2>

      <div className="space-y-5">
        <ReviewBlock label="Anwani ya kupelekea" editHref="#">
          <p className="text-sm">
            <span className="font-medium">{shipping.recipient_name}</span>
            <br />
            {shipping.line1}
            {shipping.line2 && <>, {shipping.line2}</>}
            <br />
            {shipping.city}, {shipping.region}
            {shipping.postal_code && <> {shipping.postal_code}</>}
            <br />
            {shipping.country}
            <br />
            <span className="text-ink-500">{shipping.phone}</span>
          </p>
        </ReviewBlock>

        <ReviewBlock label="Malipo" editHref="#">
          <p className="text-sm">
            {PAYMENT_LABELS[paymentMethod]}
          </p>
        </ReviewBlock>

        <ReviewBlock label="Bidhaa" editHref="#">
          <ul className="space-y-2">
            {lines.map((l) => (
              <li key={`${l.productId}-${l.color.name}`} className="flex items-center gap-3 text-sm">
                <span
                  className="w-3 h-3 rounded-full border border-ink-200 shrink-0"
                  style={{ backgroundColor: l.color.hex }}
                  aria-label={l.color.name}
                />
                <span className="flex-1 min-w-0 truncate">
                  {l.name}{' '}
                  <span className="text-ink-500">× {l.quantity}</span>
                </span>
                <span className="tabular-nums shrink-0">
                  {formatPrice(l.price * l.quantity)}
                </span>
              </li>
            ))}
          </ul>
        </ReviewBlock>

        <div>
          <label className="block text-xs font-mono uppercase tracking-[0.2em] text-ink-500 mb-2">
            Ujumbe wa ziada (optional)
          </label>
          <textarea
            rows={3}
            value={customerNote}
            onChange={(e) => onNoteChange(e.target.value)}
            placeholder="Mfano: Tafadhali piga simu kabla ya kuwasili"
            className="w-full px-3 py-2.5 rounded-xl border border-ink-200 focus:border-flame-500 focus:outline-none transition-colors text-sm resize-none"
          />
        </div>

        {error && (
          <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-sm text-rose-900">
            {error}
          </div>
        )}
      </div>

      <div className="mt-8 flex items-center justify-between">
        <button
          type="button"
          onClick={onBack}
          disabled={submitting}
          className="inline-flex items-center gap-2 text-sm font-mono uppercase tracking-[0.2em] text-ink-500 hover:text-ink-900 transition-colors disabled:opacity-50"
        >
          <ArrowLeft size={14} />
          Rudi
        </button>
        <button
          type="button"
          onClick={onSubmit}
          disabled={submitting}
          className="group inline-flex items-center gap-2 bg-flame-500 text-cream-50 font-medium text-sm px-7 py-3.5 rounded-full hover:bg-flame-600 transition-colors disabled:opacity-60 disabled:cursor-wait"
        >
          {submitting ? (
            <>
              <Loader2 size={16} className="animate-spin" />
              Inaweka order...
            </>
          ) : (
            <>
              Thibitisha order
              <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
            </>
          )}
        </button>
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Sidebar — order summary
// ---------------------------------------------------------------------------

function Summary({
  lines,
  subtotal,
  shipping,
  tax,
  total,
}: {
  lines: CartLine[]
  subtotal: number
  shipping: number
  tax: number
  total: number
}) {
  return (
    <div className="bg-white rounded-3xl p-6 border border-ink-100">
      <h2 className="font-display text-xl mb-5">Muhtasari</h2>
      <ul className="space-y-3 mb-5">
        {lines.map((l) => (
          <li
            key={`${l.productId}-${l.color.name}`}
            className="flex items-center gap-3 text-sm"
          >
            <div className="w-12 h-12 rounded-lg overflow-hidden bg-cream-100 shrink-0">
              <img
                src={l.image}
                alt={l.name}
                className="w-full h-full object-cover"
                loading="lazy"
              />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium truncate">{l.name}</p>
              <p className="text-xs text-ink-500">
                {l.color.name} · × {l.quantity}
              </p>
            </div>
            <span className="tabular-nums shrink-0 text-sm">
              {formatPrice(l.price * l.quantity)}
            </span>
          </li>
        ))}
      </ul>
      <div className="border-t border-ink-100 pt-4 space-y-2 text-sm">
        <Row label="Subtotal" value={formatPrice(subtotal)} />
        <Row
          label="Usafirishaji"
          value={shipping === 0 ? 'Bure' : formatPrice(shipping)}
          valueClass={shipping === 0 ? 'text-emerald-600' : undefined}
        />
        {tax > 0 && <Row label="Kodi" value={formatPrice(tax)} />}
        {subtotal < SHIPPING_FREE_ABOVE_TSH && shipping > 0 && (
          <p className="text-xs text-ink-500 pt-1">
            Ongeza {formatPrice(SHIPPING_FREE_ABOVE_TSH - subtotal)} ili upate
            usafirishaji bure.
          </p>
        )}
      </div>
      <div className="border-t border-ink-100 mt-4 pt-4 flex items-center justify-between">
        <span className="font-medium">Jumla</span>
        <span className="font-display text-2xl tabular-nums">
          {formatPrice(total)}
        </span>
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Tiny helpers
// ---------------------------------------------------------------------------

function Field({
  label,
  error,
  children,
  wide,
}: {
  label: string
  error?: string
  children: React.ReactNode
  wide?: boolean
}) {
  return (
    <div className={wide ? 'sm:col-span-2' : undefined}>
      <label className="block text-xs font-mono uppercase tracking-[0.2em] text-ink-500 mb-1.5">
        {label}
      </label>
      {children}
      {error && <p className="text-xs text-rose-600 mt-1">{error}</p>}
    </div>
  )
}

function Row({
  label,
  value,
  valueClass,
}: {
  label: string
  value: string
  valueClass?: string
}) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-ink-600">{label}</span>
      <span className={`tabular-nums ${valueClass ?? ''}`}>{value}</span>
    </div>
  )
}

function ReviewBlock({
  label,
  editHref,
  children,
}: {
  label: string
  editHref: string
  children: React.ReactNode
}) {
  return (
    <div className="border-b border-ink-100 pb-4 last:border-0">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-mono uppercase tracking-[0.2em] text-ink-500">
          {label}
        </span>
      </div>
      {children}
    </div>
  )
}

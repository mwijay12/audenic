import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import {
  ArrowRight,
  CheckCircle2,
  Copy,
  Loader2,
  Mail,
  Smartphone,
  Truck,
} from 'lucide-react'
import { fetchOrderById, PAYMENT_LABELS, STATUS_LABELS, type OrderWithItems } from '@/lib/orders'
import { formatPrice } from '@/lib/utils'

const PAYOUT_NUMBER = '151515'
const PAYOUT_NAME = 'AUDENIC AUDIO'

export default function OrderConfirmation() {
  const { id } = useParams<{ id: string }>()
  const [order, setOrder] = useState<OrderWithItems | null>(null)
  const [loading, setLoading] = useState(true)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    if (!id) return
    setLoading(true)
    fetchOrderById(id).then((o) => {
      setOrder(o)
      setLoading(false)
    })
  }, [id])

  if (loading) {
    return (
      <section className="min-h-[60vh] flex items-center justify-center">
        <Loader2 size={32} className="animate-spin text-flame-500" />
      </section>
    )
  }

  if (!order) {
    return (
      <section className="max-w-2xl mx-auto px-6 py-24 text-center">
        <h1 className="font-display text-3xl mb-4">Order haijapatikana</h1>
        <p className="text-ink-600 mb-8">
          Order inaweza kuwa imefutwa, au link yake si sahihi.
        </p>
        <Link
          to="/shop"
          className="inline-flex items-center gap-2 bg-ink-900 text-cream-50 font-medium text-sm px-7 py-3.5 rounded-full hover:bg-flame-500 transition-colors"
        >
          Rudi dukani
          <ArrowRight size={16} />
        </Link>
      </section>
    )
  }

  const status = STATUS_LABELS[order.status]
  const isMobileMoney =
    order.payment_method === 'mpesa' ||
    order.payment_method === 'tigopesa' ||
    order.payment_method === 'airtel_money'

  function copyOrderNumber() {
    if (!order) return
    navigator.clipboard.writeText(order.order_number)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <section className="min-h-screen bg-cream-50">
      <div className="max-w-3xl mx-auto px-6 py-16 md:py-24">
        {/* Hero */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-emerald-100 text-emerald-700 mb-5">
            <CheckCircle2 size={32} />
          </div>
          <h1 className="font-display text-4xl md:text-5xl mb-3">
            Asante, {order.shipping_address.recipient_name.split(' ')[0]}!
          </h1>
          <p className="text-ink-600 text-lg">
            Order yako imepokelewa. Tunakuandalia hivi sasa.
          </p>
        </div>

        {/* Order card */}
        <div className="bg-white rounded-3xl p-6 md:p-8 border border-ink-100 mb-6">
          <div className="flex flex-wrap items-start justify-between gap-4 mb-6 pb-6 border-b border-ink-100">
            <div>
              <p className="text-xs font-mono uppercase tracking-[0.2em] text-ink-500 mb-1">
                Nambari ya order
              </p>
              <button
                onClick={copyOrderNumber}
                className="group inline-flex items-center gap-2 font-display text-2xl hover:text-flame-600 transition-colors"
                title="Bofya kunakili"
              >
                {order.order_number}
                <Copy
                  size={16}
                  className="text-ink-400 group-hover:text-flame-500 transition-colors"
                />
                {copied && (
                  <span className="text-xs font-mono text-emerald-600 normal-case tracking-normal">
                    imenakiliwa
                  </span>
                )}
              </button>
            </div>
            <span
              className={`inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-full ${status.tone}`}
            >
              {status.sw}
            </span>
          </div>

          {/* Payment instructions */}
          {isMobileMoney && (
            <PaymentInstructions order={order} />
          )}
          {order.payment_method === 'cod' && (
            <CodInstructions order={order} />
          )}
          {order.payment_method === 'card' && (
            <CardInstructions />
          )}

          {/* Items */}
          <div className="mt-8 pt-6 border-t border-ink-100">
            <h2 className="font-display text-lg mb-4">Bidhaa</h2>
            <ul className="space-y-3">
              {order.items.map((it) => (
                <li
                  key={it.id}
                  className="flex items-center gap-3 text-sm"
                >
                  <div className="w-12 h-12 rounded-lg overflow-hidden bg-cream-100 shrink-0">
                    {it.product_image && (
                      <img
                        src={it.product_image}
                        alt={it.product_name}
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{it.product_name}</p>
                    <p className="text-xs text-ink-500">
                      {it.color_name} · × {it.quantity}
                    </p>
                  </div>
                  <span className="tabular-nums shrink-0">
                    {formatPrice(it.line_total_tsh)}
                  </span>
                </li>
              ))}
            </ul>
            <dl className="mt-6 space-y-2 text-sm">
              <Row label="Subtotal" value={formatPrice(order.subtotal_tsh)} />
              <Row
                label="Usafirishaji"
                value={
                  order.shipping_tsh === 0
                    ? 'Bure'
                    : formatPrice(order.shipping_tsh)
                }
              />
              {order.tax_tsh > 0 && (
                <Row label="Kodi" value={formatPrice(order.tax_tsh)} />
              )}
              <div className="pt-2 border-t border-ink-100 flex items-center justify-between">
                <dt className="font-medium">Jumla</dt>
                <dd className="font-display text-2xl tabular-nums">
                  {formatPrice(order.total_tsh)}
                </dd>
              </div>
            </dl>
          </div>

          {/* Shipping address */}
          <div className="mt-8 pt-6 border-t border-ink-100">
            <h2 className="font-display text-lg mb-3">Anwani ya kupelekea</h2>
            <p className="text-sm text-ink-700">
              {order.shipping_address.recipient_name}
              <br />
              {order.shipping_address.line1}
              {order.shipping_address.line2 && <>, {order.shipping_address.line2}</>}
              <br />
              {order.shipping_address.city}, {order.shipping_address.region}
              {order.shipping_address.postal_code && (
                <> {order.shipping_address.postal_code}</>
              )}
              <br />
              {order.shipping_address.country}
              <br />
              <span className="text-ink-500">{order.shipping_address.phone}</span>
            </p>
          </div>
        </div>

        {/* What's next */}
        <div className="bg-white rounded-3xl p-6 md:p-8 border border-ink-100">
          <h2 className="font-display text-lg mb-4">Hatua zinazofuata</h2>
          <ol className="space-y-4">
            <NextStep
              icon={Mail}
              title="Thibitisha email yako"
              text={`Tumekutumia confirmation kwa ${order.shipping_address.recipient_name}. Angalia spam kama huioni.`}
            />
            <NextStep
              icon={isMobileMoney ? Smartphone : Truck}
              title={
                isMobileMoney
                  ? 'Lipa kwa simu'
                  : order.payment_method === 'cod'
                    ? 'Tupeleke order yako'
                    : 'Malipo yanasubiriwa'
              }
              text={
                isMobileMoney
                  ? `Tuma ${formatPrice(order.total_tsh)} kwenda ${PAYOUT_NUMBER}. Order itasubiri malipo hadi kesho alasiri.`
                  : order.payment_method === 'cod'
                    ? 'Tutakupigia simu kabla ya kufunga delivery yako ndani ya saa 24.'
                    : 'Tunasubiri malipo yako kuthibitishwa.'
              }
            />
            <NextStep
              icon={Truck}
              title="Delivery"
              text="Dar es Salaam & Dodoma: 1-2 siku. Mikoa mingine: 3-5 siku. Utapata tracking code kwa SMS."
            />
          </ol>
        </div>

        {/* Footer links */}
        <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
          <Link
            to="/account"
            className="inline-flex items-center gap-2 bg-ink-900 text-cream-50 font-medium text-sm px-6 py-3 rounded-full hover:bg-flame-500 transition-colors"
          >
            Angalia orders zangu
            <ArrowRight size={16} />
          </Link>
          <Link
            to="/shop"
            className="text-sm text-ink-500 hover:text-ink-900 transition-colors"
          >
            Endelea kununua
          </Link>
        </div>
      </div>
    </section>
  )
}

// ---------------------------------------------------------------------------
// Payment instructions per method
// ---------------------------------------------------------------------------

function PaymentInstructions({ order }: { order: OrderWithItems }) {
  const method = order.payment_method as 'mpesa' | 'tigopesa' | 'airtel_money'
  return (
    <div className="rounded-2xl bg-flame-50/50 border border-flame-200 p-5">
      <h2 className="font-medium text-sm flex items-center gap-2 mb-3">
        <Smartphone size={16} className="text-flame-600" />
        Malipo kwa {PAYMENT_LABELS[method]}
      </h2>
      <ol className="space-y-2 text-sm text-ink-800">
        <li>
          <span className="inline-flex w-5 h-5 rounded-full bg-ink-900 text-cream-50 text-xs items-center justify-center mr-2">
            1
          </span>
          Fungua menu ya {PAYMENT_LABELS[method]} kwenye simu yako
        </li>
        <li>
          <span className="inline-flex w-5 h-5 rounded-full bg-ink-900 text-cream-50 text-xs items-center justify-center mr-2">
            2
          </span>
          Chagua "Tuma Pesa" / "Send Money"
        </li>
        <li>
          <span className="inline-flex w-5 h-5 rounded-full bg-ink-900 text-cream-50 text-xs items-center justify-center mr-2">
            3
          </span>
          Nambari: <code className="font-mono font-semibold">{PAYOUT_NUMBER}</code>{' '}
          ({PAYOUT_NAME})
        </li>
        <li>
          <span className="inline-flex w-5 h-5 rounded-full bg-ink-900 text-cream-50 text-xs items-center justify-center mr-2">
            4
          </span>
          Kiasi: <code className="font-mono font-semibold">{formatPrice(order.total_tsh)}</code>
        </li>
        <li>
          <span className="inline-flex w-5 h-5 rounded-full bg-ink-900 text-cream-50 text-xs items-center justify-center mr-2">
            5
          </span>
          Weka PIN yako kuthibitisha
        </li>
      </ol>
      <p className="text-xs text-ink-600 mt-4">
        Tutatuma receipt yako kwa email na SMS mara tu malipo yatakapothibitishwa.
        Wasiliana nasi kwa{' '}
        <a href="tel:+255700000000" className="underline">
          +255 700 000 000
        </a>{' '}
        kama una swali.
      </p>
    </div>
  )
}

function CodInstructions({ order }: { order: OrderWithItems }) {
  return (
    <div className="rounded-2xl bg-amber-50 border border-amber-200 p-5">
      <h2 className="font-medium text-sm flex items-center gap-2 mb-2">
        <Truck size={16} className="text-amber-700" />
        Cash on Delivery
      </h2>
      <p className="text-sm text-amber-900">
        Utalipa <strong>{formatPrice(order.total_tsh)}</strong> pale unapopokea
        bidhaa. Tafadhali andaika pia{' '}
        <code className="font-mono">{order.order_number}</code> wakati wa
        malipo.
      </p>
    </div>
  )
}

function CardInstructions() {
  return (
    <div className="rounded-2xl bg-blue-50 border border-blue-200 p-5">
      <p className="text-sm text-blue-900">
        Uko karibu kumaliza — bonyeza kiungo cha malipo tulichokutumia kwa
        email ili ukamilishe malipo yako kwa kadi.
      </p>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Tiny helpers
// ---------------------------------------------------------------------------

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between">
      <dt className="text-ink-600">{label}</dt>
      <dd className="tabular-nums">{value}</dd>
    </div>
  )
}

function NextStep({
  icon: Icon,
  title,
  text,
}: {
  icon: typeof Mail
  title: string
  text: string
}) {
  return (
    <li className="flex items-start gap-3">
      <span className="w-8 h-8 rounded-full bg-ink-50 text-ink-700 flex items-center justify-center shrink-0 mt-0.5">
        <Icon size={14} />
      </span>
      <div>
        <p className="font-medium text-sm">{title}</p>
        <p className="text-sm text-ink-600 mt-0.5">{text}</p>
      </div>
    </li>
  )
}

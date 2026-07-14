import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  ArrowRight,
  Loader2,
  Lock,
  LogOut,
  Mail,
  Package,
  User as UserIcon,
  Plus,
  Trash2,
  CheckCircle,
  MapPin,
  Check,
  Heart,
  ShoppingBag,
} from 'lucide-react'
import {
  fetchMyOrders,
  PAYMENT_LABELS,
  STATUS_LABELS,
  type OrderWithItems,
} from '@/lib/orders'
import { useSession } from '@/lib/useSession'
import { supabase } from '@/lib/supabase'
import { formatPrice } from '@/lib/utils'
import { useWishlist } from '@/store/wishlist'
import { products, extraProducts } from '@/data/products'
import { useCart } from '@/store/cart'

export default function Account() {
  const { user, loading: authLoading, configured } = useSession()
  const [orders, setOrders] = useState<OrderWithItems[]>([])
  const [loadingOrders, setLoadingOrders] = useState(true)

  // Tabs
  const [activeTab, setActiveTab] = useState<'orders' | 'profile' | 'addresses' | 'wishlist'>('orders')
  const wishlistIds = useWishlist((s) => s.productIds)
  const toggleWishlist = useWishlist((s) => s.toggle)
  const addToCart = useCart((s) => s.add)
  const allProducts = [...products, ...extraProducts]
  const wishlistedProducts = allProducts.filter((p) => wishlistIds.includes(p.id))

  // Profile fields
  const [profile, setProfile] = useState({
    full_name: '',
    phone: '',
    marketing_opt_in: false,
  })
  const [loadingProfile, setLoadingProfile] = useState(true)
  const [savingProfile, setSavingProfile] = useState(false)
  const [profileMsg, setProfileMsg] = useState({ text: '', type: 'success' })

  // Address fields
  const [addresses, setAddresses] = useState<any[]>([])
  const [loadingAddresses, setLoadingAddresses] = useState(true)
  const [savingAddress, setSavingAddress] = useState(false)
  const [showAddressForm, setShowAddressForm] = useState(false)
  const [editingAddressId, setEditingAddressId] = useState<string | null>(null)
  const [addressForm, setAddressForm] = useState({
    recipient_name: '',
    phone: '',
    line1: '',
    line2: '',
    city: 'Dar es Salaam',
    region: 'Dar es Salaam',
    postal_code: '',
    country: 'Tanzania',
    is_default: false,
    label: 'Nyumbani',
  })

  // Load orders, profile and addresses
  useEffect(() => {
    if (!user) {
      setLoadingOrders(false)
      return
    }

    // Load orders
    setLoadingOrders(true)
    fetchMyOrders().then((rows) => {
      setOrders(rows)
      setLoadingOrders(false)
    })

    // Load Profile & Addresses
    const isDemo = Boolean(localStorage.getItem('audenic-demo-session'))
    if (isDemo) {
      // Demo load
      const stored = localStorage.getItem('audenic-demo-session')
      if (stored) {
        const u = JSON.parse(stored)
        setProfile({
          full_name: u.user_metadata?.full_name || '',
          phone: u.user_metadata?.phone || '',
          marketing_opt_in: u.user_metadata?.marketing_opt_in || false,
        })
      }
      setLoadingProfile(false)

      const addrStored = localStorage.getItem('audenic-demo-addresses')
      if (addrStored) {
        setAddresses(JSON.parse(addrStored))
      } else {
        const defaultAddresses = [
          {
            id: 'addr-1',
            recipient_name: 'Mwijay Davie',
            phone: '+255 790 942 616',
            line1: 'Plot 45, Mikocheni B',
            line2: 'Karibu na Kibo Complex',
            city: 'Dar es Salaam',
            region: 'Dar es Salaam',
            postal_code: '14112',
            country: 'Tanzania',
            is_default: true,
            label: 'Nyumbani',
          },
        ]
        setAddresses(defaultAddresses)
        localStorage.setItem('audenic-demo-addresses', JSON.stringify(defaultAddresses))
      }
      setLoadingAddresses(false)
    } else {
      // Supabase load
      setLoadingProfile(true)
      setLoadingAddresses(true)

      supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .maybeSingle()
        .then(({ data }) => {
          if (data) {
            setProfile({
              full_name: data.full_name || '',
              phone: data.phone || '',
              marketing_opt_in: data.marketing_opt_in || false,
            })
          }
          setLoadingProfile(false)
        })

      supabase
        .from('addresses')
        .select('*')
        .eq('user_id', user.id)
        .order('is_default', { ascending: false })
        .then(({ data }) => {
          if (data) {
            setAddresses(data)
          }
          setLoadingAddresses(false)
        })
    }
  }, [user])

  // Profile Save
  async function handleSaveProfile(e: React.FormEvent) {
    e.preventDefault()
    setSavingProfile(true)
    setProfileMsg({ text: '', type: 'success' })

    const isDemo = Boolean(localStorage.getItem('audenic-demo-session'))
    if (isDemo) {
      const stored = localStorage.getItem('audenic-demo-session')
      if (stored) {
        const u = JSON.parse(stored)
        u.user_metadata = {
          ...u.user_metadata,
          full_name: profile.full_name,
          phone: profile.phone,
          marketing_opt_in: profile.marketing_opt_in,
        }
        localStorage.setItem('audenic-demo-session', JSON.stringify(u))
        window.dispatchEvent(new Event('audenic-demo-auth-change'))
      }
      setProfileMsg({ text: 'Profile imesasishwa kikamilifu!', type: 'success' })
      setSavingProfile(false)
    } else {
      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: profile.full_name,
          phone: profile.phone,
          marketing_opt_in: profile.marketing_opt_in,
        })
        .eq('id', user!.id)

      if (error) {
        setProfileMsg({ text: 'Hitilafu imetokea: ' + error.message, type: 'error' })
      } else {
        setProfileMsg({ text: 'Profile imesasishwa kikamilifu!', type: 'success' })
      }
      setSavingProfile(false)
    }
  }

  // Address Actions
  async function handleSaveAddress(e: React.FormEvent) {
    e.preventDefault()
    setSavingAddress(true)

    const isDemo = Boolean(localStorage.getItem('audenic-demo-session'))
    let updatedAddresses = [...addresses]

    if (addressForm.is_default) {
      updatedAddresses = updatedAddresses.map((a) => ({ ...a, is_default: false }))
    }

    if (isDemo) {
      if (editingAddressId) {
        updatedAddresses = updatedAddresses.map((a) =>
          a.id === editingAddressId ? { ...a, ...addressForm, id: editingAddressId } : a
        )
      } else {
        const newAddress = {
          ...addressForm,
          id: `addr-${Date.now()}`,
        }
        updatedAddresses.push(newAddress)
      }
      updatedAddresses.sort((a, b) => (a.is_default ? -1 : b.is_default ? 1 : 0))
      setAddresses(updatedAddresses)
      localStorage.setItem('audenic-demo-addresses', JSON.stringify(updatedAddresses))
      setSavingAddress(false)
      setShowAddressForm(false)
      setEditingAddressId(null)
    } else {
      if (addressForm.is_default) {
        await supabase.from('addresses').update({ is_default: false }).eq('user_id', user!.id)
      }

      if (editingAddressId) {
        await supabase.from('addresses').update(addressForm).eq('id', editingAddressId)
      } else {
        await supabase.from('addresses').insert({ ...addressForm, user_id: user!.id })
      }

      // Reload
      const { data } = await supabase
        .from('addresses')
        .select('*')
        .eq('user_id', user!.id)
        .order('is_default', { ascending: false })
      if (data) setAddresses(data)

      setSavingAddress(false)
      setShowAddressForm(false)
      setEditingAddressId(null)
    }
  }

  async function handleDeleteAddress(id: string) {
    const isDemo = Boolean(localStorage.getItem('audenic-demo-session'))
    if (isDemo) {
      const updated = addresses.filter((a) => a.id !== id)
      setAddresses(updated)
      localStorage.setItem('audenic-demo-addresses', JSON.stringify(updated))
    } else {
      const { error } = await supabase.from('addresses').delete().eq('id', id)
      if (error) {
        alert('Imeshindikana kufuta anwani.')
      } else {
        setAddresses(addresses.filter((a) => a.id !== id))
      }
    }
  }

  async function handleSetDefaultAddress(id: string) {
    const isDemo = Boolean(localStorage.getItem('audenic-demo-session'))
    if (isDemo) {
      const updated = addresses.map((a) => ({
        ...a,
        is_default: a.id === id,
      }))
      setAddresses(updated)
      localStorage.setItem('audenic-demo-addresses', JSON.stringify(updated))
    } else {
      await supabase.from('addresses').update({ is_default: false }).eq('user_id', user!.id)
      await supabase.from('addresses').update({ is_default: true }).eq('id', id)
      const { data } = await supabase
        .from('addresses')
        .select('*')
        .eq('user_id', user!.id)
        .order('is_default', { ascending: false })
      if (data) setAddresses(data)
    }
  }

  // ---------- guards ----------

  if (authLoading) {
    return (
      <section className="min-h-[60vh] flex items-center justify-center">
        <Loader2 size={32} className="animate-spin text-flame-500" />
      </section>
    )
  }

  if (!user) {
    return (
      <section className="max-w-2xl mx-auto px-6 py-24 text-center">
        <Lock className="mx-auto mb-6 text-ink-400" size={48} />
        <h1 className="font-display text-3xl mb-4">Akaunti yako</h1>
        <p className="text-ink-600 mb-8">
          Ingia ili kuona orders zako, anwani, na profile yako.
        </p>
        <Link
          to="/signin?next=/account"
          className="inline-flex items-center gap-2 bg-ink-900 text-cream-50 font-medium text-sm px-7 py-3.5 rounded-full hover:bg-flame-500 transition-colors"
        >
          Ingia / Sajili
          <ArrowRight size={16} />
        </Link>
      </section>
    )
  }

  if (!configured) {
    return (
      <section className="max-w-2xl mx-auto px-6 py-24 text-center">
        <h1 className="font-display text-3xl mb-4">Backend haijasanidiwa</h1>
        <p className="text-ink-600">
          Supabase env vars hazipo. Angalia <code className="bg-ink-100 px-2 py-0.5 rounded">.env</code>.
        </p>
      </section>
    )
  }

  const displayName =
    (user.user_metadata?.full_name as string) ||
    user.email?.split('@')[0] ||
    'Rafiki'
  const initials = displayName
    .split(' ')
    .map((n) => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()

  async function handleSignOut() {
    if (localStorage.getItem('audenic-demo-session')) {
      localStorage.removeItem('audenic-demo-session')
      window.dispatchEvent(new Event('audenic-demo-auth-change'))
    } else {
      await supabase.auth.signOut()
    }
  }

  return (
    <section className="min-h-screen bg-cream-50">
      <div className="max-w-5xl mx-auto px-6 py-12 md:py-16">
        <h1 className="font-display text-4xl md:text-5xl mb-2">Akaunti yangu</h1>
        <p className="text-ink-600 mb-10">Karibu tena, {displayName}.</p>

        <div className="grid lg:grid-cols-[280px_1fr] gap-8">
          {/* Sidebar */}
          <aside className="bg-white rounded-3xl p-6 border border-ink-100 h-fit lg:sticky lg:top-24">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-12 h-12 rounded-full bg-ink-900 text-cream-50 font-medium flex items-center justify-center">
                {initials}
              </div>
              <div className="min-w-0">
                <p className="font-medium truncate">{displayName}</p>
                <p className="text-xs text-ink-500 truncate">{user.email}</p>
              </div>
            </div>
            <ul className="space-y-1 text-sm">
              <SideLink
                icon={Package}
                label="Orders"
                active={activeTab === 'orders'}
                onClick={() => setActiveTab('orders')}
              />
              <SideLink
                icon={UserIcon}
                label="Profile"
                active={activeTab === 'profile'}
                onClick={() => setActiveTab('profile')}
              />
              <SideLink
                icon={Mail}
                label="Anwani"
                active={activeTab === 'addresses'}
                onClick={() => setActiveTab('addresses')}
              />
              <SideLink
                icon={Heart}
                label="Vipendwa"
                active={activeTab === 'wishlist'}
                onClick={() => setActiveTab('wishlist')}
              />
            </ul>
            <button
              onClick={handleSignOut}
              className="mt-5 w-full inline-flex items-center justify-center gap-2 text-sm font-mono uppercase tracking-[0.2em] text-ink-500 hover:text-flame-600 transition-colors py-2"
            >
              <LogOut size={14} />
              Toka
            </button>
          </aside>

          {/* Main column */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-ink-100">
            {activeTab === 'orders' && (
              <div>
                <div className="flex items-center justify-between mb-6">
                  <h2 className="font-display text-2xl">Orders zako</h2>
                  <span className="text-sm font-mono text-ink-500">
                    {orders.length} {orders.length === 1 ? 'order' : 'orders'}
                  </span>
                </div>

                {loadingOrders ? (
                  <div className="flex items-center justify-center py-20">
                    <Loader2 size={24} className="animate-spin text-flame-500" />
                  </div>
                ) : orders.length === 0 ? (
                  <EmptyOrders />
                ) : (
                  <ul className="space-y-4">
                    {orders.map((o) => (
                      <OrderRow key={o.id} order={o} />
                    ))}
                  </ul>
                )}
              </div>
            )}

            {activeTab === 'profile' && (
              <div>
                <h2 className="font-display text-2xl mb-6">Taarifa za Profile</h2>
                {loadingProfile ? (
                  <div className="flex items-center justify-center py-20">
                    <Loader2 size={24} className="animate-spin text-flame-500" />
                  </div>
                ) : (
                  <form onSubmit={handleSaveProfile} className="space-y-5">
                    {profileMsg.text && (
                      <div
                        className={`p-4 rounded-2xl text-sm flex items-center gap-2 ${
                          profileMsg.type === 'success'
                            ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                            : 'bg-rose-50 text-rose-800 border border-rose-200'
                        }`}
                      >
                        <CheckCircle size={16} />
                        {profileMsg.text}
                      </div>
                    )}
                    <div>
                      <label className="block text-xs font-mono uppercase tracking-[0.2em] text-ink-500 mb-1.5">
                        Email Address (Haiwezi kubadilishwa)
                      </label>
                      <input
                        type="email"
                        disabled
                        value={user.email || ''}
                        className="w-full px-4 py-2.5 rounded-xl border border-ink-100 bg-ink-50 text-ink-400 text-sm cursor-not-allowed"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-mono uppercase tracking-[0.2em] text-ink-500 mb-1.5">
                        Jina Kamili
                      </label>
                      <input
                        type="text"
                        required
                        value={profile.full_name}
                        onChange={(e) => setProfile((p) => ({ ...p, full_name: e.target.value }))}
                        className="w-full px-4 py-2.5 rounded-xl border border-ink-200 focus:border-flame-500 focus:outline-none transition-colors text-sm"
                        placeholder="Ingiza jina lako"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-mono uppercase tracking-[0.2em] text-ink-500 mb-1.5">
                        Namba ya Simu
                      </label>
                      <input
                        type="tel"
                        required
                        value={profile.phone}
                        onChange={(e) => setProfile((p) => ({ ...p, phone: e.target.value }))}
                        className="w-full px-4 py-2.5 rounded-xl border border-ink-200 focus:border-flame-500 focus:outline-none transition-colors text-sm"
                        placeholder="Mfano: +255 712 345 678"
                      />
                    </div>
                    <div className="flex items-start gap-3 pt-2">
                      <input
                        id="marketing"
                        type="checkbox"
                        checked={profile.marketing_opt_in}
                        onChange={(e) =>
                          setProfile((p) => ({ ...p, marketing_opt_in: e.target.checked }))
                        }
                        className="mt-1 rounded border-ink-300 text-flame-500 focus:ring-flame-500"
                      />
                      <label htmlFor="marketing" className="text-xs text-ink-600 leading-normal">
                        Ninakubali kupokea taarifa za bidhaa mpya, matangazo, na punguzo la bei kutoka Audenic Audio.
                      </label>
                    </div>
                    <button
                      type="submit"
                      disabled={savingProfile}
                      className="inline-flex items-center gap-2 bg-ink-900 text-cream-50 font-medium text-sm px-6 py-3 rounded-full hover:bg-flame-500 transition-colors disabled:opacity-60"
                    >
                      {savingProfile ? (
                        <>
                          <Loader2 size={16} className="animate-spin" />
                          Inahifadhi...
                        </>
                      ) : (
                        'Hifadhi Taarifa'
                      )}
                    </button>
                  </form>
                )}
              </div>
            )}

            {activeTab === 'addresses' && (
              <div>
                <div className="flex items-center justify-between mb-6">
                  <h2 className="font-display text-2xl">Anwani za Usafirishaji</h2>
                  {!showAddressForm && (
                    <button
                      onClick={() => {
                        setEditingAddressId(null)
                        setAddressForm({
                          recipient_name: '',
                          phone: '',
                          line1: '',
                          line2: '',
                          city: 'Dar es Salaam',
                          region: 'Dar es Salaam',
                          postal_code: '',
                          country: 'Tanzania',
                          is_default: addresses.length === 0,
                          label: 'Nyumbani',
                        })
                        setShowAddressForm(true)
                      }}
                      className="inline-flex items-center gap-1 bg-ink-900 text-cream-50 font-medium text-xs px-4 py-2 rounded-full hover:bg-flame-500 transition-colors"
                    >
                      <Plus size={14} />
                      Weka Mpya
                    </button>
                  )}
                </div>

                {loadingAddresses ? (
                  <div className="flex items-center justify-center py-20">
                    <Loader2 size={24} className="animate-spin text-flame-500" />
                  </div>
                ) : showAddressForm ? (
                  <form onSubmit={handleSaveAddress} className="space-y-4">
                    <h3 className="text-sm font-semibold text-ink-700">
                      {editingAddressId ? 'Hariri Anwani' : 'Ongeza Anwani Mpya'}
                    </h3>
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-mono uppercase tracking-[0.2em] text-ink-500 mb-1.5">
                          Jina la Mpokeaji
                        </label>
                        <input
                          type="text"
                          required
                          value={addressForm.recipient_name}
                          onChange={(e) =>
                            setAddressForm((f) => ({ ...f, recipient_name: e.target.value }))
                          }
                          className="w-full px-4 py-2 rounded-xl border border-ink-200 text-sm focus:border-flame-500 focus:outline-none"
                          placeholder="Jina la mpokeaji"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-mono uppercase tracking-[0.2em] text-ink-500 mb-1.5">
                          Namba ya Simu
                        </label>
                        <input
                          type="tel"
                          required
                          value={addressForm.phone}
                          onChange={(e) => setAddressForm((f) => ({ ...f, phone: e.target.value }))}
                          className="w-full px-4 py-2 rounded-xl border border-ink-200 text-sm focus:border-flame-500 focus:outline-none"
                          placeholder="Mfano: +255 712 345 678"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-mono uppercase tracking-[0.2em] text-ink-500 mb-1.5">
                        Mtaa / Namba ya Nyumba (Line 1)
                      </label>
                      <input
                        type="text"
                        required
                        value={addressForm.line1}
                        onChange={(e) => setAddressForm((f) => ({ ...f, line1: e.target.value }))}
                        className="w-full px-4 py-2 rounded-xl border border-ink-200 text-sm focus:border-flame-500 focus:outline-none"
                        placeholder="Mtaa, nyumba, ghorofa..."
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-mono uppercase tracking-[0.2em] text-ink-500 mb-1.5">
                        Eneo / Maelezo Zaidi (Line 2)
                      </label>
                      <input
                        type="text"
                        value={addressForm.line2}
                        onChange={(e) => setAddressForm((f) => ({ ...f, line2: e.target.value }))}
                        className="w-full px-4 py-2 rounded-xl border border-ink-200 text-sm focus:border-flame-500 focus:outline-none"
                        placeholder="Neighborhood, karibu na alama fulani (hiari)"
                      />
                    </div>

                    <div className="grid sm:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-xs font-mono uppercase tracking-[0.2em] text-ink-500 mb-1.5">
                          Mji
                        </label>
                        <input
                          type="text"
                          required
                          value={addressForm.city}
                          onChange={(e) => setAddressForm((f) => ({ ...f, city: e.target.value }))}
                          className="w-full px-4 py-2 rounded-xl border border-ink-200 text-sm focus:border-flame-500 focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-mono uppercase tracking-[0.2em] text-ink-500 mb-1.5">
                          Mkoa
                        </label>
                        <input
                          type="text"
                          required
                          value={addressForm.region}
                          onChange={(e) =>
                            setAddressForm((f) => ({ ...f, region: e.target.value }))
                          }
                          className="w-full px-4 py-2 rounded-xl border border-ink-200 text-sm focus:border-flame-500 focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-mono uppercase tracking-[0.2em] text-ink-500 mb-1.5">
                          Lebo (Label)
                        </label>
                        <select
                          value={addressForm.label}
                          onChange={(e) => setAddressForm((f) => ({ ...f, label: e.target.value }))}
                          className="w-full px-4 py-2 rounded-xl border border-ink-200 text-sm focus:border-flame-500 focus:outline-none bg-white"
                        >
                          <option value="Nyumbani">Nyumbani</option>
                          <option value="Ofisini">Ofisini</option>
                          <option value="Nyingine">Nyingine</option>
                        </select>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 pt-2">
                      <input
                        id="is_default"
                        type="checkbox"
                        checked={addressForm.is_default}
                        onChange={(e) =>
                          setAddressForm((f) => ({ ...f, is_default: e.target.checked }))
                        }
                        className="rounded border-ink-300 text-flame-500 focus:ring-flame-500"
                      />
                      <label htmlFor="is_default" className="text-xs text-ink-600">
                        Weka hii kama anwani ya msingi (Default address)
                      </label>
                    </div>

                    <div className="flex gap-3 pt-4">
                      <button
                        type="submit"
                        disabled={savingAddress}
                        className="bg-ink-900 text-cream-50 font-medium text-xs px-5 py-2.5 rounded-full hover:bg-flame-500 transition-colors disabled:opacity-60"
                      >
                        {savingAddress ? 'Inahifadhi...' : 'Hifadhi Anwani'}
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setShowAddressForm(false)
                          setEditingAddressId(null)
                        }}
                        className="border border-ink-200 text-ink-700 font-medium text-xs px-5 py-2.5 rounded-full hover:bg-ink-50 transition-colors"
                      >
                        Ghairi
                      </button>
                    </div>
                  </form>
                ) : addresses.length === 0 ? (
                  <div className="text-center py-12 border border-dashed border-ink-200 rounded-3xl">
                    <MapPin className="mx-auto text-ink-300 mb-3" size={32} />
                    <p className="text-sm text-ink-500">Huna anwani yoyote iliyohifadhiwa bado.</p>
                  </div>
                ) : (
                  <ul className="grid sm:grid-cols-2 gap-4">
                    {addresses.map((a) => (
                      <li
                        key={a.id}
                        className={`p-5 rounded-3xl border transition-all flex flex-col justify-between ${
                          a.is_default
                            ? 'bg-cream-100/50 border-ink-900/35 shadow-sm'
                            : 'bg-white border-ink-100 hover:border-ink-200'
                        }`}
                      >
                        <div>
                          <div className="flex items-center justify-between mb-3">
                            <span className="font-mono text-[10px] uppercase tracking-wider text-ink-500 bg-ink-50 px-2 py-0.5 rounded">
                              {a.label || 'Anwani'}
                            </span>
                            {a.is_default && (
                              <span className="text-[10px] font-medium text-flame-600 bg-flame-500/10 px-2 py-0.5 rounded-full flex items-center gap-1">
                                <Check size={10} />
                                Msingi
                              </span>
                            )}
                          </div>
                          <p className="font-semibold text-sm mb-1">{a.recipient_name}</p>
                          <p className="text-xs text-ink-500 mb-3">{a.phone}</p>
                          <p className="text-xs text-ink-600 leading-relaxed">
                            {a.line1}
                            {a.line2 && <>, {a.line2}</>}
                            <br />
                            {a.city}, {a.region}
                            {a.postal_code && <> - {a.postal_code}</>}
                            <br />
                            {a.country}
                          </p>
                        </div>
                        <div className="flex gap-3 pt-4 border-t border-ink-100 mt-4 justify-between items-center">
                          {!a.is_default ? (
                            <button
                              onClick={() => handleSetDefaultAddress(a.id)}
                              className="text-[10px] font-mono uppercase tracking-wider text-ink-500 hover:text-ink-900 transition-colors"
                            >
                              Weka Msingi
                            </button>
                          ) : (
                            <span />
                          )}
                          <div className="flex gap-2">
                            <button
                              onClick={() => {
                                setEditingAddressId(a.id)
                                setAddressForm({
                                  recipient_name: a.recipient_name,
                                  phone: a.phone,
                                  line1: a.line1,
                                  line2: a.line2 || '',
                                  city: a.city,
                                  region: a.region,
                                  postal_code: a.postal_code || '',
                                  country: a.country || 'Tanzania',
                                  is_default: a.is_default,
                                  label: a.label || 'Nyumbani',
                                })
                                setShowAddressForm(true)
                              }}
                              className="text-xs text-ink-600 hover:text-ink-900"
                            >
                              Hariri
                            </button>
                            <button
                              onClick={() => handleDeleteAddress(a.id)}
                              className="text-xs text-rose-600 hover:text-rose-700"
                            >
                              Futa
                            </button>
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}

            {activeTab === 'wishlist' && (
              <div>
                <h2 className="font-display text-2xl mb-6">Bidhaa Unazozipenda</h2>
                {wishlistedProducts.length === 0 ? (
                  <div className="text-center py-16 border border-dashed border-ink-200 rounded-3xl">
                    <Heart className="mx-auto text-ink-300 mb-3" size={32} />
                    <p className="text-sm text-ink-500 mb-6">Hujapenda bidhaa yoyote bado.</p>
                    <Link
                      to="/shop"
                      className="inline-flex items-center gap-2 bg-ink-900 text-cream-50 font-medium text-xs px-6 py-2.5 rounded-full hover:bg-flame-500 transition-colors"
                    >
                      Nenda dukani
                      <ArrowRight size={12} />
                    </Link>
                  </div>
                ) : (
                  <ul className="space-y-4">
                    {wishlistedProducts.map((p) => (
                      <li
                        key={p.id}
                        className="p-4 rounded-3xl border border-ink-100 bg-white hover:border-ink-200 transition-colors flex items-center gap-4 justify-between flex-wrap sm:flex-nowrap"
                      >
                        <div className="flex items-center gap-4">
                          <Link
                            to={`/shop/${p.slug}`}
                            className="w-16 h-16 rounded-2xl bg-cream-100 overflow-hidden shrink-0 flex items-center justify-center p-2"
                          >
                            <img
                              src={p.image}
                              alt={p.name}
                              className="w-full h-full object-cover mix-blend-multiply"
                            />
                          </Link>
                          <div>
                            <Link
                              to={`/shop/${p.slug}`}
                              className="font-display font-semibold hover:text-flame-600 transition-colors text-sm sm:text-base"
                            >
                              {p.name}
                            </Link>
                            <p className="text-xs text-ink-500 line-clamp-1 mt-0.5">{p.tagline}</p>
                            <p className="font-display font-semibold text-xs text-ink-900 mt-1">
                              {formatPrice(p.price, 'TSh')}
                            </p>
                          </div>
                        </div>
                        <div className="flex gap-2 shrink-0">
                          <button
                            onClick={() => {
                              addToCart(p, p.colors[0], 1)
                            }}
                            className="inline-flex items-center gap-1.5 bg-ink-900 text-cream-50 font-medium text-xs px-4 py-2 rounded-full hover:bg-flame-500 transition-colors"
                          >
                            <ShoppingBag size={12} />
                            <span>Weka Kikapuni</span>
                          </button>
                          <button
                            onClick={() => toggleWishlist(p.id, user.id)}
                            className="w-8 h-8 rounded-full flex items-center justify-center text-ink-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                            aria-label="Ondoa kwenye vipendwa"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}

// ---------------------------------------------------------------------------
// Subcomponents
// ---------------------------------------------------------------------------

function OrderRow({ order }: { order: OrderWithItems }) {
  const status = STATUS_LABELS[order.status]
  const date = new Date(order.created_at)
  return (
    <li className="bg-white rounded-2xl p-5 border border-ink-100 hover:border-ink-200 transition-colors">
      <div className="flex flex-wrap items-start justify-between gap-3 mb-4">
        <div>
          <p className="font-mono text-xs text-ink-500 uppercase tracking-wider mb-1">
            {date.toLocaleDateString('en-GB', {
              day: '2-digit',
              month: 'short',
              year: 'numeric',
            })}
          </p>
          <Link
            to={`/order/${order.id}`}
            className="font-display text-lg hover:text-flame-600 transition-colors font-medium"
          >
            {order.order_number}
          </Link>
        </div>
        <span
          className={`inline-flex items-center gap-1.5 text-[10px] font-mono uppercase tracking-wider px-3 py-1 rounded-full ${status.tone}`}
        >
          {status.sw}
        </span>
      </div>
      <ul className="space-y-2 mb-4">
        {order.items.slice(0, 3).map((it) => (
          <li key={it.id} className="flex items-center gap-3 text-sm">
            <div className="w-9 h-9 rounded-lg overflow-hidden bg-cream-100 shrink-0">
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
              <p className="truncate font-medium text-xs">
                {it.product_name} <span className="text-ink-500">× {it.quantity}</span>
              </p>
              <p className="text-[10px] text-ink-500">
                {it.color_name} · {formatPrice(it.line_total_tsh, 'TSh')}
              </p>
            </div>
          </li>
        ))}
        {order.items.length > 3 && (
          <li className="text-xs text-ink-500 pl-12">
            + {order.items.length - 3} bidhaa nyingine
          </li>
        )}
      </ul>
      <div className="pt-3 border-t border-ink-100 flex items-center justify-between">
        <span className="text-xs text-ink-500">
          {order.payment_method ? PAYMENT_LABELS[order.payment_method] : 'Malipo yanasubiriwa'}
        </span>
        <div className="flex items-center gap-4">
          <span className="font-display text-lg tabular-nums">
            {formatPrice(order.total_tsh, 'TSh')}
          </span>
          <Link
            to={`/order/${order.id}`}
            className="inline-flex items-center gap-1 text-xs font-mono uppercase tracking-[0.2em] text-flame-600 hover:text-flame-700 transition-colors"
          >
            Maelezo
            <ArrowRight size={12} />
          </Link>
        </div>
      </div>
    </li>
  )
}

function SideLink({
  icon: Icon,
  label,
  active = false,
  onClick,
}: {
  icon: typeof Package
  label: string
  active?: boolean
  onClick: () => void
}) {
  const base = 'w-full text-left flex items-center gap-2 px-3 py-2 rounded-xl text-sm transition-colors font-medium'
  return (
    <li>
      <button
        onClick={onClick}
        className={`${base} ${
          active ? 'bg-ink-100 text-ink-900' : 'text-ink-500 hover:bg-ink-50 hover:text-ink-900'
        }`}
      >
        <Icon size={14} />
        {label}
      </button>
    </li>
  )
}

function EmptyOrders() {
  return (
    <div className="bg-white rounded-3xl p-10 border border-ink-100 text-center">
      <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-ink-50 text-ink-400 mb-4">
        <Package size={24} />
      </div>
      <h3 className="font-display text-xl mb-2">Huna orders bado</h3>
      <p className="text-sm text-ink-500 mb-6 font-mono uppercase tracking-wider">
        Weka order yako ya kwanza
      </p>
      <Link
        to="/shop"
        className="inline-flex items-center gap-2 bg-ink-900 text-cream-50 font-medium text-sm px-6 py-3 rounded-full hover:bg-flame-500 transition-colors"
      >
        Nenda dukani
        <ArrowRight size={16} />
      </Link>
    </div>
  )
}

import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  Package,
  TrendingUp,
  Users,
  BarChart3,
  Loader2,
  Lock,
  ArrowLeft,
  Mail,
  RefreshCw,
  ShoppingBag,
  ExternalLink,
  Edit,
} from 'lucide-react'
import { supabase, isSupabaseConfigured } from '@/lib/supabase'
import { useSession } from '@/lib/useSession'
import { formatPrice } from '@/lib/utils'

type AdminOrder = {
  id: string
  order_number: string
  created_at: string
  total_tsh: number
  status: string
  payment_method: string
  shipping_address: { recipient_name: string; phone: string; city: string }
  email?: string
}

type Subscriber = {
  id: string
  email: string
  source: string
  opted_in_at: string
}

type AnalyticsEvent = {
  id: string | number
  event_name: string
  properties: any
  created_at: string
}

export default function AdminDashboard() {
  const { user, loading: authLoading } = useSession()
  const [activeTab, setActiveTab] = useState<'kpis' | 'orders' | 'subscribers' | 'analytics' | 'products'>('kpis')

  const [loading, setLoading] = useState(true)
  const [orders, setOrders] = useState<AdminOrder[]>([])
  const [subscribers, setSubscribers] = useState<Subscriber[]>([])
  const [events, setEvents] = useState<AnalyticsEvent[]>([])

  // Product editing state
  const [adminProducts, setAdminProducts] = useState<any[]>([])
  const [editingProduct, setEditingProduct] = useState<any | null>(null)
  const [productForm, setProductForm] = useState({
    name: '',
    price: 0,
    tagline: '',
    description: '',
  })

  // Load products list locally
  useEffect(() => {
    const fetchLocalProducts = async () => {
      const { products: p1, extraProducts: p2 } = await import('@/data/products')
      const merged = [...p1, ...p2]
      setAdminProducts(merged)
    }
    fetchLocalProducts()
  }, [])

  // State to simulate updates
  const [updatingOrderId, setUpdatingOrderId] = useState<string | null>(null)

  // Demo check
  const isDemo = !isSupabaseConfigured || Boolean(localStorage.getItem('audenic-demo-session'))

  async function loadData() {
    setLoading(true)
    if (isDemo) {
      // Load mock orders
      let localOrders: AdminOrder[] = []
      const stored = localStorage.getItem('audenic-demo-orders')
      if (stored) {
        localOrders = JSON.parse(stored)
      } else {
        localOrders = [
          {
            id: 'ord-1',
            order_number: 'AUD-2026-000104',
            created_at: new Date(Date.now() - 3600000 * 2).toISOString(),
            total_tsh: 43500,
            status: 'paid',
            payment_method: 'mpesa',
            shipping_address: { recipient_name: 'Juma Ramadhani', phone: '+255 754 123 456', city: 'Dar es Salaam' },
            email: 'juma@ramadhani.com',
          },
          {
            id: 'ord-2',
            order_number: 'AUD-2026-000103',
            created_at: new Date(Date.now() - 3600000 * 24).toISOString(),
            total_tsh: 28600,
            status: 'delivered',
            payment_method: 'card',
            shipping_address: { recipient_name: 'Lilian Kamazima', phone: '+255 682 987 654', city: 'Mwanza' },
            email: 'lilian@kamazima.net',
          },
          {
            id: 'ord-3',
            order_number: 'AUD-2026-000102',
            created_at: new Date(Date.now() - 3600000 * 48).toISOString(),
            total_tsh: 89500,
            status: 'pending',
            payment_method: 'tigopesa',
            shipping_address: { recipient_name: 'Khalfan Said', phone: '+255 715 111 222', city: 'Dar es Salaam' },
            email: 'khalfan@said.org',
          },
        ]
        localStorage.setItem('audenic-demo-orders', JSON.stringify(localOrders))
      }
      setOrders(localOrders)

      // Load mock subscribers
      setSubscribers([
        { id: 'sub-1', email: 'salum@gmail.com', source: 'footer', opted_in_at: new Date().toISOString() },
        { id: 'sub-2', email: 'amisa@hotmail.com', source: 'homepage', opted_in_at: new Date(Date.now() - 86400000).toISOString() },
        { id: 'sub-3', email: 'elizabeth@yahoo.com', source: 'checkout', opted_in_at: new Date(Date.now() - 172800000).toISOString() },
      ])

      // Load mock analytics events
      setEvents([
        { id: 1, event_name: 'product_view', properties: { slug: 'audenic-classic-red' }, created_at: new Date().toISOString() },
        { id: 2, event_name: 'add_to_cart', properties: { slug: 'mwanga-buds', price: 14900 }, created_at: new Date(Date.now() - 600000).toISOString() },
        { id: 3, event_name: 'checkout_start', properties: { items_count: 2 }, created_at: new Date(Date.now() - 1200000).toISOString() },
        { id: 4, event_name: 'newsletter_subscribe', properties: { source: 'footer' }, created_at: new Date(Date.now() - 3600000).toISOString() },
      ])
      setLoading(false)
    } else {
      // Supabase load
      try {
        const { data: ords } = await supabase
          .from('orders')
          .select('*, profiles(email)')
          .order('created_at', { ascending: false })

        if (ords) {
          setOrders(
            ords.map((o: any) => ({
              id: o.id,
              order_number: o.order_number,
              created_at: o.created_at,
              total_tsh: o.total_tsh,
              status: o.status,
              payment_method: o.payment_method,
              shipping_address: o.shipping_address,
              email: o.profiles?.email,
            }))
          )
        }

        const { data: subs } = await supabase
          .from('newsletter_subscribers')
          .select('*')
          .order('opted_in_at', { ascending: false })
        if (subs) setSubscribers(subs)

        const { data: evs } = await supabase
          .from('analytics_events')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(50)
        if (evs) setEvents(evs)
      } catch (err) {
        console.error('Error fetching admin data:', err)
      } finally {
        setLoading(false)
      }
    }
  }

  useEffect(() => {
    if (user) loadData()
  }, [user])

  // Update order status
  async function updateOrderStatus(orderId: string, nextStatus: string) {
    setUpdatingOrderId(orderId)
    if (isDemo) {
      const updated = orders.map((o) => (o.id === orderId ? { ...o, status: nextStatus } : o))
      setOrders(updated)
      localStorage.setItem('audenic-demo-orders', JSON.stringify(updated))
      setUpdatingOrderId(null)
    } else {
      const { error } = await supabase.from('orders').update({ status: nextStatus }).eq('id', orderId)
      if (error) {
        alert('Imeshindikana kusasisha status: ' + error.message)
      } else {
        setOrders(orders.map((o) => (o.id === orderId ? { ...o, status: nextStatus } : o)))
      }
      setUpdatingOrderId(null)
    }
  }

  function handleSaveProductDetails(e: React.FormEvent) {
    e.preventDefault()
    if (!editingProduct) return

    const updated = adminProducts.map((p) =>
      p.id === editingProduct.id ? { ...p, ...productForm } : p
    )
    setAdminProducts(updated)

    localStorage.setItem('audenic-product-overrides', JSON.stringify(updated))
    
    alert('Bidhaa imesasishwa kwa mafanikio!')
    setEditingProduct(null)
    window.location.reload()
  }

  // Guards
  if (authLoading) {
    return (
      <section className="min-h-[60vh] flex items-center justify-center">
        <Loader2 size={32} className="animate-spin text-flame-500" />
      </section>
    )
  }

  // simple admin checks: either demo mode or role is admin/staff or matching admin emails
  const isAdmin = isDemo || user?.email === 'mgeni@audenic.com'

  if (!user || !isAdmin) {
    return (
      <section className="max-w-2xl mx-auto px-6 py-24 text-center">
        <Lock className="mx-auto mb-6 text-rose-500" size={48} />
        <h1 className="font-display text-3xl mb-4">Ufikiaji Umezuiwa</h1>
        <p className="text-ink-600 mb-8">
          Ukurasa huu ni kwa ajili ya Wasimamizi wa Mfumo tu (Admin Dashboard).
        </p>
        <Link
          to="/"
          className="inline-flex items-center gap-2 bg-ink-900 text-cream-50 font-medium text-sm px-7 py-3.5 rounded-full hover:bg-flame-500 transition-colors"
        >
          <ArrowLeft size={16} />
          Rudi Nyumbani
        </Link>
      </section>
    )
  }

  // KPIs calculations
  const totalRevenue = orders.reduce((acc, o) => acc + (o.status !== 'cancelled' ? o.total_tsh : 0), 0)
  const totalOrdersCount = orders.length
  const totalSubsCount = subscribers.length
  const totalViews = events.filter((e) => e.event_name === 'product_view').length

  return (
    <section className="min-h-screen bg-cream-50 pt-12 pb-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-10">
          <div>
            <div className="flex items-center gap-3">
              <Link to="/account" className="text-ink-500 hover:text-ink-900 transition-colors">
                <ArrowLeft size={20} />
              </Link>
              <h1 className="font-display text-3xl sm:text-4xl font-medium tracking-tight">
                Admin Panel {isDemo && <span className="text-xs bg-flame-500/10 text-flame-600 px-3 py-1 rounded-full uppercase tracking-wider font-mono">Demo Mode</span>}
              </h1>
            </div>
            <p className="text-xs text-ink-500 mt-2 font-mono uppercase tracking-wider">
              Telemetry &amp; Database Management
            </p>
          </div>
          <button
            onClick={loadData}
            className="inline-flex items-center gap-2 border border-ink-200 bg-white text-ink-700 hover:bg-ink-50 px-4 py-2 rounded-full text-xs font-semibold shadow-sm transition-colors"
          >
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
            Pakia Upya
          </button>
        </div>

        {/* Tab Selection */}
        <div className="flex border-b border-ink-200 mb-8 overflow-x-auto whitespace-nowrap scrollbar-none gap-2">
          <TabButton
            active={activeTab === 'kpis'}
            label="Kiwango cha Biashara"
            icon={TrendingUp}
            onClick={() => setActiveTab('kpis')}
          />
          <TabButton
            active={activeTab === 'orders'}
            label={`Orders (${totalOrdersCount})`}
            icon={Package}
            onClick={() => setActiveTab('orders')}
          />
          <TabButton
            active={activeTab === 'subscribers'}
            label={`Subscribers (${totalSubsCount})`}
            icon={Mail}
            onClick={() => setActiveTab('subscribers')}
          />
          <TabButton
            active={activeTab === 'analytics'}
            label="Matukio (Analytics)"
            icon={BarChart3}
            onClick={() => setActiveTab('analytics')}
          />
          <TabButton
            active={activeTab === 'products'}
            label="Bidhaa (Inventory)"
            icon={ShoppingBag}
            onClick={() => setActiveTab('products')}
          />
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-32">
            <Loader2 size={32} className="animate-spin text-flame-500" />
          </div>
        ) : (
          <div>
            {/* 1. KPIs panel */}
            {activeTab === 'kpis' && (
              <div className="space-y-8">
                {/* Metric Cards Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                  <KpiCard
                    title="Jumla ya Mauzo"
                    value={formatPrice(totalRevenue, 'TSh')}
                    desc="Kando na yaliyofutwa"
                    icon={TrendingUp}
                  />
                  <KpiCard
                    title="Idadi ya Orders"
                    value={totalOrdersCount.toString()}
                    desc="Maagizo yaliyopo sasa"
                    icon={Package}
                  />
                  <KpiCard
                    title="Newsletter Subscribers"
                    value={totalSubsCount.toString()}
                    desc="Waliopo kwenye jarida"
                    icon={Users}
                  />
                  <KpiCard
                    title="Product Views"
                    value={totalViews.toString()}
                    desc="Kutoka log ya Analytics"
                    icon={BarChart3}
                  />
                </div>

                {/* Quick actions info */}
                <div className="bg-white rounded-3xl p-6 border border-ink-100 shadow-sm max-w-2xl">
                  <h3 className="font-display text-lg mb-2">Mfumo wa Telemetry ya Audenic</h3>
                  <p className="text-sm text-ink-600 leading-relaxed mb-4">
                    Kupitia jopo hili, unaweza kusimamia maagizo, kusasisha hali ya usafirishaji wa spika/headphones, na kuona matukio ya analytics kwa wakati halisi. Data zote zinasimamiwa na sheria za Supabase Row-Level Security.
                  </p>
                  <div className="flex gap-3 flex-wrap">
                    <Link
                      to="/shop"
                      className="inline-flex items-center gap-1.5 text-xs font-mono uppercase tracking-[0.2em] text-flame-600 hover:underline"
                    >
                      Kagua Duka <ExternalLink size={12} />
                    </Link>
                  </div>
                </div>
              </div>
            )}

            {/* 2. Orders Panel */}
            {activeTab === 'orders' && (
              <div className="bg-white rounded-3xl border border-ink-100 overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-ink-50 font-mono text-[10px] uppercase tracking-wider text-ink-500 border-b border-ink-100">
                        <th className="px-6 py-4">Namba ya Order</th>
                        <th className="px-6 py-4">Mteja / Email</th>
                        <th className="px-6 py-4">Mji</th>
                        <th className="px-6 py-4">Malipo</th>
                        <th className="px-6 py-4">Jumla</th>
                        <th className="px-6 py-4">Hali (Status)</th>
                        <th className="px-6 py-4 text-right">Vitendo</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-ink-100 text-sm">
                      {orders.map((o) => (
                        <tr key={o.id} className="hover:bg-cream-100/20 transition-colors">
                          <td className="px-6 py-4 font-mono font-medium text-ink-900">{o.order_number}</td>
                          <td className="px-6 py-4">
                            <div>
                              <p className="font-medium text-xs">{o.shipping_address.recipient_name}</p>
                              <p className="text-[10px] text-ink-500 font-mono">{o.email || 'guest@audenic.com'}</p>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-xs font-mono">{o.shipping_address.city}</td>
                          <td className="px-6 py-4 text-xs uppercase font-mono">{o.payment_method}</td>
                          <td className="px-6 py-4 font-mono font-semibold">{formatPrice(o.total_tsh, 'TSh')}</td>
                          <td className="px-6 py-4">
                            <span
                              className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-mono uppercase tracking-wider ${
                                o.status === 'delivered'
                                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                  : o.status === 'paid'
                                  ? 'bg-blue-50 text-blue-700 border border-blue-200'
                                  : o.status === 'pending'
                                  ? 'bg-amber-50 text-amber-700 border border-amber-200'
                                  : 'bg-zinc-100 text-zinc-600'
                              }`}
                            >
                              {o.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-right">
                            <div className="flex justify-end gap-1.5">
                              {o.status === 'pending' && (
                                <button
                                  disabled={updatingOrderId === o.id}
                                  onClick={() => updateOrderStatus(o.id, 'paid')}
                                  className="px-3 py-1 bg-ink-900 text-cream-50 text-[10px] rounded-full hover:bg-flame-500 transition-colors"
                                >
                                  Lipa
                                </button>
                              )}
                              {o.status === 'paid' && (
                                <button
                                  disabled={updatingOrderId === o.id}
                                  onClick={() => updateOrderStatus(o.id, 'delivered')}
                                  className="px-3 py-1 bg-ink-900 text-cream-50 text-[10px] rounded-full hover:bg-flame-500 transition-colors"
                                >
                                  Fikisha
                                </button>
                              )}
                              {o.status !== 'cancelled' && o.status !== 'delivered' && (
                                <button
                                  disabled={updatingOrderId === o.id}
                                  onClick={() => updateOrderStatus(o.id, 'cancelled')}
                                  className="px-3 py-1 border border-rose-200 text-rose-600 text-[10px] rounded-full hover:bg-rose-50 transition-colors"
                                >
                                  Ghairi
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* 3. Subscribers Panel */}
            {activeTab === 'subscribers' && (
              <div className="bg-white rounded-3xl border border-ink-100 overflow-hidden shadow-sm max-w-3xl">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-ink-50 font-mono text-[10px] uppercase tracking-wider text-ink-500 border-b border-ink-100">
                        <th className="px-6 py-4">Email</th>
                        <th className="px-6 py-4">Chanzo (Source)</th>
                        <th className="px-6 py-4">Tarehe ya Kujiunga</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-ink-100 text-sm">
                      {subscribers.map((s) => (
                        <tr key={s.id} className="hover:bg-cream-100/20 transition-colors">
                          <td className="px-6 py-4 font-mono font-medium text-ink-900">{s.email}</td>
                          <td className="px-6 py-4">
                            <span className="font-mono text-xs text-ink-500">{s.source}</span>
                          </td>
                          <td className="px-6 py-4 text-xs text-ink-500">
                            {new Date(s.opted_in_at).toLocaleString('en-GB')}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* 4. Analytics Panel */}
            {activeTab === 'analytics' && (
              <div className="bg-white rounded-3xl border border-ink-100 overflow-hidden shadow-sm max-w-4xl">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-ink-50 font-mono text-[10px] uppercase tracking-wider text-ink-500 border-b border-ink-100">
                        <th className="px-6 py-4">Tukio (Event Name)</th>
                        <th className="px-6 py-4">Muda</th>
                        <th className="px-6 py-4">Mali (Properties)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-ink-100 text-sm">
                      {events.map((e) => (
                        <tr key={e.id} className="hover:bg-cream-100/20 transition-colors">
                          <td className="px-6 py-4 font-mono font-semibold text-flame-600">{e.event_name}</td>
                          <td className="px-6 py-4 text-xs text-ink-500">
                            {new Date(e.created_at).toLocaleString('en-GB')}
                          </td>
                          <td className="px-6 py-4 text-xs text-ink-600 font-mono max-w-xs truncate">
                            {JSON.stringify(e.properties)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {activeTab === 'products' && (
              <div>
                <h2 className="font-display text-2xl mb-6">Bidhaa na Hifadhi (Products &amp; Inventory)</h2>
                {editingProduct ? (
                  <form onSubmit={handleSaveProductDetails} className="space-y-4 max-w-xl">
                    <h3 className="text-sm font-semibold text-ink-700">Hariri Maelezo ya {editingProduct.name}</h3>
                    <div>
                      <label className="block text-xs font-mono uppercase tracking-[0.2em] text-ink-500 mb-1.5">
                        Jina la Bidhaa
                      </label>
                      <input
                        type="text"
                        required
                        value={productForm.name}
                        onChange={(e) => setProductForm((f) => ({ ...f, name: e.target.value }))}
                        className="w-full px-4 py-2 rounded-xl border border-ink-200 text-sm focus:outline-none focus:border-flame-500 bg-white text-ink-900"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-mono uppercase tracking-[0.2em] text-ink-500 mb-1.5">
                        Bei (TSh)
                      </label>
                      <input
                        type="number"
                        required
                        value={productForm.price}
                        onChange={(e) => setProductForm((f) => ({ ...f, price: parseInt(e.target.value) || 0 }))}
                        className="w-full px-4 py-2 rounded-xl border border-ink-200 text-sm focus:outline-none focus:border-flame-500 bg-white text-ink-900"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-mono uppercase tracking-[0.2em] text-ink-500 mb-1.5">
                        Tagline / Ujumbe Mfupi
                      </label>
                      <input
                        type="text"
                        required
                        value={productForm.tagline}
                        onChange={(e) => setProductForm((f) => ({ ...f, tagline: e.target.value }))}
                        className="w-full px-4 py-2 rounded-xl border border-ink-200 text-sm focus:outline-none focus:border-flame-500 bg-white text-ink-900"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-mono uppercase tracking-[0.2em] text-ink-500 mb-1.5">
                        Maelezo ya Kina (Description)
                      </label>
                      <textarea
                        required
                        rows={4}
                        value={productForm.description}
                        onChange={(e) => setProductForm((f) => ({ ...f, description: e.target.value }))}
                        className="w-full px-4 py-2 rounded-xl border border-ink-200 text-sm focus:outline-none focus:border-flame-500 bg-white text-ink-900"
                      />
                    </div>
                    <div className="flex gap-2">
                      <button
                        type="submit"
                        className="bg-ink-900 text-cream-50 font-medium text-xs px-5 py-2.5 rounded-full hover:bg-flame-500 transition-colors"
                      >
                        Hifadhi Bidhaa
                      </button>
                      <button
                        type="button"
                        onClick={() => setEditingProduct(null)}
                        className="border border-ink-200 text-ink-700 font-medium text-xs px-5 py-2.5 rounded-full hover:bg-ink-50 transition-colors"
                      >
                        Ghairi
                      </button>
                    </div>
                  </form>
                ) : (
                  <div className="bg-white rounded-3xl border border-ink-100 overflow-hidden shadow-sm">
                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className="bg-ink-50 font-mono text-[10px] uppercase tracking-wider text-ink-500 border-b border-ink-100">
                            <th className="px-6 py-4">Picha</th>
                            <th className="px-6 py-4">Bidhaa</th>
                            <th className="px-6 py-4">Aina (Category)</th>
                            <th className="px-6 py-4">Bei</th>
                            <th className="px-6 py-4 text-right">Vitendo</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-ink-100 text-sm">
                          {adminProducts.map((p) => (
                            <tr key={p.id} className="hover:bg-cream-100/20 transition-colors">
                              <td className="px-6 py-4">
                                <div className="w-10 h-10 rounded-lg overflow-hidden bg-cream-100 flex items-center justify-center p-1.5">
                                  <img src={p.image} alt={p.name} className="w-full h-full object-cover mix-blend-multiply" />
                                </div>
                              </td>
                              <td className="px-6 py-4">
                                <div>
                                  <p className="font-semibold">{p.name}</p>
                                  <p className="text-[10px] text-ink-500 font-mono line-clamp-1">{p.tagline}</p>
                                </div>
                              </td>
                              <td className="px-6 py-4 text-xs font-mono uppercase">{p.category}</td>
                              <td className="px-6 py-4 font-mono font-semibold">{formatPrice(p.price, 'TSh')}</td>
                              <td className="px-6 py-4 text-right">
                                <button
                                  onClick={() => {
                                    setEditingProduct(p)
                                    setProductForm({
                                      name: p.name,
                                      price: p.price,
                                      tagline: p.tagline,
                                      description: p.description,
                                    })
                                  }}
                                  className="inline-flex items-center gap-1 bg-ink-900 text-cream-50 text-[10px] px-3 py-1 rounded-full hover:bg-flame-500 transition-colors"
                                >
                                  Hariri
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  )
}

// Subcomponents
function TabButton({
  active,
  label,
  icon: Icon,
  onClick,
}: {
  active: boolean
  label: string
  icon: typeof TrendingUp
  onClick: () => void
}) {
  return (
    <button
      onClick={onClick}
      className={`pb-4 px-2 font-display text-sm font-semibold flex items-center gap-2 border-b-2 transition-colors relative ${
        active ? 'border-ink-900 text-ink-900' : 'border-transparent text-ink-400 hover:text-ink-900'
      }`}
    >
      <Icon size={16} />
      {label}
    </button>
  )
}

function KpiCard({
  title,
  value,
  desc,
  icon: Icon,
}: {
  title: string
  value: string
  desc: string
  icon: typeof TrendingUp
}) {
  return (
    <div className="bg-white rounded-3xl p-6 border border-ink-100 shadow-sm flex items-center justify-between">
      <div>
        <p className="text-xs font-mono uppercase tracking-wider text-ink-500">{title}</p>
        <p className="font-display text-3xl font-bold text-ink-900 mt-2 tracking-tight">{value}</p>
        <p className="text-[10px] text-ink-400 mt-1 font-mono">{desc}</p>
      </div>
      <div className="w-12 h-12 bg-cream-100 rounded-2xl flex items-center justify-center text-flame-500">
        <Icon size={20} />
      </div>
    </div>
  )
}

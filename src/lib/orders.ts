/**
 * Orders — typed Supabase wrapper.
 *
 * All money is whole TSh (integer) — matches the schema.
 * The browser client is used; RLS ensures users can only see their own orders.
 */
import { supabase, isSupabaseConfigured } from './supabase'
import type { CartLine } from '@/store/cart'

// ---------------------------------------------------------------------------
// Types — mirror the Postgres tables 1:1
// ---------------------------------------------------------------------------

export type OrderStatus =
  | 'pending'
  | 'paid'
  | 'processing'
  | 'shipped'
  | 'delivered'
  | 'cancelled'
  | 'refunded'

export type PaymentMethod = 'mpesa' | 'tigopesa' | 'airtel_money' | 'card' | 'cod'

export type ShippingAddress = {
  recipient_name: string
  phone: string
  line1: string
  line2?: string
  city: string
  region: string
  postal_code?: string
  country: string
}

export type Order = {
  id: string
  user_id: string
  order_number: string
  status: OrderStatus
  subtotal_tsh: number
  shipping_tsh: number
  tax_tsh: number
  total_tsh: number
  payment_method: PaymentMethod | null
  payment_reference: string | null
  paid_at: string | null
  shipping_address: ShippingAddress
  customer_note: string | null
  created_at: string
}

export type OrderItem = {
  id: string
  order_id: string
  product_id: string
  product_slug: string
  product_name: string
  product_image: string | null
  color_name: string
  color_hex: string
  unit_price_tsh: number
  quantity: number
  line_total_tsh: number
}

export type OrderWithItems = Order & { items: OrderItem[] }

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

/** Free shipping in Dar es Salaam, TSh 5,000 elsewhere in Tanzania. */
export const SHIPPING_FREE_ABOVE_TSH = 50_000
export const SHIPPING_FLAT_TSH = 5_000
export const SHIPPING_DAR_CITIES = ['dar es salaam', 'dodoma'] // free for capital region
export const TAX_RATE = 0 // TZ has VAT registered separately; keep 0 for now

export type CreateOrderInput = {
  userId: string
  lines: CartLine[]
  shipping: ShippingAddress
  paymentMethod: PaymentMethod
  customerNote?: string
}

// ---------------------------------------------------------------------------
// Pricing helpers
// ---------------------------------------------------------------------------

export function calcSubtotal(lines: CartLine[]): number {
  return lines.reduce((acc, l) => acc + l.price * l.quantity, 0)
}

export function calcShipping(subtotal: number, city: string): number {
  if (subtotal >= SHIPPING_FREE_ABOVE_TSH) return 0
  const cityLower = city.trim().toLowerCase()
  if (SHIPPING_DAR_CITIES.includes(cityLower)) return 0
  return SHIPPING_FLAT_TSH
}

export function calcTax(subtotal: number): number {
  return Math.round(subtotal * TAX_RATE)
}

export function calcTotal(
  lines: CartLine[],
  city: string
): { subtotal: number; shipping: number; tax: number; total: number } {
  const subtotal = calcSubtotal(lines)
  const shipping = calcShipping(subtotal, city)
  const tax = calcTax(subtotal)
  return { subtotal, shipping, tax, total: subtotal + shipping + tax }
}

// ---------------------------------------------------------------------------
// createOrder — insert parent + items in a single function
// ---------------------------------------------------------------------------

export type CreateOrderResult =
  | { ok: true; order: Order; items: OrderItem[] }
  | { ok: false; message: string; code?: string }

export async function createOrder(input: CreateOrderInput): Promise<CreateOrderResult> {
  if (!isSupabaseConfigured) {
    return {
      ok: false,
      code: 'NOT_CONFIGURED',
      message: 'Supabase haijasanidiwa. Set VITE_SUPABASE_* katika .env.',
    }
  }
  if (input.lines.length === 0) {
    return { ok: false, code: 'EMPTY_CART', message: 'Cart ni tupu.' }
  }

  const { subtotal, shipping, tax, total } = calcTotal(
    input.lines,
    input.shipping.city
  )

  // 1. Insert the order row
  const { data: orderRow, error: orderErr } = await supabase
    .from('orders')
    .insert({
      user_id: input.userId,
      status: 'pending',
      subtotal_tsh: subtotal,
      shipping_tsh: shipping,
      tax_tsh: tax,
      total_tsh: total,
      payment_method: input.paymentMethod,
      shipping_address: input.shipping,
      customer_note: input.customerNote ?? null,
    })
    .select('*')
    .single()

  if (orderErr || !orderRow) {
    return {
      ok: false,
      code: orderErr?.code,
      message:
        orderErr?.message ??
        'Imeshindikana kuunda order. Tafadhali jaribu tena.',
    }
  }

  // 2. Insert the line items
  const itemRows = input.lines.map((l) => ({
    order_id: orderRow.id,
    product_id: l.productId,
    product_slug: l.slug,
    product_name: l.name,
    product_image: l.image,
    color_name: l.color.name,
    color_hex: l.color.hex,
    unit_price_tsh: l.price,
    quantity: l.quantity,
    line_total_tsh: l.price * l.quantity,
  }))

  const { data: items, error: itemsErr } = await supabase
    .from('order_items')
    .insert(itemRows)
    .select('*')

  if (itemsErr || !items) {
    // Parent order exists; surface a soft error so the user can contact support
    return {
      ok: false,
      code: itemsErr?.code,
      message:
        `Order imeundwa (${orderRow.order_number}) lakini line items zimeshindikana. ` +
        `Tafadhali wasiliana nasi na utaje nambari hii.`,
    }
  }

  return { ok: true, order: orderRow as Order, items: items as OrderItem[] }
}

// ---------------------------------------------------------------------------
// Read — fetch the signed-in user's orders (RLS does the filtering)
// ---------------------------------------------------------------------------

export async function fetchMyOrders(): Promise<OrderWithItems[]> {
  if (!isSupabaseConfigured) return []

  const { data: orders, error } = await supabase
    .from('orders')
    .select('*')
    .order('created_at', { ascending: false })

  if (error || !orders) return []

  // Fetch items for all visible orders in one round trip
  const orderIds = orders.map((o) => o.id)
  const { data: items, error: itemsErr } = await supabase
    .from('order_items')
    .select('*')
    .in('order_id', orderIds)

  if (itemsErr) return orders.map((o) => ({ ...(o as Order), items: [] }))

  return orders.map((o) => ({
    ...(o as Order),
    items: (items ?? []).filter((it) => it.order_id === o.id) as OrderItem[],
  }))
}

export async function fetchOrderById(
  id: string
): Promise<OrderWithItems | null> {
  if (!isSupabaseConfigured) return null

  const { data: order, error } = await supabase
    .from('orders')
    .select('*')
    .eq('id', id)
    .maybeSingle()

  if (error || !order) return null

  const { data: items } = await supabase
    .from('order_items')
    .select('*')
    .eq('order_id', id)

  return { ...(order as Order), items: (items ?? []) as OrderItem[] }
}

// ---------------------------------------------------------------------------
// Display helpers
// ---------------------------------------------------------------------------

export const STATUS_LABELS: Record<OrderStatus, { sw: string; en: string; tone: string }> = {
  pending:    { sw: 'Inasubiri malipo',  en: 'Pending payment',  tone: 'bg-amber-100 text-amber-800' },
  paid:       { sw: 'Ime lipa',          en: 'Paid',             tone: 'bg-blue-100 text-blue-800' },
  processing: { sw: 'Inaandaliwa',       en: 'Processing',       tone: 'bg-indigo-100 text-indigo-800' },
  shipped:    { sw: 'Imepelekwa',        en: 'Shipped',          tone: 'bg-purple-100 text-purple-800' },
  delivered:  { sw: 'Imefika',           en: 'Delivered',        tone: 'bg-emerald-100 text-emerald-800' },
  cancelled:  { sw: 'Imeghairiwa',       en: 'Cancelled',        tone: 'bg-zinc-200 text-zinc-700' },
  refunded:   { sw: 'Imerejeshwa',       en: 'Refunded',         tone: 'bg-rose-100 text-rose-800' },
}

export const PAYMENT_LABELS: Record<PaymentMethod, string> = {
  mpesa: 'M-Pesa',
  tigopesa: 'Tigo Pesa',
  airtel_money: 'Airtel Money',
  card: 'Card',
  cod: 'Cash on Delivery',
}

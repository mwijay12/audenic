import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import type { Product } from '@/data/products'

export type CartLine = {
  productId: string
  slug: string
  name: string
  price: number // whole TSh (e.g. 43500 for TSh 43,500)
  image: string
  color: { name: string; hex: string }
  quantity: number
}

type CartState = {
  lines: CartLine[]
  isOpen: boolean
  promoCode: string | null
  discountPercent: number
  freeShippingPromo: boolean
  // actions
  add: (product: Product, color: { name: string; hex: string }, quantity?: number) => void
  remove: (productId: string, colorName: string) => void
  setQuantity: (productId: string, colorName: string, qty: number) => void
  clear: () => void
  open: () => void
  close: () => void
  toggle: () => void
  applyPromoCode: (code: string) => { success: boolean; message: string }
  removePromoCode: () => void
}

export const useCart = create<CartState>()(
  persist(
    (set, get) => ({
      lines: [],
      isOpen: false,
      promoCode: null,
      discountPercent: 0,
      freeShippingPromo: false,

      add: (product, color, quantity = 1) => {
        set((s) => {
          const existing = s.lines.find(
            (l) => l.productId === product.id && l.color.name === color.name
          )
          if (existing) {
            return {
              lines: s.lines.map((l) =>
                l === existing ? { ...l, quantity: l.quantity + quantity } : l
              ),
            }
          }
          return {
            lines: [
              ...s.lines,
              {
                productId: product.id,
                slug: product.slug,
                name: product.name,
                price: product.price,
                image: product.image,
                color,
                quantity,
              },
            ],
          }
        })
        // Open the drawer so the user sees the add worked
        get().open()
      },

      remove: (productId, colorName) => {
        set((s) => ({
          lines: s.lines.filter(
            (l) => !(l.productId === productId && l.color.name === colorName)
          ),
        }))
      },

      setQuantity: (productId, colorName, qty) => {
        if (qty <= 0) {
          get().remove(productId, colorName)
          return
        }
        set((s) => ({
          lines: s.lines.map((l) =>
            l.productId === productId && l.color.name === colorName
              ? { ...l, quantity: qty }
              : l
          ),
        }))
      },

      clear: () => set({ lines: [], promoCode: null, discountPercent: 0, freeShippingPromo: false }),
      open: () => set({ isOpen: true }),
      close: () => set({ isOpen: false }),
      toggle: () => set((s) => ({ isOpen: !s.isOpen })),

      applyPromoCode: (code) => {
        const cleanCode = code.trim().toUpperCase()
        if (cleanCode === 'KARIBU10') {
          set({ promoCode: cleanCode, discountPercent: 10, freeShippingPromo: false })
          return { success: true, message: 'Punguzo la 10% limeongezwa!' }
        }
        if (cleanCode === 'DARFREE') {
          set({ promoCode: cleanCode, discountPercent: 0, freeShippingPromo: true })
          return { success: true, message: 'Usafirishaji wa bure umeongezwa!' }
        }
        if (cleanCode === 'AUDENIC20') {
          set({ promoCode: cleanCode, discountPercent: 20, freeShippingPromo: false })
          return { success: true, message: 'Punguzo la 20% limeongezwa!' }
        }
        return { success: false, message: 'Kuponi isiyo sahihi. Jaribu tena.' }
      },

      removePromoCode: () => {
        set({ promoCode: null, discountPercent: 0, freeShippingPromo: false })
      },
    }),
    {
      name: 'audenic-cart',
      storage: createJSONStorage(() => localStorage),
      partialize: (s) => ({
        lines: s.lines,
        promoCode: s.promoCode,
        discountPercent: s.discountPercent,
        freeShippingPromo: s.freeShippingPromo,
      }), // don't persist drawer open state
    }
  )
)

// Selectors — keep components from re-rendering on unrelated state changes
export const useCartCount = () => useCart((s) =>
  s.lines.reduce((acc, l) => acc + l.quantity, 0)
)
export const useCartTotal = () => useCart((s) =>
  s.lines.reduce((acc, l) => acc + l.price * l.quantity, 0)
)

import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { supabase, isSupabaseConfigured } from '@/lib/supabase'

type WishlistState = {
  productIds: string[]
  toggle: (productId: string, userId?: string | null) => Promise<void>
  has: (productId: string) => boolean
  sync: (userId: string) => Promise<void>
  clear: () => void
}

export const useWishlist = create<WishlistState>()(
  persist(
    (set, get) => ({
      productIds: [],

      toggle: async (productId, userId) => {
        const current = get().productIds
        const exists = current.includes(productId)
        const next = exists
          ? current.filter((id) => id !== productId)
          : [...current, productId]

        set({ productIds: next })

        // If user is authenticated and Supabase is configured, sync to database
        if (userId && isSupabaseConfigured && !localStorage.getItem('audenic-demo-session')) {
          if (exists) {
            await supabase
              .from('wishlists')
              .delete()
              .eq('user_id', userId)
              .eq('product_id', productId)
          } else {
            await supabase
              .from('wishlists')
              .insert({ user_id: userId, product_id: productId })
          }
        }
      },

      has: (productId) => get().productIds.includes(productId),

      sync: async (userId) => {
        if (!isSupabaseConfigured || localStorage.getItem('audenic-demo-session')) return

        const { data, error } = await supabase
          .from('wishlists')
          .select('product_id')
          .eq('user_id', userId)

        if (data && !error) {
          const ids = data.map((item: any) => item.product_id)
          set({ productIds: ids })
        }
      },

      clear: () => set({ productIds: [] }),
    }),
    {
      name: 'audenic-wishlist',
      storage: createJSONStorage(() => localStorage),
    }
  )
)

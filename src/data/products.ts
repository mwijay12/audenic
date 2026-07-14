// Product data — premium music devices, hand-tuned in Dar es Salaam.
// Categories: over-ear, in-ear, on-ear, speaker, soundbar.
// The product images are sourced from Unsplash (free, no auth).
// TODO: replace with Supabase fetched data when the store goes live.

export type ProductCategory = 'over-ear' | 'in-ear' | 'on-ear' | 'speaker' | 'soundbar'

export type Product = {
  id: string
  slug: string
  name: string
  category: ProductCategory
  tagline: string
  description: string
  price: number // cents
  compareAt?: number // cents
  rating: number
  reviewCount: number
  colors: { name: string; hex: string }[]
  features: string[]
  specs: { label: string; value: string }[]
  image: string
  gallery: string[]
  badge?: string
}

const baseProducts: Product[] = [
  {
    id: 'p-001',
    slug: 'audenic-classic-red',
    name: 'Audenic Classic',
    category: 'over-ear',
    tagline: 'The signature red. Built for everyday immersion.',
    description:
      'A studio-grade driver pair hidden in a CNC aluminum chassis. The Classic delivers a warm, balanced sound signature tuned for long listening sessions — podcasts at 8am, trap at 5pm, jazz at midnight.',
    price: 43500,
    compareAt: 46500,
    rating: 4.5,
    reviewCount: 1284,
    colors: [
      { name: 'Flame Red', hex: '#ff4d1a' },
      { name: 'Ink Black', hex: '#0e0d0c' },
      { name: 'Cream', hex: '#f3ecdc' },
    ],
    features: [
      'Active noise cancellation up to 35dB',
      '40mm beryllium-coated drivers',
      'Bluetooth 5.3 with multipoint pairing',
      'Up to 60 hours battery life',
    ],
    specs: [
      { label: 'Driver', value: '40mm Beryllium' },
      { label: 'Impedance', value: '32Ω' },
      { label: 'Frequency', value: '5Hz – 40kHz' },
      { label: 'Battery', value: '60h playback' },
      { label: 'Weight', value: '248g' },
    ],
    image:
      'https://images.unsplash.com/photo-1583394838336-acd977736f90?auto=format&fit=crop&w=1400&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1583394838336-acd977736f90?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1546435770-a3e426bf472b?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1577174881658-0f30ed549adc?auto=format&fit=crop&w=1200&q=80',
    ],
    badge: 'Best Seller',
  },
  {
    id: 'p-002',
    slug: 'arua-blue-wave',
    name: 'Arua Blue',
    category: 'over-ear',
    tagline: 'Cobalt chassis. Calm sound.',
    description:
      'Inspired by Lake Victoria at dusk, the Arua Blue wraps you in a soft, expansive soundstage. Best for ambient, lo-fi, and slow-burn R&B.',
    price: 23600,
    rating: 4.0,
    reviewCount: 642,
    colors: [
      { name: 'Arua Blue', hex: '#3b6db5' },
      { name: 'Sand', hex: '#d8c39a' },
    ],
    features: [
      'Adaptive ANC with transparency mode',
      'Memory foam earcups',
      'USB-C fast charge — 10 min = 5h playback',
      'Foldable travel design',
    ],
    specs: [
      { label: 'Driver', value: '38mm Titanium' },
      { label: 'Impedance', value: '24Ω' },
      { label: 'Frequency', value: '8Hz – 38kHz' },
      { label: 'Battery', value: '45h playback' },
      { label: 'Weight', value: '232g' },
    ],
    image:
      'https://images.unsplash.com/photo-1546435770-a3e426bf472b?auto=format&fit=crop&w=1400&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1546435770-a3e426bf472b?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1583394838336-acd977736f90?auto=format&fit=crop&w=1200&q=80',
    ],
  },
  {
    id: 'p-003',
    slug: 'kifaru-green-pro',
    name: 'Kifaru Pro',
    category: 'over-ear',
    tagline: 'Forest green. Studio-grade.',
    description:
      'A no-compromise reference pair. Hand-tuned by audio engineers in Dar es Salaam. The Kifaru Pro is the one you reach for when the music has to be right.',
    price: 28600,
    rating: 4.4,
    reviewCount: 318,
    colors: [
      { name: 'Kifaru Green', hex: '#3d5a40' },
      { name: 'Charcoal', hex: '#2a2723' },
      { name: 'Gold Trim', hex: '#c89519' },
    ],
    features: [
      'Reference-tuned flat response',
      'Detachable braided cable',
      'Memory-foam lambskin earcups',
      'Hard-shell travel case included',
    ],
    specs: [
      { label: 'Driver', value: '45mm Planar Magnetic' },
      { label: 'Impedance', value: '38Ω' },
      { label: 'Frequency', value: '4Hz – 50kHz' },
      { label: 'Battery', value: '50h playback' },
      { label: 'Weight', value: '298g' },
    ],
    image:
      'https://images.unsplash.com/photo-1577174881658-0f30ed549adc?auto=format&fit=crop&w=1400&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1577174881658-0f30ed549adc?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1484704849700-f032a568e944?auto=format&fit=crop&w=1200&q=80',
    ],
    badge: 'New',
  },
  {
    id: 'p-004',
    slug: 'mwanga-buds',
    name: 'Mwanga Buds',
    category: 'in-ear',
    tagline: 'In-ear. Out of this world.',
    description:
      'True wireless earbuds with a charging case that doubles as a Bluetooth speaker. Designed for movement — running, gym, commuting.',
    price: 14900,
    compareAt: 17900,
    rating: 4.7,
    reviewCount: 2104,
    colors: [
      { name: 'Pearl White', hex: '#faf7f0' },
      { name: 'Ink Black', hex: '#0e0d0c' },
      { name: 'Coral', hex: '#ff7240' },
    ],
    features: [
      'Hybrid ANC + Transparency',
      '6 mics with AI noise reduction',
      'IPX5 sweat resistance',
      '8h + 24h with case',
    ],
    specs: [
      { label: 'Driver', value: '11mm Dynamic' },
      { label: 'Codec', value: 'LDAC, AAC, aptX' },
      { label: 'Battery', value: '8h + 24h case' },
      { label: 'Weight', value: '4.6g per bud' },
    ],
    image:
      'https://images.unsplash.com/photo-1606220588913-b3aacb4d2f46?auto=format&fit=crop&w=1400&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1606220588913-b3aacb4d2f46?auto=format&fit=crop&w=1200&q=80',
    ],
    badge: 'Limited',
  },
]

export const collections = [
  {
    id: 'over-ear',
    name: 'Over-Ear',
    description: 'Full immersion. Maximum soundstage.',
    image:
      'https://images.unsplash.com/photo-1583394838336-acd977736f90?auto=format&fit=crop&w=900&q=80',
  },
  {
    id: 'in-ear',
    name: 'In-Ear',
    description: 'Pocket-sized. Built for movement.',
    image:
      'https://images.unsplash.com/photo-1606220588913-b3aacb4d2f46?auto=format&fit=crop&w=900&q=80',
  },
  {
    id: 'on-ear',
    name: 'On-Ear',
    description: 'Lightweight. All-day comfort.',
    image:
      'https://images.unsplash.com/photo-1484704849700-f032a568e944?auto=format&fit=crop&w=900&q=80',
  },
  {
    id: 'speaker',
    name: 'Speakers',
    description: 'Room-filling sound. Made to share.',
    image:
      'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?auto=format&fit=crop&w=900&q=80',
  },
  {
    id: 'soundbar',
    name: 'Soundbars',
    description: 'Cinema-grade audio for your living room.',
    image:
      'https://images.unsplash.com/photo-1545454675-3531b543be5d?auto=format&fit=crop&w=900&q=80',
  },
]

// Additional product entries — speakers & soundbars
// (kept separate from the headphones lineup to preserve the
// flagship feel of the top of the page)
const baseExtraProducts: Product[] = [
  {
    id: 'p-005',
    slug: 'twiga-portable-speaker',
    name: 'Twiga Portable',
    category: 'speaker',
    tagline: 'Pocket-sized. Room-filling.',
    description:
      'A 360° portable speaker tuned for outdoor life. IP67 dust and water resistance. 24-hour battery. Pairs two for stereo.',
    price: 18900,
    rating: 4.6,
    reviewCount: 842,
    colors: [
      { name: 'Safari Tan', hex: '#c89519' },
      { name: 'Charcoal', hex: '#2a2723' },
    ],
    features: [
      '360° sound with dual passive radiators',
      'IP67 dust & water resistance',
      '24-hour battery life',
      'USB-C fast charge',
    ],
    specs: [
      { label: 'Driver', value: '2x 50mm full-range' },
      { label: 'Output', value: '30W RMS' },
      { label: 'Battery', value: '24h playback' },
      { label: 'Weight', value: '580g' },
      { label: 'Rating', value: 'IP67' },
    ],
    image:
      'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?auto=format&fit=crop&w=1400&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1545454675-3531b543be5d?auto=format&fit=crop&w=1200&q=80',
    ],
    badge: 'New',
  },
  {
    id: 'p-006',
    slug: 'dunia-soundbar',
    name: 'Dunia Soundbar',
    category: 'soundbar',
    tagline: 'Cinema-grade audio. Living-room ready.',
    description:
      'A 5-driver soundbar with Dolby Atmos decoding and wireless subwoofer. Hand-tuned by Audenic engineers for African music, hip-hop, and Amapiano frequencies.',
    price: 89500,
    compareAt: 99500,
    rating: 4.7,
    reviewCount: 412,
    colors: [
      { name: 'Ink Black', hex: '#0e0d0c' },
    ],
    features: [
      'Dolby Atmos 5.1.2 decoding',
      'Wireless subwoofer included',
      'HDMI eARC + Optical + Bluetooth 5.3',
      'Hand-tuned EQ for African music genres',
    ],
    specs: [
      { label: 'Drivers', value: '5x + 8" sub' },
      { label: 'Output', value: '450W RMS' },
      { label: 'Frequency', value: '35Hz – 20kHz' },
      { label: 'Connectivity', value: 'HDMI eARC / BT 5.3' },
    ],
    image:
      'https://images.unsplash.com/photo-1545454675-3531b543be5d?auto=format&fit=crop&w=1400&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1545454675-3531b543be5d?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?auto=format&fit=crop&w=1200&q=80',
    ],
    badge: 'Premium',
  },
]

export const features = [
  {
    title: 'Battery',
    subtitle: '60 hours of pure playtime',
    description:
      'A custom lithium cell tuned for low power draw. Charge once a week — or once a month if you only listen on commutes.',
    icon: 'battery',
    stat: '60h',
    statLabel: 'playback',
  },
  {
    title: 'Bluetooth',
    subtitle: '5.3 with multipoint pairing',
    description:
      'Connect to your laptop and phone at the same time. Take a call on the phone, go back to the playlist on the laptop — no manual re-pairing.',
    icon: 'bluetooth',
    stat: '< 40ms',
    statLabel: 'latency',
  },
  {
    title: 'Microphone',
    subtitle: 'Studio-grade clarity',
    description:
      'Six-mic array with AI noise reduction. Call from a street in Dar es Salaam, sound like you’re in a quiet studio.',
    icon: 'mic',
    stat: '6-mic',
    statLabel: 'array',
  },
  {
    title: 'Sound',
    subtitle: 'Hand-tuned by ear',
    description:
      'Each device is tuned by an audio engineer — not an algorithm. We listen to music. We make audio gear for people who actually listen to music.',
    icon: 'wave',
    stat: '40mm',
    statLabel: 'drivers',
  },
]

export const stats = [
  { value: 128400, label: 'Devices sold' },
  { value: 47, label: 'Countries shipped' },
  { value: 4.8, label: 'Average rating' },
  { value: 98, label: '% would buy again' },
]

// Load customized overrides from localStorage if present
const getOverriddenProducts = (defaults: Product[]): Product[] => {
  if (typeof window === 'undefined') return defaults
  const stored = localStorage.getItem('audenic-product-overrides')
  if (!stored) return defaults
  try {
    const overrides = JSON.parse(stored) as Product[]
    return defaults.map((d) => {
      const match = overrides.find((o) => o.id === d.id)
      return match ? { ...d, ...match } : d
    })
  } catch {
    return defaults
  }
}

export const products = getOverriddenProducts(baseProducts)
export const extraProducts = getOverriddenProducts(baseExtraProducts)

import { useState, useRef, useEffect, type FormEvent } from 'react'
import { MessageCircle, X, Send, Loader2, Sparkles } from 'lucide-react'
import { products, extraProducts, type Product } from '@/data/products'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
type Message = { role: 'user' | 'assistant'; text: string }

// ---------------------------------------------------------------------------
// Product context for the AI — describe ALL products so the model knows them
// ---------------------------------------------------------------------------
const allProducts: Product[] = [...products, ...extraProducts]

const SYSTEM_PROMPT = `You are Auden, the helpful AI shopping assistant for **Audenic Audio** — a premium Tanzanian audio brand crafting headphones, earbuds, speakers, and soundbars in Dar es Salaam.

**Founder & Chief Sound Engineer:**
- **Mwijay Davie**: The founder, lead hardware designer, and chief sound engineer of Audenic Audio. He hand-tunes every single headset, earbud, and soundbar in the Mikocheni studio in Dar es Salaam. If anyone asks about the founder, "mzee", "bosi", or creator, speak of Mwijay Davie with pride and respect. Highlight that he hand-tunes each device to deliver deep bass and warm treble specifically optimized for African and global music genres, representing Tanzanian craftsmanship.

**Your personality:**
- Friendly, conversational, and proud of Tanzanian craftsmanship.
- Use a mix of English and Swahili naturally where it feels right (e.g. "Karibu", "Mambo!", "Ndiyo, tunafanya delivery", "Sawa").
- Be concise but helpful — 2-4 sentences is usually enough.
- If someone asks something you don't know, be honest.
- You CAN access the full product catalog below — use it to answer questions.

**What you can help with:**
- Product info, prices, specs, features.
- Comparing products.
- Recommendations based on use case (gym, studio, travel, home).
- Order info (direct them to their Account page).
- Company info, policies, support.

**Company info:**
- Email: audenic.audio@gmail.com
- Phone: +255 790 942 616
- Location: Mikocheni B, Dar es Salaam, Tanzania
- Shipping: Worldwide, crafted in Dar es Salaam
- Returns: 60-day return policy, 2-year warranty
- Payment: M-Pesa, Tigopesa, Airtel Money, Card

Here is the complete product catalog. Every product has a name, price (in TSh — Tanzanian Shillings), category, and tagline. Use these to answer questions accurately:

${allProducts
  .map(
    (p) =>
      `- **${p.name}** (${p.category}) — ${p.tagline}\n` +
      `  Price: TSh ${(p.price).toLocaleString()}/-\n` +
      `  Colors: ${p.colors.map((c) => c.name).join(', ')}\n` +
      `  Rating: ${p.rating}/5 (${p.reviewCount} reviews)\n` +
      `  Top features: ${p.features.slice(0, 3).join(' | ')}\n` +
      `  ${p.badge ? `Badge: ${p.badge}` : ''}`
  )
  .join('\n\n')}

## CRITICAL RULES:
1. When someone asks about **price** of a product, ALWAYS respond with the exact price in TSh, using the format "TSh X,XXX/-" (e.g., "TSh 43,500/-").
2. If someone seems ready to buy, gently guide them to the Shop (/shop) or Cart page.
3. Keep Swahili natural — don't force it. Use Swahili greetings and expressions naturally.
4. If you don't know something, say "Sijui kwa uhakika — unaweza wasiliana nasi kwa email audenic.audio@gmail.com au simu +255 790 942 616."
5. NEVER make up prices or specs. Use ONLY the catalog above.`

// ---------------------------------------------------------------------------
// API Keys — loaded from environment variables (VITE_ prefixed)
// ---------------------------------------------------------------------------
const GROQ_KEYS: string[] = import.meta.env.VITE_GROQ_KEYS
  ? import.meta.env.VITE_GROQ_KEYS.split(',').map((k: string) => k.trim()).filter(Boolean)
  : import.meta.env.VITE_GROQ_API_KEY
    ? [import.meta.env.VITE_GROQ_API_KEY]
    : []

const CEREBRAS_KEYS: string[] = import.meta.env.VITE_CEREBRAS_KEYS
  ? import.meta.env.VITE_CEREBRAS_KEYS.split(',').map((k: string) => k.trim()).filter(Boolean)
  : import.meta.env.VITE_CEREBRAS_API_KEY
    ? [import.meta.env.VITE_CEREBRAS_API_KEY]
    : []

const OPENROUTER_KEYS: string[] = import.meta.env.VITE_OPENROUTER_KEYS
  ? import.meta.env.VITE_OPENROUTER_KEYS.split(',').map((k: string) => k.trim()).filter(Boolean)
  : import.meta.env.VITE_OPENROUTER_API_KEY
    ? [import.meta.env.VITE_OPENROUTER_API_KEY]
    : []

// Helper function to query rotating key pools
async function getAIReponse(formattedMessages: { role: string; content: string }[]): Promise<string> {
  // 1. Try Groq Pool first (lowest latency Llama 3)
  for (const key of GROQ_KEYS) {
    try {
      const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${key}`
        },
        body: JSON.stringify({
          model: 'llama-3.3-70b-specdec',
          messages: formattedMessages,
          temperature: 0.7,
          max_tokens: 500
        })
      })
      if (res.ok) {
        const data = await res.json()
        return data?.choices?.[0]?.message?.content || ''
      }
    } catch (e) {
      console.warn('Groq key failed, trying next...', e)
    }
  }

  // 2. Try Cerebras Pool second (highly fast)
  for (const key of CEREBRAS_KEYS) {
    try {
      const res = await fetch('https://api.cerebras.ai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${key}`
        },
        body: JSON.stringify({
          model: 'llama3.1-70b',
          messages: formattedMessages,
          temperature: 0.7,
          max_tokens: 500
        })
      })
      if (res.ok) {
        const data = await res.json()
        return data?.choices?.[0]?.message?.content || ''
      }
    } catch (e) {
      console.warn('Cerebras key failed, trying next...', e)
    }
  }

  // 3. Try OpenRouter Pool third (Fallback)
  for (const key of OPENROUTER_KEYS) {
    try {
      const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${key}`,
          'HTTP-Referer': 'https://audenic.audio',
          'X-Title': 'Audenic Audio AI'
        },
        body: JSON.stringify({
          model: 'meta-llama/llama-3.3-70b-instruct',
          messages: formattedMessages,
          temperature: 0.7,
          max_tokens: 500
        })
      })
      if (res.ok) {
        const data = await res.json()
        return data?.choices?.[0]?.message?.content || ''
      }
    } catch (e) {
      console.warn('OpenRouter key failed, trying next...', e)
    }
  }

  throw new Error('All key pools exhausted.')
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------
export default function AIChatbot() {
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      text: "👋 Mambo! Mimi ni **Auden**, msaidizi wa AI wa Audenic Audio. Una swali lolote kuhusu bidhaa zetu, bei, au uanzishwaji na Mzee Mwijay Davie? Nieleze nami nitakusaidia!",
    },
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [unread, setUnread] = useState(1)
  const listRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // Auto-scroll
  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: 'smooth' })
  }, [messages])

  // Focus input when opened
  useEffect(() => {
    if (open) {
      setUnread(0)
      setTimeout(() => inputRef.current?.focus(), 300)
    }
  }, [open])

  async function handleSend(e: FormEvent) {
    e.preventDefault()
    const trimmed = input.trim()
    if (!trimmed || loading) return

    const userMsg: Message = { role: 'user', text: trimmed }
    setMessages((prev) => [...prev, userMsg])
    setInput('')
    setLoading(true)

    try {
      // Build conversation history in OpenAI format
      const formattedMessages = [
        { role: 'system', content: SYSTEM_PROMPT },
        ...messages.map((m) => ({
          role: m.role,
          content: m.text,
        })),
        { role: 'user', content: trimmed },
      ]

      const text = await getAIReponse(formattedMessages)
      
      if (!text) {
        throw new Error('Empty response content.')
      }

      setMessages((prev) => [...prev, { role: 'assistant', text }])
    } catch (err) {
      console.error(err)
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          text: "Samahani — hitilafu imetokea kwenye muunganisho wa AI. Tafadhali wasiliana nasi kwa barua pepe **audenic.audio@gmail.com** au piga simu **+255 790 942 616** kwa msaada wa haraka! 📧",
        },
      ])
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      {/* Floating button */}
      <button
        onClick={() => setOpen((o) => !o)}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-flame-500 text-cream-50 shadow-xl hover:bg-flame-600 transition-all flex items-center justify-center group active:scale-90"
        aria-label={open ? 'Funga chat' : 'Fungua chat'}
      >
        {open ? <X size={24} /> : <MessageCircle size={24} />}
        {unread > 0 && !open && (
          <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-rose-500 text-cream-50 text-[10px] font-bold flex items-center justify-center animate-pulse">
            {unread}
          </span>
        )}
      </button>

      {/* Chat window */}
      <div
        className={`fixed bottom-24 right-6 z-50 w-[calc(100vw-2rem)] sm:w-[380px] max-h-[600px] bg-white rounded-3xl border border-ink-200 shadow-2xl flex flex-col transition-all duration-300 origin-bottom-right ${
          open ? 'opacity-100 scale-100 pointer-events-auto' : 'opacity-0 scale-95 pointer-events-none'
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-ink-100 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-flame-400 to-flame-600 flex items-center justify-center">
              <Sparkles size={16} className="text-cream-50" />
            </div>
            <div>
              <p className="font-display font-semibold text-sm">Auden</p>
              <p className="text-[10px] text-emerald-600 font-mono flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block animate-pulse" />
                Online — AI Assistant
              </p>
            </div>
          </div>
          <button
            onClick={() => setOpen(false)}
            className="w-8 h-8 rounded-full flex items-center justify-center text-ink-400 hover:bg-ink-50 transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        {/* Messages */}
        <div ref={listRef} className="flex-1 overflow-y-auto px-5 py-4 space-y-4 scroll-smooth">
          {messages.map((m, i) => (
            <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div
                className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
                  m.role === 'user'
                    ? 'bg-ink-900 text-cream-50 rounded-tr-md'
                    : 'bg-cream-100 text-ink-900 rounded-tl-md'
                }`}
              >
                <div
                  className="prose prose-sm max-w-none"
                  style={{ whiteSpace: 'pre-wrap' }}
                  dangerouslySetInnerHTML={{
                    __html: m.text
                      .replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold">$1</strong>')
                      .replace(/\n/g, '<br/>'),
                  }}
                />
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex justify-start">
              <div className="bg-cream-100 rounded-2xl rounded-tl-md px-4 py-3">
                <Loader2 size={16} className="animate-spin text-flame-500" />
              </div>
            </div>
          )}
        </div>

        {/* Input */}
        <form onSubmit={handleSend} className="shrink-0 border-t border-ink-100 p-3 flex items-center gap-2">
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Uliza swali lolote..."
            className="flex-1 bg-cream-50 rounded-full px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-flame-500/30 border border-ink-100 placeholder:text-ink-400 text-ink-950"
            disabled={loading}
          />
          <button
            type="submit"
            disabled={!input.trim() || loading}
            className="w-10 h-10 rounded-full bg-ink-900 text-cream-50 flex items-center justify-center hover:bg-flame-500 transition-colors disabled:opacity-40 disabled:cursor-not-allowed shrink-0"
          >
            {loading ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
          </button>
        </form>
      </div>
    </>
  )
}
import Reveal from '@/components/Reveal'

export default function Terms() {
  return (
    <section className="container-fluid py-20 max-w-4xl mx-auto">
      <Reveal>
        <p className="font-mono text-xs uppercase tracking-[0.3em] text-ink-500 mb-2">
          [ Masharti na Vigezo ]
        </p>
        <h1 className="font-display text-4xl md:text-5xl font-medium tracking-tight mb-10">
          Terms &amp; Conditions
        </h1>
      </Reveal>

      <Reveal delay={0.1}>
        <div className="prose prose-ink max-w-none text-ink-700 space-y-6 text-sm md:text-base leading-relaxed">
          <p>
            Karibu Audenic Audio. Tunakushukuru kwa kuchagua bidhaa zetu za sauti ambazo zimetengenezwa kwa mikono na kupimwa kwa sikio jijini Dar es Salaam. Masharti haya ya huduma yanatawala matumizi yako ya tovuti yetu na ununuzi wa bidhaa zetu.
          </p>

          <h2 className="font-display text-xl font-semibold text-ink-900 pt-4">
            1. Ununuzi na Malipo (Purchases &amp; Payments)
          </h2>
          <p>
            Kwa kufanya agizo kupitia tovuti yetu, unakubali kutoa maelezo sahihi ya malipo na usafirishaji. Tunakubali njia mbalimbali za malipo ikijumuisha M-Pesa, Tigo Pesa, Airtel Money, na kadi za mkopo/debit. Maagizo yote yatashughulikiwa mara tu baada ya malipo kuthibitishwa.
          </p>

          <h2 className="font-display text-xl font-semibold text-ink-900 pt-4">
            2. Usafirishaji na Uwasilishaji (Shipping &amp; Delivery)
          </h2>
          <p>
            Tunatoa usafirishaji wa bure kwa maagizo ya kuanzia TSh 50,000 ndani ya Dar es Salaam na Dodoma. Kwa mikoa mingine ya Tanzania, gharama ya usafirishaji wa jumla ni TSh 5,000. Uwasilishaji kawaida huchukua masaa 2-4 ndani ya Dar es Salaam na siku 1-3 kwa mikoa mingine.
          </p>

          <h2 className="font-display text-xl font-semibold text-ink-900 pt-4">
            3. Dhamana na Kurudisha Bidhaa (Warranty &amp; Returns)
          </h2>
          <p>
            Spika na headphones zetu zote zina dhamana ya miaka miwili dhidi ya kasoro za kiwanda. Ikiwa hujaridhishwa na bidhaa uliyoinunua, unaweza kuirudisha ndani ya siku 60 katika hali yake ya awali (pamoja na boksi lake) kwa ajili ya kubadilishiwa au kurejeshewa fedha zako kikamilifu.
          </p>

          <h2 className="font-display text-xl font-semibold text-ink-900 pt-4">
            4. Sheria Inayotumika (Governing Law)
          </h2>
          <p>
            Masharti haya yanasimamiwa na kufasiriwa kwa mujibu wa sheria za Jamhuri ya Muungano wa Tanzania. Migogoro yote itatatuliwa chini ya mamlaka ya mahakama za Tanzania.
          </p>

          <h2 className="font-display text-xl font-semibold text-ink-900 pt-4">
            5. Mabadiliko ya Masharti (Amendments)
          </h2>
          <p>
            Audenic Audio ina haki ya kubadilisha au kurekebisha masharti haya wakati wowote. Mabadiliko yoyote yataanza kutumika mara tu yatakapowekwa kwenye tovuti yetu. Ni wajibu wako kupitia ukurasa huu mara kwa mara ili kufahamu mabadiliko yoyote.
          </p>
          
          <div className="pt-8 text-xs font-mono text-ink-400">
            Imesasishwa mwisho: Julai 14, 2026
          </div>
        </div>
      </Reveal>
    </section>
  )
}

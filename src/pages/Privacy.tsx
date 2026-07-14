import Reveal from '@/components/Reveal'

export default function Privacy() {
  return (
    <section className="container-fluid py-20 max-w-4xl mx-auto">
      <Reveal>
        <p className="font-mono text-xs uppercase tracking-[0.3em] text-ink-500 mb-2">
          [ Sera ya Faragha ]
        </p>
        <h1 className="font-display text-4xl md:text-5xl font-medium tracking-tight mb-10">
          Privacy Policy
        </h1>
      </Reveal>

      <Reveal delay={0.1}>
        <div className="prose prose-ink max-w-none text-ink-700 space-y-6 text-sm md:text-base leading-relaxed">
          <p>
            Katika Audenic Audio, faragha ya wateja wetu ni kipaumbele chetu kikuu. Sera hii ya faragha inaelezea jinsi tunavyokusanya, kutumia, na kulinda taarifa zako unapotembelea tovuti yetu au unaponunua bidhaa zetu.
          </p>

          <h2 className="font-display text-xl font-semibold text-ink-900 pt-4">
            1. Taarifa Tunazokusanya (Information We Collect)
          </h2>
          <p>
            Tunakusanya taarifa unazotupatia moja kwa moja unaposajili akaunti, unapofanya ununuzi, au unapotuma maombi ya kupokea barua pepe zetu za matangazo. Taarifa hizi ni pamoja na:
          </p>
          <ul className="list-disc pl-5 space-y-1">
            <li>Jina lako kamili</li>
            <li>Barua pepe (Email Address)</li>
            <li>Namba ya simu</li>
            <li>Anwani ya usafirishaji</li>
            <li>Maelezo ya malipo (maelezo yote ya kadi yanasimamiwa kwa usalama na processor wetu wa malipo na hayahifadhiwi kwenye seva zetu).</li>
          </ul>

          <h2 className="font-display text-xl font-semibold text-ink-900 pt-4">
            2. Jinsi Tunavyotumia Taarifa Zako (How We Use Your Info)
          </h2>
          <p>
            Tunatumia taarifa tunazokusanya kwa madhumuni yafuatayo:
          </p>
          <ul className="list-disc pl-5 space-y-1">
            <li>Kushughulikia na kusafirisha maagizo yako (orders).</li>
            <li>Kutuma taarifa za ufuatiliaji wa usafirishaji wa bidhaa zako.</li>
            <li>Kukutumia barua pepe za matangazo na ofa mpya za punguzo la bei (ikiwa ulikubali kujiunga).</li>
            <li>Kuboresha huduma zetu na tovuti yetu kulingana na jinsi wateja wanavyoitumia.</li>
          </ul>

          <h2 className="font-display text-xl font-semibold text-ink-900 pt-4">
            3. Ulinzi wa Taarifa (Data Security)
          </h2>
          <p>
            Tovuti yetu inatumia ulinzi wa kiwango cha juu cha SSL (Secure Sockets Layer) ili kuhakikisha kuwa data zote zinazopita kati ya kivinjari chako na seva zetu zinasimbwa kwa njia salama. RLS (Row-Level Security) katika database yetu ya Supabase inazuia watumiaji wengine kuona au kurekebisha data zako binafsi bila ruhusa.
          </p>

          <h2 className="font-display text-xl font-semibold text-ink-900 pt-4">
            4. Vidakuzi (Cookies)
          </h2>
          <p>
            Tunatumia vidakuzi ili kuboresha uzoefu wako kwenye tovuti yetu (kwa mfano kuweka bidhaa kwenye kikapu chako cha manunuzi hata ukifunga tovuti na kurudi baadae). Unaweza kuzima vidakuzi kwenye mipangilio ya kivinjari chako, lakini baadhi ya vipengele vya tovuti vinaweza visifanye kazi vizuri.
          </p>

          <div className="pt-8 text-xs font-mono text-ink-400">
            Imesasishwa mwisho: Julai 14, 2026
          </div>
        </div>
      </Reveal>
    </section>
  )
}

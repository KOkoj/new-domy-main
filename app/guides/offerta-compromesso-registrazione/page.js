'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, Calendar, Clock, CheckCircle, AlertTriangle, FileText, Shield, Landmark } from 'lucide-react'
import Navigation from '@/components/Navigation'
import Footer from '@/components/Footer'
import { Button } from '@/components/ui/button'
import InformationalDisclaimer from '@/components/legal/InformationalDisclaimer'

const CONTENT = {
  cs: {
    back: 'Zpět na články',
    category: 'Právo',
    date: '2026-03-26',
    readTime: '9 min',
    title: 'Jak podat nabídku na koupi domu v Itálii: návrh, compromesso a registrace',
    intro: [
      'Při koupi domu v Itálii patří mezi nejvíce podceňované fáze právě období od první nabídky až po registraci compromessa. Právě zde často vznikají chyby, nesprávná očekávání a závazky přijaté příliš brzy.',
      'Pro kupujícího ze zahraničí není klíčové jen pochopit, jaký dokument podepisuje, ale hlavně kdy se tento dokument stává závazným, jaké částky se skutečně skládají, co musí být napsáno a jaké kontroly je nutné udělat ještě před závazkem.',
      'V tomto článku se záměrně zastavíme ještě před rogitem. Cílem je jasně vysvětlit fázi nabídky, předběžné smlouvy a registrace compromessa.'
    ],
    keyIdea:
      'Klíčová myšlenka: v Itálii návrh koupě a compromesso nejsou jen běžná obchodní formalita. Jsou to právní kroky, které při špatném znění nebo příliš časném podpisu mohou výrazně změnit vaše riziko, vyjednávací pozici i náklady.',
    beforeTitle: 'Než podáte nabídku: co už musí být jasné',
    beforeIntro:
      'Ještě před tím, než dáte nabídku písemně, by mělo být jasné alespoň toto:',
    before: [
      'cena, kterou jste skutečně připraveni zaplatit, včetně vedlejších nákladů a daní',
      'reálný časový plán koupě, zejména pokud potřebujete hypotéku nebo prodáváte jinou nemovitost',
      'kdo kupuje: fyzická osoba, pár nebo společnost',
      'jaké odkládací podmínky je potřeba vložit už do návrhu',
      'jaké minimální dokumenty si musíte vyžádat ještě před vážným závazkem'
    ],
    beforeNote:
      'Typická chyba: považovat nabídku jen za projev zájmu. Ve skutečnosti může po přijetí a při určité formulaci vyvolat velmi významné účinky.',
    proposalTitle: 'Návrh koupě: co to skutečně je',
    proposalText:
      'Návrh koupě je písemná nabídka, ve které kupující uvede cenu, podmínky a lhůtu, ve které může prodávající nabídku přijmout. Dokud není přijata, obecně zůstává návrhem. Po přijetí je ale potřeba velmi pečlivě číst, jak byl dokument napsán: v praxi může zůstat jen mezikrokem směrem ke compromessu, nebo už mít strukturu velmi blízkou skutečné předběžné smlouvě.',
    proposalList: [
      'správná identifikace stran a nemovitosti',
      'nabízená cena a způsob úhrady',
      'případná částka složená jako depozitum, caparra nebo záloha',
      'lhůta pro přijetí',
      'termín, do kdy se má podepsat compromesso nebo dojít k rogitu',
      'odkládací nebo rozvazovací podmínky'
    ],
    proposalAlert:
      'Nabídku nelze hodnotit podle názvu formuláře, ale podle jejího skutečného obsahu. Právě text určuje, jak moc jste už zavázáni.',
    bindingTitle: 'Kdy se návrh stává závazným',
    bindingText:
      'Citlivým okamžikem je přijetí návrhu prodávajícím. Od té chvíle nestačí říct „byla to jen nabídka“. Pokud dokument už obsahuje podstatné prvky dohody, může se situace stát právně mnohem závaznější, než si kupující myslí.',
    bindingList: [
      'čím úplnější je text, tím vyšší je míra závazku',
      'pokud skládáte peníze bez jasně napsaných podmínek, riziko okamžitě roste',
      'když chybí ochranné klauzule, pozdější získání prostoru je velmi obtížné',
      'přijatá nabídka může při nesplnění povinností rychle otevřít spor'
    ],
    clauseTitle: 'Caparra, záloha a odkládací podmínky: body, které se nesmí brát lehce',
    clauseText:
      'Jednou z nejčastějších chyb je zaměňování caparry a zálohy nebo podpis bez jasného vymezení podmínek, které chrání kupujícího. Nestačí vědět, že se skládá určitá částka. Je nutné vědět, z jakého titulu se skládá a jaké má právní následky.',
    clauseList: [
      'caparra confirmatoria: posiluje závazek mezi stranami a má přesné důsledky při nesplnění',
      'záloha na kupní cenu: je předplatbou kupní ceny a musí se číst ve vazbě na zbytek smlouvy',
      'odkládací podmínka kvůli hypotéce: zásadní, pokud koupě závisí na financování',
      'ustanovení navázaná na dokumenty, soulad nebo technické kontroly: často rozhodují o tom, zda předejdete drahým chybám'
    ],
    clauseNote:
      'Pokud kupující potřebuje hypotéku, odkládací podmínka není detail. Je to jedna z hlavních ochran, kterou je nutné dobře nastavit ještě před podpisem.',
    transitionTitle: 'Od přijaté nabídky ke compromessu',
    transitionText:
      'Mezi přijatou nabídkou a compromessem se otevírá klíčová provozní fáze. Tehdy se ověřují dokumenty, vyjasňují případné problémy a připravuje se úplnější text s přesnějšími termíny a povinnostmi.',
    transitionList: [
      'shromáždění a kontrola dostupné dokumentace',
      'ověření bodů, které v návrhu zůstaly nejasné',
      'nastavení termínů rogita, předání nemovitosti, plateb a předání',
      'sladění mezi agenturou, prodávajícím, kupujícím, technikem a notářem'
    ],
    transitionAlert:
      'Pokud se v této fázi objeví urbanistické, katastrální nebo dokumentační problémy, ignorovat je jen proto, abyste „nepřišli o příležitost“, bývá jednou z nejdražších chyb.',
    compromessoTitle: 'Co je compromesso a co musí obsahovat',
    compromessoText:
      'Compromesso neboli předběžná smlouva je dokument, kterým se prodávající i kupující zavazují uzavřít budoucí kupní smlouvu za sjednaných podmínek. Vlastnictví se jím ještě nepřevádí, ale vzniká skutečný smluvní závazek.',
    compromessoList: [
      'úplné údaje o stranách',
      'přesný popis nemovitosti a související katastrální údaje',
      'celková cena a způsob plateb',
      'již zaplacené částky a jejich právní kvalifikace',
      'plánované datum rogita',
      'případné stále otevřené odkládací podmínky',
      'závazky prodávajícího ohledně dokumentů, souladu a uvolnění nemovitosti',
      'jasné rozdělení nákladů a souvisejících povinností'
    ],
    compromessoNote:
      'Dobrý compromesso neslouží jen k tomu, aby „zablokoval dům“. Slouží ke snížení nejasností, prevenci sporů a přesnému určení toho, kdo co musí udělat před rogitem.',
    compromessoCta: 'Stahnout PDF o compromessu',
    compromessoCtaHref: '/pdfs/art%20compromessoi.pdf',
    registrationTitle: 'Registrace compromessa: lhůty, daně a kdo ji zajišťuje',
    registrationText:
      'Preliminární smlouva se musí registrovat. Obecně platí, že registrace má proběhnout do 20 dnů od podpisu; pokud je preliminární smlouva sepsána notářským aktem, běžná lhůta je 30 dnů a úkon zajišťuje notář. Registrace nepřevádí vlastnictví, ale je povinným a velmi důležitým daňovým krokem.',
    registrationList: [
      'pevná registrační daň z preliminární smlouvy',
      'proporcionální daň z caparry confirmatorie, pokud je sjednána',
      'proporcionální daň ze záloh na kupní cenu, pokud nepodléhají DPH',
      'kolky a provozní náklady registrace'
    ],
    registrationNote:
      'Kdo konkrétně registraci provádí, často závisí na způsobu vedení celé transakce: může to být agentura, pověřený profesionál nebo notář, pokud je preliminární smlouva notářská. V praxi ale registraci zpravidla hradí kupující a orientačně je potřeba počítat s nákladem zhruba 200 až 300 EUR. Pro kupujícího ale není podstatné slepě delegovat. Podstatné je vědět, že registrace musí být provedena správně a včas.',
    registrationExtraTitle: 'Registrace ještě neznamená úplnou ochranu',
    registrationExtraText:
      'Mnoho kupujících se domnívá, že po registraci compromessa „už je všechno v pořádku“. Tak to ale není. Registrace je daňový úkon a dokládá existenci preliminární smlouvy, automaticky však neznamená její zápis do katastrálních či nemovitostních registrů v širším smyslu ochrany.',
    registrationExtraList: [
      'registrace sama o sobě nepřevádí vlastnictví',
      'registrace nenahrazuje technické a právní kontroly',
      'v některých citlivých případech je nutné zvážit i trascrizione preliminární smlouvy',
      'správná míra ochrany závisí na konkrétním riziku dané transakce'
    ],
    registrationExtraNote:
      'Pokud je mezi compromessem a rogitem dlouhá doba, už byly zaplaceny významné částky nebo je situace dokumentačně složitá, samotná registrace nemusí být dostatečná.',
    checklistTitle: 'Praktický checklist před podpisem nabídky nebo compromessa',
    checklistIntro:
      'Jestliže vám není jasný byť jen jeden z těchto bodů, zpomalte ještě před podpisem:',
    checklist: [
      'Víte přesně, zda skládaná částka je caparra nebo záloha?',
      'Rozumíte tomu, kdy se dokument stává závazným?',
      'Jsou odkládací podmínky napsané jasně, a ne jen slíbené ústně?',
      'Je jasné, kdo registruje compromesso a v jaké lhůtě?',
      'Ověřili jste si už, jaké kontroly musí proběhnout před rogitem a kdo je provádí?'
    ],
    finalTitle: 'Rozhodující bod',
    finalText:
      'V Itálii není fáze nabídky a compromessa jen byrokratickým koridorem mezi prohlídkou a rogitem. Je to fáze, ve které se rozhoduje, jaké riziko přebíráte, jakou skutečnou ochranu máte a jak obtížné bude později napravit případné chyby. Čím jasnější je tato fáze, tím méně nepříjemných překvapení vás čeká později.',
    finalPrimaryCta: 'Zobrazit celý proces',
    finalPrimaryCtaHref: '/process',
    finalSecondaryCta: 'Přečíst článek o notáři',
    finalSecondaryCtaHref: '/guides/notary'
  },
  en: {
    back: 'Back to articles',
    category: 'Legal',
    date: '2026-03-26',
    readTime: '9 min',
    title: 'How to make an offer on a house in Italy: proposal, preliminary contract, and registration',
    intro: [
      'When buying a house in Italy, one of the most underestimated stages is the period between the first offer and the registration of the preliminary contract. This is exactly where mistakes, wrong expectations, and commitments made too early often begin.',
      'For buyers coming from abroad, the key issue is not only understanding which document they are signing, but also when that document becomes binding, what money is actually being paid, what must be written into the text, and which checks need to be completed before committing.',
      'In this article, we deliberately stop before the final deed. The goal is to clarify the offer stage, the preliminary contract, and the registration of the compromesso.'
    ],
    keyIdea:
      'Key idea: in Italy, the purchase proposal and the compromesso are not just routine commercial formalities. They are legal steps that, if drafted badly or signed too early, can materially change your level of risk, your negotiating position, and your costs.',
    beforeTitle: 'Before making an offer: what should already be clear',
    beforeIntro:
      'Before putting an offer in writing, at least these points should already be defined:',
    before: [
      'the price you are truly ready to pay, including taxes and extra costs',
      'a realistic purchase timeline, especially if you need mortgage approval or must sell another property',
      'who is buying: an individual, a couple, or a company',
      'which suspensive conditions need to be included from the offer stage',
      'which minimum documents should be requested before making a serious commitment'
    ],
    beforeNote:
      'Typical mistake: treating the offer as a simple expression of interest. In reality, once accepted and drafted in a certain way, it can already produce significant effects.',
    proposalTitle: 'The purchase proposal: what it really is',
    proposalText:
      'A purchase proposal is a written offer in which the buyer indicates the price, conditions, and deadline within which the seller may accept. Until it is accepted, it generally remains a proposal. After acceptance, however, the wording must be read very carefully: in practice it may remain a preliminary step toward the compromesso, or it may already be structured very closely to a true preliminary contract.',
    proposalList: [
      'correct identification of the parties and the property',
      'offered price and payment method',
      'any amount left as a deposit, caparra, or advance payment',
      'acceptance deadline',
      'deadline for signing the preliminary contract or proceeding to the final deed',
      'suspensive or resolutive conditions'
    ],
    proposalAlert:
      'A proposal should not be judged by the name of the form, but by its real content. It is the text that determines how committed you already are.',
    bindingTitle: 'When the proposal becomes binding',
    bindingText:
      'The sensitive moment is the seller’s acceptance. From that point on, it is no longer enough to say “it was only an offer.” If the document already contains the essential elements of the agreement, the situation can become legally far more binding than the buyer expects.',
    bindingList: [
      'the more complete the text, the stronger the commitment',
      'if money is paid without clearly written conditions, the risk rises immediately',
      'if protective clauses are missing, it becomes very difficult to regain room later',
      'an accepted proposal may immediately open the door to a dispute in case of breach'
    ],
    clauseTitle: 'Caparra, advance payment, and suspensive clauses: points never to treat lightly',
    clauseText:
      'One of the most common mistakes is confusing caparra with an advance payment, or signing without clearly defining the conditions that protect the buyer. In practice, it is not enough to know that money is being paid. You must know under which legal heading it is paid and what consequences it creates.',
    clauseList: [
      'caparra confirmatoria: strengthens the commitment between the parties and has specific consequences in case of breach',
      'advance payment on the price: it is part of the purchase price and must be read together with the rest of the contract',
      'suspensive mortgage clause: essential when the purchase depends on financing',
      'clauses linked to documents, compliance, or technical checks: often decisive in avoiding expensive mistakes'
    ],
    clauseNote:
      'If the buyer needs mortgage financing, the suspensive clause is not a minor detail. It is one of the main protections to define properly before signing.',
    transitionTitle: 'From accepted proposal to compromesso',
    transitionText:
      'Between the accepted proposal and the compromesso, a crucial operational phase begins. This is when documents are checked, any open issues are clarified, and a more complete text is prepared, with clearer deadlines and obligations.',
    transitionList: [
      'collection and review of the available documentation',
      'verification of any points that remained ambiguous in the proposal',
      'definition of timing for the final deed, release of the property, payments, and handover',
      'alignment between agency, seller, buyer, technician, and notary'
    ],
    transitionAlert:
      'If urban planning, cadastral, or documentary problems emerge at this stage, ignoring them just to “not lose the deal” is often the most expensive mistake.',
    compromessoTitle: 'What the compromesso is and what it must contain',
    compromessoText:
      'The compromesso, or preliminary contract, is the document by which the seller and buyer commit to completing the future sale under the agreed terms. It does not yet transfer ownership, but it creates a real contractual obligation.',
    compromessoList: [
      'full details of the parties',
      'precise description of the property and related cadastral data',
      'total price and payment structure',
      'amounts already paid and their legal qualification',
      'planned date for the final deed',
      'any suspensive conditions still pending',
      'seller’s obligations regarding documentation, compliance, and release of the property',
      'clear allocation of related costs and obligations'
    ],
    compromessoNote:
      'A good compromesso does not only serve to “reserve the house.” It serves to reduce ambiguity, prevent conflict, and clearly state who must do what before the final deed.',
    compromessoCta: 'Download the compromesso PDF',
    compromessoCtaHref: '/pdfs/art%20compromessoi.pdf',
    registrationTitle: 'Registration of the compromesso: timing, taxes, and who handles it',
    registrationText:
      'The preliminary contract must be registered. As a general rule, registration must be completed within 20 days of signing; if the preliminary contract is executed as a notarial deed, the ordinary deadline is 30 days and the notary handles the filing. Registration does not transfer ownership, but it is a mandatory and very important tax requirement.',
    registrationList: [
      'fixed registration tax on the preliminary contract',
      'proportional tax on the caparra confirmatoria, if provided',
      'proportional tax on advance payments not subject to VAT, if provided',
      'stamp duties and operational registration costs'
    ],
    registrationNote:
      'Who practically registers the contract often depends on how the transaction has been managed: it may be the agency, an appointed professional, or the notary if the preliminary contract is in notarial form. In practice, however, the registration cost is generally borne by the buyer, and a typical range to budget for is around 200 to 300 EUR. For the buyer, however, the point is not to delegate blindly. The point is to know that registration must be done correctly and on time.',
    registrationExtraTitle: 'Registration does not yet mean full protection',
    registrationExtraText:
      'Many buyers think that once the compromesso has been registered, “everything is now safe.” That is not the case. Registration is a tax requirement and proves the existence of the preliminary contract, but it does not automatically amount to a full protective filing in the property registers.',
    registrationExtraList: [
      'registration does not transfer ownership',
      'registration does not replace technical and legal checks',
      'in some sensitive cases, transcription of the preliminary contract should also be evaluated',
      'the correct level of protection depends on the actual risk of the transaction'
    ],
    registrationExtraNote:
      'When there is a long gap between the preliminary contract and the final deed, when significant amounts have already been paid, or when the documentation is complex, relying on registration alone may not be enough.',
    checklistTitle: 'Practical checklist before signing the proposal or compromesso',
    checklistIntro:
      'If even one of these points is unclear, slow down before signing:',
    checklist: [
      'Do you know exactly whether the amount you are paying is caparra or an advance payment?',
      'Do you understand when the document becomes binding?',
      'Are suspensive conditions written clearly and not only promised verbally?',
      'Is it clear who will register the compromesso and within what timing?',
      'Have you already verified which checks must be completed before the final deed, and by whom?'
    ],
    finalTitle: 'The decisive point',
    finalText:
      'In Italy, the proposal-compromesso phase is not just a bureaucratic corridor between a viewing and the final deed. It is the stage in which your real level of risk, your actual protection, and the difficulty of correcting mistakes later are all decided. The clearer this phase is, the fewer surprises you will face afterward.',
    finalPrimaryCta: 'See the full process',
    finalPrimaryCtaHref: '/process',
    finalSecondaryCta: 'Read the notary article',
    finalSecondaryCtaHref: '/guides/notary'
  },
  it: {
    back: 'Torna agli articoli',
    category: 'Legale',
    date: '2026-03-26',
    readTime: '9 min',
    title: "Come fare un'offerta per comprare casa in Italia: proposta, compromesso e registrazione",
    intro: [
      "Quando si compra casa in Italia, uno dei passaggi più sottovalutati è quello che va dalla prima offerta fino alla registrazione del compromesso. Ed è proprio qui che spesso nascono errori, aspettative sbagliate e impegni presi troppo presto.",
      "Per chi compra dall'estero, il punto critico non è solo capire quale documento si firma, ma capire quando quel documento diventa vincolante, quali somme si versano davvero, cosa deve essere scritto e quali controlli vanno fatti prima di impegnarsi.",
      "In questo articolo ci fermiamo volutamente prima del rogito. L'obiettivo è chiarire bene la fase dell'offerta, del preliminare e della registrazione del compromesso."
    ],
    keyIdea:
      "Idea chiave: in Italia proposta e compromesso non sono una semplice formalità commerciale. Sono passaggi giuridici che, se scritti male o firmati troppo presto, possono cambiare in modo concreto il tuo rischio, il tuo margine negoziale e i tuoi costi.",
    beforeTitle: "Prima di fare un'offerta: cosa deve essere già chiaro",
    beforeIntro:
      "Prima di mettere per iscritto una proposta, dovrebbero essere già definiti almeno questi punti:",
    before: [
      "prezzo che sei davvero disposto a sostenere, inclusi costi accessori e imposte",
      "tempi realistici di acquisto, soprattutto se hai bisogno di mutuo o di vendere un altro immobile",
      "soggetto che compra: persona fisica, coppia o società",
      "eventuali condizioni sospensive da inserire già in proposta",
      "documenti minimi da richiedere prima di impegnarti seriamente"
    ],
    beforeNote:
      "Errore tipico: trattare la proposta come un semplice segnale di interesse. In realtà, se viene accettata e formulata in un certo modo, può già produrre effetti molto rilevanti.",
    proposalTitle: "La proposta d'acquisto: che cos'è davvero",
    proposalText:
      "La proposta d'acquisto è un'offerta scritta con cui l'acquirente indica il prezzo, le condizioni e il termine entro cui il venditore può accettare. Finché non viene accettata, in linea generale resta una proposta. Dopo l'accettazione, però, bisogna leggere molto bene come è stata scritta: in pratica può restare un passaggio preliminare verso il compromesso, oppure avere già una struttura molto vicina a un vero preliminare.",
    proposalList: [
      "identificazione corretta delle parti e dell'immobile",
      "prezzo offerto e modalità di pagamento",
      "eventuale somma lasciata a titolo di deposito, caparra o acconto",
      "scadenza per l'accettazione",
      "termine entro cui firmare il compromesso o andare al rogito",
      "condizioni sospensive o risolutive"
    ],
    proposalAlert:
      "La proposta non va giudicata dal nome del modulo, ma dal suo contenuto reale. È il testo che determina quanto sei già impegnato.",
    bindingTitle: "Quando la proposta diventa vincolante",
    bindingText:
      "Il momento delicato è l'accettazione del venditore. Da lì in poi non basta dire “era solo una proposta”. Se il documento contiene già gli elementi essenziali dell'accordo, la situazione può diventare giuridicamente molto più impegnativa di quanto l'acquirente immagini.",
    bindingList: [
      "più il testo è completo, più aumenta il livello di impegno",
      "se versi denaro senza condizioni ben scritte, il rischio sale subito",
      "se mancano clausole di tutela, recuperare margine dopo è molto difficile",
      "una proposta accettata può aprire immediatamente un contenzioso in caso di inadempimento"
    ],
    clauseTitle: "Caparra, acconto e clausole sospensive: i punti che non vanno mai trattati con leggerezza",
    clauseText:
      "Uno degli errori più frequenti è confondere caparra e acconto, oppure firmare senza aver definito bene le condizioni che proteggono l'acquirente. In pratica, non basta sapere che si versa una somma: bisogna sapere a che titolo viene versata e che conseguenze produce.",
    clauseList: [
      "caparra confirmatoria: rafforza l'impegno tra le parti e ha effetti precisi in caso di inadempimento",
      "acconto prezzo: è un anticipo sul prezzo e va letto in relazione al resto del contratto",
      "clausola sospensiva per mutuo: essenziale quando l'acquisto dipende dal finanziamento",
      "clausole legate a documenti, conformità o verifiche tecniche: spesso decisive per evitare errori costosi"
    ],
    clauseNote:
      "Se l'acquirente compra con mutuo, la condizione sospensiva non è un dettaglio. È una delle protezioni principali da definire bene prima di firmare.",
    transitionTitle: "Dalla proposta accettata al compromesso",
    transitionText:
      "Tra la proposta accettata e il compromesso si apre una fase operativa fondamentale. È il momento in cui si verificano documenti, si chiariscono eventuali criticità e si prepara un testo più completo, con termini e obblighi più precisi.",
    transitionList: [
      "raccolta e controllo della documentazione disponibile",
      "verifica di eventuali punti rimasti ambigui nella proposta",
      "definizione dei tempi per rogito, liberazione immobile, pagamenti e consegne",
      "allineamento tra agenzia, venditore, acquirente, tecnico e notaio"
    ],
    transitionAlert:
      "Se in questa fase emergono problemi urbanistici, catastali o documentali, ignorarli per “non perdere l'affare” è spesso l'errore più costoso.",
    compromessoTitle: "Che cos'è il compromesso e cosa deve contenere",
    compromessoText:
      "Il compromesso, o contratto preliminare, è il documento con cui venditore e acquirente si obbligano a concludere la futura compravendita alle condizioni pattuite. Non trasferisce ancora la proprietà, ma crea un vincolo contrattuale vero e proprio.",
    compromessoList: [
      "dati completi delle parti",
      "descrizione precisa dell'immobile e dei relativi dati catastali",
      "prezzo totale e modalità dei pagamenti",
      "importi già versati e loro qualificazione giuridica",
      "data prevista per il rogito",
      "eventuali condizioni sospensive ancora pendenti",
      "impegni del venditore su documenti, conformità e liberazione dell'immobile",
      "ripartizione chiara di spese e oneri collegati"
    ],
    compromessoNote:
      "Un buon compromesso non serve solo a “bloccare la casa”. Serve a ridurre ambiguità, prevenire conflitti e mettere per iscritto chi deve fare cosa prima del rogito.",
    compromessoCta: 'Scarica il PDF sul compromesso',
    compromessoCtaHref: '/pdfs/art%20compromessoi.pdf',
    registrationTitle: "Registrazione del compromesso: tempi, imposte e chi se ne occupa",
    registrationText:
      "Il preliminare deve essere registrato. In linea generale, la registrazione va fatta entro 20 giorni dalla firma; se il preliminare è stipulato con atto notarile, il termine ordinario è 30 giorni a cura del notaio. La registrazione non trasferisce la proprietà, ma è un adempimento fiscale obbligatorio e molto importante.",
    registrationList: [
      "imposta di registro in misura fissa sul preliminare",
      "imposta proporzionale sulla caparra confirmatoria, se prevista",
      "imposta proporzionale sugli acconti prezzo non soggetti a IVA, se previsti",
      "marche da bollo e costi operativi di registrazione"
    ],
    registrationNote:
      "Chi registra in concreto dipende spesso da come è stata gestita l'operazione: può occuparsene l'agenzia, un professionista incaricato oppure il notaio se il preliminare è notarile. In pratica, però, la registrazione è normalmente a carico dell'acquirente e conviene considerare un costo indicativo di circa 200-300 EUR. Ma per il compratore il punto non è delegare alla cieca: il punto è sapere che la registrazione va fatta correttamente e nei tempi.",
    registrationExtraTitle: "Registrazione non significa ancora protezione completa",
    registrationExtraText:
      "Molti compratori pensano che una volta registrato il compromesso “sia tutto a posto”. Non è così. La registrazione è un adempimento fiscale e prova l'esistenza del preliminare, ma non equivale automaticamente alla trascrizione nei Registri Immobiliari.",
    registrationExtraList: [
      "la registrazione non trasferisce la proprietà",
      "la registrazione non sostituisce le verifiche tecniche e legali",
      "in alcuni casi delicati va valutata anche la trascrizione del preliminare",
      "la scelta della tutela corretta dipende dal rischio concreto dell'operazione"
    ],
    registrationExtraNote:
      "Quando ci sono tempi lunghi tra preliminare e rogito, importi rilevanti già versati o situazioni documentali complesse, fermarsi alla sola registrazione può non essere sufficiente.",
    checklistTitle: "Checklist pratica prima di firmare proposta o compromesso",
    checklistIntro:
      "Se anche uno solo di questi punti non è chiaro, rallenta prima di firmare:",
    checklist: [
      "Sai esattamente se la somma che versi è caparra o acconto?",
      "Hai capito quando il documento diventa vincolante?",
      "Le condizioni sospensive sono scritte in modo chiaro e non solo promesse a voce?",
      "È chiaro chi registra il compromesso e con quali tempi?",
      "Hai già verificato quali controlli devono essere fatti prima del rogito e da chi?"
    ],
    finalTitle: 'Il punto decisivo',
    finalText:
      "In Italia la fase proposta-compromesso non è un corridoio burocratico tra una visita e il rogito. È una fase in cui si decide quanto rischio stai assumendo, quanta tutela hai davvero e quanto sarà difficile correggere eventuali errori più avanti. Più questa fase è chiara, meno sorprese avrai dopo.",
    finalPrimaryCta: 'Vedi il processo completo',
    finalPrimaryCtaHref: '/process',
    finalSecondaryCta: 'Leggi l’articolo sul notaio',
    finalSecondaryCtaHref: '/guides/notary'
  }
}

function formatDate(language, value) {
  const locale = language === 'cs' ? 'cs-CZ' : language === 'en' ? 'en-US' : 'it-IT'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  return date.toLocaleDateString(locale, { day: '2-digit', month: 'short', year: 'numeric' })
}

function Box({ title, children, tone = 'default' }) {
  const toneClass =
    tone === 'warning'
      ? 'bg-amber-50 border-amber-200'
      : tone === 'dark'
        ? 'bg-slate-900 border-slate-900 text-white'
        : 'bg-white border-slate-200'

  return (
    <section className={`rounded-2xl border p-6 md:p-8 ${toneClass}`}>
      {title ? <h2 className={`text-2xl font-semibold mb-4 ${tone === 'dark' ? 'text-white' : 'text-slate-900'}`}>{title}</h2> : null}
      {children}
    </section>
  )
}

export default function OfferCompromessoRegistrationPage() {
  const [language, setLanguage] = useState('it')

  useEffect(() => {
    const savedLanguage = localStorage.getItem('preferred-language')
    if (savedLanguage) {
      setLanguage(savedLanguage)
      document.documentElement.lang = savedLanguage
    } else {
      document.documentElement.lang = 'it'
    }

    const handleLanguageChange = (event) => {
      const next = event?.detail
      if (next) {
        setLanguage(next)
        document.documentElement.lang = next
      }
    }

    window.addEventListener('languageChange', handleLanguageChange)
    return () => window.removeEventListener('languageChange', handleLanguageChange)
  }, [])

  const t = CONTENT[language] || CONTENT.it

  return (
    <div className="min-h-screen bg-[#faf8f5]">
      <Navigation />

      <main className="pt-28 pb-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto space-y-6">
            <Button asChild variant="outline" className="inline-flex items-center border-slate-300 text-slate-700 hover:bg-slate-100">
              <Link href="/blog">
                <ArrowLeft className="h-4 w-4 mr-2" />
                {t.back}
              </Link>
            </Button>

            <div className="bg-white border border-slate-200 rounded-2xl p-6 md:p-8">
              <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wide bg-slate-100 border border-slate-200 text-slate-700 mb-4">
                {t.category}
              </span>
              <h1 className="text-3xl md:text-5xl font-bold text-slate-900 leading-tight mb-5">{t.title}</h1>
              <div className="flex flex-wrap items-center gap-4 text-sm text-slate-500 mb-6">
                <span className="inline-flex items-center">
                  <Calendar className="h-4 w-4 mr-1.5" />
                  {formatDate(language, t.date)}
                </span>
                <span className="inline-flex items-center">
                  <Clock className="h-4 w-4 mr-1.5" />
                  {t.readTime}
                </span>
              </div>
              <div className="space-y-3 text-slate-700 leading-relaxed">
                {t.intro.map((line) => (
                  <p key={line}>{line}</p>
                ))}
              </div>
            </div>

            <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
              <img
                src="https://images.unsplash.com/photo-1450101499163-c8848c66ca85?auto=format&fit=crop&w=1400&q=80"
                alt="Documenti e firma per proposta e compromesso"
                className="w-full h-64 md:h-80 object-cover"
                loading="lazy"
              />
              <p className="text-sm text-slate-600 px-4 py-3">
                La parte più delicata non è solo trovare la casa giusta, ma capire bene quando e come un documento ti vincola davvero.
              </p>
            </div>

            <Box tone="warning">
              <p className="text-slate-800 leading-relaxed">{t.keyIdea}</p>
            </Box>

            <Box title={t.beforeTitle}>
              <p className="text-slate-700 mb-4">{t.beforeIntro}</p>
              <ul className="list-disc pl-6 space-y-2 text-slate-700 leading-relaxed">
                {t.before.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
              <div className="mt-5 border-l-4 border-slate-300 bg-slate-50 rounded-r-lg px-4 py-3 text-slate-700">
                {t.beforeNote}
              </div>
            </Box>

            <Box title={t.proposalTitle}>
              <p className="text-slate-700 mb-4">{t.proposalText}</p>
              <ul className="list-disc pl-6 space-y-2 text-slate-700 leading-relaxed">
                {t.proposalList.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
              <div className="mt-5 border-l-4 border-blue-300 bg-blue-50 rounded-r-lg px-4 py-3 text-slate-700">
                {t.proposalAlert}
              </div>
            </Box>

            <Box title={t.bindingTitle}>
              <p className="text-slate-700 mb-4">{t.bindingText}</p>
              <ul className="list-disc pl-6 space-y-2 text-slate-700 leading-relaxed">
                {t.bindingList.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </Box>

            <Box title={t.clauseTitle} tone="warning">
              <p className="text-slate-800 mb-4">{t.clauseText}</p>
              <ul className="list-disc pl-6 space-y-2 text-slate-800 leading-relaxed">
                {t.clauseList.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
              <div className="mt-5 border-l-4 border-amber-400 bg-white rounded-r-lg px-4 py-3 text-slate-800">
                <span className="inline-flex items-center font-semibold">
                  <AlertTriangle className="h-4 w-4 mr-2" />
                  {t.clauseNote}
                </span>
              </div>
            </Box>

            <Box title={t.transitionTitle}>
              <p className="text-slate-700 mb-4">{t.transitionText}</p>
              <ul className="list-disc pl-6 space-y-2 text-slate-700 leading-relaxed">
                {t.transitionList.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
              <div className="mt-5 border-l-4 border-red-300 bg-red-50 rounded-r-lg px-4 py-3 text-slate-700">
                {t.transitionAlert}
              </div>
            </Box>

            <Box title={t.compromessoTitle}>
              <p className="text-slate-700 mb-4">{t.compromessoText}</p>
              <ul className="list-disc pl-6 space-y-2 text-slate-700 leading-relaxed">
                {t.compromessoList.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
              <div className="mt-5 border-l-4 border-slate-300 bg-slate-50 rounded-r-lg px-4 py-3 text-slate-700">
                {t.compromessoNote}
              </div>
              <div className="mt-5">
                <Button asChild className="bg-blue-600 hover:bg-blue-700 text-white font-semibold">
                  <Link href={t.compromessoCtaHref} target="_blank" rel="noopener noreferrer">
                    {t.compromessoCta}
                  </Link>
                </Button>
              </div>
            </Box>

            <Box title={t.registrationTitle} tone="dark">
              <p className="text-slate-300 mb-4">{t.registrationText}</p>
              <ul className="list-disc pl-6 space-y-2 text-slate-100 leading-relaxed">
                {t.registrationList.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
              <div className="mt-5 border-l-4 border-copper-300 bg-white/10 rounded-r-lg px-4 py-3 text-slate-100">
                {t.registrationNote}
              </div>
            </Box>

            <Box title={t.registrationExtraTitle}>
              <p className="text-slate-700 mb-4">{t.registrationExtraText}</p>
              <ul className="list-disc pl-6 space-y-2 text-slate-700 leading-relaxed">
                {t.registrationExtraList.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
              <div className="mt-5 flex items-start gap-3 border-l-4 border-slate-300 bg-slate-50 rounded-r-lg px-4 py-3 text-slate-700">
                <Landmark className="h-5 w-5 text-slate-700 mt-0.5 flex-shrink-0" />
                <span>{t.registrationExtraNote}</span>
              </div>
            </Box>

            <Box title={t.checklistTitle}>
              <p className="text-slate-700 mb-4">{t.checklistIntro}</p>
              <ul className="space-y-2">
                {t.checklist.map((item) => (
                  <li key={item} className="flex items-start space-x-3 text-slate-700">
                    <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                    <span className="leading-relaxed">{item}</span>
                  </li>
                ))}
              </ul>
            </Box>

            <Box title={t.finalTitle} tone="warning">
              <p className="text-slate-800 leading-relaxed mb-5">{t.finalText}</p>
              <div className="flex flex-wrap gap-3">
                <Button asChild className="bg-blue-600 hover:bg-blue-700 text-white font-semibold">
                  <Link href={t.finalPrimaryCtaHref}>{t.finalPrimaryCta}</Link>
                </Button>
                <Button asChild className="bg-white text-slate-900 hover:bg-slate-100 border border-slate-200 font-semibold">
                  <Link href={t.finalSecondaryCtaHref}>{t.finalSecondaryCta}</Link>
                </Button>
              </div>
            </Box>
          </div>
        </div>
        <section className="pb-12">
          <div className="max-w-4xl mx-auto px-4">
            <InformationalDisclaimer language={language} className="mt-14" />
          </div>
        </section>
      </main>

      <Footer language={language} />
    </div>
  )
}

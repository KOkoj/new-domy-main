const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const https = require("https");
const pptxgen = require("pptxgenjs");
const { extractListingData } = require("./extract-listing-data.cjs");

const ROOT = path.resolve(__dirname, "..");
const HAR_DIR = "C:\\Users\\39327\\Desktop\\har oggi";
const OUT_DIR = path.join(ROOT, "tmp", "ppt-build", "har-oggi-2026-07-06");
const OUTPUT = path.join(ROOT, "tmp", "selezione-trieste-har-oggi-2026-07-06.pptx");
const ICON_STRIP = path.join(ROOT, "tmp", "ppt-build", "extracted", "ppt", "media", "image1.png");

const ITEMS = [
  { index: 1, har: "1har.har", url: "https://www.immobiliare.it/annunci/129214920/" },
  { index: 2, har: "2har.har", url: "https://www.immobiliare.it/annunci/128448730/" },
  { index: 3, har: "3har.har", url: "https://www.immobiliare.it/annunci/126228135/" },
  { index: 4, har: "4har.har", url: "https://www.immobiliare.it/annunci/128864836/" },
  { index: 5, har: "5har.har", url: "https://www.immobiliare.it/annunci/129715858/" },
  { index: 6, har: "6har.har", url: "https://www.immobiliare.it/annunci/129919084/" },
  { index: 7, har: "7har.har", url: "https://www.immobiliare.it/annunci/129474718/" },
  { index: 8, har: "8har.har", url: "https://www.immobiliare.it/annunci/130246078/" },
  { index: 9, har: "9har.har", url: "https://www.immobiliare.it/annunci/129414160/" },
  { index: 10, har: "10har.har", url: "https://www.immobiliare.it/annunci/124401779/" },
  { index: 11, har: "11har.har", url: "https://www.immobiliare.it/annunci/127893830/" },
  { index: 12, har: "12har.har", url: "https://www.immobiliare.it/annunci/129860490/" },
];

const COLORS = {
  bg: "FFFFFF",
  text: "111111",
  muted: "5D6670",
  chip: "F2EEE8",
};

const HERO_OVERRIDES = {};
const CZECH_TITLE_OVERRIDES = {
  1: "Samostatná krasová vila ve Visoglianu, Duino-Aurisina",
  2: "Část dvojdomu se zahradou v Sistianě",
  3: "Řadová vila v Banne u Opiciny",
  4: "Světlý byt s výhledem v Rozzolu, Terst",
  5: "Zrekonstruovaný byt u Viale Miramare, Terst",
  6: "Přistavěná vila se zahradou ve čtvrti Roiano",
  7: "Rustikální řadový dům u univerzity v Terstu",
  8: "Byt v dvojdomu se zahradou v San Sabbě",
  9: "Historický dům s terasou v Piccola Parigi",
  10: "Holé vlastnictví samostatného domu v Domiu",
  11: "Zrekonstruovaný řadový dům ve Strada per Longera",
  12: "Zrekonstruovaný byt s terasou v Roianu",
};
const OLD_IMAGE_OVERRIDES = {
  1: {
    hero: "gallery-2",
    gallery: ["gallery-9", "gallery-6", "gallery-11", "gallery-12", "gallery-4", "gallery-16"],
  },
  2: {
    hero: "main",
    gallery: ["gallery-30", "gallery-26", "gallery-31", "gallery-37", "gallery-28", "gallery-29"],
  },
  3: {
    hero: "gallery-2",
    gallery: ["gallery-3", "gallery-4", "gallery-6", "gallery-8", "gallery-11", "gallery-12"],
  },
  4: {
    hero: "gallery-3",
    gallery: ["gallery-8", "gallery-10", "gallery-13", "gallery-15", "gallery-16", "gallery-19"],
  },
  5: {
    hero: "main",
    gallery: ["gallery-2", "gallery-3", "gallery-5", "gallery-8", "gallery-11", "gallery-12"],
  },
  6: {
    hero: "main",
    gallery: ["gallery-4", "gallery-11", "gallery-14", "gallery-15", "gallery-21", "gallery-22"],
  },
  7: {
    hero: "gallery-3",
    gallery: ["gallery-9", "gallery-14", "gallery-20", "gallery-30", "gallery-32", "gallery-40"],
  },
  9: {
    hero: "main",
    gallery: ["gallery-4", "gallery-5", "gallery-6", "gallery-8", "gallery-10", "gallery-12"],
  },
};
const IMAGE_OVERRIDES = {
  1: { hero: "main", gallery: ["gallery-4", "gallery-7", "gallery-18", "gallery-20", "gallery-10", "gallery-26"] },
  2: { hero: "gallery-38", gallery: ["gallery-16", "gallery-27", "gallery-24", "gallery-30", "gallery-36", "gallery-34"] },
  3: { hero: "main", gallery: ["gallery-4", "gallery-8", "gallery-13", "gallery-18", "gallery-22", "gallery-16"] },
  4: { hero: "gallery-34", gallery: ["gallery-2", "gallery-8", "gallery-12", "gallery-19", "gallery-25", "gallery-26"] },
  5: { hero: "gallery-38", gallery: ["gallery-24", "gallery-42", "gallery-12", "gallery-3", "gallery-10", "gallery-33"] },
  6: { hero: "main", gallery: ["gallery-4", "gallery-8", "gallery-9", "gallery-14", "gallery-18", "gallery-6"] },
  7: { hero: "gallery-19", gallery: ["gallery-17", "gallery-3", "gallery-8", "gallery-15", "gallery-14", "gallery-20"] },
  8: { hero: "main", gallery: ["gallery-24", "gallery-6", "gallery-11", "gallery-22", "gallery-15", "gallery-7"] },
  9: { hero: "gallery-16", gallery: ["gallery-4", "gallery-2", "gallery-9", "gallery-7", "gallery-8", "gallery-14"] },
  10: { hero: "gallery-50", gallery: ["gallery-14", "gallery-3", "gallery-9", "gallery-26", "gallery-21", "gallery-28"] },
  11: { hero: "main", gallery: ["gallery-5", "gallery-11", "gallery-18", "gallery-20", "gallery-22", "gallery-3"] },
  12: { hero: "gallery-7", gallery: ["gallery-1", "gallery-9", "gallery-11", "gallery-14", "gallery-13", "gallery-6"] },
};
const OLD_DATA_OVERRIDES = {
  3: {
    title: "Villa unifamiliare Contrada Vinelli, Monforte San Giorgio",
    typology: "Villa unifamiliare",
    city: "Monforte San Giorgio",
    address: "Contrada Vinelli",
    surface: "91 m2",
    description:
      "Villa unifamiliare in Contrada Vinelli a Monforte San Giorgio. Il HAR contiene dati parziali: risultano buono stato, posto auto, terrazza e superficie di 91 m2. Prezzo e distribuzione interna non sono indicati nel file disponibile.",
  },
};
const DATA_OVERRIDES = {};
const OLD_CZECH_DESCRIPTION_OVERRIDES = {
  1:
    "V obci Rometta, v lokalitě Sottocastello, se prodává samostatný dům s velkým dvorem a pozemkem. Dům má dvě podlaží propojená vnitřním schodištěm: v přízemí je přibližně 78 m2 se dvěma místnostmi a koupelnou, v prvním patře přibližně 45 m2 se dvěma pokoji a další koupelnou.\n\nK domu patří příjezdový dvůr o ploše asi 180 m2 a rozsáhlý pozemek přibližně 11 000 m2, částečně rovinatý a částečně svažitý. Interiér je dokončený, jsou přítomny elektrické a vodovodní rozvody i příprava na vytápění radiátory. Poloha je panoramatická, dobře dostupná z hlavní silnice a podle inzerátu je nemovitost ihned využitelná.",
  2:
    "Samostatná vila v Contrada Minocera v obci Ucria, podle dostupných dat z inzerátu o ploše přibližně 208 m2. Z fotografií a uložených podkladů je patrná samostatná stavba v zeleném prostředí s kuchyní, obytnou částí, ložnicemi, koupelnou a venkovním prostorem kolem domu.\n\nHAR soubor je neúplný, proto nebylo možné bezpečně převzít plný text původního popisu. U této nemovitosti je vhodné před dalším krokem ověřit přesné vnitřní členění, technický stav, přístup, hranice pozemku a kompletní dokumentaci přímo u prodávajícího nebo makléře.",
  3:
    "Samostatná vila v Contrada Vinelli v obci Monforte San Giorgio. Dostupná data z HAR souboru jsou omezená: evidována je plocha 91 m2, dobrý stav, parkovací místo a terasa. Fotografie ukazují dům v zeleném a panoramatickém prostředí s venkovní terasou a obytnými prostory.\n\nProtože v souboru chybí kompletní původní popis i cena, je nutné před rozhodnutím ověřit přesnou dispozici, stav konstrukcí, technické instalace, právní dokumentaci a reálnou dostupnost nemovitosti na místě.",
  4:
    "V části Belvedere obce Falcone se prodává panoramatický byt o ploše přibližně 120 m2 se samostatným vstupem v přízemí a horní terasou o podobné ploše. Dispozice zahrnuje vstup, velký obývací pokoj, kuchyni s obytnou částí, chodbu, dvě prostorné ložnice a velkou koupelnu, která byla nedávno zrekonstruována.\n\nZ pokojů i z terasy je výrazný výhled na moře a okolní kopce. Povrchy nejsou moderní, ale jsou udržované; byt vyžaduje modernizaci, přičemž elektroinstalace a koupelna byly podle inzerátu nedávno renovovány. Hlavní místnosti mají klimatizaci teplo/chlad a v kuchyni je plynová kamna na metan. Poloha je blízko sjezdu z dálnice A20 Falcone a nemovitost se hodí pro celoroční i letní bydlení.",
  5:
    "Panoramatický dům se zahradou v Contrada San Sergio v obci Tortorici, v prostředí pohoří Nebrodi. Nemovitost má celkovou plochu přibližně 170 m2 a je rozložena do tří úrovní: v polosuterénu je kuchyně, jídelna a servisní místnosti s možností vstupu také zvenku; v prvním patře je vstup, velká koupelna a obývací pokoj se vstupem na terasovitou zahradu; ve druhém patře je noční část se dvěma ložnicemi.\n\nVenkovní prostor je soukromý a obklopený zelení. Součástí prodeje jsou také dva menší pozemky s lískovým sadem o celkové ploše asi 1 700 m2, umístěné nedaleko domu. Nemovitost potřebuje práce hlavně v přízemí, zatímco horní patra jsou podle inzerátu již obyvatelná. Uvedeny jsou i některé trhliny související se starším pohybem terénu, který je označen jako stabilizovaný; případné zásahy by měly být lokální. Dům je vhodný jako rekreační i hlavní bydlení.",
  6:
    "V historickém centru Santa Lucia del Mela, nedaleko kostela dell'Annunziata, se prodává panoramatická částečně samostatná nemovitost větší výměry. Dům je zasazený do typických úzkých uliček a rozkládá se na čtyřech úrovních; díky rozdílné výšce ulic je přístup možný z přední i zadní strany stavby.\n\nHlavní vstup z Via Teatro vede do přízemí, kde je velký reprezentativní salon s dvojím otevřením na balkon, další místnost s oknem a prostorný komunikační prostor se schodištěm. První patro slouží jako noční část s hlavní ložnicí, menším pokojem, koupelnou s oknem a další využitelnou plochou například pro šatnu. Nižší podlaží mají další vstup a balkon směrem k Vico Caselipari. Stavba byla v minulosti konstrukčně zpevňována; dnes vyžaduje dokončení, úpravy a modernizaci, ale nabízí pevný základ, velké světlé prostory a výhled na moře, záliv Milazzo a Liparské ostrovy.",
  7:
    "Immobiliare Costa Saracena nabízí rodinný dům ve frazione Fiumara v obci Piraino. Nemovitost má dvě terasy: první je prostorná vstupní terasa s přímým přístupem do domu a zároveň s výstupem z hlavní ložnice; druhá, vnitřní terasa, otevírá panoramatický výhled.\n\nPo vstupu se vchází do salonu, dále do hlavní ložnice napojené na vstupní terasu. Dispozice zahrnuje také druhý pokoj v blízkosti proskleného průchodu, který přivádí světlo z vnitřní terasy, koupelnu s předsíní a vanou, další chodbu a obytnou kuchyni. Kuchyně, druhý pokoj a prosklený prostor, využitelný i jako prádelna nebo servisní zóna, mají výhled na hřebeny Nebrodi. Jde o samostatné řešení s dvojí expozicí a dobře využitelnými venkovními prostory.",
  8:
    "Dům je obklopený velkým pozemkem s olivovníky a ovocnými stromy. Vila se skládá ze dvou samostatných třípokojových bytů o ploše přibližně 73 m2 každý, které jsou nyní propojeny dřevěným schodištěm. Přízemní byt má vstup s menším obývacím koutem, obytnou kuchyni, koupelnu, manželskou ložnici s balkonem, menší pokoj a komoru. V prvním patře je kuchyně otevřená do velkého salonu s balkonem a schodištěm na panoramatickou terasu, dále koupelna, manželská ložnice s balkonem a menší pokoj.\n\nV polosuterénu je taverna s pecí na dřevo a kuchyní o ploše asi 55 m2, vhodná pro společenské využití. Na horní úrovni je panoramatická terasa s výhledem na hory Nebrodi a za dobrého počasí i směrem k Etně. K domu vede soukromá cesta k parkovací ploše pro více aut. Nedaleko vily je také dvoupodlažní rustikální stavba o ploše asi 100 m2, vhodná k přeměně na dépendance. Nemovitost má soukromý zdroj vody a autonomní radiátorové vytápění, nyní na naftu, s připraveným napojením na metan.",
  9:
    "V Messině-Furnari, v klidné a dobře obsloužené zóně, se prodává samostatný dům o ploše 75 m2 se dvěma soukromými zahradami. Vstup vede do prostorné otevřené denní části, kde jsou obývací pokoj a kuchyně propojené do světlého a příjemného prostoru s přímým vstupem do přední zahrady, vhodné pro odpočinek nebo posezení s hosty.\n\nNoční část tvoří dvě pohodlné ložnice a koupelna s oknem a sprchovým koutem. Dům je obklopen dvěma soukromými zahradami, přední a zadní, které lze využít pro venkovní stolování, dětskou zónu nebo klidný pobyt v zeleni. Podle inzerátu má nemovitost dobrou sluneční expozici, funkční a snadno přizpůsobitelné prostory a může sloužit jako první bydlení i investice.",
};
const CZECH_DESCRIPTION_OVERRIDES = {
  1:
    "Ve Visoglianu u Duino-Aurisina je nabízena typická krasová samostatná vila volná ze čtyř stran, se slunnou expozicí, dvorem a garáží. Dům má podle inzerátu celkem 180 m2 ve dvou úrovních a je vhodný pro rodinu, která potřebuje obytné i doplňkové prostory.\n\nV prvním patře je denní část se světlým obývacím pokojem, obytnou kuchyní, dvěma ložnicemi, koupelnou a balkonem s výhledem. V přízemí jsou další místnosti, druhá koupelna, skladové a servisní prostory a garáž. Nemovitost je v dobrém stavu, ale technické detaily, dispozici, stav instalací a dokumentaci je nutné ověřit při prohlídce.",
  2:
    "V Sistianě, velmi blízko centra, je nabízena část dvojdomu s vlastní osázenou zahradou. Dům pochází z 60. let a byl modernizován v roce 2020: podlahy, plastová okna s roletami, kamna na pelety v kuchyni a elektroinstalace uvedená jako odpovídající normě, bez certifikace. Plynový kotel je podle inzerátu potřeba vyměnit.\n\nDispozice zahrnuje velkou vstupní část, obytnou kuchyni, obývací pokoj, dvě ložnice a koupelnu s oknem a sprchou. Ze zahrady je přístup do sklepa a ke dvěma skladovým prostorům, z nichž jeden má vstup také ze zadní komunikace. Zahrada je příjemným venkovním prostorem k ověření na místě.",
  3:
    "V Banne, asi pět minut autem od Opiciny, je nabízena elegantní řadová vila z roku 2008 ve tichém a udržovaném rezidenčním prostředí. Dům je řešen ve dvou úrovních a v přízemí nabízí praktické doplňkové prostory: prádelnu, barbecue zónu, sklep a kryté vlastní parkovací místo.\n\nHlavní obytná část je v prvním patře. Tvoří ji otevřený denní prostor s kuchyní na míru a krbem na dřevo, navazující na dvě terasy. V podkroví je ložnicová část s koupelnou. Nemovitost působí udržovaně a je vhodná pro kupující, kteří hledají klid, venkovní plochy a dobrou dostupnost k Opicině i Terstu.",
  4:
    "V části Rozzol v Terstu je nabízen byt s velkým potenciálem, v klidné zóně mimo hlavní dopravu a v blízkosti zeleně. Vstup vede do prostorné a světlé denní části s přímým výstupem na slunný balkon, odkud je otevřený výhled na záliv, vinice a okolní zeleň.\n\nKuchyně je obytná a navazuje na denní prostor, což umožňuje případné propojení. Byt má dvě velké ložnice, z nichž jedna má přístup na malé soukromé venkovní místo, a dvě koupelny. Jde o nemovitost k modernizaci podle vlastních potřeb, s dobrými objemy, výhledem a venkovními plochami, které je vhodné ověřit při prohlídce.",
  5:
    "Mezi centrem Terstu a Barcolou, na Viale Miramare, je nabízen byt ve třetím patře bez výtahu, kompletně zrekonstruovaný a připravený k bydlení. Má přibližně 110-116 m2, jižní a jihozápadní orientaci, velmi světlé místnosti a otevřený výhled směrem k Porto Vecchio s částečným výhledem na moře.\n\nInteriér tvoří velká otevřená denní zóna s kuchyní, dvě prostorné manželské ložnice, z nichž jedna má vlastní koupelnu, druhá kompletní koupelna a praktické obslužné prostory. Byt je prezentován jako první vstup po rekonstrukci, s kvalitními úpravami a strategickou polohou pro městské i přímořské bydlení.",
  6:
    "Ve čtvrti Roiano v Terstu je nabízena přistavěná vila s vlastní zahradou, v klidném rezidenčním prostředí se zelení, jižní expozicí a panoramatickým výhledem na moře a město. Dům je dostupný pouze pěším chodníkem s několika schody, takže není možný přímý příjezd autem, ale v blízkosti jsou ulice Commerciale a Verniellis s napojením na městskou dopravu.\n\nNemovitost má dvě úrovně a zahradu se slunnou pergolou porostlou révou. Vnitřní prostory vyžadují posouzení a modernizaci, ale nabízejí velkou plochu, více pokojů, dvě koupelny a výrazný venkovní potenciál. Přístup, technický stav a náklady je nutné ověřit na místě.",
  7:
    "V jedné z charakteristických částí Terstu, u univerzitní zóny a v prostředí historických domků, je nabízena půvabná přistavěná casetta. Poloha je klidná, stranou provozu, ale dobře napojená na služby. Nemovitost vznikla spojením dvou menších jednotek a dnes nabízí obytné prostory na více úrovních.\n\nVstup je přes kamenné schodiště do prvního patra s atriem, kuchyní a obývacím pokojem. Dům má dvě ložnice, dvě koupelny a výrazné venkovní prvky, zejména terasu a výhledy přes střechy a okolní zástavbu. Interiéry mají osobitý rustikální charakter a je vhodné ověřit dispozici, dokumentaci a technický stav.",
  8:
    "V oblasti San Sabba, poblíž Valmaury, je nabízena část dvojdomu s bytem ve druhém patře, zahradou ve společném užívání a garáží. Lokalita je dobře obsloužená dopravou a službami, ale samotná nemovitost leží v klidné rezidenční zóně. Dům byl postaven v 80. letech a je koncipován pro dvě rodiny.\n\nProdávaná část má přibližně 206 m2, čtyři ložnice, dvě koupelny, balkon, výhledy a venkovní plochy. K dispozici je box pro jedno auto a další venkovní stání. Zahrada kolem domu má podle inzerátu asi 800 m2 a je společná se sousedy, což je důležitý bod k právnímu i praktickému ověření.",
  9:
    "V historické oblasti Piccola Parigi, poblíž univerzity v Terstu, je nabízena venkovsky působící casa colonica v klidné pěší zóně s malými uličkami a dvorem. Dům je zasazen do příjemného historického prostředí a byl podle inzerátu postaven na začátku století a renovován v roce 2001.\n\nNemovitost má 127 m2 ve dvou vnitřních úrovních, tři místnosti, dvě ložnice a dvě koupelny. Silným prvkem je terasa o ploše asi 20 m2, vhodná pro venkovní posezení. Interiéry mají rustikální charakter s kuchyní, obytnou částí, ložnicí a koupelnou; před dalším krokem je vhodné ověřit stav a dokumentaci.",
  10:
    "V Domiu, v obci San Dorligo della Valle - Dolina, je nabízena nuda proprieta samostatného domu postaveného v roce 2010, v energetické třídě A1, se zahradou a příjezdem autem. Jde tedy o koupi holého vlastnictví, nikoli běžné okamžité plné užívání, což je zásadní právní bod k ověření.\n\nDům je ve velmi dobrém stavu a má dvě úrovně. V přízemí je vstup, obytná kuchyně s výstupem do zahrady, velký obývací pokoj s krbem a koupelna. V horní úrovni jsou dvě ložnice, studijní kout a druhá kompletní koupelna. Součástí je zahrada asi 230 m2 a pohodlné parkovací stání o ploše 24 m2.",
  11:
    "Na Strada per Longera v Terstu je nabízena přistavěná casetta v klidném a soukromém prostředí mimo městský provoz. Nemovitost je kompletně zrekonstruovaná, ve velmi dobrém stavu a podle inzerátu připravená k bydlení.\n\nDům má dvě úrovně. V přízemí je vstup do denní části s kuchyňským koutem a kompletní koupelna s oknem a sprchou. V prvním patře je manželská ložnice, menší pokoj a druhá denní část s malým balkonem. K nemovitosti patří půda, sklep 13 m2, venkovní sklad a dvůr. Dům má klimatizaci a působí jako praktické řešení pro ty, kdo hledají klidné bydlení s charakterem.",
  12:
    "V Roianu, jen kousek od vlakového nádraží v Terstu, je nabízena vzácná bytová jednotka ve velmi dobře obsloužené zóně. Byt je ve druhém patře malé budovy s výtahem, je zrekonstruovaný a dobře dispozičně rozvržený.\n\nInteriér tvoří tři místnosti: denní zóna s otevřenou kuchyní, dvě ložnice, koupelna a terasa orientovaná do klidné zelené části. Byt má dvojí expozici a výrazné detaily v úpravách, včetně elektrického krbu s ionizační funkcí v obývací části. Jde o kompaktní, hotové městské bydlení, u kterého je vhodné ověřit přesné náklady, stav domu a dokumentaci.",
};

const CZECH_DESCRIPTION_FINAL_OVERRIDES = {
  1:
    "Ve Visoglianu u Duino-Aurisina je nabízena typická krasová samostatná vila volná ze čtyř stran, dobře osluněná, s dvorem, garáží a příjezdem autem. Dům má celkem 180 m2 ve dvou podlažích. V prvním patře je prostorný obývací pokoj a obytná kuchyně, oboje s výstupem na terasu s otevřeným výhledem až k moři, dále manželská ložnice s výstupem na terasu, druhá velká ložnice a velká koupelna s předsíní a místem pro pračku.\n\nV přízemí je velká cantina s vraty, fakticky použitelná jako garáž, sklad, další místnost nyní využívaná jako kuchyně nebo pracovna, velká prádelna, druhá koupelna a technická místnost s plynovým kotlem. Obě podlaží spojuje schodišťová plošina, proto může být dům vhodný i pro osobu s omezenou mobilitou. Dvůr má asi 170 m2, umožňuje parkování a půda slouží jako sklad. Střecha je podle inzerátu ve velmi dobrém stavu a orientovaná k jihu.",
  2:
    "V Sistianě, velmi blízko centra, je nabízena část dvojdomu v dobrém stavu s vlastní osázenou zahradou. Dům je z 60. let a byl modernizován v roce 2020: novéjší podlahy, bílá plastová okna s roletami, peletová kamna v kuchyni a elektroinstalace uvedená jako v normě, ale bez certifikace. Plynový kotel je podle inzerátu potřeba vyměnit.\n\nDispozice zahrnuje prostorný vstup, obytnou kuchyni, obývací pokoj, dvě ložnice a koupelnu s oknem a sprchou. Ze zahrady je přístup do sklepa v suterénu a do dvou prostor vedených jako sklady, z nichž jeden má také zadní vstup z ulice. Zahrada je podle popisu velmi příjemná a má i glorietu, což je hlavní venkovní kvalita této nabídky.",
  3:
    "V Banne, asi pět minut autem od Opiciny, je nabízena středová řadová vila z roku 2008 v tichém a udržovaném rezidenčním prostředí. V přízemí jsou praktické doplňkové prostory: prádelna, barbecue zóna, sklep a kryté vlastní parkovací místo.\n\nHlavní obytná část je v prvním patře a tvoří ji otevřený denní prostor s kuchyní na míru a krbem na dřevo. Z obývacího pokoje se vychází na dvě terasy, které rozšiřují obytnou část směrem ven. Noční část má nyní jednu ložnici s další terasou, ale podle inzerátu lze vytvořit druhou ložnici. Koupelna je velká, s oknem a hydromasáží. Fasády a střecha jsou ve výborném stavu, topení je autonomní plynové, okna dřevěná s dvojsklem.",
  4:
    "V srdci Rozzolu v Terstu je nabízen byt s velkým potenciálem, v klidné zóně mimo provoz a se zelení kolem domu. Vstup vede do velmi světlé velké denní části s přímým výstupem na pohodlný slunný balkon, odkud je výhled na záliv, vinice a okolní zelené plochy.\n\nObytná kuchyně navazuje na denní prostor a může být případně propojena. Byt má dvě velké manželské ložnice; jedna má přímý přístup na malé soukromé zahradní místo. Jsou zde dvě koupelny, možnost en-suite řešení a prádelna v prostorném skladu. Součástí jsou také dvě vlastní sklepy a kryté parkovací místo. Dům z 90. let je podle inzerátu udržovaný, s velkou společnou zelenou plochou a dětskými hrami.",
  5:
    "Na Viale Miramare, mezi centrem Terstu a Barcolou, je nabízen byt ve třetím patře bez výtahu, kompletně zrekonstruovaný a připravený k bydlení jako první vstup. Má přibližně 110 m2, jižní a jihozápadní orientaci, velmi světlé místnosti a otevřený pohled směrem k Porto Vecchio s částečným výhledem na moře.\n\nInteriér tvoří velká otevřená denní zóna s kuchyní, dvě prostorné manželské ložnice, z nichž jedna má vlastní koupelnu, druhá kompletní koupelna s velkou sprchou a praktický sklad/prádelna s oknem. Součástí nabídky je zděný sklep asi 16 m2 v přízemí a parkovací místo ve vnitřním dvoře s bránou. Poloha je vhodná pro běh u Porto Vecchio, pěší dostupnost Barcoly i centra.",
  6:
    "Ve čtvrti Roiano v Terstu je nabízena přistavěná vila se zahradou, v klidném rezidenčním prostředí se zelení, jižní expozicí a panoramatickým výhledem na moře a město. Dům je dostupný pouze pěším chodníkem se schody, takže není možný příjezd autem přímo k domu; v blízkosti jsou ale Via Commerciale a Via Verniellis s městskou dopravou.\n\nVila má dvě úrovně po asi 100 m2. V nižším podlaží je velký vstup, obytná kuchyně, obývací pokoj, velká koupelna s oknem a dva sklady. V horním podlaží jsou tři ložnice, pracovna a druhé kompletní WC/koupelna s oknem. Interiéry jsou převážně ze 70. a 80. let a vyžadují zásadní rekonstrukci instalací i povrchů. Fasády a střecha byly obnoveny v roce 2007.",
  7:
    "U univerzitní oblasti v Terstu, v klidném prostředí historických domků, je nabízen přistavěný menší dům z obou stran. Vznikl spojením dvou menších jednotek a dnes nabízí dobře rozdělené prostory na více úrovních. Vstup je v prvním patře přes kamenné schodiště do velkého atria; na této úrovni je kuchyně, obývací pokoj použitelný i jako ložnice a kompletní koupelna s oknem.\n\nV nižším podlaží je útulná obytná zóna s krbem, manželská ložnice, druhá kompletní koupelna s oknem a finská sauna. V horním podlaží je obytná terasa s otevřeným výhledem na San Giovanni a zeleň Boschetto del Farneto. Interiér je ve výborném stavu a má rustikální charakter: trámy, dřevo, schody a kamenné prvky.",
  8:
    "V San Sabbě, kousek od Valmaury, je nabízena část dvojdomu: byt ve druhém patře v klidné rezidenční poloze, přitom blízko dopravy a služeb. K nabídce patří zahrada kolem domu o asi 800 m2 sdílená se sousedy, garáž pro jedno auto, venkovní prostor pro další dvě auta, společná sklepní část a soukromý sklep asi 23 m2.\n\nSamotný byt má přes 120 m2 a pět místností: obývací pokoj a obytnou kuchyni, oboje s výstupem na obytnou terasu asi 11 m2, dvě manželské ložnice, dvě jednolůžkové ložnice a dvě kompletní koupelny s oknem. Interiér je funkční, ale ve stylu 80. let. Jižní orientace zajišťuje světlo během dne a vyvýšená poloha otevřený výhled na okolí.",
  9:
    "V historické Piccola Parigi, pár kroků od univerzity, je nabízen dům venkovského typu v mimořádně klidné pěší zóně s úzkými uličkami. Dům stojí v příjemném dvoře s dalšími dobovými domy a vytváří atmosféru starého Terstu. Byl postaven na začátku století a renovován v roce 2001.\n\nNemovitost má 127 m2 ve dvou vnitřních úrovních a nabízí tři místnosti, vhodné pro rodinu nebo pro kupujícího, který chce větší obytné prostory. Hlavním venkovním prvkem je terasa asi 20 m2 pro odpočinek venku. Interiéry jsou podle inzerátu ve výborném stavu a připravené k užívání. Blízkost univerzity zvyšuje zajímavost i pro studenty, pedagogy nebo investiční využití.",
  10:
    "V Domiu, v obci San Dorligo della Valle - Dolina, je nabízena nuda proprietà samostatného domu postaveného v roce 2010, v energetické třídě A1, se zahradou a příjezdem autem. Jde o koupi holého vlastnictví, což je zásadní právní a praktický bod: podmínky užívání je nutné předem přesně ověřit.\n\nDům je podle inzerátu ve výborném stavu a má dvě úrovně. V přízemí je vstup, obytná kuchyně s výstupem do zahrady, velký obývací pokoj s krbem a koupelna. V horním podlaží jsou dvě ložnice, studijní zóna a druhá kompletní koupelna. Součástí je vlastní zahrada asi 230 m2 a pohodlné parkovací místo o ploše 24 m2.",
  11:
    "Na Strada per Longera v Terstu je nabízen přistavěný menší dům v klidném a soukromém prostředí mimo městský provoz. Nemovitost je kompletně zrekonstruovaná, ve velmi dobrém stavu a podle inzerátu připravená k bydlení.\n\nDům má dvě úrovně. V přízemí je vstup do denní části s kuchyňským koutem a kompletní koupelna s oknem a sprchou. V prvním patře je manželská ložnice, jednolůžkový pokoj a druhá denní část s malým balkonem. Prostory jsou udržované a funkční. K nemovitosti patří půda, sklep 13 m2, venkovní sklad a dvůr. Dům má klimatizaci s funkcí teplo/chlad v obou podlažích, peletová kamna a prodává se s kuchyní na míru.",
  12:
    "V Roianu, jen kousek od vlakového nádraží v Terstu, je nabízena vzácná bytová jednotka v dobře obsloužené zóně. Byt je ve druhém patře malé budovy s výtahem, je zrekonstruovaný a velmi dobře rozdělený.\n\nInteriér tvoří tři místnosti: obytná zóna s otevřenou kuchyní, dvě ložnice, koupelna a terasa orientovaná do klidné zelené části. Byt má dvojí expozici, kvalitní úpravy a funkční prostory. V obývací části je elektrický krb i s ionizační funkcí. Prodává se zařízený včetně kuchyně a vestavěných skříní. Topení je autonomní s novým kondenzačním kotlem, vnitřní výška je 3 m. Je možné pronajmout garáž pro auto a motorku o asi 30 m2.",
};

function ensureDir(dir) {
  fs.mkdirSync(dir, { recursive: true });
}

function normalizeWhitespace(value) {
  return String(value || "")
    .replace(/\s+/g, " ")
    .trim();
}

function extractLabel(value) {
  if (!value) return "";
  if (typeof value === "string" || typeof value === "number") return String(value);
  if (typeof value === "object") {
    return value.label || value.value || value.name || value.formatted || value.text || "";
  }
  return "";
}

function selectImageVariant(urls = {}) {
  return urls.xxl || urls.large || urls.medium || urls.photo || urls.image || urls.m || urls["m-c"] || urls["cover-m-c"] || urls.small || null;
}

function extractHtmlFromTruncatedHar(harPath) {
  const text = fs.readFileSync(harPath, "utf8");
  const marker = '"text": "<!DOCTYPE html';
  const markerIndex = text.indexOf(marker);
  if (markerIndex < 0) return "";
  const colonIndex = text.indexOf(":", markerIndex);
  const stringStart = text.indexOf('"', colonIndex + 1) + 1;
  let escaped = false;
  for (let index = stringStart; index < text.length; index += 1) {
    const char = text[index];
    if (escaped) {
      escaped = false;
      continue;
    }
    if (char === "\\") {
      escaped = true;
      continue;
    }
    if (char === '"') {
      return JSON.parse(`"${text.slice(stringStart, index)}"`);
    }
  }
  return "";
}

function getNextData(html) {
  const match = html.match(/<script[^>]+id="__NEXT_DATA__"[^>]*>([\s\S]*?)<\/script>/i);
  return match ? JSON.parse(match[1]) : null;
}

function extFromUrl(url) {
  const clean = String(url || "").split("?")[0].toLowerCase();
  if (clean.endsWith(".png")) return ".png";
  if (clean.endsWith(".webp")) return ".webp";
  if (clean.endsWith(".jpeg")) return ".jpeg";
  return ".jpg";
}

function downloadImage(url, filePath) {
  return new Promise((resolve, reject) => {
    if (!url) {
      resolve(null);
      return;
    }
    if (fs.existsSync(filePath)) {
      resolve(filePath);
      return;
    }
    ensureDir(path.dirname(filePath));
    const request = https.get(url, { headers: { "user-agent": "Mozilla/5.0" } }, (response) => {
      if ([301, 302, 303, 307, 308].includes(response.statusCode) && response.headers.location) {
        response.resume();
        downloadImage(new URL(response.headers.location, url).toString(), filePath).then(resolve, reject);
        return;
      }
      if (response.statusCode < 200 || response.statusCode >= 300) {
        response.resume();
        reject(new Error(`Image download failed ${response.statusCode}: ${url}`));
        return;
      }
      const chunks = [];
      response.on("data", (chunk) => chunks.push(chunk));
      response.on("end", () => {
        fs.writeFileSync(filePath, Buffer.concat(chunks));
        resolve(filePath);
      });
    });
    request.on("error", reject);
    request.setTimeout(30000, () => {
      request.destroy(new Error(`Image download timeout: ${url}`));
    });
  });
}

async function extractListingDataFallback(harPath, outDir, item) {
  const html = extractHtmlFromTruncatedHar(harPath);
  const nextData = getNextData(html);
  const pageProps = nextData?.props?.pageProps || {};
  const realEstate = pageProps?.detailData?.realEstate || {};
  const property = realEstate?.properties?.[0] || {};
  const multimedia = property.multimedia || {};
  const photoItems = Array.isArray(multimedia.photos) ? multimedia.photos : [];
  const galleryDetails = photoItems
    .map((photo, index) => ({
      index,
      type: photo?.type || null,
      caption: normalizeWhitespace(photo?.caption || ""),
      url: selectImageVariant(photo?.urls || {}),
    }))
    .filter((photo) => photo.url);
  const mainPhoto = selectImageVariant(property.photo?.urls || {}) || galleryDetails[0]?.url || null;
  const saved = { mainPath: null, galleryPaths: [], planPath: null };
  if (outDir) {
    saved.mainPath = mainPhoto ? await downloadImage(mainPhoto, path.join(outDir, `main${extFromUrl(mainPhoto)}`)) : null;
    for (let index = 0; index < galleryDetails.length; index += 1) {
      const url = galleryDetails[index].url;
      saved.galleryPaths.push(await downloadImage(url, path.join(outDir, `gallery-${index + 1}${extFromUrl(url)}`)));
    }
  }
  return {
    url: item.url,
    title: normalizeWhitespace(realEstate.title),
    typology: normalizeWhitespace(extractLabel(realEstate.typology || realEstate.type)),
    contract: realEstate.contract || null,
    city: normalizeWhitespace(property.location?.city || property.location?.label || ""),
    zone: normalizeWhitespace(property.location?.zone || ""),
    address: normalizeWhitespace(property.location?.address || ""),
    streetNumber: normalizeWhitespace(property.location?.streetNumber || ""),
    latitude: property.location?.latitude ?? null,
    longitude: property.location?.longitude ?? null,
    description: normalizeWhitespace(property.description || property.defaultDescription),
    priceLabel: normalizeWhitespace(extractLabel(realEstate.price) || extractLabel(property.price)),
    surface: normalizeWhitespace(extractLabel(property.surface) || extractLabel(property.surfaceValue)),
    rooms: normalizeWhitespace(extractLabel(property.rooms) || extractLabel(property.roomsValue)),
    bedrooms: normalizeWhitespace(extractLabel(property.bedRoomsNumber)),
    bathrooms: normalizeWhitespace(extractLabel(property.bathrooms)),
    mainPhoto,
    planPhoto: null,
    gallery: galleryDetails.map((photo) => photo.url),
    galleryDetails,
    saved,
  };
}

function cleanText(value) {
  return String(value || "")
    .replace(/Â˛/g, "2")
    .replace(/Ă /g, "à")
    .replace(/Ă¨/g, "è")
    .replace(/Ă©/g, "é")
    .replace(/Ă¬/g, "ì")
    .replace(/Ă˛/g, "ò")
    .replace(/Ăš/g, "ù")
    .replace(/\u00a0/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function compactTitle(listing) {
  const raw = cleanText(listing.titleCs || listing.title).split("|")[0].trim();
  if (!raw) return `Immobile ${listing.index}`;
  return raw.length <= 48 ? raw : `${raw.slice(0, 45).trim()}...`;
}

function formatMetric(value) {
  return cleanText(value).replace(/m(?:\u00b2|\u00c2\u00b2|\u00c2\u02db|\u02db)|mq/gi, "m2") || "-";
}

function formatPrice(raw) {
  const digits = String(raw || "").replace(/[^\d]/g, "");
  return digits ? `${Number(digits).toLocaleString("cs-CZ")} EUR` : "neuvedeno";
}

function buildMapUrl(listing) {
  if (listing.latitude != null && listing.longitude != null) {
    return `https://www.google.com/maps/search/?api=1&query=${listing.latitude},${listing.longitude}`;
  }
  const query = [listing.address, listing.streetNumber, listing.city].filter(Boolean).join(", ");
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query || listing.url)}`;
}

function numberValue(value) {
  const cleaned = String(value || "").replace(/[^\d,.-]/g, "").replace(/\./g, "").replace(",", ".");
  const parsed = Number.parseFloat(cleaned);
  return Number.isFinite(parsed) ? Math.round(parsed) : 0;
}

function czechRooms(value) {
  const n = numberValue(value);
  if (!n) return "počet místností neuveden";
  if (n === 1) return "1 místnost";
  if (n >= 2 && n <= 4) return `${n} místnosti`;
  return `${n} místností`;
}

function czechBedrooms(value) {
  const n = numberValue(value);
  if (!n) return "počet ložnic neuveden";
  if (n === 1) return "1 ložnici";
  if (n >= 2 && n <= 4) return `${n} ložnice`;
  return `${n} ložnic`;
}

function czechBathrooms(value) {
  const n = numberValue(value);
  if (!n) return "počet koupelen neuveden";
  if (n === 1) return "1 koupelnu";
  if (n >= 2 && n <= 4) return `${n} koupelny`;
  return `${n} koupelen`;
}

function czechTypology(listing) {
  const text = `${listing.typology || ""} ${listing.title || ""}`.toLowerCase();
  if (hasAny(text, ["villa", "villetta"])) return "Vila";
  if (hasAny(text, ["casa indipendente", "casa singola", "rustico", "casale", "terratetto"])) return "Dům";
  if (hasAny(text, ["appartamento", "bilocale", "trilocale", "quadrilocale", "attico"])) return "Byt";
  if (hasAny(text, ["palazzo", "stabile"])) return "Dům";
  return "Nemovitost";
}

function czechTitle(listing) {
  const city = cleanText(listing.city || listing.zone || "");
  const typology = czechTypology(listing);
  return city ? `${typology} v lokalitě ${city}` : typology;
}

function czechHighlight(listing) {
  const text = `${listing.description || ""} ${(listing.galleryDetails || []).map((item) => item.caption).join(" ")}`.toLowerCase();
  const highlights = [];
  if (hasAny(text, ["giardino", "terreno", "corte", "resede"])) highlights.push("venkovní prostor nebo zahrada");
  if (hasAny(text, ["terrazzo", "balcone"])) highlights.push("terasa nebo balkon");
  if (hasAny(text, ["vista", "panorama"])) highlights.push("výhled nebo panoramatická poloha");
  if (hasAny(text, ["ristrutturat", "ottimo stato", "buono stato"])) highlights.push("dobrý stav podle inzerátu");
  if (hasAny(text, ["centro"])) highlights.push("poloha v centru nebo v dostupné části obce");
  if (!highlights.length) highlights.push("základní parametry vhodné k dalšímu prověření");
  return highlights.slice(0, 2).join(" a ");
}

function czechDescription(listing) {
  if (CZECH_DESCRIPTION_FINAL_OVERRIDES[listing.index]) {
    return CZECH_DESCRIPTION_FINAL_OVERRIDES[listing.index];
  }
  if (CZECH_DESCRIPTION_OVERRIDES[listing.index]) {
    return CZECH_DESCRIPTION_OVERRIDES[listing.index];
  }
  const surface = formatMetric(listing.surface);
  const price = formatPrice(listing.priceLabel);
  const place = [listing.city, listing.address, listing.streetNumber].filter(Boolean).join(", ");
  const title = compactTitle(listing);
  return `${title} se nachází v lokalitě ${place || listing.city || "Toskánsko"}. Nemovitost má podle inzerátu ${surface}, ${czechRooms(listing.rooms)}, ${czechBedrooms(listing.bedrooms)} a ${czechBathrooms(listing.bathrooms)}. Požadovaná cena je ${price}. Hlavním bodem k posouzení je ${czechHighlight(listing)}. Před dalším krokem je vhodné ověřit technický stav, dokumentaci, reálné náklady a přesnou situaci na místě při osobní prohlídce.`;
}

function shortDescription(listing) {
  const text = cleanText(listing.descriptionCs || listing.description)
    .replace(/Contattaci[\s\S]*$/i, "")
    .replace(/Per informazioni[\s\S]*$/i, "")
    .replace(/Chiama[\s\S]*$/i, "")
    .trim();
  if (text.length <= 1500) return text;

  const sentences = text.split(/(?<=[.!?])\s+/);
  const kept = [];
  for (const sentence of sentences) {
    const next = [...kept, sentence].join(" ");
    if (next.length > 1500) break;
    kept.push(sentence);
  }
  return kept.join(" ").trim() || `${text.slice(0, 1497).trim()}...`;
}

function imageEntries(listing) {
  const entries = [];
  const add = (filePath, caption, role) => {
    if (!filePath || !fs.existsSync(filePath)) return;
    if (entries.some((item) => item.path === filePath)) return;
    const hash = crypto.createHash("sha1").update(fs.readFileSync(filePath)).digest("hex");
    entries.push({
      path: filePath,
      caption: cleanText(caption).toLowerCase(),
      role,
      hash,
    });
  };

  add(listing.saved?.mainPath, listing.galleryDetails?.[0]?.caption, "main");
  (listing.saved?.galleryPaths || []).forEach((file, index) => {
    add(file, listing.galleryDetails?.[index]?.caption, "gallery");
  });
  add(listing.saved?.planPath, "planimetria", "plan");
  return entries.filter((item) => item.role !== "plan");
}

function dedupeImageEntries(entries) {
  const seen = new Set();
  const unique = [];
  for (const item of entries) {
    if (seen.has(item.hash)) continue;
    seen.add(item.hash);
    unique.push(item);
  }
  return unique;
}

function hasAny(text, keywords) {
  return keywords.some((keyword) => text.includes(keyword));
}

function heroScore(item) {
  const caption = item.caption;
  let score = item.role === "main" ? 30 : 0;
  if (hasAny(caption, ["facciata", "esterno", "vista", "panorama", "giardino", "terrazzo", "balcone", "corte", "resede"])) score += 100;
  if (hasAny(caption, ["soggiorno", "salone", "living"])) score += 32;
  if (hasAny(caption, ["cucina"])) score += 20;
  if (hasAny(caption, ["camera", "bagno", "corridoio", "scala"])) score -= 18;
  return score;
}

function pickHeroImage(listing) {
  const entries = dedupeImageEntries(imageEntries(listing));
  const imageOverride = IMAGE_OVERRIDES[listing.index]?.hero;
  if (imageOverride) {
    const match = entries.find((item) => path.basename(item.path, path.extname(item.path)) === imageOverride);
    if (match) return match.path;
  }
  const override = HERO_OVERRIDES[listing.index];
  if (override) {
    const match = entries.find((item) => path.basename(item.path, path.extname(item.path)) === override);
    if (match) return match.path;
  }
  return entries.slice().sort((a, b) => heroScore(b) - heroScore(a))[0]?.path || null;
}

function galleryScore(caption) {
  if (hasAny(caption, ["cucina", "angolo cottura"])) return 100;
  if (hasAny(caption, ["soggiorno", "salone", "living", "zona giorno"])) return 96;
  if (hasAny(caption, ["camera", "stanza"])) return 92;
  if (hasAny(caption, ["bagno"])) return 88;
  if (hasAny(caption, ["terrazzo", "balcone", "giardino", "corte", "resede", "vista"])) return 78;
  if (hasAny(caption, ["facciata", "esterno"])) return 62;
  if (hasAny(caption, ["ingresso", "scala", "corridoio", "disimpegno"])) return 45;
  return 55;
}

function pickGalleryImages(listing) {
  const hero = pickHeroImage(listing);
  const heroHash = imageEntries(listing).find((item) => item.path === hero)?.hash;
  const entries = dedupeImageEntries(imageEntries(listing)).filter((item) => item.path !== hero && item.hash !== heroHash);
  const chosen = [];
  const used = new Set();
  const manualGallery = IMAGE_OVERRIDES[listing.index]?.gallery || [];
  for (const name of manualGallery) {
    const match = entries.find((item) => path.basename(item.path, path.extname(item.path)) === name);
    if (!match || used.has(match.path)) continue;
    chosen.push(match.path);
    used.add(match.path);
    if (chosen.length >= 6) break;
  }

  const rules = [
    ["cucina", "angolo cottura"],
    ["soggiorno", "salone", "living", "zona giorno"],
    ["camera", "stanza"],
    ["bagno"],
    ["studio", "lavanderia", "cantina", "mansarda"],
    ["ingresso", "scala", "corridoio", "disimpegno", "interno appartamento"],
    ["terrazzo", "balcone", "giardino", "corte", "resede"],
  ];

  for (const rule of rules) {
    const match = entries.find((item) => !used.has(item.path) && hasAny(item.caption, rule));
    if (!match) continue;
    chosen.push(match.path);
    used.add(match.path);
    if (chosen.length >= 6) break;
  }

  for (const item of entries.slice().sort((a, b) => galleryScore(b.caption) - galleryScore(a.caption))) {
    if (chosen.length >= 6) break;
    if (used.has(item.path)) continue;
    chosen.push(item.path);
    used.add(item.path);
  }

  const fallback = entries
    .filter((item) => !hasAny(item.caption, ["facciata", "esterno", "vista", "panorama"]))
    .concat(entries.filter((item) => hasAny(item.caption, ["facciata", "esterno", "vista", "panorama"])));
  for (const item of fallback) {
    if (chosen.length >= 6) break;
    const file = item.path;
    if (!used.has(file)) {
      chosen.push(file);
      used.add(file);
    }
  }

  return chosen.slice(0, 6);
}

function addImageIfExists(slide, filePath, options) {
  if (filePath && fs.existsSync(filePath)) {
    slide.addImage({ path: filePath, ...options });
    return;
  }
  slide.addShape("rect", {
    x: options.x,
    y: options.y,
    w: options.w,
    h: options.h,
    fill: { color: "F0F0F0" },
    line: { color: "F0F0F0" },
  });
}

function addFadeOverlay(slide) {
  const bands = [
    { x: 2.758, w: 0.472, transparency: 12 },
    { x: 3.227, w: 0.389, transparency: 26 },
    { x: 3.619, w: 0.305, transparency: 42 },
    { x: 3.93, w: 0.222, transparency: 58 },
    { x: 4.151, w: 0.139, transparency: 72 },
  ];
  for (const band of bands) {
    slide.addShape("rect", {
      x: band.x,
      y: 0,
      w: band.w,
      h: 7.5,
      line: { color: "FFFFFF", transparency: 100 },
      fill: { color: "FFFFFF", transparency: band.transparency },
    });
  }
}

function addSlideOne(pptx, listing) {
  const slide = pptx.addSlide();
  slide.background = { color: COLORS.bg };

  addImageIfExists(slide, pickHeroImage(listing), {
    x: 3.37,
    y: 0,
    w: 9.97,
    h: 7.5,
    sizing: { type: "cover", x: 3.37, y: 0, w: 9.97, h: 7.5 },
  });
  addFadeOverlay(slide);
  addImageIfExists(slide, ICON_STRIP, { x: 0.38, y: 1.55, w: 0.8, h: 4.89 });

  slide.addText(`${listing.index}. ${compactTitle(listing)}`, {
    x: 0.11,
    y: 0.15,
    w: 3.95,
    h: 0.82,
    fontFace: "Aptos Display",
    fontSize: 20,
    color: COLORS.text,
    margin: 0,
    fit: "shrink",
  });

  const metricX = 1.52;
  const metricStyle = {
    fontFace: "Aptos",
    fontSize: 18,
    color: COLORS.text,
    margin: 0,
    valign: "mid",
    align: "left",
  };
  slide.addText(formatMetric(listing.surface), { x: metricX, y: 1.72, w: 1.45, h: 0.36, ...metricStyle });
  slide.addText(formatMetric(listing.rooms), { x: metricX, y: 2.56, w: 1.45, h: 0.36, ...metricStyle });
  slide.addText(formatMetric(listing.bedrooms), { x: metricX, y: 3.39, w: 1.45, h: 0.36, ...metricStyle });
  slide.addText(formatMetric(listing.bathrooms), { x: metricX, y: 4.24, w: 1.45, h: 0.36, ...metricStyle });
  slide.addText("mappa", {
    x: metricX,
    y: 5.13,
    w: 1.45,
    h: 0.36,
    ...metricStyle,
    hyperlink: { url: buildMapUrl(listing) },
    underline: { color: COLORS.text },
  });
  slide.addText(formatPrice(listing.priceLabel), {
    x: metricX,
    y: 6.17,
    w: 1.95,
    h: 0.4,
    fontFace: "Aptos",
    fontSize: 18,
    color: COLORS.text,
    margin: 0,
    fit: "shrink",
  });

  const place = [listing.city, listing.address].filter(Boolean).join(" | ");
  slide.addText(place, {
    x: 0.13,
    y: 6.93,
    w: 3.1,
    h: 0.27,
    fontFace: "Aptos",
    fontSize: 8.4,
    color: COLORS.muted,
    margin: 0,
    fit: "shrink",
  });
}

function addSlideTwo(pptx, listing) {
  const slide = pptx.addSlide();
  slide.background = { color: COLORS.bg };
  const slots = [
    { x: 0.0, y: 0.0, w: 4.07, h: 2.42 },
    { x: 4.12, y: 0.0, w: 4.07, h: 2.42 },
    { x: 0.0, y: 2.5, w: 4.07, h: 2.42 },
    { x: 4.12, y: 2.5, w: 4.07, h: 2.42 },
    { x: 0.0, y: 5.0, w: 4.07, h: 2.5 },
    { x: 4.12, y: 5.0, w: 4.07, h: 2.5 },
  ];

  pickGalleryImages(listing).forEach((filePath, index) => {
    const slot = slots[index];
    addImageIfExists(slide, filePath, {
      x: slot.x,
      y: slot.y,
      w: slot.w,
      h: slot.h,
      sizing: { type: "cover", x: slot.x, y: slot.y, w: slot.w, h: slot.h },
    });
  });

  slide.addText(String(listing.index), {
    x: 8.28,
    y: 0.22,
    w: 0.6,
    h: 0.32,
    fontFace: "Aptos",
    fontSize: 20,
    bold: true,
    color: COLORS.text,
    margin: 0,
  });
  slide.addText(compactTitle(listing), {
    x: 8.28,
    y: 0.58,
    w: 4.72,
    h: 0.55,
    fontFace: "Aptos Display",
    fontSize: 15,
    bold: true,
    color: COLORS.text,
    margin: 0,
    fit: "shrink",
  });
  slide.addText(shortDescription(listing), {
    x: 8.28,
    y: 1.2,
    w: 4.78,
    h: 5.62,
    fontFace: "Aptos",
    fontSize: 11.2,
    color: COLORS.text,
    margin: 0,
    valign: "top",
    breakLine: false,
    fit: "shrink",
  });
  slide.addText(`Zdroj: ${listing.url}`, {
    x: 8.28,
    y: 7.02,
    w: 4.78,
    h: 0.2,
    fontFace: "Aptos",
    fontSize: 6.5,
    color: COLORS.muted,
    margin: 0,
    fit: "shrink",
  });
}

async function loadListings() {
  ensureDir(OUT_DIR);
  const listings = [];
  for (const item of ITEMS) {
    const listingDir = path.join(OUT_DIR, `listing-${item.index}`);
    ensureDir(listingDir);
    const harPath = path.join(HAR_DIR, item.har);
    let data;
    try {
      data = extractListingData(harPath, listingDir);
    } catch (error) {
      console.warn(`HAR ${item.har} non è parsabile come JSON completo, uso fallback parziale: ${error.message}`);
      data = await extractListingDataFallback(harPath, listingDir, item);
    }
    const override = DATA_OVERRIDES[item.index] || {};
    const listing = {
      ...data,
      ...override,
      ...item,
      title: cleanText(override.title || data.title),
      titleCs: CZECH_TITLE_OVERRIDES[item.index],
      city: cleanText(override.city || data.city),
      address: cleanText(override.address || data.address),
      streetNumber: cleanText(override.streetNumber || data.streetNumber),
      description: cleanText(override.description || data.description),
      priceLabel: cleanText(override.priceLabel || data.priceLabel),
      surface: cleanText(override.surface || data.surface),
      rooms: cleanText(override.rooms || data.rooms),
      bedrooms: cleanText(override.bedrooms || data.bedrooms),
      bathrooms: cleanText(override.bathrooms || data.bathrooms),
      descriptionCs: "",
      url: item.url,
    };
    listing.titleCs = listing.titleCs || listing.title;
    listings.push(listing);
  }
  return listings;
}

async function main() {
  const outPath = process.argv[2] || OUTPUT;
  ensureDir(path.dirname(outPath));
  const listings = await loadListings();

  const pptx = new pptxgen();
  pptx.layout = "LAYOUT_WIDE";
  pptx.author = "OpenAI Codex";
  pptx.company = "OpenAI";
  listings.forEach((listing) => {
    listing.descriptionCs = czechDescription(listing);
  });

  pptx.subject = "Výběr nemovitostí z HAR Immobiliare.it";
  pptx.title = "Výběr Trieste a okolí - červenec 2026";
  pptx.lang = "cs-CZ";
  pptx.theme = { headFontFace: "Aptos Display", bodyFontFace: "Aptos", lang: "cs-CZ" };

  listings.forEach((listing) => {
    addSlideOne(pptx, listing);
    addSlideTwo(pptx, listing);
  });

  fs.writeFileSync(
    path.join(OUT_DIR, "listings-summary.json"),
    JSON.stringify(
      listings.map((listing) => ({
        index: listing.index,
        url: listing.url,
        title: listing.title,
        city: listing.city,
        price: listing.priceLabel,
        surface: listing.surface,
        hero: pickHeroImage(listing),
        gallery: pickGalleryImages(listing),
      })),
      null,
      2
    )
  );

  await pptx.writeFile({ fileName: outPath });
  console.log(outPath);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});

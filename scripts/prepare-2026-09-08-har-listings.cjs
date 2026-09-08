const fs = require('fs');
const path = require('path');
const sharp = require('sharp');
const { extractListingData } = require('./extract-listing-data.cjs');
const harRoot = process.argv[2];
if (!harRoot) throw new Error('Usage: node scripts/prepare-2026-09-08-har-listings.cjs HAR_DIRECTORY');
const tr = (it, en, cs) => ({ it, en, cs });
const items = [
  [1, 'toscana-rustico-quiesa-massarosa-132061064', tr('Rustico ristrutturato con giardino a Quiesa', 'Renovated rustic house with garden in Quiesa', 'Zrekonstruovaný rustikální dům se zahradou v Quiese'), tr(
    'A Quiesa, nel comune di Massarosa, terratetto ristrutturato di 170 m² su più livelli. Il piano terra ospita soggiorno, cucina, sala da pranzo e una stanza utilizzabile come camera o studio; ai piani superiori si trovano tre camere, due bagni complessivi e due grandi vani al secondo piano. Giardino e resede sul retro, spazio per parcheggiare davanti. La scheda della fonte riporta cinque camere. Classe energetica G.',
    'Renovated 170 m² house over several levels in Quiesa, Massarosa. The ground floor has a living room, kitchen, dining room and a bedroom or study. Above are three bedrooms, two bathrooms in total and two large top-floor rooms. There is a rear garden and courtyard, with parking space in front. The source lists five bedrooms overall. Energy class G.',
    'Zrekonstruovaný dům o ploše 170 m² v Quiese u Massarosy má několik podlaží. V přízemí je obývací pokoj, kuchyně, jídelna a pokoj vhodný jako ložnice nebo pracovna. Výše jsou tři ložnice, celkem dvě koupelny a dva velké pokoje v posledním patře. Za domem je zahrada a dvůr, před domem prostor k parkování. Zdroj uvádí celkem pět ložnic. Energetická třída G.')],
  [2, 'toscana-terratetto-solaio-pietrasanta-127378181', tr('Terratetto vista mare a Solaio, Pietrasanta', 'Sea-view village house in Solaio, Pietrasanta', 'Dům s výhledem na moře v Solaiu u Pietrasanty'), tr(
    'Nel borgo di Solaio, a circa cinque minuti in auto da Pietrasanta, terratetto ristrutturato di 80 m² con vista mare. Su tre livelli offre zona giorno e pranzo, tre camere, un bagno e ripostiglio. Terreno di circa 400 m² e annesso utilizzato come lavanderia, deposito e posto auto. La fonte indica la possibilità di realizzare un secondo bagno, da verificare.',
    'Renovated 80 m² village house with sea views in Solaio, about five minutes by car from Pietrasanta. Three floors contain the living and dining area, three bedrooms, one bathroom and storage. Approximately 400 m² of land and an outbuilding used for laundry, storage and parking. The source mentions a possible second bathroom, subject to verification.',
    'Zrekonstruovaný dům o ploše 80 m² s výhledem na moře v Solaiu, asi pět minut autem od Pietrasanty. Ve třech podlažích je obytná a jídelní část, tři ložnice, koupelna a komora. Pozemek má přibližně 400 m², vedlejší stavba slouží jako prádelna, sklad a parkovací prostor. Možnost druhé koupelny uvedenou ve zdroji je třeba ověřit.')],
  [3, 'toscana-casa-pieve-compito-capannori-128377910', tr('Casa in pietra con terreno a Pieve di Compito', 'Stone house with land in Pieve di Compito', 'Kamenný dům s pozemkem v Pieve di Compito'), tr(
    'A Pieve di Compito, circa 9 km da Lucca, casa libera su tre lati di circa 160 m². Comprende una parte abitabile con cucina con camino, soggiorno, tre camere e due bagni, oltre a una seconda unità al grezzo con ingresso indipendente. Completano la proprietà una capanna di circa 50 m² su due piani, forno esterno, resede coperta di circa 40 m² e terreno di circa 4.500 m². Le eventuali trasformazioni della capanna e la piscina richiedono verifica tecnica e autorizzativa.',
    'Approximately 160 m² stone house with three free sides in Pieve di Compito, around 9 km from Lucca. The habitable section has a kitchen with fireplace, living room, three bedrooms and two bathrooms; a second unfinished unit has its own entrance. Also included are a two-storey barn of about 50 m², outdoor oven, covered courtyard of about 40 m² and roughly 4,500 m² of land. Barn conversion and a pool require technical and planning checks.',
    'Kamenný dům o ploše přibližně 160 m², volný ze tří stran, v Pieve di Compito asi 9 km od Luccy. Obyvatelná část má kuchyni s krbem, obývací pokoj, tři ložnice a dvě koupelny; druhá nedokončená jednotka má vlastní vstup. Součástí je dvoupodlažní stodola asi 50 m², venkovní pec, krytý dvůr asi 40 m² a pozemek přibližně 4 500 m². Přestavba stodoly a bazén vyžadují technické posouzení a povolení.')],
  [4, 'toscana-casa-sommocolonia-barga-90676764', tr('Casa panoramica con patio a Sommocolonia, Barga', 'Panoramic village house with patio in Sommocolonia, Barga', 'Dům s panoramatickým výhledem a patiem v Sommocolonii'), tr(
    'Nel borgo di Sommocolonia, vicino a Barga, casa ristrutturata con circa 190 m² abitabili oltre alle cantine. Distribuita su quattro livelli, offre quattro camere, due bagni, cucina, soggiorno con camino e locali accessori. Patio con pergola in legno e forno a legna, con vista sulla valle. La ristrutturazione conserva pavimenti in cotto, travi a vista e scale in pietra.',
    'Renovated village house in Sommocolonia near Barga, with around 190 m² of living space plus cellars. Four levels provide four bedrooms, two bathrooms, a kitchen, living room with fireplace and ancillary rooms. A patio with a timber pergola and wood-fired oven overlooks the valley. Terracotta floors, exposed beams and stone stairs retain the house’s traditional character.',
    'Zrekonstruovaný dům v Sommocolonii u Bargy nabízí asi 190 m² obytné plochy a sklepy. Ve čtyřech úrovních jsou čtyři ložnice, dvě koupelny, kuchyně, obývací pokoj s krbem a vedlejší místnosti. Patio s dřevěnou pergolou a pecí na dřevo má výhled do údolí. Zachovány jsou terakotové podlahy, trámy a kamenné schodiště.')],
  [5, 'toscana-rustico-valpromaro-massarosa-130818992', tr('Rustico in pietra con giardino a Valpromaro', 'Stone village house with garden in Valpromaro', 'Kamenný dům se zahradou ve Valpromaru'), tr(
    'A Valpromaro, nel comune di Massarosa, rustico in pietra con giardino privato vicino a un torrente. La scheda indica 298 m², mentre il testo descrive circa 270 m². Al piano terra si trovano due locali commerciali con accesso indipendente; sopra, cucina, soggiorno, camere e bagni. Presenti vani seminterrati, resede di circa 110 m² e quattro camini. Il testo descrive quattro camere, mentre la scheda ne indica cinque: consistenza da confermare. L’eventuale conversione dei negozi in abitazione è soggetta a verifica.',
    'Stone village house in Valpromaro, Massarosa, with a private garden beside a stream. The listing shows 298 m², while its description states about 270 m². Two independently accessed commercial rooms occupy the ground floor, with kitchen, living room, bedrooms and bathrooms above. Basement storage, a courtyard of about 110 m² and four fireplaces are included. The text describes four bedrooms but the specification lists five; the layout needs confirmation. Residential conversion of the shops requires verification.',
    'Kamenný dům ve Valpromaru u Massarosy má soukromou zahradu u potoka. Karta uvádí 298 m², popis přibližně 270 m². V přízemí jsou dva obchodní prostory s vlastními vstupy, výše kuchyně, obývací pokoj, ložnice a koupelny. Součástí jsou sklepní prostory, dvůr asi 110 m² a čtyři krby. Popis uvádí čtyři ložnice, karta pět; dispozici je třeba potvrdit. Změna obchodních prostor na bydlení vyžaduje ověření.')],
  [6, 'toscana-capriccio-celle-puccini-pescaglia-5119267', tr('Il Capriccio: casa a Celle dei Puccini, Pescaglia', 'Il Capriccio: village home in Celle dei Puccini, Pescaglia', 'Il Capriccio: dům v Celle dei Puccini u Pescaglie'), tr(
    'Nel borgo di Celle dei Puccini, porzione di edificio storico ristrutturato denominata Il Capriccio. Il testo descrive un’unità di circa 123 m² con due camere e due bagni, cucina e pranzo, soggiorno con camino, terrazzo, portico, lavanderia e cantina. Vendita arredata. Terreno di circa 1.015 m² condiviso con l’altra unità, dall’altro lato della strada e non adiacente alla casa. La scheda riporta dati diversi per camere, bagni e superficie commerciale: consistenza da verificare con l’agenzia.',
    'Il Capriccio is a renovated part of a historic building in Celle dei Puccini. The description identifies a unit of about 123 m² with two bedrooms and two bathrooms, kitchen and dining area, living room with fireplace, terrace, porch, laundry and cellar. Sold furnished. About 1,015 m² of land is shared with the other unit and lies across the road, away from the house. The listing’s summary gives different bedroom, bathroom and commercial-area figures; confirm the exact accommodation with the agent.',
    'Il Capriccio je zrekonstruovaná část historického domu v Celle dei Puccini. Popis uvádí jednotku přibližně 123 m² se dvěma ložnicemi a dvěma koupelnami, kuchyní a jídelnou, obývacím pokojem s krbem, terasou, krytým vstupem, prádelnou a sklepem. Prodává se zařízená. Pozemek asi 1 015 m² je společný s druhou jednotkou a leží přes ulici, nikoli přímo u domu. Přehled ve zdroji uvádí odlišné počty pokojů, koupelen a obchodní plochu; přesný rozsah je nutné potvrdit s agenturou.')],
  [7, 'toscana-ex-mulino-valdottavo-129179200', tr('Ex mulino ristrutturato a Valdottavo', 'Renovated former mill in Valdottavo', 'Zrekonstruovaný bývalý mlýn ve Valdottavu'), tr(
    'A Valdottavo, nel comune di Borgo a Mozzano, ex mulino ristrutturato di circa 150 m², libero su tre lati. Il soggiorno con pavimento in legno e bagno di servizio si collega tramite scala interna in ferro alla cucina al piano seminterrato, con ripostiglio e lavanderia, e alla zona notte con due camere e bagno finestrato. Pietra e travi a vista si uniscono a finiture moderne. La fonte contiene indicazioni contrastanti sul posto auto: disponibilità da confermare.',
    'Renovated former mill of about 150 m² in Valdottavo, Borgo a Mozzano, with three free sides. A living room with timber flooring and guest bathroom connects via an iron staircase to the lower-ground kitchen, storage and laundry, and to the sleeping area with two bedrooms and a windowed bathroom. Exposed stone and beams combine with modern finishes. The source contradicts itself about parking, so availability must be confirmed.',
    'Zrekonstruovaný bývalý mlýn o ploše asi 150 m² ve Valdottavu u Borgo a Mozzano, volný ze tří stran. Obývací pokoj s dřevěnou podlahou a koupelnou propojuje železné schodiště s kuchyní, komorou a prádelnou v suterénu i s částí se dvěma ložnicemi a koupelnou s oknem. Kamenné stěny a trámy doplňují moderní povrchy. Zdroj si protiřečí ohledně parkování; jeho dostupnost je třeba potvrdit.')]
];
function decode(c) { return c.encoding === 'base64' ? Buffer.from(c.text, 'base64').toString('utf8') : c.text || ''; }
async function main() {
  const inventoryPath = 'data/local-properties.json';
  const inventory = JSON.parse(fs.readFileSync(inventoryPath, 'utf8'));
  const additions = [];
  for (const [index, slug, title, description] of items) {
    const harPath = path.join(harRoot, `${index}.har`);
    const har = JSON.parse(fs.readFileSync(harPath, 'utf8'));
    const sourceUrl = har.log.pages[0].title.split('?')[0];
    if (inventory.some(p => p.sourceUrl === sourceUrl || p.slug.current === slug)) throw new Error(`Already imported: ${sourceUrl}`);
    const htmlEntry = har.log.entries.find(e => e.request.url.split('?')[0] === sourceUrl && /text\/html/.test(e.response.content.mimeType));
    if (!htmlEntry || htmlEntry.response.status !== 200) throw new Error(`Missing source: ${index}`);
    const html = decode(htmlEntry.response.content);
    let data, urls;
    if ([1,2,3,5,7].includes(index)) {
      data = extractListingData(harPath);
      urls = data.gallery;
    } else {
      data = index === 4
        ? { city: 'Barga', address: 'Sommocolonia', priceLabel: '290000', surface: '190', bedrooms: '4', bathrooms: '2', latitude: 44.09295, longitude: 10.49051 }
        : { city: 'Pescaglia', address: 'Celle dei Puccini, Strada Provinciale 60', priceLabel: '235000', surface: '123', bedrooms: '2', bathrooms: '2', rooms: '6', latitude: 43.96513, longitude: 10.41166 };
      urls = [...new Set(html.match(index === 4
        ? /https:\/\/media.rightmove.co.uk\/property-photo\/[^"<>\s]+\.jpeg/g
        : /https:\/\/agestanet.risorseimmobiliari.it\/public\/annunci\/08754\/2592020\/[^"<>\s]+\.jpg/g) || [])];
    }
    const folder = path.join('data/import/properties', slug);
    const publicDir = path.join('public/uploads/properties', slug);
    fs.mkdirSync(folder, { recursive: true }); fs.mkdirSync(publicDir, { recursive: true });
    const images = [], media = [];
    for (const url of [...new Set(urls)]) {
      const cached = har.log.entries.find(e => e.request.url === url && e.response.content.encoding === 'base64' && e.response.content.text);
      let buffer;
      if (cached) buffer = Buffer.from(cached.response.content.text, 'base64');
      else {
        const response = await fetch(url, { signal: AbortSignal.timeout(20000) });
        if (!response.ok) throw new Error(`Image ${response.status}: ${url}`);
        buffer = Buffer.from(await response.arrayBuffer());
      }
      const info = await sharp(buffer).metadata();
      if (info.width < 300 || info.height < 200) throw new Error(`Image too small: ${url}`);
      const filename = `${String(images.length + 1).padStart(2, '0')}.jpg`;
      await sharp(buffer).rotate().resize({ width: 1600, withoutEnlargement: true }).jpeg({ quality: 85 }).toFile(path.join(publicDir, filename));
      images.push(`/uploads/properties/${slug}/${filename}`);
      media.push({ sourceUrl: url, localPath: images.at(-1) });
    }
    if (!images.length) throw new Error(`No images for ${slug}`);
    const number = v => Number.parseInt(v, 10) || 0;
    const specifications = { bedrooms: number(data.bedrooms), bathrooms: number(data.bathrooms), squareFootage: number(data.surface) };
    if (data.rooms && data.rooms !== '5+') specifications.rooms = number(data.rooms);
    const property = {
      _id: `local-import-${slug}`, _type: 'listing', title, slug: { _type: 'slug', current: slug }, propertyType: 'house',
      price: { amount: number(data.priceLabel), currency: 'EUR' }, specifications,
      location: { city: { name: tr(data.city, data.city, data.city), slug: { current: data.city.toLowerCase().replaceAll(' ', '-') }, region: { name: tr('Toscana', 'Tuscany', 'Toskánsko'), country: tr('Italia', 'Italy', 'Itálie') } }, address: tr(data.address || 'Quiesa', data.address || 'Quiesa', data.address || 'Quiesa'), coordinates: { lat: data.latitude, lng: data.longitude } },
      status: 'available', featured: false, isNew: true, noAgency: false, description, images, mainImage: 0, amenities: [],
      seoTitle: title, seoDescription: Object.fromEntries(Object.entries(description).map(([k,v]) => [k, v.split('. ')[0] + '.'])),
      keywords: ['toscana', data.city.toLowerCase(), 'house'], sourceUrl,
      _createdAt: '2026-09-08T10:00:00.000Z', _updatedAt: '2026-09-08T10:00:00.000Z'
    };
    fs.writeFileSync(path.join(folder, 'source.json'), JSON.stringify({ har: `${index}.har`, sourceUrl, capturedAt: htmlEntry.startedDateTime, httpStatus: htmlEntry.response.status, extracted: data, media }, null, 2) + '\n');
    fs.writeFileSync(path.join(folder, 'listing.json'), JSON.stringify(property, null, 2) + '\n');
    additions.push(property);
    console.log(`${index}: ${slug}: ${images.length} photos`);
  }
  fs.writeFileSync(inventoryPath, JSON.stringify([...additions, ...inventory], null, 2) + '\n');
  console.log(`Added ${additions.length}; total ${inventory.length + additions.length}`);
}
main().catch(error => { console.error(error); process.exit(1); });

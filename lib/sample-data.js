// Sample data for development and testing
// This data is used when Sanity CMS is not configured

export const SAMPLE_PROPERTIES = [
  {
    _id: '1',
    title: { 
      en: 'Luxury Villa with Lake Como Views', 
      it: 'Villa di Lusso con Vista sul Lago di Como',
      cs: 'Luxusní vila s výhledem na jezero Como'
    },
    slug: { current: 'luxury-villa-lake-como' },
    propertyType: 'villa',
    price: { amount: 2500000, currency: 'EUR' },
    description: { 
      en: 'Stunning lakefront villa with panoramic views of Lake Como. Features elegant interiors, private gardens, and direct lake access. Perfect for those seeking luxury and tranquility.',
      it: 'Splendida villa fronte lago con vista panoramica sul Lago di Como. Caratteristiche interni eleganti, giardini privati e accesso diretto al lago.',
      cs: 'Úžasná vila na břehu jezera s panoramatickým výhledem na jezero Como. Elegantní interiéry, soukromé zahrady a přímý přístup k jezeru.'
    },
    specifications: { 
      bedrooms: 4, 
      bathrooms: 3, 
      squareFootage: 350,
      landSize: 1200,
      yearBuilt: 2018
    },
    location: {
      city: {
        name: { en: 'Como', it: 'Como', cs: 'Como' },
        slug: { current: 'como' },
        region: { 
          name: { en: 'Lombardy', it: 'Lombardia', cs: 'Lombardie' }, 
          country: 'Italy' 
        }
      },
      address: 'Via del Lago 123, Como',
      coordinates: [45.8081, 9.0852]
    },
    images: [
      '/house_como.jpg',
      '/house_como.jpg',
      '/house_como.jpg'
    ],
    amenities: [
      { name: { en: 'Swimming Pool', it: 'Piscina', cs: 'Bazén' } },
      { name: { en: 'Garden', it: 'Giardino', cs: 'Zahrada' } },
      { name: { en: 'Garage', it: 'Garage', cs: 'Garáž' } },
      { name: { en: 'Lake Access', it: 'Accesso al Lago', cs: 'Přístup k jezeru' } }
    ],
    status: 'available',
    featured: true
  },
  {
    _id: '2',
    title: { 
      en: 'Tuscan Farmhouse with Vineyards', 
      it: 'Casa Colonica Toscana con Vigneti',
      cs: 'Toskánský statek s vinicemi'
    },
    slug: { current: 'tuscan-farmhouse-vineyards' },
    propertyType: 'house',
    price: { amount: 1200000, currency: 'EUR' },
    description: { 
      en: 'Authentic Tuscan farmhouse surrounded by rolling hills and vineyards. Perfect blend of rustic charm and modern comfort. Includes wine cellar and olive grove.',
      it: 'Autentica casa colonica toscana circondata da colline e vigneti. Perfetta combinazione di fascino rustico e comfort moderno.',
      cs: 'Autentický toskánský statek obklopený kopci a vinicemi. Dokonalá kombinace rustikálního kouzla a moderního pohodlí.'
    },
    specifications: { 
      bedrooms: 3, 
      bathrooms: 2, 
      squareFootage: 280,
      landSize: 5000,
      yearBuilt: 1850
    },
    location: {
      city: {
        name: { en: 'Chianti', it: 'Chianti', cs: 'Chianti' },
        slug: { current: 'chianti' },
        region: { 
          name: { en: 'Tuscany', it: 'Toscana', cs: 'Toskánsko' }, 
          country: 'Italy' 
        }
      },
      address: 'Strada del Vino 45, Chianti',
      coordinates: [43.4643, 11.2558]
    },
    images: [
      '/house_tuscany_vineyards.jpg',
      '/house_tuscany_vineyards.jpg',
      '/house_tuscany_vineyards.jpg'
    ],
    amenities: [
      { name: { en: 'Wine Cellar', it: 'Cantina', cs: 'Vinný sklep' } },
      { name: { en: 'Olive Grove', it: 'Uliveto', cs: 'Olivový háj' } },
      { name: { en: 'Fireplace', it: 'Camino', cs: 'Krb' } },
      { name: { en: 'Terrace', it: 'Terrazza', cs: 'Terasa' } }
    ],
    status: 'available',
    featured: true
  },
  {
    _id: '3',
    title: { 
      en: 'Amalfi Coast Villa with Sea Views', 
      it: 'Villa Costa Amalfitana con Vista Mare',
      cs: 'Vila na pobřeží Amalfi s výhledem na moře'
    },
    slug: { current: 'amalfi-coast-villa-sea-views' },
    propertyType: 'villa',
    price: { amount: 3200000, currency: 'EUR' },
    description: { 
      en: 'Spectacular villa perched on the Amalfi Coast with breathtaking sea views. Features infinity pool, terraced gardens, and direct beach access.',
      it: 'Villa spettacolare arroccata sulla Costa Amalfitana con vista mare mozzafiato. Piscina a sfioro, giardini terrazzati e accesso diretto alla spiaggia.',
      cs: 'Velkolepá vila na pobřeží Amalfi s úchvatným výhledem na moře. Nekonečný bazén, terasovité zahrady a přímý přístup na pláž.'
    },
    specifications: { 
      bedrooms: 5, 
      bathrooms: 4, 
      squareFootage: 420,
      landSize: 800,
      yearBuilt: 2015
    },
    location: {
      city: {
        name: { en: 'Positano', it: 'Positano', cs: 'Positano' },
        slug: { current: 'positano' },
        region: { 
          name: { en: 'Campania', it: 'Campania', cs: 'Kampánie' }, 
          country: 'Italy' 
        }
      },
      address: 'Via Pasitea 200, Positano',
      coordinates: [40.6281, 14.4850]
    },
    images: [
      '/house_amalfi.jpg',
      '/house_amalfi.jpg',
      '/house_amalfi.jpg'
    ],
    amenities: [
      { name: { en: 'Infinity Pool', it: 'Piscina a Sfioro', cs: 'Nekonečný bazén' } },
      { name: { en: 'Sea Access', it: 'Accesso al Mare', cs: 'Přístup k moři' } },
      { name: { en: 'Terrace', it: 'Terrazza', cs: 'Terasa' } },
      { name: { en: 'Air Conditioning', it: 'Aria Condizionata', cs: 'Klimatizace' } }
    ],
    status: 'available',
    featured: true
  },
  {
    _id: '4',
    title: { 
      en: 'Modern Apartment in Rome Center', 
      it: 'Appartamento Moderno nel Centro di Roma',
      cs: 'Moderní byt v centru Říma'
    },
    slug: { current: 'modern-apartment-rome-center' },
    propertyType: 'apartment',
    price: { amount: 850000, currency: 'EUR' },
    description: { 
      en: 'Elegant modern apartment in the heart of Rome, steps from the Pantheon. Recently renovated with luxury finishes and rooftop terrace.',
      it: 'Elegante appartamento moderno nel cuore di Roma, a pochi passi dal Pantheon. Recentemente ristrutturato con finiture di lusso.',
      cs: 'Elegantní moderní byt v srdci Říma, pár kroků od Pantheonu. Nedávno zrekonstruovaný s luxusními povrchovými úpravami.'
    },
    specifications: { 
      bedrooms: 2, 
      bathrooms: 2, 
      squareFootage: 120,
      floor: 3,
      yearBuilt: 1900,
      yearRenovated: 2022
    },
    location: {
      city: {
        name: { en: 'Rome', it: 'Roma', cs: 'Řím' },
        slug: { current: 'rome' },
        region: { 
          name: { en: 'Lazio', it: 'Lazio', cs: 'Lazio' }, 
          country: 'Italy' 
        }
      },
      address: 'Via del Pantheon 15, Roma',
      coordinates: [41.8986, 12.4769]
    },
    images: [
      'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800',
      'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800',
      'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800'
    ],
    amenities: [
      { name: { en: 'Rooftop Terrace', it: 'Terrazza Panoramica', cs: 'Střešní terasa' } },
      { name: { en: 'Historic Building', it: 'Palazzo Storico', cs: 'Historická budova' } },
      { name: { en: 'Central Location', it: 'Posizione Centrale', cs: 'Centrální poloha' } },
      { name: { en: 'Modern Kitchen', it: 'Cucina Moderna', cs: 'Moderní kuchyň' } }
    ],
    status: 'available',
    featured: false
  },
  {
    _id: '5',
    title: { 
      en: 'Venetian Palace Apartment', 
      it: 'Appartamento in Palazzo Veneziano',
      cs: 'Byt v benátském paláci'
    },
    slug: { current: 'venetian-palace-apartment' },
    propertyType: 'apartment',
    price: { amount: 1800000, currency: 'EUR' },
    description: { 
      en: 'Magnificent apartment in a 16th-century Venetian palace overlooking the Grand Canal. Original frescoes, marble floors, and canal views.',
      it: 'Magnifico appartamento in palazzo veneziano del XVI secolo affacciato sul Canal Grande. Affreschi originali, pavimenti in marmo.',
      cs: 'Nádherný byt v benátském paláci ze 16. století s výhledem na Velký kanál. Původní fresky, mramorové podlahy.'
    },
    specifications: { 
      bedrooms: 3, 
      bathrooms: 2, 
      squareFootage: 200,
      floor: 2,
      yearBuilt: 1580,
      yearRenovated: 2020
    },
    location: {
      city: {
        name: { en: 'Venice', it: 'Venezia', cs: 'Benátky' },
        slug: { current: 'venice' },
        region: { 
          name: { en: 'Veneto', it: 'Veneto', cs: 'Benátsko' }, 
          country: 'Italy' 
        }
      },
      address: 'Palazzo Grimani, Canal Grande',
      coordinates: [45.4408, 12.3155]
    },
    images: [
      'https://images.unsplash.com/photo-1523906834658-6e24ef2386f9?w=800',
      'https://images.unsplash.com/photo-1551918120-9739cb430c6d?w=800',
      'https://images.unsplash.com/photo-1534445538923-ab38438550d5?w=800'
    ],
    amenities: [
      { name: { en: 'Canal Views', it: 'Vista Canale', cs: 'Výhled na kanál' } },
      { name: { en: 'Historic Frescoes', it: 'Affreschi Storici', cs: 'Historické fresky' } },
      { name: { en: 'Marble Floors', it: 'Pavimenti Marmo', cs: 'Mramorové podlahy' } },
      { name: { en: 'Water Taxi Access', it: 'Accesso Water Taxi', cs: 'Přístup vodním taxi' } }
    ],
    status: 'available',
    featured: false
  },
  {
    _id: '6',
    title: { 
      en: 'Sicilian Villa with Mountain Views', 
      it: 'Villa Siciliana con Vista Montagna',
      cs: 'Sicilská vila s výhledem na hory'
    },
    slug: { current: 'sicilian-villa-mountain-views' },
    propertyType: 'villa',
    price: { amount: 750000, currency: 'EUR' },
    description: { 
      en: 'Charming Sicilian villa with stunning views of Mount Etna. Traditional architecture with modern amenities, citrus groves, and swimming pool.',
      it: 'Affascinante villa siciliana con vista mozzafiato sull\'Etna. Architettura tradizionale con comfort moderni, agrumeti e piscina.',
      cs: 'Okouzlující sicilská vila s úžasným výhledem na Etnu. Tradiční architektura s moderním vybavením, citrusové háje a bazén.'
    },
    specifications: { 
      bedrooms: 4, 
      bathrooms: 3, 
      squareFootage: 300,
      landSize: 3000,
      yearBuilt: 1920,
      yearRenovated: 2019
    },
    location: {
      city: {
        name: { en: 'Taormina', it: 'Taormina', cs: 'Taormina' },
        slug: { current: 'taormina' },
        region: { 
          name: { en: 'Sicily', it: 'Sicilia', cs: 'Sicílie' }, 
          country: 'Italy' 
        }
      },
      address: 'Via Teatro Greco 88, Taormina',
      coordinates: [37.8536, 15.2869]
    },
    images: [
      'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800',
      'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800',
      'https://images.unsplash.com/photo-1600607687644-c7171b42498b?w=800'
    ],
    amenities: [
      { name: { en: 'Mountain Views', it: 'Vista Montagna', cs: 'Výhled na hory' } },
      { name: { en: 'Citrus Grove', it: 'Agrumeto', cs: 'Citrusový háj' } },
      { name: { en: 'Swimming Pool', it: 'Piscina', cs: 'Bazén' } },
      { name: { en: 'Traditional Architecture', it: 'Architettura Tradizionale', cs: 'Tradiční architektura' } }
    ],
    status: 'available',
    featured: false
  },
  {
    _id: '6',
    title: { 
      en: 'Modern Apartment in Milan Center', 
      it: 'Appartamento Moderno nel Centro di Milano',
      cs: 'Moderní byt v centru Milána'
    },
    slug: { current: 'modern-apartment-milan' },
    propertyType: 'apartment',
    price: { amount: 450000, currency: 'EUR' },
    description: { 
      en: 'Contemporary apartment in the heart of Milan with modern amenities and excellent connectivity. Perfect for urban living with luxury finishes.',
      it: 'Appartamento contemporaneo nel cuore di Milano con servizi moderni e ottima connettività. Perfetto per la vita urbana con finiture di lusso.',
      cs: 'Současný byt v srdci Milána s moderním vybavením a vynikající konektivitou. Ideální pro městský život s luxusními dokončeními.'
    },
    specifications: { 
      bedrooms: 2, 
      bathrooms: 2, 
      squareFootage: 120,
      landSize: 0,
      yearBuilt: 2020
    },
    location: {
      city: {
        name: { en: 'Milan', it: 'Milano', cs: 'Milán' },
        slug: { current: 'milan' },
        region: { 
          name: { en: 'Lombardy', it: 'Lombardia', cs: 'Lombardie' }, 
          country: 'Italy' 
        }
      },
      address: 'Via Montenapoleone 15, Milan',
      coordinates: [45.4654, 9.1859]
    },
    images: [
      'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800',
      'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800',
      'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800'
    ],
    amenities: [
      { name: { en: 'City Center', it: 'Centro Città', cs: 'Centrum města' } },
      { name: { en: 'Modern Kitchen', it: 'Cucina Moderna', cs: 'Moderní kuchyně' } },
      { name: { en: 'Balcony', it: 'Balcone', cs: 'Balkon' } },
      { name: { en: 'Parking', it: 'Parcheggio', cs: 'Parkování' } }
    ],
    status: 'available',
    featured: false
  },
  {
    _id: '7',
    title: { 
      en: 'Historic Farmhouse in Umbria', 
      it: 'Cascina Storica in Umbria',
      cs: 'Historický statek v Umbrii'
    },
    slug: { current: 'historic-farmhouse-umbria' },
    propertyType: 'house',
    price: { amount: 320000, currency: 'EUR' },
    description: { 
      en: 'Charming 18th-century farmhouse with original features, olive groves, and panoramic countryside views. Perfect for those seeking authentic Italian rural life.',
      it: 'Incantata cascina del XVIII secolo con caratteristiche originali, uliveti e viste panoramiche sulla campagna. Perfetta per chi cerca la vita rurale italiana autentica.',
      cs: 'Okouzlující statek z 18. století s původními prvky, olivovými háji a panoramatickými výhledy na venkov. Ideální pro ty, kteří hledají autentický italský venkovský život.'
    },
    specifications: { 
      bedrooms: 3, 
      bathrooms: 2, 
      squareFootage: 180,
      landSize: 2000,
      yearBuilt: 1750
    },
    location: {
      city: {
        name: { en: 'Perugia', it: 'Perugia', cs: 'Perugia' },
        slug: { current: 'perugia' },
        region: { 
          name: { en: 'Umbria', it: 'Umbria', cs: 'Umbrie' }, 
          country: 'Italy' 
        }
      },
      address: 'Strada Provinciale 15, Perugia',
      coordinates: [43.1122, 12.3888]
    },
    images: [
      'https://images.unsplash.com/photo-1600607687644-c7171b42498b?w=800',
      'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800',
      'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800'
    ],
    amenities: [
      { name: { en: 'Olive Grove', it: 'Uliveto', cs: 'Olivový háj' } },
      { name: { en: 'Original Features', it: 'Caratteristiche Originali', cs: 'Původní prvky' } },
      { name: { en: 'Countryside Views', it: 'Vista Campagna', cs: 'Výhled na venkov' } },
      { name: { en: 'Fireplace', it: 'Caminetto', cs: 'Krb' } }
    ],
    status: 'available',
    featured: true
  },
  {
    _id: '8',
    title: { 
      en: 'Luxury Penthouse in Rome', 
      it: 'Attico di Lusso a Roma',
      cs: 'Luxusní penthouse v Římě'
    },
    slug: { current: 'luxury-penthouse-rome' },
    propertyType: 'apartment',
    price: { amount: 1800000, currency: 'EUR' },
    description: { 
      en: 'Exclusive penthouse with panoramic views of Rome, private terrace, and luxury finishes. Located in the heart of the Eternal City.',
      it: 'Attico esclusivo con vista panoramica su Roma, terrazza privata e finiture di lusso. Situato nel cuore della Città Eterna.',
      cs: 'Exkluzivní penthouse s panoramatickým výhledem na Řím, soukromá terasa a luxusní dokončení. Nachází se v srdci Věčného města.'
    },
    specifications: { 
      bedrooms: 3, 
      bathrooms: 3, 
      squareFootage: 200,
      landSize: 0,
      yearBuilt: 2019
    },
    location: {
      city: {
        name: { en: 'Rome', it: 'Roma', cs: 'Řím' },
        slug: { current: 'rome' },
        region: { 
          name: { en: 'Lazio', it: 'Lazio', cs: 'Lazio' }, 
          country: 'Italy' 
        }
      },
      address: 'Via del Corso 200, Rome',
      coordinates: [41.9028, 12.4964]
    },
    images: [
      'https://images.unsplash.com/photo-1544984243-ec57ea16fe25?w=800',
      'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800',
      'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800'
    ],
    amenities: [
      { name: { en: 'Private Terrace', it: 'Terrazza Privata', cs: 'Soukromá terasa' } },
      { name: { en: 'City Views', it: 'Vista Città', cs: 'Výhled na město' } },
      { name: { en: 'Luxury Finishes', it: 'Finiture di Lusso', cs: 'Luxusní dokončení' } },
      { name: { en: 'Concierge', it: 'Portiere', cs: 'Vrátný' } }
    ],
    status: 'available',
    featured: false
  },
  {
    _id: '9',
    title: { 
      en: 'Seaside Villa in Cinque Terre', 
      it: 'Villa sul Mare nelle Cinque Terre',
      cs: 'Přímořská vila v Cinque Terre'
    },
    slug: { current: 'seaside-villa-cinque-terre' },
    propertyType: 'villa',
    price: { amount: 1200000, currency: 'EUR' },
    description: { 
      en: 'Stunning seaside villa with direct beach access and panoramic Mediterranean views. Located in the UNESCO World Heritage site of Cinque Terre.',
      it: 'Splendida villa sul mare con accesso diretto alla spiaggia e vista panoramica sul Mediterraneo. Situata nel sito Patrimonio dell\'Umanità UNESCO delle Cinque Terre.',
      cs: 'Úžasná přímořská vila s přímým přístupem k pláži a panoramatickým výhledem na Středozemní moře. Nachází se v UNESCO světovém dědictví Cinque Terre.'
    },
    specifications: { 
      bedrooms: 4, 
      bathrooms: 3, 
      squareFootage: 280,
      landSize: 800,
      yearBuilt: 2015
    },
    location: {
      city: {
        name: { en: 'Vernazza', it: 'Vernazza', cs: 'Vernazza' },
        slug: { current: 'vernazza' },
        region: { 
          name: { en: 'Liguria', it: 'Liguria', cs: 'Ligurie' }, 
          country: 'Italy' 
        }
      },
      address: 'Via Roma 25, Vernazza',
      coordinates: [44.1350, 9.6840]
    },
    images: [
      'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=800',
      'https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?w=800',
      'https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=800'
    ],
    amenities: [
      { name: { en: 'Beach Access', it: 'Accesso Spiaggia', cs: 'Přístup k pláži' } },
      { name: { en: 'Sea Views', it: 'Vista Mare', cs: 'Výhled na moře' } },
      { name: { en: 'Private Garden', it: 'Giardino Privato', cs: 'Soukromá zahrada' } },
      { name: { en: 'UNESCO Site', it: 'Sito UNESCO', cs: 'UNESCO lokalita' } }
    ],
    status: 'available',
    featured: true
  },
  {
    _id: '10',
    title: { 
      en: 'Mountain Chalet in South Tyrol', 
      it: 'Chalet di Montagna in Alto Adige',
      cs: 'Horský chalet v Jižním Tyrolsku'
    },
    slug: { current: 'mountain-chalet-south-tyrol' },
    propertyType: 'house',
    price: { amount: 680000, currency: 'EUR' },
    description: { 
      en: 'Charming alpine chalet with stunning mountain views, traditional architecture, and modern amenities. Perfect for mountain lovers and outdoor enthusiasts.',
      it: 'Incantato chalet alpino con vista mozzafiato sulle montagne, architettura tradizionale e servizi moderni. Perfetto per gli amanti della montagna e degli sport all\'aperto.',
      cs: 'Okouzlující alpský chalet s úchvatným výhledem na hory, tradiční architekturou a moderním vybavením. Ideální pro milovníky hor a outdoorových aktivit.'
    },
    specifications: { 
      bedrooms: 3, 
      bathrooms: 2, 
      squareFootage: 160,
      landSize: 1200,
      yearBuilt: 2010
    },
    location: {
      city: {
        name: { en: 'Bolzano', it: 'Bolzano', cs: 'Bolzano' },
        slug: { current: 'bolzano' },
        region: { 
          name: { en: 'South Tyrol', it: 'Alto Adige', cs: 'Jižní Tyrolsko' }, 
          country: 'Italy' 
        }
      },
      address: 'Via delle Rose 8, Bolzano',
      coordinates: [46.4983, 11.3548]
    },
    images: [
      'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800',
      'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800',
      'https://images.unsplash.com/photo-1600607687644-c7171b42498b?w=800'
    ],
    amenities: [
      { name: { en: 'Mountain Views', it: 'Vista Montagna', cs: 'Výhled na hory' } },
      { name: { en: 'Ski Access', it: 'Accesso Sci', cs: 'Přístup k lyžování' } },
      { name: { en: 'Traditional Style', it: 'Stile Tradizionale', cs: 'Tradiční styl' } },
      { name: { en: 'Fireplace', it: 'Caminetto', cs: 'Krb' } }
    ],
    status: 'available',
    featured: false
  }
];

export const SAMPLE_CITIES = [
  {
    _id: 'city-1',
    name: { en: 'Rome', it: 'Roma', cs: 'Řím' },
    slug: { current: 'rome' },
    region: { 
      name: { en: 'Lazio', it: 'Lazio', cs: 'Lazio' },
      country: 'Italy'
    },
    description: { 
      en: 'The eternal city, capital of Italy with incredible history and culture.',
      it: 'La città eterna, capitale d\'Italia con storia e cultura incredibili.',
      cs: 'Věčné město, hlavní město Itálie s neuvěřitelnou historií a kulturou.'
    },
    coordinates: [41.8986, 12.4769],
    propertyCount: 150
  },
  {
    _id: 'city-2',
    name: { en: 'Venice', it: 'Venezia', cs: 'Benátky' },
    slug: { current: 'venice' },
    region: { 
      name: { en: 'Veneto', it: 'Veneto', cs: 'Benátsko' },
      country: 'Italy'
    },
    description: { 
      en: 'Unique city built on water with stunning architecture and canals.',
      it: 'Città unica costruita sull\'acqua con architettura e canali mozzafiato.',
      cs: 'Jedinečné město postavené na vodě s úžasnou architekturou a kanály.'
    },
    coordinates: [45.4408, 12.3155],
    propertyCount: 75
  },
  {
    _id: 'city-3',
    name: { en: 'Como', it: 'Como', cs: 'Como' },
    slug: { current: 'como' },
    region: { 
      name: { en: 'Lombardy', it: 'Lombardia', cs: 'Lombardie' },
      country: 'Italy'
    },
    description: { 
      en: 'Beautiful lakeside city in northern Italy, popular for luxury properties.',
      it: 'Bellissima città lacustre nel nord Italia, popolare per proprietà di lusso.',
      cs: 'Krásné město u jezera v severní Itálii, oblíbené pro luxusní nemovitosti.'
    },
    coordinates: [45.8081, 9.0852],
    propertyCount: 120
  }
];

export const SAMPLE_REGIONS = [
  {
    _id: 'region-1',
    name: { en: 'Tuscany', it: 'Toscana', cs: 'Toskánsko' },
    slug: { current: 'tuscany' },
    country: 'Italy',
    description: { 
      en: 'Rolling hills, vineyards, and Renaissance cities in central Italy.',
      it: 'Colline ondulate, vigneti e città rinascimentali nell\'Italia centrale.',
      cs: 'Zvlněné kopce, vinice a renesanční města ve střední Itálii.'
    },
    coordinates: [43.4643, 11.2558],
    propertyCount: 300
  },
  {
    _id: 'region-2',
    name: { en: 'Lombardy', it: 'Lombardia', cs: 'Lombardie' },
    slug: { current: 'lombardy' },
    country: 'Italy',
    description: { 
      en: 'Northern region with lakes, Alps, and Milan as economic center.',
      it: 'Regione settentrionale con laghi, Alpi e Milano come centro economico.',
      cs: 'Severní region s jezery, Alpami a Milánem jako ekonomickým centrem.'
    },
    coordinates: [45.4773, 9.1815],
    propertyCount: 250
  }
];

export default {
  SAMPLE_PROPERTIES,
  SAMPLE_CITIES,
  SAMPLE_REGIONS
};

param(
  [Parameter(Mandatory = $true)]
  [string]$TemplatePath,

  [Parameter(Mandatory = $true)]
  [string[]]$InputDirs,

  [string]$OutputBaseName = "prova-codex-ppt-expanded-v1",

  [ValidateSet("it", "cs")]
  [string]$Language = "it"
)

$ErrorActionPreference = "Stop"

if ($InputDirs.Count -eq 1 -and $InputDirs[0] -match ',') {
  $InputDirs = $InputDirs[0].Split(',') | ForEach-Object { $_.Trim() } | Where-Object { $_ }
}

$overridesPath = Join-Path $PSScriptRoot "presentation-cs-overrides.json"
$script:PresentationCsOverrides = $null
if (Test-Path $overridesPath) {
  $script:PresentationCsOverrides = Get-Content $overridesPath -Raw -Encoding UTF8 | ConvertFrom-Json
}

function Get-PresentationOverride {
  param(
    [string]$ListingId
  )

  if ($null -eq $script:PresentationCsOverrides) {
    return $null
  }

  $property = $script:PresentationCsOverrides.PSObject.Properties[$ListingId]
  if ($null -eq $property) {
    return $null
  }

  return $property.Value
}

function Repair-Text {
  param(
    [AllowNull()]
    [string]$Text
  )

  if ([string]::IsNullOrWhiteSpace($Text)) {
    return $Text
  }

  try {
    return [System.Text.Encoding]::UTF8.GetString([System.Text.Encoding]::GetEncoding(1252).GetBytes($Text))
  } catch {
    return $Text
  }
}

function Resolve-AssetPath {
  param(
    [string]$BaseDir,
    [string]$RelativePath
  )

  return [System.IO.Path]::GetFullPath((Join-Path $BaseDir ($RelativePath -replace '/', '\')))
}

function Get-ImagePlan {
  param(
    $Listing,
    [string]$BaseDir,
    $Metadata
  )

  $exportedImages = @($Metadata.exportedImages | ForEach-Object {
    [PSCustomObject]@{
      FileName = $_.fileName
      Caption = $_.caption
      Path = Resolve-AssetPath -BaseDir $BaseDir -RelativePath $_.relativePath
    }
  })

  $heroFileName = $Metadata.heroImage.fileName
  $galleryFileNames = @($Metadata.galleryImages | ForEach-Object { $_.fileName })

  switch ([string]$Listing.id) {
    "127126561" {
      $galleryFileNames = @(
        "02-photo-2.jpg",
        "01-photo-1.jpg",
        "03-photo-3.jpg",
        "04-photo-4.jpg",
        "01-photo-1.jpg",
        "02-photo-2.jpg"
      )
    }
    "123879781" {
      $galleryFileNames = @(
        "04-photo-4.jpg",
        "02-photo-2.jpg",
        "08-photo-8.jpg",
        "03-photo-3.jpg",
        "07-photo-7.jpg",
        "09-photo-9.jpg"
      )
    }
    "123046823" {
      $heroFileName = "01-terrazzo.jpg"
      $galleryFileNames = @(
        "02-camera-da-letto.jpg",
        "03-bagno.jpg",
        "04-cucina.jpg",
        "05-salone.jpg",
        "06-terrazzo.jpg",
        "07-scala.jpg"
      )
    }
    "124317681" {
      $heroFileName = "03-terrazzo.jpg"
      $galleryFileNames = @(
        "04-monolocale.jpg",
        "02-bagno.jpg",
        "05-terrazzo.jpg",
        "06-bagno.jpg",
        "04-monolocale.jpg",
        "03-terrazzo.jpg"
      )
    }
    "126421707" {
      $heroFileName = "01-facciata.jpg"
      $galleryFileNames = @(
        "02-camera-da-letto.jpg",
        "03-bagno.jpg",
        "04-cucina.jpg",
        "05-salone.jpg",
        "06-camera-da-letto.jpg",
        "07-salone.jpg"
      )
    }
  }

  $override = Get-PresentationOverride -ListingId ([string]$Listing.id)
  if ($null -ne $override) {
    if (-not [string]::IsNullOrWhiteSpace([string]$override.heroFileName)) {
      $heroFileName = [string]$override.heroFileName
    }

    $overrideGallery = @($override.galleryFileNames | ForEach-Object { [string]$_ } | Where-Object { $_ })
    if ($overrideGallery.Count -gt 0) {
      $galleryFileNames = $overrideGallery
    }
  }

  $heroImage = ($exportedImages | Where-Object { $_.FileName -eq $heroFileName } | Select-Object -First 1).Path
  if (-not $heroImage) {
    $heroImage = Resolve-AssetPath -BaseDir $BaseDir -RelativePath $Metadata.heroImage.relativePath
  }

  $galleryImages = @()
  foreach ($fileName in $galleryFileNames) {
    $match = ($exportedImages | Where-Object { $_.FileName -eq $fileName } | Select-Object -First 1)
    if ($match) {
      $galleryImages += $match.Path
    }
  }

  if ($galleryImages.Count -eq 0) {
    $galleryImages = @($Metadata.galleryImages | ForEach-Object { Resolve-AssetPath -BaseDir $BaseDir -RelativePath $_.relativePath })
  }

  return [PSCustomObject]@{
    HeroImage = $heroImage
    GalleryImages = $galleryImages
  }
}

function Get-Metadata {
  param(
    [string]$InputDir
  )

  $baseDir = (Resolve-Path $InputDir).Path
  $metadata = Get-Content (Join-Path $baseDir "metadata.json") -Raw -Encoding UTF8 | ConvertFrom-Json
  $imagePlan = Get-ImagePlan -Listing $metadata.listing -BaseDir $baseDir -Metadata $metadata
  return [PSCustomObject]@{
    BaseDir = $baseDir
    Listing = $metadata.listing
    HeroImage = $imagePlan.HeroImage
    GalleryImages = $imagePlan.GalleryImages
    Description = @($metadata.descriptionParagraphs | ForEach-Object { Repair-Text $_ }) -join "`r`n`r`n"
  }
}

function Get-CompactTitle {
  param(
    $Listing,
    [string]$LanguageCode = "it"
  )

  $id = [string]$Listing.id
  $override = Get-PresentationOverride -ListingId $id
  if ($LanguageCode -eq "cs" -and $null -ne $override -and -not [string]::IsNullOrWhiteSpace([string]$override.compactTitleCs)) {
    return [string]$override.compactTitleCs
  }

  $manualTitles = if ($LanguageCode -eq "cs") {
    @{
      "121923402" = "Vila Savona"
      "116370033" = "Vila Alassio"
      "124217555" = "Byt ve vile Albenga"
      "123649691" = "Vila Diano Marina"
      "123965841" = "Vila Stella"
      "126143841" = "Vila Finale Ligure"
      "113613691" = "Řadový dům Varazze"
      "107564383" = "Dům Bergeggi"
      "126251655" = "Dvojvila Massa"
      "126969403" = "Dvojvila Camaiore"
      "124378365" = "Dům Massa"
      "125204335" = "Vila Calice"
      "126046931" = "Dvojvila Ameglia"
      "122281168" = "Vila Lerici"
      "126673555" = "Dům Riomaggiore"
      "108590681" = "Vila Leivi"
      "125866699" = "Vila La Spezia"
      "127126561" = "Studio Lignano"
      "123879781" = "Dům Aquileia"
      "123046823" = "Byt Monfalcone"
      "124317681" = "Studio Grado"
      "126421707" = "Byt Grado Pineta"
    }
  } else {
    @{
      "121923402" = "Villa Savona"
      "124217555" = "App. in villa Albenga"
      "123649691" = "Villa Diano Marina"
      "123965841" = "Villa Stella"
    }
  }

  if ($manualTitles.ContainsKey($id)) {
    return $manualTitles[$id]
  }

  $typology = (Repair-Text $Listing.typology).ToLowerInvariant()
  $city = Repair-Text $Listing.location.city

  if ($LanguageCode -eq "cs") {
    if ($typology -match 'appartamento' -and $typology -match 'villa') {
      return "Byt ve vile $city"
    }
    if ($typology -match 'appartamento') {
      return "Byt $city"
    }
    if ($typology -match 'villa') {
      return "Vila $city"
    }
    if ($typology -match 'terratetto') {
      return "Dům $city"
    }
  } else {
    if ($typology -match 'appartamento' -and $typology -match 'villa') {
      return "App. in villa $city"
    }
    if ($typology -match 'appartamento') {
      return "Appartamento $city"
    }
    if ($typology -match 'villa') {
      return "Villa $city"
    }
  }

  $firstWord = ((Repair-Text $Listing.typology) -split '\s+')[0]
  if ([string]::IsNullOrWhiteSpace($firstWord)) {
    return $city
  }
  return "$firstWord $city"
}

function Get-LocalizedDescription {
  param(
    $Listing,
    [string]$FallbackText,
    [string]$LanguageCode = "it"
  )

  if ($LanguageCode -ne "cs") {
    return $FallbackText
  }

  $id = [string]$Listing.id
  $override = Get-PresentationOverride -ListingId $id
  if ($null -ne $override -and -not [string]::IsNullOrWhiteSpace([string]$override.descriptionCs)) {
    return [string]$override.descriptionCs
  }

  switch ($id) {
    "121923402" { return @"
Samostatný dům se soukromou zahradou kolem domu má pěší i vjezdový přístup z veřejné ulice. Jde o samostatnou, udržovanou stavbu jen 150 metrů od pobřežní promenády, v čtvrti se sportovišti, veřejnými parky, cyklostezkou, veřejným parkováním, obchody a supermarkety pro každodenní potřeby. Nemovitost je pohodlně dostupná městskou dopravou, pěšky z vlakové zastávky Quiliano Vado i z dálničního sjezdu.

Dům je rozložen do dvou nadzemních podlaží, má podzemní sklep a podkrovní mansardu s balkonem. Součástí je obytná terasa s výhledem na moře, víceúčelová vedlejší místnost a prostorná veranda.

V přízemí je velký otevřený obývací prostor s krbem, velká obytná kuchyně propojená s hlavním prostorem obloukovým průchodem, koupelna a veranda přímo orientovaná do soukromé oplocené zahrady. Do prvního patra vede působivé schodiště s obkladem z černého mramoru; zde jsou dvě velké ložnice s výhledem na moře, terasa, chodba a hlavní koupelna s hydromasáží. V podkroví, přístupném pohodlným dřevěným schodištěm, je další terasa a prostor využitelný podle potřeby. V suterénu se nachází prostorný sklep rozdělený do dvou propojených místností.
"@ }
    "116370033" { return @"
Alassio s nádherným otevřeným výhledem na moře: velmi charakteristické samostatné bydlení s panoramatickou terasou. V krásné kopcovité části Moglio, ponořené do klidu a zeleně a s výbornou sluneční orientací, má nemovitost plochu 100 m² a navíc velkou dlážděnou zahradu s výsuvnou markýzou, výborně využitelnou pro venkovní život.

Na první úrovni, v úrovni zahrady, vstup vede do příjemného obývacího pokoje, následuje obytná zděná kuchyně, menší pokoj a první koupelna. V horním podlaží jsou dvě ložnice, druhá koupelna a velká obytná terasa.

Podkrovní část je velmi dobře využitelná jako kancelář, pracovna, herna pro děti nebo další relaxační zóna. Odtud je přístup na ještě jednu velkou slunnou terasu s panoramatickým výhledem na moře a zelené svahy. Dům je ve výborném stavu, s prvky ve stylu shabby a s mnoha detaily, které vytvářejí teplou a útulnou atmosféru. Za zmínku stojí například stropy s přiznanými dřevěnými trámy v bílo-modrých tónech, na které navazují i dveře ve stejném ladění. K nemovitosti náleží soukromé parkovací místo.
"@ }
    "124217555" { return @"
V prestižní části Salea, jen několik kilometrů od moře, se nachází přízemní část samostatné vily, volná ze čtyř stran a obklopená zelení.

Dům se vyznačuje výbornou orientací a světlými interiéry a je ve velmi dobrém vnitřním stavu, připravený k okamžitému bydlení. Vstup je zcela samostatný a neplatí se žádné společné poplatky.

Bytová část se rozkládá na jednom podlaží a tvoří ji vstup do velkého obývacího pokoje, obytná kuchyně, tři ložnice, dvě koupelny, z nichž jedna je součástí hlavní ložnice, a praktická komora. Denní část navazuje na elegantní kryté podloubí, které lemuje dvě strany domu a je ideální pro relaxaci a posezení venku. Venku se rozprostírá velká soukromá zahrada doplněná olivovým hájem. Nemovitost dále doplňuje prostorný sklep a vlastní garáž.
"@ }
    "123649691" { return @"
V Diano Marina nabízíme k prodeji vilku novější výstavby, jen asi 2 km od moře. Je v dobrém udržovaném stavu, obklopená zelení, ale zároveň pohodlně dostupná z centra a od všech služeb.

Obytná část v prvním podlaží se skládá ze vstupního prostoru, jedné dvoulůžkové ložnice, obývacího pokoje s kuchyňským koutem, koupelny s oknem a schodiště vedoucího do spodního podlaží, kde je velký sklad využitelný jako tavernetta a druhá koupelna. Ze suterénu je pohodlný vstup do zahrady.

V horním podlaží je malé podkroví s terasou. Okolní pozemek má přibližně 2 500 m². Díky výborné sluneční orientaci je tato nemovitost vhodná jak pro trvalé bydlení, tak jako druhý dům využitelný po celý rok.
"@ }
    "123965841" { return @"
Ve Stella San Bernardo, ve Via Donatelli, nabízíme k prodeji tuto velmi žádanou nemovitost. Jde o samostatnou vilu se slunným a otevřeným výhledem do kopců.

Stavba je novější nebo nedávno postavená a má energetickou třídu C. Významným benefitem je přítomnost studny s pramenitou vodou.

Nemovitost má tři ložnice a dvě koupelny. K domu náleží pozemek o rozloze 6 550 m², který je využitelný pro pěstování a částečně i pro výstavbu s indexem 0,03 m³ na metr čtvereční.
"@ }
    "126143841" { return @"
Jen pár kroků od srdce Finalborga, jednoho z nejpůvabnějších městeček Ligurie, a zároveň velmi blízko ke všem službám, nabízíme krásný typický ligurský dům ponořený do zeleně.

Obytná část se rozkládá na dvou úrovních a je obklopena velkým zcela oploceným pozemkem rozděleným do tří samostatných teras, ideálních pro venkovní život, zeleninovou zahradu, relaxační zóny nebo pro ty, kdo hledají soukromí a nezávislost. V suterénu se nachází sklad nebo garáž o ploše přibližně 100 m², postavený celý ze železobetonu, mimořádně všestranný prostor vhodný jako garáž, sklad, dílna nebo hobby zóna.

Přízemí domu tvoří světlý open space s obývacím pokojem a kuchyní, praktická komora, dvoulůžková ložnice a koupelna s oknem, vanou i sprchou. V horním patře je druhá dvoulůžková ložnice, podkrovní místnost sloužící jako sklad, malá servisní koupelna a další pokoj ideální jako pracovna, kancelář nebo třetí ložnice. Ložnice i pracovna mají přístup na velkou panoramatickou terasu s krásným otevřeným výhledem na Rocca di Perti. Dům je vybaven systémem GPL pro teplou vodu, plyn i vytápění; v přízemí je podlahové topení a kamna na pelety, v patře radiátory a tepelné čerpadlo v ložnici.
"@ }
    "113613691" { return @"
Varazze, lokalita Pero: těžko dostupná řadová vilka se zahradou sjízdnou autem, trojgaráží, terasami a pozemkem. Jde o mimořádně zajímavý dům v klidné a zelené části, ideální pro ty, kdo hledají oázu klidu bez vzdání se blízkosti moře, vzdáleného asi 4 km.

V přízemí se nachází prostorná denní část s kuchyní a obývacím pokojem, doplněná krbem, a dále moderní a funkční koupelna. V prvním patře je noční část se dvěma ložnicemi, pracovnou ideální pro práci z domova a druhou koupelnou. Nechybí ani šatna.

Kamenná fasáda dodává domu eleganci a tradiční charakter, zatímco okna z PVC zajišťují dobrou energetickou účinnost. Vytápění na pelety zajišťuje i ohřev teplé vody. Rovinatá zahrada je ideální pro odpočinek nebo venkovní aktivity. K dispozici jsou také terasy a balkony s výhledem do okolí. Trojgaráž s elektrickými vraty poskytuje místo pro tři auta i další úložný prostor a vstupní elektrická brána umožňuje pohodlný a bezpečný vjezd.
"@ }
    "107564383" { return @"
Bergeggi, velmi žádaná lokalita: nabízíme polosamostatné řešení se soukromou zahradou, nulovými provozními poplatky a pohodlným dosahem veřejných služeb.

Na pozemek se vstupuje brankou, odkud je přístup do soukromé zahrady; její část je krytá přístřeškem, ideálním pro venkovní stolování a klidné užívání letních dnů. Nemovitost je rozložena do dvou podlaží: v přízemí je velká místnost využívaná jako obývací pokoj s otevřenou kuchyní a první koupelna.

V horním podlaží je malá servisní koupelna a dvě manželské ložnice. Dům má strategickou polohu, je slunný prakticky po celý den a nabízí i pohodlné parkování v okolí.
"@ }
    "126251655" { return @"
Ronchi - Poveromo. Přibližně 800 metrů od moře, v klidné a rezidenční oblasti, se nachází část dvojvily po nedávné rekonstrukci, celá rozložená v přízemí, se soukromou zahradou ze tří stran, na níž stojí i dřevěný zahradní domek využívaný jako sklad.

Interiér tvoří velký obývací pokoj s otevřenou kuchyní, chodba, hlavní ložnice, dvoulůžkový pokoj a koupelna s možností vybudovat druhé sociální zařízení.

Před domem je kryté podloubí, ideální pro venkovní stolování. K dispozici je velká parkovací plocha s možností zaparkovat tři auta. Dům má nezávislé vytápění i klimatizaci.
"@ }
    "126969403" { return @"
Camaiore: vilka kompletně zrekonstruovaná v roce 2010, jen pár kroků od historického centra a vybavená veškerým komfortem. Nemovitost má soukromé parkování s automatickou bránou pro dvě auta plus místo pro motorky a kola, předzahrádku a příjemné kryté posezení se zónou relaxu a grilem.

Dům má dvojí vstup: jeden vjezdový ze strany zahrady a jeden pěší z hlavní ulice. Uvnitř se nachází velký obývací prostor rozdělený na living a jídelní část. Praktická předsíň s vestavěnou skříní slouží koupelně s oknem a sprchou. Obytná kuchyně je mimořádně světlá díky velkým posuvným PVC oknům směrem do zahrady a má přímý vstup do portika. Výrazným designovým prvkem je oboustranný krb, který propojuje kuchyni a obývací pokoj.

Po schodišti se vstupuje i do sklepa tvořeného jedním velkým prostorem se solárním světlovodem. V horním patře s kvalitní dřevěnou podlahou je hlavní ložnice s vlastní koupelnou se sprchou, další pokoj, menší pokoj a balkon využívaný jako prádelna. Kromě klasického topení s kotlem a radiátory je připravena i rozvodná síť pro termo-krb a navíc byl instalován fotovoltaický systém s akumulací.
"@ }
    "124378365" { return @"
Bondano: v blízkosti centra a hlavních služeb nabízíme polosamostatný dům na dvou podlažích o pěti místnostech, kompletně zrekonstruovaný, se dvěma koupelnami, soukromou zahradou a dvěma parkovacími místy uvnitř pozemku.

Do domu se vstupuje jak vjezdem, tak pěšky přímo do zahrady obklopující dům ze tří stran. Přes portiko se vstupuje do velkého obývacího pokoje s funkčním krbem. Denní část doplňuje obytná kuchyně, která má rovněž přímý výstup na portiko.

Přes chodbu se vstupuje do noční části se dvěma manželskými ložnicemi, oběma s vlastním balkonem přes francouzské dveře. První koupelna v přízemí má okno a sprchový kout. Po mramorovém schodišti se vystoupá do horního patra, kde je třetí manželská ložnice s balkonem a otevřeným výhledem a druhá koupelna s oknem a sprchovým koutem. Vytápění je autonomní, bez kondominiálních poplatků, a nemovitost doplňuje prostorná zahrada, kryté stání pro dvě auta a skladovací místnost.
"@ }
    "125204335" { return @"
Jedinečná příležitost v Ligurii: vila s bazénem a dechberoucím výhledem. Pokud hledáte dům snů, Villa Beltrami, kompletně zrekonstruovaná v roce 2023, představuje mimořádně zajímavou možnost. Jde o prostornou prestižní vilu se soukromým bazénem v jedné z nejkrásnějších částí Ligurie, s panoramaty na záliv La Spezia, údolí řeky Magra i pobřežní silnici Toskánska.

Nemovitost je po kompletní rekonstrukci: má okna s dvojitým zasklením, podlahové vytápění v koupelně, nový kotel, nový centrální topný systém, napojení na kanalizaci, soukromé přípojky plynu a vody a novou elektroinstalaci. Výhodou je také již zavedená činnost, vhodná pro B&B nebo další příjem. Nemovitost obklopují více než 2 hektary soukromého pozemku se zahradou ve dvou úrovních, bazénem a otevřeným výhledem do údolí.

Hlavní charakteristiky: obývací pokoj s krbem a kamny na dřevo, plně vybavená open-space kuchyně, čtyři ložnice s restaurovaným starožitným nábytkem, tři nové koupelny, velké kryté terasy a další venkovní kuchyně. Dále je zde soukromé parkování pro tři auta s automatickou branou, ovocné stromy, ořešáky a vinná réva.
"@ }
    "126046931" { return @"
V horní části Ameglie, nedaleko pláží Marinella a Fiumaretta, nabízíme polosamostatnou vilu se zahradou a velkými terasami. Vila má nezávislý přístup přes velkou zahradu s venkovní jídelní zónou a parkovací plochou.

Nemovitost se rozvíjí na třech úrovních. Ve vstupním podlaží v přízemí se nachází obývací pokoj s jídelní částí, malá kuchyně, manželská ložnice a koupelna. Po velkém schodišti se vstupuje do prvního patra, kde je velký salon s krbem a výstupem na terasu s otevřeným výhledem do údolí řeky Magry a na Apuánské Alpy, dále obytná kuchyně se spíží, dvě manželské ložnice, obě s balkonem, a koupelna s oknem.

Z obývacího pokoje je přístup i do posledního podlaží, kde je velké podkroví a výstup na rozsáhlou střešní terasu. Nemovitost doplňuje velký polosuterén se zónou prádelny. Z domu se během několika minut pěšky dostanete do historického centra Ameglie i autem k Bocca di Magra, plážím a všem službám.
"@ }
    "122281168" { return @"
Nabízíme k prodeji samostatnou vilu v klidné a soukromé části Canarbino, ponořenou do zeleně a ideální pro ty, kdo hledají soukromí, pohodlí a působivé přírodní prostředí.

Pěší vstup vede do rovné zahrady, která předchází vstupu do domu. Uvnitř se nachází útulný obývací pokoj a dále chodba vedoucí do noční části se dvěma prostornými a světlými manželskými ložnicemi.

Po vnitřním schodišti se schází do přízemí, kde je velká obytná kuchyně, srdce domu, s přímým výhledem do uzavřené verandy s posuvnými skly, ideální pro užívání v každém ročním období a s krásným otevřeným výhledem do vnitrozemí. Odtud je také přístup na terasu vhodnou pro venkovní stolování a odpočinek. Na tomto podlaží je i koupelna s oknem, podlahovou sanitou a sprchovým koutem z křišťálového skla. Nemovitost obklopuje soukromý pozemek, nechybí dvě sklepení a druhý vjezd na pozemek.
"@ }
    "126673555" { return @"
Nabízíme k prodeji samostatný dům o rozloze přibližně 80 m² ve Via Aldo Rollandi v Manarole, v obci Riomaggiore. Nemovitost pochází z 19. století, je kompletně zrekonstruovaná, ve velmi dobrém stavu a rozložená do dvou podlaží propojených vnitřním schodištěm, se samostatným vstupem zajišťujícím soukromí a nezávislost.

V první úrovni se nachází prostorná manželská ložnice s vlastní koupelnou se sprchou. Po vnitřním schodišti se vystupuje do druhého podlaží, kde je denní část s útulným obývacím pokojem a otevřenou kuchyní a druhá koupelna se sprchou.

Dům se prodává zařízený a je vybaven autonomním teplovzdušným vytápěním s tepelným čerpadlem a klimatizací teplo/chlad pro komfort po celý rok. Díky centrální poloze v Manarole, jedné z nejkouzelnějších obcí Cinque Terre, je nemovitost ideální jako turistická investice i jako exkluzivní druhé bydlení.
"@ }
    "108590681" { return @"
Snili jste někdy o životě v domě s nádherným výhledem na Carasco a celé údolí? Tato samostatná vila by mohla být přesně to, co hledáte. Nachází se na velmi slunném místě, takže je osvětlena sluncem prakticky po celý den.

Jde o dům o ploše přibližně 300 m² rozložený do tří podlaží, s mnoha prostory vhodnými pro velkou rodinu nebo i pro provoz B&B či rekreačního domu. V přízemí je kuchyně, obývací pokoj, koupelna a terasa ideální pro venkovní stolování nebo prosté užívání výhledu. V prvním patře jsou tři ložnice a další koupelna, zatímco ve druhém patře je jedna ložnice s vlastní koupelnou a panoramatická terasa o rozloze 100 m².

V polosuterénu je velká tavernetta s koupelnou, ideální pro společné chvíle nebo relax. K nemovitosti dále náleží zahrada o velikosti asi 1 500 m² s malou vedlejší stavbou. K dispozici jsou dvě pronajatá parkovací místa za 200 eur měsíčně. Poloha je strategická: asi 1,5 km od Carasca a 5 km od Chiavari, tedy blízko služeb, ale zároveň s dostatkem klidu a soukromí.
"@ }
    "125866699" { return @"
Pegazzano: samostatná vilka s přístupem po krátkém schodišti, obklopená zahradními terasami o celkové rozloze přibližně 1 000 m². Dům je rozdělen do dvou úrovní.

V přízemí se vstupuje do velké denní části s otevřenou kuchyní, dále je zde manželská ložnice s vlastní koupelnou, velký sklep, krytý světlík a prádelna. V prvním patře je další manželská ložnice, jedna větší jednolůžková ložnice a koupelna s oknem a vanou.

Na obou úrovních jsou dlážděné terasy a kolem domu soukromá zahrada. Okna jsou z bílého PVC s dvojitými skly a sítěmi proti hmyzu, podlahy jsou z gresu. Nemovitost doplňuje velká garáž v úrovni ulice a otevřený výhled směrem k městu.
"@ }
    "127126561" { return @"
Kompletně zrekonstruované studio v Lignano Pineta, jen pár minut od moře a v klidné rezidenční části, je vhodné jako rekreační byt i jako investice k pronájmu.

Byt tvoří dobře uspořádaný otevřený prostor s teplou dřevěnou podlahou, která dodává interiéru příjemný charakter. Obytná část zahrnuje vybavený kuchyňský kout s lineární kuchyní, varnou deskou, troubou a lednicí, doplněný praktickými úložnými policemi.

Dispozice umožňuje využít každý metr: rozkládací pohovka, vyvýšené lůžko a jídelní stůl dělají prostor všestranným a pohodlným i pro více osob. Koupelna s oknem je vybavena sprchovým koutem, sanitou a elektrickým bojlerem. Jde o kompaktní, ale dobře řešené bydlení připravené k okamžitému užívání.
"@ }
    "123879781" { return @"
V klidné a dobře dostupné části Aquileie nabízíme dům přistavěný z obou stran se zahradou, praktickou dispozicí a všestranně využitelnými venkovními prostory.

Vstup vede do prostorného a světlého obývacího pokoje, vhodného pro každodenní život i odpočinek. Dále navazuje obytná kuchyně a koupelna s oknem a sprchovým koutem. V prvním patře se nachází velká manželská ložnice. Ze stávající místnosti nyní nelze snadno vytvořit druhý pokoj, ale už je připraven projekt na vybudování další ložnice, takže lze noční část rozšířit podle potřeby.

Z kuchyně se vychází do soukromého dvora, který je velkou předností nemovitosti; nachází se zde dřevník, druhá venkovní koupelna a několik skladů využitelných jako depozit nebo dílna. Dům je ihned obyvatelný, i když některé úpravy by pomohly plně využít jeho potenciál. Kotel byl vyměněn nedávno a střecha byla revidována přibližně před deseti lety.
"@ }
    "123046823" { return @"
Byt na prodej v Monfalcone, ve Via G. Caboto, se nachází v prvním patře a má plochu přibližně 70 m2. Hlavním prvkem je útulná denní zóna open space s kuchyní a obývacím pokojem, které navazují přímo na velkou obytnou terasu ideální pro venkovní stolování a relax.

Noční část tvoří světlá ložnice se vstupem na druhou, více soukromou terasu a koupelna se sprchovým koutem. Nemovitost má autonomní vytápění a bezpečnostní vstupní dveře, které zajišťují komfort i bezpečí.

Jde o vhodné řešení pro jednotlivce nebo pár, kteří hledají moderní a funkční byt s dobře využitými venkovními prostory; zajímavý je i jako investice díky snadnému pronájmu. Byt je v současnosti pronajatý, se zbývající dobou nájmu ještě 2 roky a výnosem 550 eur měsíčně.
"@ }
    "124317681" { return @"
Grado Città Giardino: jednopokojový byt ve 2. patře bez výtahu, tvořený vstupem, kuchyňským koutem, víceúčelovou místností, koupelnou se sprchou a terasou. Cena činí 109.000 eur a je předmětem jednání.
"@ }
    "126421707" { return @"
Byt určený k rekonstrukci se nachází ve třetím patře domu s výtahem od úrovně terénu, v kondominiu vzdáleném asi 200 metrů od pláže v Grado Pineta.

Dispozice zahrnuje vstup s vestavěnou skříní, obývací pokoj s kuchyňským koutem, jednu manželskou ložnici, druhý menší pokoj, koupelnu bez okna se sprchou a terasu o ploše 3 m2 orientovanou na východ, přístupnou z obývacího pokoje i z hlavní ložnice.

Je zde možnost parkování v kondominiální zahradě. Dům má společnou klimatizaci a přípravu na centrální vytápění, které momentálně není v provozu. Nemovitost je volná ihned.
"@ }
    default { return $FallbackText }
  }
}

function Get-MapsUrl {
  param(
    $Listing
  )

  $parts = @(
    (Repair-Text $Listing.location.address),
    (Repair-Text $Listing.location.city),
    (Repair-Text $Listing.location.province),
    (Repair-Text $Listing.location.region),
    "Italy"
  ) | Where-Object { $_ }

  $query = [System.Uri]::EscapeDataString(($parts -join ", "))
  return "https://www.google.com/maps/search/?api=1&query=$query"
}

function Get-SurfaceText {
  param($Listing)

  $matches = [regex]::Matches([string]$Listing.surface, '\d+')
  if ($matches.Count -eq 0) { return "n/a" }
  return ($matches[0].Value + " m2")
}

function Get-FitDescription {
  param(
    [string]$Text
  )

  $clean = $Text `
    -replace '(?im)^.*(tel\.|telefono|per informazioni|per info|info@).*$','' `
    -replace '\s{2,}', ' ' `
    -replace "(\r?\n){3,}", "`r`n`r`n"

  $clean = $clean.Trim()
  if ($clean.Length -le 1500) {
    return $clean
  }

  $sentences = [regex]::Split($clean, '(?<=[\.\!\?])\s+')
  $buffer = New-Object System.Collections.Generic.List[string]
  $length = 0
  foreach ($sentence in $sentences) {
    $candidate = $sentence.Trim()
    if ([string]::IsNullOrWhiteSpace($candidate)) { continue }
    if (($length + $candidate.Length + 1) -gt 1450) { break }
    $buffer.Add($candidate)
    $length += $candidate.Length + 1
  }

  if ($buffer.Count -gt 0) {
    return ($buffer -join ' ').Trim()
  }

  return $clean.Substring(0, [Math]::Min(1450, $clean.Length)).Trim() + "..."
}

function Replace-PictureShape {
  param(
    $Slide,
    [string]$ShapeName,
    [string]$ImagePath
  )

  $shape = $null
  try {
    $shape = $Slide.Shapes.Item($ShapeName)
  } catch {
    $shape = @($Slide.Shapes | Where-Object { $_.Type -eq 13 } | Sort-Object { $_.Width * $_.Height } -Descending | Select-Object -First 1)[0]
  }

  if ($null -eq $shape) {
    throw "Unable to find picture shape on slide."
  }

  $left = $shape.Left
  $top = $shape.Top
  $width = $shape.Width
  $height = $shape.Height
  $z = $shape.ZOrderPosition
  $shape.Delete()
  $newShape = $Slide.Shapes.AddPicture($ImagePath, $false, $true, $left, $top, $width, $height)
  while ($newShape.ZOrderPosition -lt $z) {
    $newShape.ZOrder(0)
  }
}

function Add-CoverFadeSoft {
  param(
    $Slide
  )

  foreach ($shape in @($Slide.Shapes)) {
    if ($shape.Name -like 'CoverFade*') {
      $shape.Delete()
    }
  }

  $left = 198.6
  $top = 0
  $height = 540
  $bands = @(
    @{ Width = 34; Transparency = 0.12 },
    @{ Width = 28; Transparency = 0.28 },
    @{ Width = 22; Transparency = 0.44 },
    @{ Width = 16; Transparency = 0.60 },
    @{ Width = 10; Transparency = 0.76 }
  )

  $offset = 0
  $index = 1
  foreach ($band in $bands) {
    $shape = $Slide.Shapes.AddShape(1, $left + $offset, $top, $band.Width, $height)
    $shape.Name = "CoverFade$index"
    $shape.Fill.ForeColor.RGB = 16777215
    $shape.Fill.Transparency = $band.Transparency
    $shape.Line.Visible = 0
    while ($shape.ZOrderPosition -gt 3) {
      $shape.ZOrder(3)
    }
    $offset += $band.Width
    $index += 1
  }
}

function Reset-DetailPictures {
  param(
    $Slide,
    [string[]]$ImagePaths
  )

  foreach ($shape in @($Slide.Shapes)) {
    if ($shape.Type -eq 13) {
      $shape.Delete()
    }
  }

  $slots = @(
    @{ Left = 0; Top = 0; Width = 292.9; Height = 173.9 },
    @{ Left = 300.1; Top = 0; Width = 292.9; Height = 178.5 },
    @{ Left = 0; Top = 176.5; Width = 292.9; Height = 177.2 },
    @{ Left = 300.1; Top = 182.4; Width = 292.9; Height = 175.2 },
    @{ Left = 0; Top = 357.6; Width = 292.9; Height = 181.7 },
    @{ Left = 300.1; Top = 364.1; Width = 292.9; Height = 176.5 }
  )

  if ($ImagePaths.Count -eq 0) {
    return
  }

  for ($i = 0; $i -lt $slots.Count; $i++) {
    $slot = $slots[$i]
    $imagePath = $ImagePaths[$i % $ImagePaths.Count]
    $null = $Slide.Shapes.AddPicture($imagePath, $false, $true, $slot.Left, $slot.Top, $slot.Width, $slot.Height)
  }
}

function Set-PropertySlides {
  param(
    $CoverSlide,
    $DetailSlide,
    $Dataset,
    [int]$CurrentNumber,
    [string]$LanguageCode
  )

  $listing = $Dataset.Listing
  $compactTitle = Get-CompactTitle -Listing $listing -LanguageCode $LanguageCode
  $coverTitle = "$CurrentNumber. $compactTitle"
  $CoverSlide.Shapes.Item("Title 1").TextFrame.TextRange.Text = $coverTitle
  $titleRange = $CoverSlide.Shapes.Item("Title 1").TextFrame.TextRange
  $titleRange.Font.Size = if ($coverTitle.Length -gt 20) { 22 } else { 24 }

  $statsShape = $CoverSlide.Shapes.Item("Content Placeholder 2")
  $statsShape.TextFrame.TextRange.Text = @(
    (Get-SurfaceText $listing),
    "",
    (Repair-Text ([string]$listing.rooms)),
    "",
    (Repair-Text ([string]$listing.bedrooms)),
    "",
    (Repair-Text ([string]$listing.bathrooms)),
    "",
    $(if ($LanguageCode -eq "cs") { "mapa" } else { "maps" }),
    "",
    "",
    (" {0:N0} €" -f [double]$listing.price).Replace(",", ".")
  ) -join "`r"
  $statsShape.Left = 150
  $statsShape.Width = 145
  $statsRange = $statsShape.TextFrame.TextRange
  $statsRange.Font.Size = 18
  $statsShape.TextFrame.MarginLeft = 0
  $statsShape.TextFrame.MarginRight = 0
  $statsShape.TextFrame.MarginTop = 0
  $statsShape.TextFrame.MarginBottom = 0
  $mapsLabel = if ($LanguageCode -eq "cs") { "mapa" } else { "maps" }
  $mapsUrl = Get-MapsUrl -Listing $listing
  foreach ($paragraphIndex in 1..$statsRange.Paragraphs().Count) {
    $paragraph = $statsRange.Paragraphs($paragraphIndex)
    $paragraph.ParagraphFormat.SpaceAfter = 0
    $paragraph.ParagraphFormat.Alignment = 1
    $paragraph.ParagraphFormat.Bullet.Visible = 0
  }

  $textValue = $statsRange.Text
  $mapsOffset = $textValue.IndexOf($mapsLabel)
  if ($mapsOffset -ge 0) {
    $mapsRange = $statsShape.TextFrame.TextRange.Characters($mapsOffset + 1, $mapsLabel.Length)
    $mapsRange.ActionSettings(1).Hyperlink.Address = $mapsUrl
  }

  Replace-PictureShape -Slide $CoverSlide -ShapeName "Picture 2" -ImagePath $Dataset.HeroImage
  Add-CoverFadeSoft -Slide $CoverSlide

  $detailBody = Get-LocalizedDescription -Listing $listing -FallbackText $Dataset.Description -LanguageCode $LanguageCode
  $detailText = "$CurrentNumber. " + (Get-FitDescription -Text $detailBody)
  $detailShape = $DetailSlide.Shapes.Item("Rectangle 3")
  $detailShape.TextFrame.TextRange.Text = $detailText
  $detailLength = $detailText.Length
  $detailShape.TextFrame.TextRange.Font.Size = if ($detailLength -le 450) { 16 } elseif ($detailLength -le 700) { 14 } elseif ($detailLength -le 1000) { 12 } elseif ($detailLength -le 1300) { 11 } else { 10 }
  $detailShape.TextFrame.TextRange.ParagraphFormat.SpaceAfter = 6
  $detailShape.TextFrame.VerticalAnchor = 1
  $detailShape.TextFrame.AutoSize = 0
  $detailShape.TextFrame.MarginLeft = 4
  $detailShape.TextFrame.MarginRight = 4
  $detailShape.TextFrame.MarginTop = 2
  $detailShape.TextFrame.MarginBottom = 2

  Reset-DetailPictures -Slide $DetailSlide -ImagePaths $Dataset.GalleryImages
}

$template = (Resolve-Path $TemplatePath).Path
$outputDir = Join-Path (Resolve-Path ".\tmp\property-presentations").Path "compiled"
New-Item -ItemType Directory -Force -Path $outputDir | Out-Null
$pptxPath = Join-Path $outputDir ($OutputBaseName + ".pptx")
$pdfPath = Join-Path $outputDir ($OutputBaseName + ".pdf")

if (Test-Path $pptxPath) { Remove-Item $pptxPath -Force }
if (Test-Path $pdfPath) { Remove-Item $pdfPath -Force }

Copy-Item $template $pptxPath -Force

$datasets = @($InputDirs | ForEach-Object { Get-Metadata -InputDir $_ })

$powerPoint = $null
$presentation = $null

try {
  $powerPoint = New-Object -ComObject PowerPoint.Application
  $powerPoint.Visible = -1
  $presentation = $powerPoint.Presentations.Open($pptxPath, $false, $false, $false)

  while ($presentation.Slides.Count -gt 2) {
    $presentation.Slides.Item($presentation.Slides.Count).Delete()
  }

  $masterCoverIndex = 1
  $masterDetailIndex = 2
  $slidePairs = @(
    [PSCustomObject]@{
      Cover = $presentation.Slides.Item($masterCoverIndex)
      Detail = $presentation.Slides.Item($masterDetailIndex)
    }
  )

  for ($i = 1; $i -lt $datasets.Count; $i++) {
    $presentation.Slides.Item($masterCoverIndex).Copy()
    $coverSlide = $presentation.Slides.Paste($presentation.Slides.Count + 1).Item(1)
    $presentation.Slides.Item($masterDetailIndex).Copy()
    $detailSlide = $presentation.Slides.Paste($presentation.Slides.Count + 1).Item(1)

    $slidePairs += [PSCustomObject]@{
      Cover = $coverSlide
      Detail = $detailSlide
    }
  }

  for ($i = 0; $i -lt $datasets.Count; $i++) {
    Set-PropertySlides -CoverSlide $slidePairs[$i].Cover -DetailSlide $slidePairs[$i].Detail -Dataset $datasets[$i] -CurrentNumber ($i + 1) -LanguageCode $Language
  }

  $presentation.Save()
  $presentation.SaveAs($pdfPath, 32)
  $presentation.Close()
  $powerPoint.Quit()

  Write-Output "PPTX: $pptxPath"
  Write-Output "PDF: $pdfPath"
} catch {
  if ($presentation -ne $null) { $presentation.Close() }
  if ($powerPoint -ne $null) { $powerPoint.Quit() }
  throw
}




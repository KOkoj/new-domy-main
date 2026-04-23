param(
  [Parameter(Mandatory = $true)]
  [string]$InputPresentationPath,

  [Parameter(Mandatory = $true)]
  [string]$OutputPresentationPath
)

$ErrorActionPreference = "Stop"

function Get-LongestTextShape {
  param(
    $Slide
  )

  $bestShape = $null
  $bestLength = -1

  foreach ($shape in $Slide.Shapes) {
    try {
      if (-not $shape.HasTextFrame) { continue }
      if (-not $shape.TextFrame.HasText) { continue }
      $rawText = $shape.TextFrame.TextRange.Text
      if ($null -eq $rawText) { $rawText = "" }
      $text = $rawText.Trim()
      if ([string]::IsNullOrWhiteSpace($text)) { continue }
      if ($text.Length -gt $bestLength) {
        $bestLength = $text.Length
        $bestShape = $shape
      }
    } catch {
    }
  }

  return $bestShape
}

function Set-DescriptionText {
  param(
    $Shape,
    [string]$Description
  )

  $currentText = $Shape.TextFrame.TextRange.Text
  if ($null -eq $currentText) { $currentText = "" }
  $currentText = $currentText.Trim()
  $numberMatch = [regex]::Match($currentText, '^\s*(\d+\.?)\s*')

  if ($numberMatch.Success) {
    $fullText = $numberMatch.Groups[1].Value.Trim() + "`r" + $Description
    $Shape.TextFrame.TextRange.Text = $fullText

    $textRange = $Shape.TextFrame.TextRange
    $numberLength = $numberMatch.Groups[1].Value.Trim().Length
    $descriptionStart = $numberLength + 2
    $descriptionLength = $Description.Length

    try {
      $textRange.Font.Bold = 0
      $textRange.Font.Size = 16

      $numberRange = $textRange.Characters(1, $numberLength)
      $numberRange.Font.Bold = -1
      $numberRange.Font.Size = 20

      $descriptionRange = $textRange.Characters($descriptionStart, $descriptionLength)
      $descriptionRange.Font.Bold = 0
      $descriptionRange.Font.Size = 16

      $textRange.ParagraphFormat.SpaceBefore = 0
      $textRange.ParagraphFormat.SpaceAfter = 0
      $textRange.ParagraphFormat.SpaceWithin = 1.05
    } catch {
    }

    return
  }

  $Shape.TextFrame.TextRange.Text = $Description
}

$descriptions = [ordered]@{
  2 = "Stary venkovsky dum se tremi mistnostmi, terasou a pozemkem v Contrada Barbagianni v Ostuni. Tvori jej vstup do prostorne chodby s pristupem na balkon, obyvak, kuchyne a dva pokoje. Nemovitost se nachazi v prvnim patre, ma soukromou terasu a pozemek o rozloze 4 860 m2. Vyzaduje rekonstrukci; stropy jsou hvezdicove a v kuchyni je pec."
  4 = "Ve Strada Vecchia Ceglie v Martina Franca se prodava polosamostatna vila s dvoukuzelovym trullem a pozemkem o rozloze priblizne 3 697 m2, ponorena do zelene Valle d'Itria. Nemovitost vyzaduje kompletni rekonstrukci a rozviji se na dvou urovnich, dnes resenych jako dve nezavisle bytove jednotky. V hornim patre je denni cast, loznice, koupelna a svetly pokoj s balkonem a panoramatickym vyhledem; ve spodnim patre je dalsi obytny prostor s loznici, koupelnou a garazi. Soucasti jsou i dva male sklady, z nichz jeden ma pec na drevo, a dvoukuzelovy trullo rozdeleny do vice mistnosti."
  6 = "V klidne krajine Valle d'Itria, ve Strada Rampone u Via Locorotondo a mezi dvema obcemi, se prodava charakteristicka nemovitost s malou vilou o 54 m2, komplexem trikuzelovych trullu o 62 m2 a pozemkem o rozloze 7 700 m2. Pristup vede aleji na pohodlne prostranstvi; veranda predchazi vstupu do vily. Uvnitr je svetla denni zona s kuchynskym koutem, mala koupelna a dve loznice s okny. Vedle vily stoji trulli s malou denni zonou a jidelnou, dalsi mistnosti vhodnou pro loznici s koupelnou a malym skladem s krbem."
  8 = "Samostatny dum ve Via Sant'Aurelia ma vice urovni a vlastni malou zahradku. Po uprave muze fungovat jako dvoupodlazni byt nebo jako jeden dum pro jednu rodinu. V prvnim patre je obyvak, loznice, koupelna a mistnost s krbem urcena pro kuchynsky kout; v dalsim patre je vstupni mistnost s druhym krbem a maly pokoj. V poslednim podlazi je treti loznice s vystupem na terasu s vyhledem na vevodsky hrad a kostely Chiesa Matrice a San Gioacchino."
  10 = "V historickem centru Putignana, jen par kroku od Via Margherita di Savoia, se prodava puvabny dum se dvema nezavislymi vstupy, vhodny pro soukrome bydleni i investici. V prizemi je obytna zona s kuchynskym koutem, loznice a koupelna. Vnejsim schodistem se vstupuje do druhe casti, ktera se rozviji ve trech urovnich: na prvni je pokoj s koupelnou, na druhe dalsi pokoj s praktickym podkrovim. Klenute stropy a kamenne podlahy chianche umoznuji vytvorit i dve samostatne jednotky."
  12 = "V historickem centru Castellana Grotte se prodava radovy dum na trech urovnich, ktery spojuje kamen a prirozene svetlo. V prizemi je obyvaci cast s kamennymi detaily, rozdelena prirodnim kamennym obloukem s valenou klenbou; v klidnejsim koute je prvni koupelna s oknem. V prvnim patre je hlavni loznice s typickym balkonkem a vlastni koupelnou. V poslednim patre je dalsi mistnost, kterou lze vyuzit jako loznici, pracovnu nebo relaxacni zonu, s vystupem na soukromou panoramatickou terasu."
  14 = "V panoramaticke poloze u Putignana se prodava krasny venkovsky dum na dvou urovnich o celkove plose priblizne 75 m2. Soukroma prijezdova cesta vede na venkovni prostranstvi se dvema cisternami; svetla veranda nabizi otevreny vyhled na okolni kopce. Uvnitr je obyvak s krbem, kuchyne s kuchynskym koutem a dve loznice. V prizemi se nachazi garaz a sklad; pozemek o rozloze asi 6 000 m2 je osazen olivovniky a ovocnymi stromy."
  16 = "V Contrada Parco Grande u Carovigna se prodava k dokonceni venkovsky dum o plose priblizne 88 m2 na jednom podlazi. Tvori jej vstup, velka kuchyne, koupelna, dve loznice a prostorne patio; na terasu se vstupuje pohodlnym zdenym schodistem. Soukroma zahrada a pozemek o rozloze asi 6 500 m2 jsou ohraniceny suchymi kamennymi zdmi a rostou na nich olivovniky, hrusne, reva, oresaky, jablone, kdoule, granatovniky, moruse a kapary. Nemovitost ma dve velke cisterny a po obnove se hodi jako soukrome bydleni nebo ubytovaci zarizeni."
}

$resolvedInput = (Resolve-Path $InputPresentationPath).Path
$resolvedOutputDir = Split-Path -Path $OutputPresentationPath -Parent

if (-not (Test-Path $resolvedOutputDir)) {
  New-Item -ItemType Directory -Path $resolvedOutputDir -Force | Out-Null
}

Copy-Item -LiteralPath $resolvedInput -Destination $OutputPresentationPath -Force

$powerPoint = $null
$presentation = $null

try {
  $powerPoint = New-Object -ComObject PowerPoint.Application
  $powerPoint.Visible = -1
  $presentation = $powerPoint.Presentations.Open($OutputPresentationPath, $false, $false, $false)

  foreach ($entry in $descriptions.GetEnumerator()) {
    $slide = $presentation.Slides.Item([int]$entry.Key)
    $shape = Get-LongestTextShape -Slide $slide
    if ($null -eq $shape) {
      throw "No text shape found on slide $($entry.Key)."
    }

    Set-DescriptionText -Shape $shape -Description $entry.Value
    Write-Output ("Updated slide {0}" -f $entry.Key)
  }

  $presentation.Save()
  $presentation.Close()
  $powerPoint.Quit()
} catch {
  if ($presentation -ne $null) { $presentation.Close() }
  if ($powerPoint -ne $null) { $powerPoint.Quit() }
  throw
}

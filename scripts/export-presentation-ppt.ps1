param(
  [Parameter(Mandatory = $true)]
  [string]$InputDir,

  [string]$OutputBaseName = "presentation-v3"
)

$ErrorActionPreference = "Stop"

function Resolve-AssetPath {
  param(
    [string]$BaseDir,
    [string]$RelativePath
  )

  return [System.IO.Path]::GetFullPath((Join-Path $BaseDir ($RelativePath -replace '/', '\')))
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

function Add-TextBoxShape {
  param(
    $Slide,
    [string]$Text,
    [single]$Left,
    [single]$Top,
    [single]$Width,
    [single]$Height,
    [single]$FontSize,
    [bool]$Bold = $false
  )

  $shape = $Slide.Shapes.AddTextbox(1, $Left, $Top, $Width, $Height)
  $shape.TextFrame.TextRange.Text = $Text
  $shape.TextFrame.TextRange.Font.Name = "Aptos"
  $shape.TextFrame.TextRange.Font.Size = $FontSize
  $shape.TextFrame.TextRange.Font.Bold = [int]$Bold
  $shape.TextFrame.TextRange.Font.Color.RGB = 1971210
  $shape.TextFrame.MarginLeft = 0
  $shape.TextFrame.MarginRight = 0
  $shape.TextFrame.MarginTop = 0
  $shape.TextFrame.MarginBottom = 0
  return $shape
}

function Add-IconRow {
  param(
    $Slide,
    [string]$IconPath,
    [string]$Text,
    [single]$Top
  )

  $iconLeft = 36
  $iconSize = 38
  $textLeft = 88
  $textWidth = 238

  try {
    $icon = $Slide.Shapes.AddPicture($IconPath, $false, $true, $iconLeft, $Top, $iconSize, $iconSize)
    $null = $icon
  } catch {
    $fallback = Add-TextBoxShape -Slide $Slide -Text "•" -Left $iconLeft -Top ($Top - 2) -Width $iconSize -Height $iconSize -FontSize 22 -Bold $true
    $fallback.TextFrame.TextRange.ParagraphFormat.Alignment = 2
  }

  $textbox = Add-TextBoxShape -Slide $Slide -Text $Text -Left $textLeft -Top ($Top + 2) -Width $textWidth -Height 34 -FontSize 18
  $textbox.TextFrame.VerticalAnchor = 3
}

function Add-FadeOverlay {
  param(
    $Slide,
    [single]$Left,
    [single]$Top,
    [single]$Height
  )

  $bands = @(
    @{ Width = 34; Transparency = 0.10 },
    @{ Width = 28; Transparency = 0.28 },
    @{ Width = 22; Transparency = 0.45 },
    @{ Width = 16; Transparency = 0.62 },
    @{ Width = 10; Transparency = 0.78 }
  )

  $offset = 0
  foreach ($band in $bands) {
    $shape = $Slide.Shapes.AddShape(1, $Left + $offset, $Top, $band.Width, $Height)
    $shape.Fill.ForeColor.RGB = 16777215
    $shape.Fill.Transparency = $band.Transparency
    $shape.Line.Visible = 0
    $offset += $band.Width
  }
}

function Add-ImageBox {
  param(
    $Slide,
    [string]$ImagePath,
    [single]$Left,
    [single]$Top,
    [single]$Width,
    [single]$Height
  )

  $image = $Slide.Shapes.AddPicture($ImagePath, $false, $true, $Left, $Top, $Width, $Height)
  $image.Line.Visible = 0
  return $image
}

$baseDir = (Resolve-Path $InputDir).Path
$metadataPath = Join-Path $baseDir "metadata.json"
$metadata = Get-Content $metadataPath -Raw -Encoding UTF8 | ConvertFrom-Json
$listing = $metadata.listing

$heroImagePath = Resolve-AssetPath -BaseDir $baseDir -RelativePath $metadata.heroImage.relativePath
$galleryImagePaths = @($metadata.galleryImages | ForEach-Object { Resolve-AssetPath -BaseDir $baseDir -RelativePath $_.relativePath })

$iconsDir = Join-Path $PSScriptRoot "presentation-icons"
$pptxPath = Join-Path $baseDir ($OutputBaseName + ".pptx")
$pdfPath = Join-Path $baseDir ($OutputBaseName + ".pdf")

$paragraphs = @($metadata.descriptionParagraphs | ForEach-Object { Repair-Text $_ })
$descriptionText = ($paragraphs -join "`r`n`r`n")
$locationLabel = @(
  Repair-Text $listing.location.city,
  Repair-Text $listing.location.province,
  Repair-Text $listing.location.region
) | Where-Object { $_ } | ForEach-Object { $_.ToString() }
$locationText = $locationLabel -join ", "

if (Test-Path $pptxPath) { Remove-Item $pptxPath -Force }
if (Test-Path $pdfPath) { Remove-Item $pdfPath -Force }

$powerPoint = $null
$presentation = $null

try {
  $powerPoint = New-Object -ComObject PowerPoint.Application
  $powerPoint.Visible = -1

  $presentation = $powerPoint.Presentations.Add()
  $presentation.PageSetup.SlideWidth = 841.89
  $presentation.PageSetup.SlideHeight = 595.28

  $slide1 = $presentation.Slides.Add(1, 12)
  $slide1.FollowMasterBackground = 0
  $slide1.Background.Fill.ForeColor.RGB = 16316664

  $coverLeftPanel = $slide1.Shapes.AddShape(1, 0, 0, 332, 595.28)
  $coverLeftPanel.Fill.ForeColor.RGB = 16250357
  $coverLeftPanel.Line.Visible = 0

  $titleBox = Add-TextBoxShape -Slide $slide1 -Text (Repair-Text $listing.title) -Left 34 -Top 28 -Width 286 -Height 94 -FontSize 24 -Bold $true
  $titleBox.TextFrame.WordWrap = -1

  Add-IconRow -Slide $slide1 -IconPath (Join-Path $iconsDir "surface.svg") -Text (Repair-Text $listing.surface) -Top 136
  Add-IconRow -Slide $slide1 -IconPath (Join-Path $iconsDir "rooms.svg") -Text ("{0} locali" -f (Repair-Text $listing.rooms)) -Top 193
  Add-IconRow -Slide $slide1 -IconPath (Join-Path $iconsDir "bedrooms.svg") -Text ("{0} camere" -f (Repair-Text $listing.bedrooms)) -Top 250
  Add-IconRow -Slide $slide1 -IconPath (Join-Path $iconsDir "bathrooms.svg") -Text ("{0} bagni" -f (Repair-Text $listing.bathrooms)) -Top 307
  Add-IconRow -Slide $slide1 -IconPath (Join-Path $iconsDir "location.svg") -Text $locationText -Top 382
  Add-IconRow -Slide $slide1 -IconPath (Join-Path $iconsDir "price.svg") -Text ("€ {0:N0}" -f [double]$listing.price).Replace(",", ".") -Top 459

  $detailText = @(Repair-Text $listing.typology, Repair-Text $listing.condition, Repair-Text $listing.pricePerSquareMeter, Repair-Text $listing.heating) | Where-Object { $_ } | ForEach-Object { $_.ToString() }
  if ($detailText.Count -gt 0) {
    $detailBox = Add-TextBoxShape -Slide $slide1 -Text ($detailText -join "   •   ") -Left 34 -Top 542 -Width 286 -Height 24 -FontSize 9
    $detailBox.TextFrame.TextRange.Font.Color.RGB = 7368816
  }

  Add-ImageBox -Slide $slide1 -ImagePath $heroImagePath -Left 292 -Top 0 -Width 549.89 -Height 595.28 | Out-Null
  Add-FadeOverlay -Slide $slide1 -Left 292 -Top 0 -Height 595.28

  $slide2 = $presentation.Slides.Add(2, 12)
  $slide2.FollowMasterBackground = 0
  $slide2.Background.Fill.ForeColor.RGB = 16644347

  $galleryBg = $slide2.Shapes.AddShape(1, 20, 20, 272, 555)
  $galleryBg.Fill.ForeColor.RGB = 15724527
  $galleryBg.Line.Visible = 0

  $imageWidth = 113.39
  $imageHeight = 141.73
  $xPositions = @(34, 155)
  $yPositions = @(34, 183, 332)

  $index = 0
  foreach ($y in $yPositions) {
    foreach ($x in $xPositions) {
      if ($index -ge $galleryImagePaths.Count) { break }
      Add-ImageBox -Slide $slide2 -ImagePath $galleryImagePaths[$index] -Left $x -Top $y -Width $imageWidth -Height $imageHeight | Out-Null
      $index += 1
    }
  }

  $descTitle = Add-TextBoxShape -Slide $slide2 -Text (Repair-Text $listing.title) -Left 320 -Top 36 -Width 485 -Height 34 -FontSize 18 -Bold $true
  $descTitle.TextFrame.WordWrap = -1

  $descBox = Add-TextBoxShape -Slide $slide2 -Text $descriptionText -Left 320 -Top 86 -Width 485 -Height 430 -FontSize 13
  $descBox.TextFrame.WordWrap = -1
  $descBox.TextFrame.TextRange.ParagraphFormat.SpaceAfter = 8

  $footerBox = Add-TextBoxShape -Slide $slide2 -Text (Repair-Text $listing.sourceUrl) -Left 320 -Top 540 -Width 485 -Height 20 -FontSize 8
  $footerBox.TextFrame.TextRange.Font.Color.RGB = 8421504

  $presentation.SaveAs($pptxPath, 24)
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

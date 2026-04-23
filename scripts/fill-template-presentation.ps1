param(
  [Parameter(Mandatory = $true)]
  [string]$TemplatePath,

  [Parameter(Mandatory = $true)]
  [string]$InputDir,

  [string]$OutputBaseName = "presentation-template"
)

$ErrorActionPreference = "Stop"

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

function Set-ShapeText {
  param(
    $Shape,
    [string]$Text
  )

  if (-not $Shape.HasTextFrame) { return }
  $Shape.TextFrame.TextRange.Text = $Text
}

$template = (Resolve-Path $TemplatePath).Path
$baseDir = (Resolve-Path $InputDir).Path
$metadata = Get-Content (Join-Path $baseDir "metadata.json") -Raw -Encoding UTF8 | ConvertFrom-Json
$listing = $metadata.listing

$title = Repair-Text $listing.title
$surface = Repair-Text $listing.surface
$rooms = Repair-Text $listing.rooms
$bedrooms = Repair-Text $listing.bedrooms
$bathrooms = Repair-Text $listing.bathrooms
$location = @(
  Repair-Text $listing.location.city,
  Repair-Text $listing.location.province,
  Repair-Text $listing.location.region
) | Where-Object { $_ }
$locationText = $location -join " / "
$priceText = ("€ {0:N0}" -f [double]$listing.price).Replace(",", ".")
$description = @($metadata.descriptionParagraphs | ForEach-Object { Repair-Text $_ }) -join "`r`n`r`n"

$heroImage = Resolve-AssetPath -BaseDir $baseDir -RelativePath $metadata.heroImage.relativePath
$galleryImages = @($metadata.galleryImages | ForEach-Object { Resolve-AssetPath -BaseDir $baseDir -RelativePath $_.relativePath })

$pptxPath = Join-Path $baseDir ($OutputBaseName + ".pptx")
$pdfPath = Join-Path $baseDir ($OutputBaseName + ".pdf")

if (Test-Path $pptxPath) { Remove-Item $pptxPath -Force }
if (Test-Path $pdfPath) { Remove-Item $pdfPath -Force }

Copy-Item $template $pptxPath -Force

$powerPoint = $null
$presentation = $null

try {
  $powerPoint = New-Object -ComObject PowerPoint.Application
  $powerPoint.Visible = -1
  $presentation = $powerPoint.Presentations.Open($pptxPath, $false, $false, $false)

  while ($presentation.Slides.Count -gt 2) {
    $presentation.Slides.Item($presentation.Slides.Count).Delete()
  }

  $slide1 = $presentation.Slides.Item(1)
  $slide2 = $presentation.Slides.Item(2)

  $slide1.Shapes.Item("Title 1").TextFrame.TextRange.Text = "1. " + $title
  $slide1.Shapes.Item("Content Placeholder 2").TextFrame.TextRange.Text = @(
    $surface
    $rooms
    $bedrooms
    $bathrooms
    $locationText
    $priceText
  ) -join "`r"

  $coverPicture = $slide1.Shapes.Item("Picture 2")
  $coverPicture.Fill.UserPicture($heroImage)

  $textShape = $slide2.Shapes.Item("Rectangle 3")
  Set-ShapeText -Shape $textShape -Text ("1.`r" + $description)

  $pictureNames = @("Picture 4", "Picture 6", "Picture 8", "Picture 10", "Picture 12", "Picture 2")
  for ($i = 0; $i -lt [Math]::Min($pictureNames.Count, $galleryImages.Count); $i++) {
    $shape = $slide2.Shapes.Item($pictureNames[$i])
    $shape.Fill.UserPicture($galleryImages[$i])
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

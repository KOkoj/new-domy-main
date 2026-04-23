param(
  [Parameter(Mandatory = $true)]
  [string]$PresentationPath
)

$ErrorActionPreference = "Stop"

function Test-ShapeHasSixPictures {
  param(
    $Slide
  )

  $pictureCount = 0
  foreach ($shape in $Slide.Shapes) {
    try {
      if ($shape.Type -eq 13) {
        $pictureCount++
      }
    } catch {
    }
  }

  return $pictureCount -ge 6
}

function Get-DescriptionTextParts {
  param(
    [string]$Text
  )

  if ([string]::IsNullOrWhiteSpace($Text)) {
    return $null
  }

  $normalized = $Text -replace "\r\n?", "`r"
  $match = [regex]::Match($normalized, '^\s*(\d+\.)\s*(.*)$', [System.Text.RegularExpressions.RegexOptions]::Singleline)
  if (-not $match.Success) {
    return $null
  }

  $numberText = $match.Groups[1].Value.Trim()
  $descriptionText = $match.Groups[2].Value.Trim()

  if ([string]::IsNullOrWhiteSpace($descriptionText)) {
    return $null
  }

  return [PSCustomObject]@{
    Number = $numberText
    Description = $descriptionText
  }
}

function Set-FormattedDescription {
  param(
    $Shape,
    [string]$NumberText,
    [string]$DescriptionText
  )

  $fullText = $NumberText + "`r" + $DescriptionText
  $Shape.TextFrame.TextRange.Text = $fullText

  $textRange = $Shape.TextFrame.TextRange
  $numberLength = $NumberText.Length
  $descriptionStart = $numberLength + 2
  $descriptionLength = $DescriptionText.Length

  $textRange.Font.Bold = 0
  $textRange.Font.Size = 16

  $numberRange = $textRange.Characters(1, $numberLength)
  $numberRange.Font.Bold = -1
  $numberRange.Font.Size = 20

  $descriptionRange = $textRange.Characters($descriptionStart, $descriptionLength)
  $descriptionRange.Font.Bold = 0
  $descriptionRange.Font.Size = 16

  try {
    $textRange.ParagraphFormat.SpaceBefore = 0
    $textRange.ParagraphFormat.SpaceAfter = 0
    $textRange.ParagraphFormat.SpaceWithin = 1.05
  } catch {
  }

  if ($textRange.BoundHeight -gt ($Shape.Height - $Shape.TextFrame.MarginTop - $Shape.TextFrame.MarginBottom)) {
    $descriptionRange.Font.Size = 14
  }
}

$resolvedPresentationPath = (Resolve-Path $PresentationPath).Path
$powerPoint = $null
$presentation = $null

try {
  $powerPoint = New-Object -ComObject PowerPoint.Application
  $powerPoint.Visible = -1
  $presentation = $powerPoint.Presentations.Open($resolvedPresentationPath, $false, $false, $false)

  foreach ($slide in $presentation.Slides) {
    if (-not (Test-ShapeHasSixPictures -Slide $slide)) {
      continue
    }

    $shape = $null
    try {
      $shape = $slide.Shapes.Item("Rectangle 3")
    } catch {
      continue
    }

    if (-not $shape.HasTextFrame) {
      continue
    }

    $currentText = $shape.TextFrame.TextRange.Text
    $parts = Get-DescriptionTextParts -Text $currentText
    if ($null -eq $parts) {
      continue
    }

    Set-FormattedDescription -Shape $shape -NumberText $parts.Number -DescriptionText $parts.Description
    Write-Output ("Updated slide {0}" -f $slide.SlideIndex)
  }

  $presentation.Save()
  $presentation.Close()
  $powerPoint.Quit()
} catch {
  if ($presentation -ne $null) { $presentation.Close() }
  if ($powerPoint -ne $null) { $powerPoint.Quit() }
  throw
}

param(
  [Parameter(Mandatory = $true)]
  [string]$PptxPath
)

$ErrorActionPreference = "Stop"

Add-Type -AssemblyName System.IO.Compression.FileSystem

function Get-ZipEntryText {
  param(
    [Parameter(Mandatory = $true)]$Zip,
    [Parameter(Mandatory = $true)][string]$EntryPath
  )

  $entry = $Zip.GetEntry($EntryPath)
  if (-not $entry) {
    return $null
  }

  $reader = [System.IO.StreamReader]::new($entry.Open())
  try {
    return $reader.ReadToEnd()
  }
  finally {
    $reader.Dispose()
  }
}

$zip = [System.IO.Compression.ZipFile]::OpenRead($PptxPath)

try {
  $slideEntries =
    $zip.Entries |
    Where-Object { $_.FullName -like 'ppt\slides\slide*.xml' -and $_.FullName -notlike '*.rels' } |
    Sort-Object { [int](($_.Name -replace '\D', '')) }

  $slides = @()

  foreach ($entry in $slideEntries) {
    $xmlText = Get-ZipEntryText -Zip $zip -EntryPath $entry.FullName
    if (-not $xmlText) {
      continue
    }

    [xml]$xml = $xmlText
    $ns = New-Object System.Xml.XmlNamespaceManager($xml.NameTable)
    $ns.AddNamespace("p", "http://schemas.openxmlformats.org/presentationml/2006/main")
    $ns.AddNamespace("a", "http://schemas.openxmlformats.org/drawingml/2006/main")

    $shapeNodes = $xml.SelectNodes("//p:sp", $ns)
    $picNodes = $xml.SelectNodes("//p:pic", $ns)
    $texts = @()
    $shapes = @()

    foreach ($shape in $shapeNodes) {
      $name = $shape.nvSpPr.cNvPr.name
      $id = $shape.nvSpPr.cNvPr.id
      $textNodes = $shape.SelectNodes(".//a:t", $ns)
      $text = (($textNodes | ForEach-Object { $_.'#text' }) -join " ").Trim()
      if ($text) {
        $texts += $text
      }

      $xfrm = $shape.spPr.xfrm
      $shapes += [pscustomobject]@{
        id = $id
        name = $name
        text = $text
        x = $xfrm.off.x
        y = $xfrm.off.y
        cx = $xfrm.ext.cx
        cy = $xfrm.ext.cy
      }
    }

    $pics = foreach ($pic in $picNodes) {
      $xfrm = $pic.spPr.xfrm
      [pscustomobject]@{
        id = $pic.nvPicPr.cNvPr.id
        name = $pic.nvPicPr.cNvPr.name
        embed = $pic.blipFill.blip.embed
        x = $xfrm.off.x
        y = $xfrm.off.y
        cx = $xfrm.ext.cx
        cy = $xfrm.ext.cy
      }
    }

    $slides += [pscustomobject]@{
      slide = $entry.Name
      texts = $texts
      shapes = $shapes
      pictures = @($pics)
    }
  }

  $slides | ConvertTo-Json -Depth 8
}
finally {
  $zip.Dispose()
}

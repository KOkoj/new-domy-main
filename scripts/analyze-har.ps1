param(
  [Parameter(Mandatory = $true)]
  [string]$HarPath
)

$ErrorActionPreference = "Stop"

$har = Get-Content -Path $HarPath -Raw | ConvertFrom-Json

$entries = @($har.log.entries)

$requests = foreach ($entry in $entries) {
  [pscustomobject]@{
    startedDateTime = $entry.startedDateTime
    method = $entry.request.method
    url = $entry.request.url
    status = $entry.response.status
    mimeType = $entry.response.content.mimeType
    size = $entry.response.content.size
  }
}

$requests | ConvertTo-Json -Depth 5

param(
  [string] $BackendRepoPath = "..\DEMO",
  [string] $ApiBaseUrl,
  [string] $FrontendOrigin,
  [switch] $PlanBackend,
  [switch] $ApplyBackend
)

$ErrorActionPreference = "Stop"

function Resolve-RepoPath([string] $Path) {
  $resolved = Resolve-Path -LiteralPath $Path
  return $resolved.ProviderPath
}

function Require-Tofu {
  $command = Get-Command tofu -ErrorAction SilentlyContinue
  if (-not $command) {
    throw "OpenTofu CLI 'tofu' is required unless both -ApiBaseUrl and -FrontendOrigin are provided."
  }
}

function Get-TofuOutput([string] $WorkingDirectory, [string] $Name) {
  Push-Location $WorkingDirectory
  try {
    $value = (& tofu output -raw $Name 2>$null)
    if ($LASTEXITCODE -ne 0) {
      return $null
    }

    return ($value | Out-String).Trim()
  }
  finally {
    Pop-Location
  }
}

function Assert-Origin([string] $Value, [string] $Name) {
  if (-not $Value) {
    throw "$Name is empty."
  }

  if ($Value.EndsWith("/")) {
    throw "$Name must not end with '/': $Value"
  }

  if ($Value -notmatch "^https?://[^/]+$") {
    throw "$Name must be an origin without path, for example https://service-abc-ue.a.run.app"
  }
}

$frontendRepo = Resolve-RepoPath "."
$backendRepo = Resolve-RepoPath $BackendRepoPath
$frontendTofu = Join-Path $frontendRepo "infra\opentofu"
$backendTofu = Join-Path $backendRepo "infra\opentofu"

if (-not (Test-Path -LiteralPath $frontendTofu)) {
  throw "Frontend OpenTofu directory not found: $frontendTofu"
}

if (-not (Test-Path -LiteralPath $backendTofu)) {
  throw "Backend OpenTofu directory not found: $backendTofu"
}

if (-not $ApiBaseUrl) {
  Require-Tofu
  $ApiBaseUrl = Get-TofuOutput $backendTofu "cloud_run_service_url"
}

if (-not $ApiBaseUrl) {
  throw "Could not read backend cloud_run_service_url. Run backend tofu apply first or pass -ApiBaseUrl."
}

Assert-Origin $ApiBaseUrl "ApiBaseUrl"

$frontendApiTfvars = Join-Path $frontendTofu "api.auto.tfvars"
$frontendEnv = Join-Path $frontendRepo ".env.local"

@"
api_base_url = "$ApiBaseUrl"
"@ | Set-Content -LiteralPath $frontendApiTfvars -Encoding ascii

@"
VITE_API_BASE_URL=$ApiBaseUrl
"@ | Set-Content -LiteralPath $frontendEnv -Encoding ascii

Write-Host "Wrote frontend API config:"
Write-Host "  $frontendApiTfvars"
Write-Host "  $frontendEnv"

if (-not $FrontendOrigin) {
  if (Get-Command tofu -ErrorAction SilentlyContinue) {
    $FrontendOrigin = Get-TofuOutput $frontendTofu "cloud_run_service_url"
  }
}

if (-not $FrontendOrigin) {
  Write-Host "Frontend Cloud Run URL is not available yet. Run frontend tofu apply and this script again, or pass -FrontendOrigin, to sync backend CORS."
  exit 0
}

Assert-Origin $FrontendOrigin "FrontendOrigin"

$backendFrontendTfvars = Join-Path $backendTofu "frontend.auto.tfvars"

@"
cloud_run_allow_unauthenticated = true
cors_allowed_origins = [
  "$FrontendOrigin",
]
"@ | Set-Content -LiteralPath $backendFrontendTfvars -Encoding ascii

Write-Host "Wrote backend CORS config:"
Write-Host "  $backendFrontendTfvars"

if ($PlanBackend -or $ApplyBackend) {
  Require-Tofu
  Push-Location $backendTofu
  try {
    if ($PlanBackend) {
      tofu plan
    }

    if ($ApplyBackend) {
      tofu apply
    }
  }
  finally {
    Pop-Location
  }
}

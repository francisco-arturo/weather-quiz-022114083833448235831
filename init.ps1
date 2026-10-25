# init.ps1 - Windows verification entrypoint for this prototype.
# Mirrors ./init.sh. Fails fast: any failing check exits non-zero.
# ASCII only: Windows PowerShell 5.1 reads BOM-less .ps1 files as ANSI.

$ErrorActionPreference = 'Stop'

function Invoke-Checked {
    param([string]$Label, [scriptblock]$Command)
    Write-Host "=== $Label ==="
    & $Command
    if ($LASTEXITCODE -ne 0) {
        throw "Check failed ($Label) with exit code $LASTEXITCODE"
    }
}

Write-Host '=== Harness Initialization ==='

Invoke-Checked -Label 'Checking app.mjs syntax' -Command { & node --check app.mjs }
Invoke-Checked -Label 'Checking quiz-core.mjs syntax' -Command { & node --check quiz-core.mjs }
Invoke-Checked -Label 'Checking dev-server.mjs syntax' -Command { & node --check dev-server.mjs }
Invoke-Checked -Label 'Validating content and required files' -Command { & node scripts/verify.mjs }
Invoke-Checked -Label 'Running unit tests' -Command { & node tests/quiz-core.test.mjs }

Write-Host '=== Verification Complete ==='
Write-Host ''
Write-Host 'Next steps:'
Write-Host '1. Read feature_list.json to see current feature state'
Write-Host '2. Run node dev-server.mjs and open the URL it prints (default http://127.0.0.1:4173)'
Write-Host '3. Walk the path in DEMO.md before handing over'

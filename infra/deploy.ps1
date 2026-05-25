# Azure Deployment Helper Script
# Usage: Run this script inside the /infra directory to initialize the Azure infrastructure.

$RESOURCE_GROUP = "financial-intelligence-rg"
$LOCATION = "eastus"

# 1. Ensure user is logged in
Write-Host "Checking Azure connection..." -ForegroundColor Cyan
$account = az account show --query name -o tsv 2>$null
if ($null -eq $account) {
    Write-Host "Not logged in. Opening browser to login to Azure..." -ForegroundColor Yellow
    az login
} else {
    Write-Host "Logged in to Azure account: $account" -ForegroundColor Green
}

# 2. Parse secrets from local .env files to pass to Bicep
Write-Host "Reading local secret files..." -ForegroundColor Cyan

# Read Auth service env
$authEnv = @{}
if (Test-Path "../auth-service/.env") {
    Get-Content "../auth-service/.env" | Where-Object { $_ -match '=' -and $_ -notmatch '^#' } | ForEach-Object {
        $key, $val = $_.Split('=', 2)
        $authEnv[$key.Trim()] = $val.Trim()
    }
}

# Read ML service env
$mlEnv = @{}
if (Test-Path "../ml-service/.env") {
    Get-Content "../ml-service/.env" | Where-Object { $_ -match '=' -and $_ -notmatch '^#' } | ForEach-Object {
        $key, $val = $_.Split('=', 2)
        $mlEnv[$key.Trim()] = $val.Trim()
    }
}

$mongoUri = $authEnv["MONGO_URI"]
$jwtSecret = $authEnv["JWT_SECRET"]
$emailUser = $authEnv["EMAIL_USER"]
$emailPass = $authEnv["EMAIL_PASS"]
$groqApiKey = $mlEnv["GROQ_API_KEY"]
$openaiApiKey = $mlEnv["OPENAI_API_KEY"]

if ([string]::IsNullOrEmpty($mongoUri) -or [string]::IsNullOrEmpty($jwtSecret)) {
    Write-Error "Could not read MONGO_URI or JWT_SECRET from auth-service/.env. Please verify the file exists."
    exit 1
}

# 3. Create Resource Group
Write-Host "Creating Resource Group '$RESOURCE_GROUP' in region '$LOCATION'..." -ForegroundColor Cyan
az group create --name $RESOURCE_GROUP --location $LOCATION

# 4. Deploy Bicep template
Write-Host "Deploying infrastructure to Azure (this will take 2-4 minutes)..." -ForegroundColor Cyan
$deployment = az deployment group create `
    --resource-group $RESOURCE_GROUP `
    --template-file main.bicep `
    --parameters mongoUri="$mongoUri" jwtSecret="$jwtSecret" emailUser="$emailUser" emailPass="$emailPass" groqApiKey="$groqApiKey" openaiApiKey="$openaiApiKey" `
    --query properties.outputs `
    -o json | ConvertFrom-Json

Write-Host "Deployment Completed Successfully!" -ForegroundColor Green
Write-Host "-------------------------------------------"
Write-Host "Azure Container Registry: $($deployment.registryLoginServer.value)"
Write-Host "Frontend URL:             https://$($deployment.frontendFqdn.value)"
Write-Host "Auth Service URL:         https://$($deployment.authFqdn.value)"
Write-Host "Expense Service URL:      https://$($deployment.expenseFqdn.value)"
Write-Host "ML Service URL:           https://$($deployment.mlFqdn.value)"
Write-Host "-------------------------------------------"
Write-Host "Please save these URLs. We will use them for the CI/CD pipeline setup next."

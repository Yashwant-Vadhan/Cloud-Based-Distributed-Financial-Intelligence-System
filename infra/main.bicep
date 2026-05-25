param location string = resourceGroup().location
param environmentName string = 'financial-intelligence-env'
param registryName string = 'finintelreg${uniqueString(resourceGroup().id)}'
param logAnalyticsWorkspaceName string = 'finintel-logs'

// Application secrets (to be passed securely at deployment time)
@secure()
param mongoUri string
@secure()
param jwtSecret string
@secure()
param emailUser string
@secure()
param emailPass string
@secure()
param groqApiKey string
@secure()
param openaiApiKey string

// 1. Log Analytics Workspace (for monitoring and logs)
resource logAnalytics 'Microsoft.OperationalInsights/workspaces@2022-10-01' = {
  name: logAnalyticsWorkspaceName
  location: location
  properties: {
    sku: {
      name: 'PerGB2018'
    }
    retentionInDays: 30
  }
}

// 2. Azure Container Registry (to host our custom Docker images)
resource registry 'Microsoft.ContainerRegistry/registries@2023-07-01' = {
  name: registryName
  location: location
  sku: {
    name: 'Basic'
  }
  properties: {
    adminUserEnabled: true
  }
}

// 3. Container Apps Environment
resource environment 'Microsoft.App/managedEnvironments@2023-05-01' = {
  name: environmentName
  location: location
  properties: {
    appLogsConfiguration: {
      destination: 'log-analytics'
      logAnalyticsConfiguration: {
        customerId: logAnalytics.properties.customerId
        sharedKey: logAnalytics.listKeys().primarySharedKey
      }
    }
  }
}

// 4. Auth Service Container App
resource authServiceApp 'Microsoft.App/containerApps@2023-05-01' = {
  name: 'auth-service'
  location: location
  properties: {
    managedEnvironmentId: environment.id
    configuration: {
      activeRevisionsMode: 'Single'
      registries: [
        {
          server: registry.properties.loginServer
          username: registry.listCredentials().username
          passwordSecretRef: 'acr-password'
        }
      ]
      ingress: {
        external: true
        targetPort: 5001
        allowInsecure: false
        corsPolicy: {
          allowedOrigins: [ '*' ]
          allowedMethods: [ 'GET', 'POST', 'PUT', 'DELETE', 'OPTIONS' ]
          allowedHeaders: [ '*' ]
        }
      }
      secrets: [
        {
          name: 'acr-password'
          value: registry.listCredentials().passwords[0].value
        }
        {
          name: 'mongo-uri'
          value: mongoUri
        }
        {
          name: 'jwt-secret'
          value: jwtSecret
        }
        {
          name: 'email-user'
          value: emailUser
        }
        {
          name: 'email-pass'
          value: emailPass
        }
      ]
    }
    template: {
      containers: [
        {
          name: 'auth-service'
          image: 'finintelregfvbuuw6fkzpl2.azurecr.io/auth-service:latest'
          resources: {
            cpu: json('0.25')
            memory: '0.5Gi'
          }
          env: [
            {
              name: 'PORT'
              value: '5001'
            }
            {
              name: 'MONGO_URI'
              secretRef: 'mongo-uri'
            }
            {
              name: 'JWT_SECRET'
              secretRef: 'jwt-secret'
            }
            {
              name: 'EMAIL_USER'
              secretRef: 'email-user'
            }
            {
              name: 'EMAIL_PASS'
              secretRef: 'email-pass'
            }
          ]
        }
      ]
    }
  }
}

// 5. ML Service Container App
resource mlServiceApp 'Microsoft.App/containerApps@2023-05-01' = {
  name: 'ml-service'
  location: location
  properties: {
    managedEnvironmentId: environment.id
    configuration: {
      activeRevisionsMode: 'Single'
      registries: [
        {
          server: registry.properties.loginServer
          username: registry.listCredentials().username
          passwordSecretRef: 'acr-password'
        }
      ]
      ingress: {
        external: true
        targetPort: 5003
        allowInsecure: false
        corsPolicy: {
          allowedOrigins: [ '*' ]
          allowedMethods: [ 'GET', 'POST', 'PUT', 'DELETE', 'OPTIONS' ]
          allowedHeaders: [ '*' ]
        }
      }
      secrets: [
        {
          name: 'acr-password'
          value: registry.listCredentials().passwords[0].value
        }
        {
          name: 'mongo-uri'
          value: mongoUri
        }
        {
          name: 'groq-api-key'
          value: groqApiKey
        }
        {
          name: 'openai-api-key'
          value: openaiApiKey
        }
      ]
    }
    template: {
      containers: [
        {
          name: 'ml-service'
          image: 'finintelregfvbuuw6fkzpl2.azurecr.io/ml-service:latest'
          resources: {
            cpu: json('0.25')
            memory: '0.5Gi'
          }
          env: [
            {
              name: 'PORT'
              value: '5003'
            }
            {
              name: 'MONGO_URI'
              secretRef: 'mongo-uri'
            }
            {
              name: 'GROQ_API_KEY'
              secretRef: 'groq-api-key'
            }
            {
              name: 'OPENAI_API_KEY'
              secretRef: 'openai-api-key'
            }
            {
              name: 'AUTH_SERVICE_URL'
              value: 'https://${authServiceApp.properties.configuration.ingress.fqdn}'
            }
          ]
        }
      ]
    }
  }
}

// 6. Expense Service Container App
resource expenseServiceApp 'Microsoft.App/containerApps@2023-05-01' = {
  name: 'expense-service'
  location: location
  properties: {
    managedEnvironmentId: environment.id
    configuration: {
      activeRevisionsMode: 'Single'
      registries: [
        {
          server: registry.properties.loginServer
          username: registry.listCredentials().username
          passwordSecretRef: 'acr-password'
        }
      ]
      ingress: {
        external: true
        targetPort: 5002
        allowInsecure: false
        corsPolicy: {
          allowedOrigins: [ '*' ]
          allowedMethods: [ 'GET', 'POST', 'PUT', 'DELETE', 'OPTIONS' ]
          allowedHeaders: [ '*' ]
        }
      }
      secrets: [
        {
          name: 'acr-password'
          value: registry.listCredentials().passwords[0].value
        }
        {
          name: 'mongo-uri'
          value: mongoUri
        }
        {
          name: 'jwt-secret'
          value: jwtSecret
        }
      ]
    }
    template: {
      containers: [
        {
          name: 'expense-service'
          image: 'finintelregfvbuuw6fkzpl2.azurecr.io/expense-service:latest'
          resources: {
            cpu: json('0.25')
            memory: '0.5Gi'
          }
          env: [
            {
              name: 'PORT'
              value: '5002'
            }
            {
              name: 'MONGO_URI'
              secretRef: 'mongo-uri'
            }
            {
              name: 'JWT_SECRET'
              secretRef: 'jwt-secret'
            }
            {
              name: 'AUTH_SERVICE_URL'
              value: 'https://${authServiceApp.properties.configuration.ingress.fqdn}'
            }
            {
              name: 'ML_SERVICE_URL'
              value: 'https://${mlServiceApp.properties.configuration.ingress.fqdn}'
            }
          ]
        }
      ]
    }
  }
}

// 7. Frontend Container App
resource frontendApp 'Microsoft.App/containerApps@2023-05-01' = {
  name: 'frontend'
  location: location
  properties: {
    managedEnvironmentId: environment.id
    configuration: {
      activeRevisionsMode: 'Single'
      registries: [
        {
          server: registry.properties.loginServer
          username: registry.listCredentials().username
          passwordSecretRef: 'acr-password'
        }
      ]

      secrets: [
        {
          name: 'acr-password'
          value: registry.listCredentials().passwords[0].value
        }
      ]
      
      ingress: {
        external: true
        targetPort: 80
        allowInsecure: false
      }
    }
    template: {
      containers: [
        {
          name: 'frontend'
          image: 'finintelregfvbuuw6fkzpl2.azurecr.io/frontend:latest'
          resources: {
            cpu: json('0.25')
            memory: '0.5Gi'
          }
        }
      ]
    }
  }
}

output registryName string = registry.name
output registryLoginServer string = registry.properties.loginServer
output authFqdn string = authServiceApp.properties.configuration.ingress.fqdn
output expenseFqdn string = expenseServiceApp.properties.configuration.ingress.fqdn
output mlFqdn string = mlServiceApp.properties.configuration.ingress.fqdn
output frontendFqdn string = frontendApp.properties.configuration.ingress.fqdn

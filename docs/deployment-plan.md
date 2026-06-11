# 🚀 Deployment Plan

The system is deployed on Microsoft Azure using a containerized microservices deployment model defined via Azure Bicep infrastructure-as-code.

## 📋 Resource Mapping

| Component | Target Azure Resource | Details / Resource Name |
| :--- | :--- | :--- |
| **Frontend UI** | Azure Container App | `smart-financial-intelligence-system` |
| **Auth Service** | Azure Container App | `auth-service` |
| **Expense Service** | Azure Container App | `expense-service` |
| **ML Service** | Azure Container App | `ml-service` |
| **Container Registry** | Azure Container Registry (ACR) | `finintelreg<unique-id>` |
| **Log Management** | Azure Log Analytics Workspace | `finintel-logs` |
| **Hosting Environment** | Azure Container Apps Managed Env | `financial-intelligence-env` |
| **Database** | Azure Cosmos DB (MongoDB API) | Managed connection via connection strings |
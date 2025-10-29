# Event-Driven Order Processing System

> An enterprise-grade e-commerce order processing system demonstrating event-driven architecture with Azure services.

## 🏗️ Architecture

```
┌─────────────────┐      ┌──────────────────┐      ┌─────────────────┐
│   Next.js 15    │─────▶│  Azure Function  │─────▶│  Service Bus    │
│   Frontend      │ HTTP │  (HTTP Trigger)  │      │     Queue       │
└─────────────────┘      └──────────────────┘      └─────────────────┘
                                                            │
                                                            ▼
                         ┌──────────────────┐      ┌─────────────────┐
                         │  Azure Function  │◀─────│  Service Bus    │
                         │ (Queue Trigger)  │      │     Queue       │
                         └──────────────────┘      └─────────────────┘
                                │
                                ▼
                         ┌──────────────────┐
                         │  Application     │
                         │    Insights      │
                         └──────────────────┘
```

## 🚀 Tech Stack

**Backend:**
- Azure Functions (TypeScript/Node.js 20)
- Azure Service Bus (Message Queue)
- Application Insights (Monitoring)

**Frontend:**
- Next.js 15 (React App Router)
- TypeScript
- TailwindCSS + shadcn/ui
- TanStack Query

**Infrastructure:**
- Bicep (Infrastructure as Code)
- GitHub Actions (CI/CD)

## 📺 YouTube Tutorial Series

This project is part of a comprehensive YouTube tutorial series:

1. **Introduction & Architecture** - Overview and design patterns
2. **Azure Infrastructure** - Deploy resources with Bicep
3. **Order Submission API** - HTTP-triggered Azure Function
4. **Order Processor** - Queue-triggered function with retry logic
5. **Observability** - Application Insights, dashboards, alerts
6. **Frontend Setup** - Next.js 15 project structure
7. **UI Implementation** - Order form and integration
8. **Deployment & CI/CD** - Automated deployments

## 🛠️ Prerequisites

- Node.js 20+
- Azure CLI
- Azure Functions Core Tools v4
- Azure subscription (free tier works)

## 📖 Getting Started

### 1. Clone the repository

```bash
git clone <your-repo-url>
cd event-driven-order-processing-system
```

### 2. Deploy Infrastructure

```bash
cd infrastructure
az deployment sub create \
  --name orderproc-infra-dev \
  --location westeurope \
  --template-file main.bicep \
  --parameters parameters/dev.bicepparam
```

### 3. Deploy Backend

```bash
cd backend/functions
npm install
npm run build
func azure functionapp publish <your-function-app-name>
```

### 4. Run Frontend Locally

```bash
cd frontend/order-portal
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## 📁 Project Structure

```
├── infrastructure/          # Bicep templates
├── backend/functions/       # Azure Functions (TypeScript)
├── frontend/order-portal/   # Next.js 15 app
├── .github/workflows/       # CI/CD pipelines
└── docs/                    # Documentation
```

## 🔧 Development

### Backend (Azure Functions)

```bash
cd backend/functions
npm install
npm run start  # Start locally
```

### Frontend (Next.js)

```bash
cd frontend/order-portal
npm install
npm run dev
```

## 🚀 Deployment

Deployments are automated via GitHub Actions when pushing to `main` branch.

### Manual Deployment

**Infrastructure:**
```bash
cd infrastructure
az deployment sub create --template-file main.bicep --parameters parameters/prod.bicepparam
```

**Backend:**
```bash
cd backend/functions
npm run build
func azure functionapp publish func-orderproc-prod
```

**Frontend:**
```bash
cd frontend/order-portal
# Deployed automatically to Azure Static Web Apps
```

## 📊 Monitoring

Access Application Insights in Azure Portal:
- Request rates and response times
- Failed requests and exceptions
- Custom metrics and events
- Live metrics stream

## 🧪 Testing

```bash
# Backend tests
cd backend/functions
npm test

# Frontend tests
cd frontend/order-portal
npm test
```

## 📝 License

MIT License - See LICENSE file for details

## 🤝 Contributing

This is a tutorial project. Feel free to fork and customize for your needs!

## 📧 Contact

Questions? Open an issue or reach out on [LinkedIn/Twitter/etc]

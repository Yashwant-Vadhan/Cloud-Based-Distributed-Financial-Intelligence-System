Architecture Overview

1. Introduction

This project is a cloud-native distributed financial intelligence system that enables users to:

* Track expenses
* Analyze spending behavior
* Predict future financial patterns using machine learning

The system is implemented using a containerized microservices architecture, where each core functionality is developed, deployed, and executed as an independent service.

2. Architectural Style

The system follows Containerized Microservices Architecture

Key Characteristics:

* Each service runs independently in its own container
* Services communicate over HTTP (REST APIs)
* Services are loosely coupled and independently deployable
* System is scalable and cloud-ready

3. High-Level Architecture

        [ Frontend Client ]
                  ↓
          [ API Communication ]
                  ↓
   ---------------------------------
   | Auth | Expense | Analytics | ML |
   ---------------------------------
                  ↓
     [ Azure Cosmos DB (Mongo API) ]
                  ↓
         [ Azure Cloud Platform ]

4. Core Services

Each service is implemented as an independent backend and containerized using Docker.

4.1 Authentication Service (`auth-service`)

Responsibilities:

* User registration and login
* Password hashing and validation
* Token-based authentication (JWT)

Endpoints (example):

* `/register`
* `/login`
* `/verify`

4.2 Expense Service (`expense-service`)

Responsibilities:

* Add, update, delete expenses
* Categorize financial transactions
* Fetch user-specific expense data

Dependency:

* Communicates with Auth Service for user verification

4.3 Machine Learning Service (`ml-service`)

Responsibilities:

* Analyze historical expense data
* Generate future spending predictions
* Provide insights based on trained models

Workflow:

1. Receive request from backend
2. Fetch or accept user data
3. Process using ML model
4. Return prediction results

4.4 Frontend (`frontend`)

Responsibilities:

* User interface for interaction
* Sends API requests to backend services
* Displays analytics and predictions

5. Communication Architecture

Service Communication

* Client → Services: REST API over HTTP
* Service → Service: REST API calls

Example:

* Expense Service → Auth Service (user verification)
* Frontend → All backend services

Important Note

Within Docker environment, services communicate using:

http://<service-name>:<port>

Example:
http://auth-service:5001

6. Data Architecture

Database: Azure Cosmos DB (MongoDB API)

The system uses Azure Cosmos DB with MongoDB API as the primary database.

Features:

* NoSQL document-based storage
* Flexible schema (JSON documents)
* High scalability and availability

7. Containerization (Docker)

Each service is containerized using Docker:

* Independent Dockerfile per service
* Services run in isolated environments
* Consistent runtime across systems

8. Orchestration (Docker Compose)

The system uses Docker Compose to:

* Run multiple services together
* Define service dependencies
* Enable inter-service communication

9. Cloud Infrastructure (Azure)

The system is designed for deployment on Microsoft Azure:

* Azure App Service / Containers – service hosting
* Azure Cosmos DB – database
* Azure Monitor – logging and monitoring

10. Security Design

* JWT-based authentication
* Secure password hashing
* HTTPS communication (in production)
* Service-level access validation

11. Scalability

* Services can be scaled independently
* Containers allow horizontal scaling
* Architecture supports future Kubernetes (AKS) deployment

12. Future Enhancements

* API Gateway integration
* Message queues (Azure Service Bus)
* Independent databases per service
* Kubernetes orchestration (AKS)
* Advanced ML models

13. Summary

This system demonstrates a practical implementation of containerized microservices, combining:

* Distributed service architecture
* Cloud-native database (Cosmos DB)
* Machine learning integration
* Docker-based deployment


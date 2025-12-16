# Car Trading Store

A comprehensive full-stack web application for buying, selling, and managing vehicle listings with a robust admin moderation system.

**Live Demo:** [https://cartrading-frontend.onrender.com/](https://cartrading-frontend.onrender.com/)  
**Repository:** [https://github.com/Kihurata/CarTradingStore](https://github.com/Kihurata/CarTradingStore)

---

## Table of Contents

- [Overview](#overview)
- [Technologies](#technologies)
- [Project Structure](#project-structure)
- [Key Features](#key-features)
- [Installation](#installation)
- [Configuration](#configuration)
- [Testing](#testing)
- [CI/CD and Deployment](#cicd-and-deployment)

---

## Overview

Car Trading Store is a centralized platform designed to facilitate vehicle trading. It features a secure user authentication system, detailed listing management, and an administration dashboard for content moderation. The application is built using a microservices-ready architecture with a Node.js/Express backend and a Next.js frontend, fully containerized with Docker.

---

## Technologies

**Backend**
- **Runtime:** Node.js, Express.js
- **Language:** TypeScript
- **Database:** PostgreSQL 15
- **Authentication:** JWT (JSON Web Tokens)
- **File Storage:** Supabase
- **Utilities:** Nodemailer (Email), PDFKit (Reporting)

**Frontend**
- **Framework:** Next.js 14+
- **Library:** React
- **Styling:** Tailwind CSS

**DevOps & Testing**
- **Containerization:** Docker, Docker Compose
- **Testing:** Jest, Supertest
- **CI/CD:** GitHub Actions

---

## Project Structure

The project follows a structured monorepo organization separating the API service and the web client.

```text
CarTradingStore/
├── docker-compose.yml          # Production Docker orchestration
├── docker-compose.dev.yml      # Development Docker orchestration with hot-reload
├── backend/                    # Node.js/Express API
│   ├── src/
│   │   ├── config/             # Database and app configuration
│   │   ├── controllers/        # Request handlers (Admin, Auth, Listing)
│   │   ├── middleware/         # Auth and validation middleware
│   │   ├── models/             # TypeScript interfaces and types
│   │   ├── routes/             # API route definitions
│   │   ├── services/           # Business logic layer
│   │   └── utils/              # Helpers (Email, PDF, Supabase)
│   ├── tests/                  # Unit,Smoke and Integration tests
│   └── Dockerfile              # Backend production image
└── frontend/                   # Next.js Web Application
    ├── app/                    # Next.js App Router
    │   ├── (main)/             # Public and user-facing pages
    │   └── admin/              # Protected admin dashboard
    ├── src/
    │   ├── components/         # Reusable UI components
    │   └── services/           # API integration services
    └── Dockerfile              # Frontend production image
```
## Key Features

### User Authentication
- **Registration and Login** via JWT.
- **Password Reset** via email token.
- **Role-based authorization** (User vs. Admin).

### Listing Management
- Create listings with multi-image upload via **Supabase**.
- Dynamic search and filtering (Brand, Model, Price, Body Type).
- Favorite and compare listings functionality.

### Admin Moderation
- Dashboard statistics (Views, Reports, Pending Listings).
- Approval workflow for new listings (Approve/Reject).
- User management (Lock/Ban users).
- Audit logging for administrative actions.

### Reporting System
- User submission of reports (Spam, Fraud, Offensive).
- Admin review and resolution workflow.
- PDF report generation.

---

## Installation

### Prerequisites
- **Docker** and **Docker Compose**
- **Node.js 18+** (if running locally without Docker)

### Method 1: Docker Compose (Recommended)

1. Clone the repository:
   ```bash
   git clone [https://github.com/Kihurata/CarTradingStore.git](https://github.com/Kihurata/CarTradingStore.git)
   cd CarTradingStore
   Create environment files (see Configuration section below).
2. Create environment files (see Configuration section below).
3. Start the development environment:
 ```bash
docker-compose -f docker-compose.dev.yml up
```
Method 2: Manual Setup
Backend
```bash
cd backend
npm install
npm run dev
```
Frontend
```bash
cd frontend
npm install
npm run dev
```
---
## Configuration
Backend Environment
Create a .env file in the backend directory with the following variables:
```bash
PORT=4000
NODE_ENV=development

# Database
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=password
DB_NAME=cartradingstore

# Authentication
JWT_SECRET=your_secret_key_here

# Supabase (Storage)
SUPABASE_URL=[https://your-project.supabase.co](https://your-project.supabase.co)
SUPABASE_KEY=your_anon_key
SUPABASE_SERVICE_KEY=your_service_key

# Email (Nodemailer)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email
SMTP_PASS=your_app_password
```
Frontend Environment
Create a .env file in the frontend directory:
```bash
NEXT_PUBLIC_API_URL=http://localhost:4000
```
---
## Testing
The project utilizes Jest for both unit and integration testing.
Run all tests
```bash
cd backend
npm test
```
Run unit tests (Isolated components: Services, Controllers, Utils with coverage reports)
```bash
cd backend
npm run test:unit
```
Run integration tests (Full API flows including database interactions and request/response cycles)
```bash
cd backend
npm run test:int
```
---
## CI/CD and Deployment

### Continuous Integration
The project uses GitHub Actions to automate the testing pipeline:
- **Backend CI**: Installs dependencies, runs unit/integration tests, and verifies Docker builds.
- **Frontend CI**: Verifies dependency installation and build process.
- **Smoke Test**: Verifies container health checks.

### Deployment
- **Platform**: Render
- **Trigger**: Pushes to the `deploy` branch automatically trigger the deployment pipeline.
- **Process**: The system deploys the backend Node.js service and the frontend Next.js static build, utilizing a managed PostgreSQL database.

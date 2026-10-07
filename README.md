# 🔍 Project SUTRA — Law Enforcement Intelligence Platform

![Status](https://img.shields.io/badge/Status-In%20Development-yellow)
![License](https://img.shields.io/badge/License-MIT-blue)
![SIH](https://img.shields.io/badge/SIH-26189--PUNE-red)

> **S**ynthetic **U**nified **T**hreat **R**ecognition & **A**nalysis — A crime investigation intelligence system built for Smart India Hackathon (SIH) under MHA / NCRB specifications.

## 📋 Overview

Project SUTRA is a fullstack law enforcement intelligence platform that provides:

- **Interactive Knowledge Graph** — Visualize suspected syndicates, entities (Persons, Bank Accounts, Phone numbers), and their relationships
- **Evidence Ingestion** — Upload police evidence files (CSV, XLSX, PDF) for NLP-powered parsing and graph database storage
- **CDR & CCTNS Intelligence** — Tabular view of Call Detail Records with cell tower locations and threat flags
- **Hawala & Money Laundering Trail** — Multi-hop financial layering and shell ledger analysis
- **Explainable AI (XAI) Dossiers** — Node-level inspection explaining why entities were flagged
- **Legal Export (Section 65B)** — Generate Word-compatible evidence dossiers certified under the Indian Evidence Act

## 🏗️ Tech Stack

| Layer | Technology |
|-------|------------|
| **Frontend** | React 19, Vite 8, Tailwind CSS 3, react-force-graph-2d |
| **Backend** | Java 17, Spring Boot 3.2.5, Spring Data Neo4j, Lombok |
| **Database** | Neo4j Graph Database (Bolt protocol) |
| **Build Tools** | npm (frontend), Maven (backend) |

## 📁 Project Structure

```
project-sutra/
├── frontend/              # React + Vite frontend application
│   ├── src/
│   │   ├── App.jsx        # Main application component (639 lines)
│   │   ├── main.jsx       # React entry point
│   │   └── index.css      # Tailwind CSS imports
│   ├── public/            # Static assets (favicon, icons)
│   └── package.json       # Frontend dependencies
├── sutra-backend/         # Spring Boot backend (Java)
│   ├── src/main/java/     # Java source code
│   ├── src/main/resources/# Configuration files
│   └── pom.xml            # Maven dependencies
├── data-generator/        # Synthetic data generation scripts
├── dashboard.html         # Standalone vis-network graph viewer
└── README.md              # This file
```

## 🚀 Getting Started

### Prerequisites

- **Node.js** >= 18.x
- **Java** 17 (JDK)
- **Neo4j** Database (running on `bolt://localhost:7687`)
- **Maven** 3.x (or use the included `mvnw` wrapper)

### Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

The frontend dev server starts at `http://localhost:5173`

### Backend Setup

```bash
cd sutra-backend
./mvnw spring-boot:run
```

The backend API starts at `http://localhost:8081`

### Environment Configuration

Create a `.env` file in the `frontend/` directory:

```env
VITE_API_BASE_URL=http://localhost:8081
```

Configure `sutra-backend/src/main/resources/application.properties`:

```properties
server.port=8081
spring.neo4j.uri=bolt://localhost:7687
spring.neo4j.authentication.username=neo4j
spring.neo4j.authentication.password=your_password_here
```

## 🔌 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/network` | Fetch all nodes and edges from Neo4j |
| `POST` | `/api/upload` | Upload evidence file for NLP parsing |
| `DELETE` | `/api/node/{id}` | Remove a node from the graph database |

## 📸 Features

### 🕸️ Network Graph View
Interactive force-directed graph with drag-and-drop nodes, topology filters (Financial, Communication, Behavioral), and custom node rendering.

### 📁 Evidence Ingestion Portal
Secure upload gateway supporting CSV, XLSX, and PDF formats with real-time NLP parsing feedback.

### 🔍 CDR Intelligence
Call Detail Record analysis with cell tower mapping and threat classification (CRITICAL / SUSPICIOUS / NORMAL).

### 💳 Financial Ledgers
Multi-hop Hawala pattern detection and money laundering trail visualization.

### ⚡ AI Threat Alerts
Neural network-based anomaly detection with syndicate convergence analysis.

### 📄 Section 65B Export
One-click generation of court-admissible evidence dossiers in Word format.

## 📄 License

This project is developed for Smart India Hackathon 2026.

## 👥 Team

Built with ❤️ by Team Turiya for SIH Case #SIH-26189-PUNE

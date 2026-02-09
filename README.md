<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/drive/1X6Zijlrf3rFRMYNCCuzKiTKYmxiS_xg_

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. Run the app:
   `npm run dev`


# Foundry System Architecture

This document maps the high-level architecture of **Foundry**, designed to be scalable, modular, and AI-native. This architecture supports real-time feedback loops between the user's input and the platform's AI intelligence engine.

## System Overview Diagram

```mermaid
graph TB
    subgraph Client ["Client Layer (User Experience)"]
        UI[Foundry Web App]
        DescUI[React 19 + Vite + TypeScript]
    end

    subgraph API ["API Layer (Gateway)"]
        Server[Foundry Backend API]
        DescServer[FastAPI + Pydantic]
        
        Auth[Auth Router]
        Users[User Router]
        Org[Workspace Router]
        Fin[Financials Router]
        Dash[Dashboard Router]
        
        Server --> Auth
        Server --> Users
        Server --> Org
        Server --> Fin
        Server --> Dash
    end

    subgraph Data ["Data Layer (Persistence)"]
        DB[(Foundry Database)]
        DescDB[SQLite / SQLAlchemy ORM]
    end

    subgraph Async ["Intelligence Layer (Async Workers)"]
        WorkerManager[Background Worker Manager]
        DescWorker[Python Threading + Queue]
        
        JobQueue[Job Queue]
        
        Worker1[Idea Analysis Worker]
        Worker2[Founder Alignment Worker]
        Worker3[Investor Readiness Worker]
        Worker4[Dashboard Insight Worker]
        
        WorkerManager --> JobQueue
        JobQueue --> Worker1
        JobQueue --> Worker2
        JobQueue --> Worker3
        JobQueue --> Worker4
    end

    subgraph External ["External Services"]
        Gemini[Google Gemini 1.5 Pro]
        DescAI[LLM Inference]
    end

    %% Key Data Flows
    UI -- "REST API (JSON)" --> Server
    Server -- "Read/Write" --> DB
    Server -- "Dispatch Job" --> DB
    
    WorkerManager -- "Polls Jobs" --> DB
    
    Worker1 -- "Prompt Engineering" --> Gemini
    Worker2 -- "Prompt Engineering" --> Gemini
    Worker3 -- "Prompt Engineering" --> Gemini
    Worker4 -- "Prompt Engineering" --> Gemini
    
    Gemini -- "Structured Analysis" --> WorkerManager
    WorkerManager -- "Save Insights & Results" --> DB

    %% Styling
    classDef client fill:#e1f5fe,stroke:#01579b,stroke-width:2px;
    classDef api fill:#e8f5e9,stroke:#2e7d32,stroke-width:2px;
    classDef data fill:#fff3e0,stroke:#ef6c00,stroke-width:2px;
    classDef worker fill:#f3e5f5,stroke:#7b1fa2,stroke-width:2px;
    classDef external fill:#eceff1,stroke:#455a64,stroke-width:2px,stroke-dasharray: 5 5;

    class UI,DescUI client;
    class Server,DescServer,Auth,Users,Org,Fin,Dash api;
    class DB,DescDB data;
    class WorkerManager,DescWorker,JobQueue,Worker1,Worker2,Worker3,Worker4 worker;
    class Gemini,DescAI external;
```

## Architectural Highlights (For Hackathon Judges)

### 1. **Asynchronous Intelligence Engine**
The system uses a **decoupled worker pattern** to handle heavy AI workloads. Instead of making the user wait for Gemini to generate complex analyses (which can take 10-30 seconds), the API dispatches a background job.
-   **Benefit**: The UI remains instant and responsive.
-   **Mechanism**: Pending jobs are stored in the database and picked up by specialized worker threads.

### 2. **Modular Router Design**
The backend is split into domain-specific routers (`financials`, `workspaces`, `analysis`).
-   **Benefit**: Clean separation of concerns. This allows different parts of the platform (e.g., Financial Modeling vs. Founder Psychology) to evolve independently without breaking each other.

### 3. **Structured AI Integration**
We don't just "chat" with the AI. We use **Structured Prompt Engineering** to force the LLM to return strictly formatted JSON data.
-   **Benefit**: The AI's output is directly actionable programmatically. We can render charts, graphs, and scores from the AI's response, rather than just displaying a text block.

### 4. **Scalable Data Model**
The database schema (`Organization`, `OrgMember`, `Financials`, `ReadinessGate`) is designed to capture the **entire lifecycle** of a startup, from idea to Series A.
-   **Benefit**: The platform creates a "Digital Twin" of the startup, allowing for deep simulations and "What If" analysis.

## Core Data Flows

### A. Idea Validation Flow
1.  **User Input**: User enters startup problem, solution, and target market in the UI.
2.  **API Call**: Frontend sends data to `/analysis/validate`.
3.  **Job Creation**: Backend creates an `idea_analysis` job in the `jobs` table (Status: `PENDING`).
4.  **Worker Pickup**: `idea_analysis_worker` detects the new job.
5.  **AI Processing**: Worker constructs a complex prompt and sends it to **Gemini 1.5 Pro**.
6.  **Result Storage**: Gemini returns JSON (TAM size, personas, roadmap). Worker saves this to `ai_idea_analysis` table.
7.  **Polling/Push**: Frontend polls (or uses WebSocket) to detect job completion and renders the results.

### B. Founder Alignment Flow
1.  **Data Aggregation**: System aggregates psychographic data from multiple founders (Risk tolerance, equity expectations, time commitment).
2.  **Analysis**: `founder_alignment_worker` feeds this multi-party dataset to the AI.
3.  **Risk Detection**: AI identifies specific conflicts (e.g., "CEO expects 80h/week, CTO only committing 20h/week").
4.  **Actionable Advice**: System generates a unified "Alignment Score" and specific mediation steps.

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


### High-Level Flow
**"Gemini reasons. Foundry decides."**

```mermaid
graph TD
    %% Nodes
    A[Frontend: React & TS]
    C[Team, Idea, Financial, and dashboard related Data Structuring]
    D[Feed data into Gemini 3 Reasoning Layer]
    E[Scoring & recommendation Engine]

    %% Connections
    A -->|User Inputs startup data| C
    C -->|Create prompt based on structured data| D
    D -->|Synthesized Insights| E
    E -->|Validated Analysis| A

    %% Styling
    classDef box fill:#ffffff,stroke:#5f6368,stroke-width:2px,color:#202124,rx:10,ry:10;
    classDef gemini fill:#e8f0fe,stroke:#1a73e8,stroke-width:3px,color:#1a73e8,rx:10,ry:10;

    class A,B,C,E box;
    class D gemini;
```





import { GoogleGenAI } from "@google/genai";
import { 
  User, OrganizationModel, OrgMember, FinancialsModel, 
  FounderAlignmentModel, AIIdeaAnalysis, InvestorReadiness 
} from '../models';

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const MODEL_NAME = 'gemini-3-flash-preview'; 

// --- PROMPT BUILDERS ---

const buildIdeaAnalysisPrompt = (org: OrganizationModel, founders: { user?: User, member: OrgMember }[]) => {
  const startup_type = org.type || "Not specified";
  const problem_statement = org.problem || "Not specified";
  const solution_statement = org.solution || "Not specified";
  
  const name = org.name || "Not specified";
  const industry = org.industry || "Not specified";
  const geography = org.geography || "Not specified";
  const stage = org.stage || "Not specified";
  const customer = org.customer || "Not specified";

  let founder_summary = "";
  if (founders && founders.length > 0) {
    founder_summary = "\n\nFounders:\n";
    founders.forEach(f => {
      founder_summary += `- ${f.user?.full_name || 'Unknown'} | Role: ${f.member.role} | Experience: ${f.user?.industry_experience || 0}\n`;
    });
  }

  return `
You are an expert startup analyst.

You will analyze the startup idea and generate a detailed idea validation report.

Startup Details:
- Startup Name: ${name}
- Industry: ${industry}
- Geography: ${geography}
- Stage: ${stage}
- Customer: ${customer}
- Startup Field: ${startup_type}
- Problem Statement: ${problem_statement}
- Solution by Startup: ${solution_statement}

${founder_summary}

You must output the analysis in JSON format with the following structure:

{
  "seed_funding_probability": int,   # 0-100
  "market": {
      "tam_value": number,           # in billions USD
      "growth_rate_percent": number, # annual growth %
      "growth_index": number,        # 0-100 score
      "insight": string
  },
  "investor_verdict": string,         # short paragraph
  "strengths": [string],
  "weaknesses": [string],
  "personas": [
      {
        "name": string,
        "pain": string,
        "solution": string
      }
  ],
  "roadmap": {
      "recommended_stage": string,
      "min_capital": number,
      "max_capital": number,
      "milestones": [
        {
          "label": string,
          "duration_days": number,
          "is_active": boolean
        }
      ]
  }
}

Make sure to:
- Provide realistic market values and growth
- Be concise but specific
- Use bullet lists for strengths/weaknesses
- Provide 3 customer personas
- Provide 3-5 milestones
`;
};

const buildFounderAlignmentPrompt = (users: { user?: User, member: OrgMember }[]) => {
  const user_lines = users.map(u => 
    `- Name: ${u.user?.full_name || 'Unknown'}
  Email: ${u.user?.email || ''}
  Member Type: ${u.member.member_type}
  Role: ${u.member.role}
  Permission Level: ${u.member.permission_level}
  Responsibility: ${u.member.responsibility || ''}
  Authority: ${u.member.authority}
  Hours per Week: ${u.member.hours_per_week}
  Start Date: ${u.member.start_date}
  Planned Change: ${u.member.planned_change}
  Status: ${u.member.status}
  Cash Contribution: ${u.member.cash_contribution}
  Salary: ${u.member.salary}
  Bonus: ${u.member.bonus}
  Equity %: ${u.member.equity}
  Vesting: ${u.member.vesting}
  Vesting Cliff (years): ${u.member.vesting_cliff}
  Risk Tolerance: ${u.member.risk_tolerance}
  Expectations: ${u.member.expectations}`
  ).join('\n');

  return `
Analyze founder alignment for a startup based on the information provided below.

Here are the current members of the org:

${user_lines}

Your task:
1. Evaluate alignment across founders on:
   - Vision & commitment
   - Time and effort contribution
   - Authority vs responsibility balance
   - Incentives (salary, equity, vesting)
   - Risk tolerance compatibility
   - Governance clarity
2. Identify key alignment factors and misalignment risks.
3. Assign an overall alignment score (0–100).
4. Classify the overall risk level: Low, Medium, or High.
5. Identify the single most critical alignment risk.
6. Suggest concrete corrective actions.

Return ONLY valid JSON matching the following structure:

{
  "score": number,
  "risk_level": "Low" | "Medium" | "High",
  "factors": {
    "commitment_alignment": string,
    "role_clarity": string,
    "authority_balance": string,
    "time_commitment_balance": string,
    "equity_and_incentives": string,
    "risk_tolerance_alignment": string,
    "governance_and_decision_making": string
  },
  "risks": [
    {
      "risk": string,
      "severity": "Low" | "Medium" | "High",
      "description": string,
      "affected_roles": [string]
    }
  ],
  "actions": [
    {
      "action": string,
      "priority": "High" | "Medium" | "Low",
      "owner": string,
      "expected_outcome": string
    }
  ],
  "primary_risk": string,
  "insight": string
}

Guidelines:
- Be critical but fair.
- Assume early-stage startup context unless stated otherwise.
- If data is missing, infer conservatively and note it as a risk.
- Do NOT include any explanation outside the JSON.
`;
};

const buildInvestorReadinessPrompt = (org: OrganizationModel, financials: FinancialsModel) => {
  const startup_type = org.type || "Not specified";
  const problem_statement = org.problem || "Not specified";
  const solution_statement = org.solution || "Not specified";
  
  const name = org.name || "Not specified";
  const industry = org.industry || "Not specified";
  const geography = org.geography || "Not specified";
  const stage = org.stage || "Not specified";
  const customer = org.customer || "Not specified";

  // Financial defaults
  const monthly_revenue = financials.monthly_revenue ?? "Not specified";
  const revenue_trend = financials.revenue_trend || "Not specified";
  const revenue_stage = financials.revenue_stage || "Not specified";
  const expense_pattern = financials.expense_pattern || "Not specified";
  const cash_in_bank = financials.cash_in_bank ?? "Not specified";
  const monthly_burn = financials.monthly_burn ?? "Not specified";
  const cost_structure = financials.cost_structure || "Not specified";
  const pricing_model = financials.pricing_model || "Not specified";
  const price_per_customer = financials.price_per_customer ?? "Not specified";
  const customers_in_pipeline = financials.customers_in_pipeline ?? "Not specified";
  const data_confidence = financials.data_confidence || "Rough";

  return `
You are an expert startup analyst with experience in venture capital and early-stage investments.

Analyze the following startup information and produce a detailed investor insights report. Be opinionated, realistic, and precise.
Judge financials based on the startup stage.

Startup Details:
- Startup Name: ${name}
- Industry: ${industry}
- Geography: ${geography}
- Stage: ${stage}
- Customer: ${customer}
- Startup Field: ${startup_type}
- Problem Statement: ${problem_statement}
- Solution by Startup: ${solution_statement}

Financial Details:
- Current Monthly Revenue: ${monthly_revenue}
- Revenue Trend: ${revenue_trend}
- Revenue Stage: ${revenue_stage}
- Estimated Cash in Bank: ${cash_in_bank}
- Estimated Monthly Burn: ${monthly_burn}
- Expenses fixedness (in percentage): ${expense_pattern}
- Estimated Cost Structure: ${cost_structure}
- Estimated Pricing Model: ${pricing_model}
- Estimated Monthly revenue per Customer: ${price_per_customer}
- Estimated Customers in Pipeline per month: ${customers_in_pipeline}
- Data Confidence: ${data_confidence}

Output your analysis strictly as **JSON** matching this TypeScript interface:

interface InvestorReadinessData {
    readiness_score: number;

    pushbacks: {
        title: string;
        points: string[];
    }[];

    fixes: string[];

    demands: {
        label: string;
        value: string;
        icon: "equity" | "control" | "milestones" | "governance";
    }[];

    simulated_reaction: {
        label: "Reject" | "Soft Interest" | "Fund";
        value: number;
    }[];

    investor_type: {
        primary: string;
        sectorFit: string;
        stageFit: string;
        mismatchFlags: string[];
    };

    recommendation: {
        verdict: "Delay Fundraising" | "Proceed" | "Conditional";
        reason: string;
    };

    summary_insight: string;

    investor_mindset_quotes: string[];

    demand_warning: string;

    next_action: {
        label: string;
        targetScreen: string;
    };
}

Guidelines:
- Provide realistic investor-style feedback with reasoning.
- readiness_score should be 0.0–1.0 and indicate how ready is the startup for any stage of investment.
- Include 2–3 pushbacks with 2–4 points each.
- Provide 3–5 actionable fixes.
- Include 2–4 demands, using the allowed icon values.
- Provide 3 simulated investor reactions with realistic probabilities.
- investor_type should include sectorFit, stageFit, and mismatchFlags.
- recommendation should be clear and justified.
- Provide a concise one-paragraph summary_insight.
- Include 3–5 short investorMindsetQuotes.
- Add a one-line demandWarning highlighting potential risks.
- Provide nextAction with a label and targetScreen.

Make sure the JSON is **fully valid** and ready to use in TypeScript.
`;
};

const buildDashboardPrompt = (
  org: OrganizationModel, 
  financials: FinancialsModel | null, 
  members: OrgMember[], 
  alignment: FounderAlignmentModel | null, 
  ideaAnalysis: AIIdeaAnalysis | null, 
  investorReadiness: InvestorReadiness | null
) => {
  const organization_json = JSON.stringify({
    industry: org.industry,
    geography: org.geography,
    stage: org.stage,
    problem: org.problem,
    solution: org.solution,
    customer: org.customer,
    risk_level: org.risk_level
  }, null, 2);

  const org_members_json = JSON.stringify(members.map(m => ({
    role: m.role,
    hours_per_week: m.hours_per_week,
    equity: m.equity,
    authority: m.authority,
    risk_tolerance: m.risk_tolerance
  })), null, 2);

  const founder_alignment_json = JSON.stringify(alignment ? {
    score: alignment.score,
    risk_level: alignment.risk_level,
    primary_risk: alignment.primary_risk,
    key_risks: alignment.risks,
    recommended_actions: alignment.actions
  } : { score: 0, risk_level: "None", primary_risk: "None", key_risks: [], recommended_actions: [] }, null, 2);

  const financials_json = JSON.stringify(financials ? {
    monthly_revenue: financials.monthly_revenue,
    revenue_trend: financials.revenue_trend,
    cash_in_bank: financials.cash_in_bank,
    monthly_burn: financials.monthly_burn,
    runway_months: (financials.cash_in_bank && financials.monthly_burn) ? Math.floor(financials.cash_in_bank / financials.monthly_burn) : 0,
    data_confidence: financials.data_confidence
  } : { monthly_revenue: 0, revenue_trend: "None", cash_in_bank: 0, monthly_burn: 0, runway_months: 0, data_confidence: "None" }, null, 2);

  const ai_idea_analysis_json = JSON.stringify(ideaAnalysis ? {
    seed_funding_probability: ideaAnalysis.seed_funding_probability,
    market_summary: ideaAnalysis.market?.insight,
    key_strengths: ideaAnalysis.strengths,
    key_weaknesses: ideaAnalysis.weaknesses
  } : { seed_funding_probability: 0, market_summary: "None", key_strengths: [], key_weaknesses: [] }, null, 2);

  const investor_readiness_json = JSON.stringify(investorReadiness ? {
    readiness_score: investorReadiness.readiness_score,
    summary_insight: investorReadiness.summary_insight,
    top_pushbacks: investorReadiness.pushbacks?.slice(0, 2) || [],
    next_action: investorReadiness.next_action
  } : { readiness_score: 0, summary_insight: "None", top_pushbacks: [], next_action: { label: "None", targetScreen: "None" } }, null, 2);

  return `
You are a senior startup investor and operating partner.

Your job is to synthesize multiple analyses into a single executive dashboard.
Be decisive, opinionated, and concise. Avoid generic advice.

INPUT DATA:

Organization:
${organization_json}

Founders & Team:
${org_members_json}

Founder Alignment Analysis:
${founder_alignment_json}

Financials:
${financials_json}

AI Market & Idea Analysis:
${ai_idea_analysis_json}

Investor Readiness Analysis:
${investor_readiness_json}

---

TASK:
Generate a SINGLE executive dashboard object using the schema below.

RULES:
- Verdict must be ONE sharp phrase
- Thesis must be 1–2 sentences max
- Killer Insight must reveal a non-obvious risk or leverage point
- Confidence should reflect data consistency (0.0–1.0)
- Actions must reference the relevant screenId
- Do NOT repeat raw data
- Think like an investor deciding whether to take the meeting
- If any output field data is missing, return null or empty list for that field

OUTPUT FORMAT (JSON ONLY):

{
  "verdict": "",
  "thesis": "",
  "killer_insight": "",
  "killer_insight_risk": "",
  "killer_insight_confidence": 0.0,
  "runway_months": null,
  "burn_rate": null,
  "capital_recommendation": "",
  "top_actions": [
    {
      "title": "",
      "why": "",
      "risk": "",
      "screenId": ""
    }
  ],
  "data_sources": [],
  "model_version": "v1"
}
`;
};

// --- SERVICE IMPLEMENTATION ---

const generateContent = async (prompt: string): Promise<any> => {
  try {
    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        temperature: 0.7,
      },
    });
    
    const text = response.text;
    if (!text) throw new Error("Empty response from AI");
    
    return JSON.parse(text);
  } catch (error) {
    console.error("AI Generation Error:", error);
    throw error;
  }
};

export const AIService = {
  generateIdeaAnalysis: async (org: OrganizationModel, founders: { user?: User, member: OrgMember }[]) => {
    const prompt = buildIdeaAnalysisPrompt(org, founders);
    return generateContent(prompt);
  },

  generateFounderAlignment: async (users: { user?: User, member: OrgMember }[]) => {
    const prompt = buildFounderAlignmentPrompt(users);
    return generateContent(prompt);
  },

  generateInvestorReadiness: async (org: OrganizationModel, financials: FinancialsModel) => {
    const prompt = buildInvestorReadinessPrompt(org, financials);
    return generateContent(prompt);
  },

  generateDashboard: async (
    org: OrganizationModel,
    financials: FinancialsModel | null,
    members: OrgMember[],
    alignment: FounderAlignmentModel | null,
    ideaAnalysis: AIIdeaAnalysis | null,
    investorReadiness: InvestorReadiness | null
  ) => {
    const prompt = buildDashboardPrompt(org, financials, members, alignment, ideaAnalysis, investorReadiness);
    return generateContent(prompt);
  }
};

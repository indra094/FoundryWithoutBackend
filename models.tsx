
// Frontend database models matching Python SQLAlchemy definitions

export interface Investor {
    id: string;
    org_id: string;
    name: string;
    type: string; // VC, Angel, etc.
    stage: string;
    status: string;
    notes?: string;
}

export interface Customer {
    id: string;
    org_id: string;
    company: string;
    role: string;
    status: string;
    signal: number; // 0-5
    notes?: string;
}

export interface Employee {
    id: string;
    org_id: string;
    name: string;
    type: string; // Human, AI
    role: string;
    status: string;
}

export interface Notification {
    id: number;
    org_id: string;
    title: string;
    type: string; // Warning, Info, Success
    created_at: string;
}

export interface AIHistory {
    id: number;
    employee_id: string;
    activity: string;
    timestamp: string;
}

export interface ReadinessGate {
    id: number;
    gate_id: string; // e.g. "incorporation", "funding"
    org_id: string;
    score: number;
    issues: string; // JSON string of strings
}

export interface Connection {
    id: number;
    org_id: string;
    name: string;
    role: string;
    company: string;
    relevance: string;
}

export interface User {
    id: string;
    full_name: string;
    email: string;
    avatar_url?: string;
    current_org_id?: string;
    status: string; // default "Active"
    industry_experience: number; // default 0
    password_hash: string;
}

export interface OrganizationModel {
    id: string;
    name: string;
    slug: string;
    industry?: string;
    geography?: string;
    type?: string;
    stage?: string;
    problem?: string;
    solution?: string;
    customer?: string;
    onboarding_step: number; // default 0
    risk_level: string; // default "Low"
    burn_rate: number; // default 0
    runway?: string;
}

export interface OrgMember {
    id: string;
    user_id: string;
    org_id: string;
    member_type: string; // 'Founder' or 'Executive', default "Founder"
    role: string; // Title e.g. CEO, CTO
    permission_level: string; // 'Read', 'Write', 'Admin', default "ADMIN"
    responsibility?: string;
    authority: string; // JSON string of authority tags, default "[]"
    hours_per_week: number; // default 40
    start_date?: string; // Date string
    planned_change: string; // default "none"
    salary: number; // default 0.0
    bonus: number; // default 0.0
    equity: number; // default 0.0
    vesting: string; // default "4 yrs, 1 yr cliff"
    expectations: string; // JSON string of accountability items, default "[]"
    last_updated?: string; // Date string
    status: string; // default "Active"
    cash_contribution: number; // default 0.0
    risk_tolerance: string; // default "Medium"
    vesting_cliff: number; // default 4
}

export interface AIIdeaAnalysis {
    workspace_id: string;
    version: number; // default 1
    seed_funding_probability?: number;
    market?: {
        tam_value: number;
        growth_rate_percent: number;
        growth_index: number;
        insight: string;
    };
    investor?: {
        verdict: string;
    };
    strengths?: string[];
    weaknesses?: string[];
    personas?: Array<{
        name: string;
        pain: string;
        solution: string;
    }>;
    roadmap?: {
        recommended_stage: string;
        min_capital: number;
        max_capital: number;
        milestones: Array<{
            label: string;
            duration_days: number;
            is_active: boolean;
        }>;
    };
    generated_at: string;
}

export interface FounderAlignmentModel {
    id: string;
    org_id: string;
    score: number;
    risk_level: string;
    factors: Record<string, string>; // JSON
    risks?: Array<{ risk: string; severity: string; description: string; affected_roles: string[] }>; // JSON
    actions?: Array<{ action: string; priority: "High" | "Medium" | "Low" }>; // JSON
    primary_risk?: string;
    insight?: string;
    generated_at: string;
    model_version: string; // default "v1"
}

export interface FinancialsModel {
    org_id: string;
    monthly_revenue?: number;
    revenue_trend?: string; // Growing, Flat, Declining
    revenue_stage?: string; // Pre-revenue, Early, Recurring
    cash_in_bank?: number;
    monthly_burn?: number;
    cost_structure?: string; // Fixed, Variable, Mix
    pricing_model?: string; // Subscription, Usage, One-time, Enterprise
    price_per_customer?: number;
    customers_in_pipeline?: number;
    data_confidence: string; // default "Rough"
    last_updated: string;
    expense_pattern: number;
}

export interface InvestorReadiness {
    id: number | string; // Adjusted to allow string ID (org_id) for simplicity in frontend logic
    readiness_score: number;
    pushbacks: { title: string; points: string[] }[];
    fixes: string[];
    demands: { label: string; value: string; icon: string }[];
    simulated_reaction: { label: string; value: number }[];
    investor_type: { primary: string; sectorFit: string; stageFit: string; mismatchFlags: string[] };
    recommendation: { verdict: string; reason: string };
    summary_insight?: string;
    investor_mindset_quotes?: string[];
    demand_warning?: string;
    next_action?: { label: string; targetScreen: string };
    last_updated: string;
}

export interface DashboardModel {
    id: number | string;
    verdict?: string;
    thesis?: string;
    killer_insight?: string;
    killer_insight_risk?: string;
    killer_insight_confidence?: number;
    runway_months?: number;
    burn_rate?: number;
    capital_recommendation?: string;
    top_actions?: Array<{ title: string; why: string; risk: string; screenId: string }>;
    data_sources?: string[];
    last_computed_at: string;
    model_version?: string;
}

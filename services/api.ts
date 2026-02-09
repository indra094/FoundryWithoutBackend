
import { 
  User, OrganizationModel, OrgMember, AIIdeaAnalysis, 
  FounderAlignmentModel, FinancialsModel, InvestorReadiness, DashboardModel 
} from '../models';
import { AIService } from './AIService';

// --- MOCK DATABASE HELPERS ---
const STORAGE_KEYS = {
  USERS: 'foundry_db_users',
  ORGS: 'foundry_db_orgs',
  MEMBERS: 'foundry_db_members',
  IDEA_ANALYSIS: 'foundry_db_analysis',
  FOUNDER_ALIGNMENT: 'foundry_db_alignment',
  INVESTOR_READINESS: 'foundry_db_readiness',
  FINANCIALS: 'foundry_db_financials',
  DASHBOARDS: 'foundry_db_dashboards',
};

const getTable = <T>(key: string): T[] => {
  try {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : [];
  } catch (e) {
    return [];
  }
};

const saveTable = (key: string, data: any[]) => {
  localStorage.setItem(key, JSON.stringify(data));
};

const getRecord = <T>(key: string, predicate: (item: T) => boolean): T | null => {
  const table = getTable<T>(key);
  return table.find(predicate) || null;
};

const upsertRecord = <T>(key: string, item: T, idField: keyof T = 'id' as keyof T) => {
  const table = getTable<T>(key);
  const idx = table.findIndex((r) => r[idField] === item[idField]);
  if (idx >= 0) {
    table[idx] = { ...table[idx], ...item };
  } else {
    table.push(item);
  }
  saveTable(key, table);
  return item;
};

// --- MAPPING HELPERS (DB -> App) ---

const mapUserToSchema = (user: User, member?: OrgMember) => {
  return {
    id: user.id,
    fullName: user.full_name,
    email: user.email,
    avatarUrl: user.avatar_url,
    current_org_id: user.current_org_id || "",
    status: user.status,
    industryExperience: user.industry_experience,
    // Joined from OrgMember
    role: member?.role,
    permission_level: member?.permission_level,
    equity: member?.equity,
    vesting: member?.vesting,
    commitment: member?.hours_per_week,
    salary: member?.salary,
    bonus: member?.bonus,
    startDate: member?.start_date,
    lastUpdated: member?.last_updated
  };
};

const mapOrgToWorkspace = (org: OrganizationModel) => {
  return {
    id: org.id,
    name: org.name,
    slug: org.slug,
    industry: org.industry,
    geography: org.geography,
    type: org.type,
    stage: org.stage,
    problem: org.problem,
    solution: org.solution,
    customer: org.customer,
    onboarding_step: org.onboarding_step,
    risk_level: org.risk_level,
    burn_rate: org.burn_rate,
    runway: org.runway
  };
};

// --- FALLBACK MOCK DATA GENERATORS (Used if AI fails) ---

const fallbackAnalysis = (orgId: string): AIIdeaAnalysis => ({
  workspace_id: orgId,
  version: 1,
  generated_at: new Date().toISOString(),
  seed_funding_probability: 0,
  market: {
    tam_value: 0,
    growth_rate_percent: 0,
    growth_index: 0,
    insight: "Analysis not generated."
  },
  investor: { verdict: "Pending Analysis" },
  strengths: [],
  weaknesses: [],
  personas: [],
  roadmap: {
    recommended_stage: "Pending",
    min_capital: 0,
    max_capital: 0,
    milestones: []
  }
});

const fallbackFounderAlignment = (orgId: string): FounderAlignmentModel => ({
  id: `align_${Date.now()}`,
  org_id: orgId,
  score: 0,
  risk_level: "Unknown",
  insight: "Analysis not generated.",
  factors: {
    commitment_alignment: "Unknown",
    role_clarity: "Unknown",
    authority_balance: "Unknown",
    time_commitment_balance: "Unknown",
    equity_and_incentives: "Unknown",
    risk_tolerance_alignment: "Unknown",
    governance_and_decision_making: "Unknown"
  },
  risks: [],
  actions: [],
  generated_at: new Date().toISOString(),
  model_version: "v1"
});

const fallbackInvestorReadiness = (orgId: string): InvestorReadiness => ({
  id: orgId,
  readiness_score: 0,
  last_updated: new Date().toISOString(),
  summary_insight: "Analysis not generated.",
  pushbacks: [],
  fixes: [],
  demands: [],
  simulated_reaction: [],
  investor_type: {
    primary: "Unknown",
    sectorFit: "Unknown",
    stageFit: "Unknown",
    mismatchFlags: []
  },
  recommendation: {
    verdict: "Unknown",
    reason: "Analysis not generated."
  },
  investor_mindset_quotes: [],
  demand_warning: ""
});

const fallbackDashboard = (orgId: string): DashboardModel => ({
  id: orgId,
  verdict: "Not Generated",
  thesis: "Dashboard data is currently unavailable.",
  killer_insight: "",
  killer_insight_risk: "",
  killer_insight_confidence: 0,
  runway_months: 0,
  burn_rate: 0,
  capital_recommendation: "",
  top_actions: [],
  last_computed_at: new Date().toISOString(),
  model_version: "v1"
});

// --- API IMPLEMENTATION ---

export const api = {
  // Auth
  login: async (data: any) => {
    await new Promise(r => setTimeout(r, 500)); // Sim delay
    const users = getTable<User>(STORAGE_KEYS.USERS);
    const user = users.find(u => u.email === data.email);
    
    if (!user) throw new Error("User not found");
    // In real app, hash check. Here we assume success if found for prototype
    
    // Get membership to return full user object
    const members = getTable<OrgMember>(STORAGE_KEYS.MEMBERS);
    const membership = members.find(m => m.user_id === user.id && m.org_id === user.current_org_id);

    return mapUserToSchema(user, membership);
  },

  signup: async (data: any) => {
    await new Promise(r => setTimeout(r, 800));
    const users = getTable<User>(STORAGE_KEYS.USERS);
    if (users.find(u => u.email === data.email)) throw new Error("Email already registered");

    const userId = `u_${Date.now()}`;
    const newUser: User = {
      id: userId,
      full_name: data.fullName,
      email: data.email,
      password_hash: "hashed_secret", 
      status: data.status,
      industry_experience: data.industry_experience || 0,
      avatar_url: undefined,
      current_org_id: undefined
    };

    upsertRecord(STORAGE_KEYS.USERS, newUser);
    return mapUserToSchema(newUser);
  },

  googleSignup: async (email: string) => {
    const users = getTable<User>(STORAGE_KEYS.USERS);
    let user = users.find(u => u.email === email);
    
    if (!user) {
      user = {
        id: `u_${Date.now()}`,
        full_name: "Demo User",
        email: email,
        password_hash: "google_oauth",
        status: "Active",
        current_org_id: undefined,
        industry_experience: 0
      };
      upsertRecord(STORAGE_KEYS.USERS, user);
    }
    return mapUserToSchema(user);
  },

  // Workspace
  getWorkspace: async (id: string) => {
    const org = getRecord<OrganizationModel>(STORAGE_KEYS.ORGS, (o) => o.id === id);
    return org ? mapOrgToWorkspace(org) : null;
  },

  getWorkspaces: async (email: string) => {
    const users = getTable<User>(STORAGE_KEYS.USERS);
    const user = users.find(u => u.email === email);
    if (!user) return [];

    const members = getTable<OrgMember>(STORAGE_KEYS.MEMBERS);
    const userMemberships = members.filter(m => m.user_id === user.id);
    const orgIds = userMemberships.map(m => m.org_id);
    
    const orgs = getTable<OrganizationModel>(STORAGE_KEYS.ORGS);
    return orgs.filter(o => orgIds.includes(o.id)).map(mapOrgToWorkspace);
  },

  updateDashboard: async (workspaceId: string) => {
    const org = getRecord<OrganizationModel>(STORAGE_KEYS.ORGS, o => o.id === workspaceId);
    const financials = getRecord<FinancialsModel>(STORAGE_KEYS.FINANCIALS, f => f.org_id === workspaceId);
    const members = getTable<OrgMember>(STORAGE_KEYS.MEMBERS).filter(m => m.org_id === workspaceId);
    const alignment = getRecord<FounderAlignmentModel>(STORAGE_KEYS.FOUNDER_ALIGNMENT, a => a.org_id === workspaceId);
    const ideaAnalysis = getRecord<AIIdeaAnalysis>(STORAGE_KEYS.IDEA_ANALYSIS, a => a.workspace_id === workspaceId);
    const investorReadiness = getRecord<InvestorReadiness>(STORAGE_KEYS.INVESTOR_READINESS, r => r.id === workspaceId);

    console.log("before org check");
    if (!org) throw new Error("Org not found");

    // Run AI in background
    (async () => {
      try {
        console.log("generate dashboard");
        const generatedDashboard = await AIService.generateDashboard(
          org, financials, members, alignment, ideaAnalysis, investorReadiness
        );

        const dashboard: DashboardModel = {
          id: workspaceId,
          verdict: generatedDashboard.verdict,
          thesis: generatedDashboard.thesis,
          killer_insight: generatedDashboard.killer_insight,
          killer_insight_risk: generatedDashboard.killer_insight_risk,
          killer_insight_confidence: generatedDashboard.killer_insight_confidence,
          runway_months: generatedDashboard.runway_months,
          burn_rate: generatedDashboard.burn_rate,
          capital_recommendation: generatedDashboard.capital_recommendation,
          top_actions: generatedDashboard.top_actions,
          data_sources: [
            "FinancialsModel", "OrgMemberModel", "FounderAlignmentModel", 
            "AIIdeaAnalysis", "InvestorReadiness"
          ],
          last_computed_at: new Date().toISOString(),
          model_version: "v1"
        };
        upsertRecord(STORAGE_KEYS.DASHBOARDS, dashboard);
      } catch (e) {
        console.error("AI Service failed (Dashboard), using fallback", e);
        const dashboard = fallbackDashboard(workspaceId);
        upsertRecord(STORAGE_KEYS.DASHBOARDS, dashboard);
      }
    })();

    return { status: "ok" };
  },

  createFounderAlignment: async (workspaceId: string) => {
    const members = getTable<OrgMember>(STORAGE_KEYS.MEMBERS).filter(m => m.org_id === workspaceId);
    const users = getTable<User>(STORAGE_KEYS.USERS);
    const founderData = members.map(m => ({
        user: users.find(u => u.id === m.user_id),
        member: m
    }));

    (async () => {
        try {
            const generatedAlignment = await AIService.generateFounderAlignment(founderData);
            const alignment: FounderAlignmentModel = {
                id: `align_${Date.now()}`,
                org_id: workspaceId,
                score: generatedAlignment.score,
                risk_level: generatedAlignment.risk_level,
                factors: generatedAlignment.factors,
                risks: generatedAlignment.risks,
                actions: generatedAlignment.actions,
                primary_risk: generatedAlignment.primary_risk,
                insight: generatedAlignment.insight,
                generated_at: new Date().toISOString(),
                model_version: "v1"
            };
            upsertRecord(STORAGE_KEYS.FOUNDER_ALIGNMENT, alignment, 'org_id');

            // ✅ Update Dashboard after Founder Alignment
            await api.updateDashboard(workspaceId);
        } catch (e) {
            console.error("AI Service failed (Founder Alignment), using fallback", e);
            const alignment = fallbackFounderAlignment(workspaceId);
            upsertRecord(STORAGE_KEYS.FOUNDER_ALIGNMENT, alignment, 'org_id');
            await api.updateDashboard(workspaceId);
        }
    })();

    return { status: "ok" };
  },


  createInvestorReadiness: async (workspaceId: string) => {
    const org = getRecord<OrganizationModel>(STORAGE_KEYS.ORGS, o => o.id === workspaceId);
    const financials = getRecord<FinancialsModel>(STORAGE_KEYS.FINANCIALS, f => f.org_id === workspaceId);

    if (!org || !financials) throw new Error("Missing data for analysis");

    (async () => {
        try {
            const generatedReadiness = await AIService.generateInvestorReadiness(org, financials);
            const readiness: InvestorReadiness = {
                id: workspaceId,
                readiness_score: generatedReadiness.readiness_score * 100,
                last_updated: new Date().toISOString(),
                pushbacks: generatedReadiness.pushbacks,
                fixes: generatedReadiness.fixes,
                demands: generatedReadiness.demands,
                simulated_reaction: generatedReadiness.simulated_reaction,
                investor_type: generatedReadiness.investor_type,
                recommendation: generatedReadiness.recommendation,
                summary_insight: generatedReadiness.summary_insight,
                investor_mindset_quotes: generatedReadiness.investor_mindset_quotes,
                demand_warning: generatedReadiness.demand_warning,
                next_action: generatedReadiness.next_action
            };
            upsertRecord(STORAGE_KEYS.INVESTOR_READINESS, readiness);

            // ✅ Update Dashboard after Investor Readiness
            await api.updateDashboard(workspaceId);
        } catch (e) {
            console.error("AI Service failed (Investor Readiness), using fallback", e);
            const readiness = fallbackInvestorReadiness(workspaceId);
            upsertRecord(STORAGE_KEYS.INVESTOR_READINESS, readiness);
            await api.updateDashboard(workspaceId);
        }
    })();

    return { status: "ok" };
  },

  createIdeaAnalysis: async (workspaceId: string) => {
    const org = getRecord<OrganizationModel>(STORAGE_KEYS.ORGS, o => o.id === workspaceId);
    if (!org) throw new Error("Org not found");

    const members = getTable<OrgMember>(STORAGE_KEYS.MEMBERS).filter(m => m.org_id === workspaceId);
    const users = getTable<User>(STORAGE_KEYS.USERS);
    const founders = members.map(m => ({
      user: users.find(u => u.id === m.user_id),
      member: m
    }));

    (async () => {
      try {
        const generatedAnalysis = await AIService.generateIdeaAnalysis(org, founders);
        const analysis: AIIdeaAnalysis = {
          workspace_id: workspaceId,
          version: 1,
          generated_at: new Date().toISOString(),
          seed_funding_probability: generatedAnalysis.seed_funding_probability,
          market: generatedAnalysis.market,
          investor: { verdict: generatedAnalysis.investor_verdict },
          strengths: generatedAnalysis.strengths,
          weaknesses: generatedAnalysis.weaknesses,
          personas: generatedAnalysis.personas,
          roadmap: generatedAnalysis.roadmap
        };
        upsertRecord(STORAGE_KEYS.IDEA_ANALYSIS, analysis, 'workspace_id');

        // ✅ Update Dashboard after Idea Analysis
        await api.updateDashboard(workspaceId);
      } catch (e) {
        console.error("AI Service failed (Idea Analysis), using fallback", e);
        const analysis = fallbackAnalysis(workspaceId);
        upsertRecord(STORAGE_KEYS.IDEA_ANALYSIS, analysis, 'workspace_id');
        await api.updateDashboard(workspaceId);
      }
    })();

    return { status: "ok" };
  },


  createWorkspace: async (email: string) => {
    const users = getTable<User>(STORAGE_KEYS.USERS);
    const user = users.find(u => u.email === email);
    if (!user) throw new Error("User not found");

    const orgId = `org_${Date.now()}`;
    const newOrg: OrganizationModel = {
      id: orgId,
      name: `Workspace ${new Date().toLocaleDateString()}`,
      onboarding_step: 1,
      slug: `ws-${Date.now()}`,
      risk_level: "Low",
      burn_rate: 0
    };
    upsertRecord(STORAGE_KEYS.ORGS, newOrg);

    // Update User
    user.current_org_id = orgId;
    upsertRecord(STORAGE_KEYS.USERS, user);

    // Create Member
    const newMember: OrgMember = {
      id: `mem_${orgId}_${user.id}`,
      user_id: user.id,
      org_id: orgId,
      member_type: "Founder",
      role: "CEO",
      equity: 100,
      hours_per_week: 40,
      permission_level: "ADMIN",
      status: "Active",
      start_date: new Date().toISOString().split('T')[0],
      last_updated: new Date().toISOString().split('T')[0],
      salary: 0,
      bonus: 0,
      vesting: "4 yrs, 1 yr cliff",
      expectations: "[]",
      authority: "[]",
      planned_change: "none",
      cash_contribution: 0,
      risk_tolerance: "Medium",
      vesting_cliff: 1
    };
    upsertRecord(STORAGE_KEYS.MEMBERS, newMember);

    return mapOrgToWorkspace(newOrg);
  },

  updateWorkspace: async (orgId: string, data: any) => {
    const org = getRecord<OrganizationModel>(STORAGE_KEYS.ORGS, (o) => o.id === orgId);
    if (!org) throw new Error("Workspace not found");
    const updated = { ...org, ...data };
    upsertRecord(STORAGE_KEYS.ORGS, updated);
    // Async call to founder alignment (non-blocking)
    if (orgId) {
        void (async () => {
            try {
                await api.createIdeaAnalysis(orgId);
            } catch (err) {
                console.error("Error running idea analysis:", err);
            }
        })();
    }
    return mapOrgToWorkspace(updated);
  },

  setOnboardingStep: async (workspaceId: string, step: number) => {
    const org = getRecord<OrganizationModel>(STORAGE_KEYS.ORGS, (o) => o.id === workspaceId);
    if (!org) throw new Error("Org not found");
    org.onboarding_step = Math.max(org.onboarding_step || 1, step);
    upsertRecord(STORAGE_KEYS.ORGS, org);
    return mapOrgToWorkspace(org);
  },

  // User & Members
  getUserByEmail: async (email: string) => {
    const user = getRecord<User>(STORAGE_KEYS.USERS, (u) => u.email === email);
    return user ? mapUserToSchema(user) : null;
  },

  updateUser: async (email: string, data: any) => {
    const user = getRecord<User>(STORAGE_KEYS.USERS, (u) => u.email === email);
    if (!user) throw new Error("User not found");
    
    const updated: User = { ...user };
    // Map nice names to db names
    if (data.fullName) updated.full_name = data.fullName;
    if (data.avatarUrl) updated.avatar_url = data.avatarUrl;
    if (data.industryExperience !== undefined) updated.industry_experience = data.industryExperience;
    if (data.current_org_id) updated.current_org_id = data.current_org_id;

    upsertRecord(STORAGE_KEYS.USERS, updated);
    // Async call to founder alignment (non-blocking)
    if (data.current_org_id) {
        void (async () => {
            try {
                await api.createFounderAlignment(data.current_org_id);
            } catch (err) {
                console.error("Error running founder alignment:", err);
            }
        })();
    }
    return mapUserToSchema(updated);
  },

  getUsersForOrg: async (orgId: string) => {
    const members = getTable<OrgMember>(STORAGE_KEYS.MEMBERS).filter(m => m.org_id === orgId);
    const users = getTable<User>(STORAGE_KEYS.USERS);
    
    return members.map(m => {
      const u = users.find(user => user.id === m.user_id);
      if (!u) return null;
      return mapUserToSchema(u, m);
    }).filter(u => u !== null);
  },

  getUserOrgInfo: async (userId: string, orgId: string) => {
    const members = getTable<OrgMember>(STORAGE_KEYS.MEMBERS);
    const member = members.find(m => m.user_id === userId && m.org_id === orgId);
    if (!member) return null;
    return {
      user_id: member.user_id,
      org_id: member.org_id,
      role: member.role,
      equity: member.equity,
      salary: member.salary,
      bonus: member.bonus,
      vesting: member.vesting,
      commitment: member.hours_per_week,
      status: member.status,
      permission_level: member.permission_level
    };
  },

  createUser: async (data: any) => {
    let user = getRecord<User>(STORAGE_KEYS.USERS, u => u.email === data.email);
    
    if (!user) {
      user = {
        id: `u_${Date.now()}`,
        full_name: data.fullName,
        email: data.email,
        status: data.status,
        current_org_id: data.org_id,
        password_hash: "password123", // Default for invited users
        industry_experience: 0
      };
      upsertRecord(STORAGE_KEYS.USERS, user);
      // Async call to founder alignment (non-blocking)
      if (data.org_id) {
        void (async () => {
            try {
                await api.createFounderAlignment(data.org_id);
            } catch (err) {
                console.error("Error running foudner alignment:", err);
            }
        })();
      }
    }
    
    return mapUserToSchema(user);
  },

  setUserOrgInfo: async (data: any) => {
    const members = getTable<OrgMember>(STORAGE_KEYS.MEMBERS);
    let memberIndex = members.findIndex(m => m.user_id === data.user_id && m.org_id === data.org_id);
    
    const existing = memberIndex >= 0 ? members[memberIndex] : {} as OrgMember;

    const newMemberData: OrgMember = {
        ...existing,
        id: existing.id || `mem_${data.org_id}_${data.user_id}`,
        user_id: data.user_id,
        org_id: data.org_id,
        role: data.role || existing.role || "",
        permission_level: data.permission_level || existing.permission_level || "ADMIN",
        equity: data.equity ?? existing.equity ?? 0,
        vesting: data.vesting || existing.vesting || "",
        hours_per_week: data.commitment ?? existing.hours_per_week ?? 0,
        status: data.status || existing.status || "Active",
        salary: data.salary ?? existing.salary ?? 0,
        bonus: data.bonus ?? existing.bonus ?? 0,
        last_updated: new Date().toISOString().split('T')[0],
        start_date: existing.start_date || new Date().toISOString().split('T')[0],
        member_type: existing.member_type || "Founder",
        authority: existing.authority || "[]",
        expectations: existing.expectations || "[]",
        planned_change: existing.planned_change || "none",
        cash_contribution: existing.cash_contribution || 0,
        risk_tolerance: existing.risk_tolerance || "Medium",
        vesting_cliff: existing.vesting_cliff || 1
    };

    upsertRecord(STORAGE_KEYS.MEMBERS, newMemberData);
    // Async call to founder alignment (non-blocking)
    if (data.org_id) {
      void (async () => {
          try {
              await api.createFounderAlignment(data.org_id);
          } catch (err) {
              console.error("Error running foudner alignment:", err);
          }
      })();
    }
    

    return { status: "success" };
  },

  deleteUserFromOrgByEmail: async (orgId: string, email: string) => {
    const users = getTable<User>(STORAGE_KEYS.USERS);
    const user = users.find(u => u.email === email);
    if (!user) throw new Error("User not found");

    const members = getTable<OrgMember>(STORAGE_KEYS.MEMBERS);
    const initialLength = members.length;
    // Filter out the specific membership
    const newMembers = members.filter(m => !(m.user_id === user.id && m.org_id === orgId));
    
    if (newMembers.length === initialLength) {
       // Member was not in the list
       throw new Error("User is not a member of this organization");
    }
    
    saveTable(STORAGE_KEYS.MEMBERS, newMembers);
    // Async call to founder alignment (non-blocking)
    if (orgId) {
      void (async () => {
          try {
              await api.createFounderAlignment(orgId);
          } catch (err) {
              console.error("Error running foudner alignment:", err);
          }
      })();
    }
    
    
    return { status: "success", message: "User removed from organization" };
  },

  // --- FEATURES ---

  getIdeaAnalysis: async (workspaceId: string) => {
    const analysis = getRecord<AIIdeaAnalysis>(STORAGE_KEYS.IDEA_ANALYSIS, a => a.workspace_id === workspaceId);
    return {
      analysis: analysis,
      size: 0
    };
  },

  
  getFounderAlignment: async (workspaceId: string) => {
    const alignment = getRecord<FounderAlignmentModel>(STORAGE_KEYS.FOUNDER_ALIGNMENT, a => a.org_id === workspaceId);
    return {
      alignment: alignment,
      size: 0
    };
  },

  
  getInvestorReadiness: async (workspaceId: string) => {
    const readiness = getRecord<InvestorReadiness>(STORAGE_KEYS.INVESTOR_READINESS, r => r.id === workspaceId);
    return {
      investor_readiness: readiness,
      size: 0
    };
  },
  
  getFinancials: async (workspaceId: string) => {
    return getRecord<FinancialsModel>(STORAGE_KEYS.FINANCIALS, (f) => f.org_id === workspaceId);
  },

  updateFinancials: async (workspaceId: string, data: any) => {
    const updated: FinancialsModel = { ...data, org_id: workspaceId, last_updated: new Date().toISOString() };
    upsertRecord(STORAGE_KEYS.FINANCIALS, updated, 'org_id');
    // Async call to founder alignment (non-blocking)
    if (workspaceId) {
      void (async () => {
        try {
            await api.createInvestorReadiness(workspaceId);
        } catch (err) {
            console.error("Error running investor readiness:", err);
        }
      })();
    }
    
    
    return updated;
  },

  getDashboard: async (workspaceId: string) => {
    const dashboard = getRecord<DashboardModel>(STORAGE_KEYS.DASHBOARDS, d => d.id === workspaceId);
    return {
      dashboard: dashboard,
      size: 0
    };
  }


};

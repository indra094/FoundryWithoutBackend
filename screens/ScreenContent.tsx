
import React, { useEffect, useRef } from 'react';
import { ScreenId } from '../types';

// Onboarding
import { AccountCreationScreen } from './AccountCreationScreen';
import { CompanyCreationScreen } from './CompanyCreationScreen';
import { FoundersAlignmentScreen } from './FoundersAlignmentScreen';
import { InvestorReadinessScreen } from './InvestorReadinessScreen';

// Founders
import { FoundersListScreen } from './FoundersListScreen';
import { CompanyDashboardScreen } from './CompanyDashboardScreen';
import { FinancialsScreen } from './FinancialsScreen';
import { AIIdeaValidationScreen } from './AIIdeaValidationScreen';

interface ScreenContentProps {
  screenId: ScreenId;
  onNavigate: (id: ScreenId) => void;
  active?: boolean;
}

// Set of screens that are "pages" and need their own scrolling container because they don't handle it internally
// Screens NOT in this list (e.g. FounderProfile, EquityModeling, Chat) handle their own layout/scrolling to support complex UIs.
const scrollableScreens = new Set([
  ScreenId.NOTIFICATIONS,
  ScreenId.ACCOUNT_CREATION,
  ScreenId.COMPANY_INFORMATION,
  ScreenId.FOUNDERS_ALIGNMENT,
  ScreenId.FOUNDERS_LIST,
  ScreenId.COFOUNDER_FINDING,
  ScreenId.ALIGNMENT_OVERVIEW,
  ScreenId.SCENARIO_SIMULATOR,
  ScreenId.LOCK_ALIGNMENT,
  ScreenId.ALIGNMENT_HISTORY,
  ScreenId.MY_ROLE,
  ScreenId.AI_ADVISORS_HOME,
  ScreenId.TEAM_EMPLOYEES,
  ScreenId.AI_EMPLOYEE_DETAIL,
  ScreenId.COMPANY_DASHBOARD,
  ScreenId.SUB_ORG_DETAIL,
  ScreenId.RELEVANT_CONNECTIONS,
  ScreenId.STAGES_CAPITAL,
  ScreenId.VALIDATION_CHECKLIST,
  ScreenId.BUILD_STATUS,
  ScreenId.FINANCIAL_DASHBOARD,
  ScreenId.INVESTORS_LIST,
  ScreenId.INVESTOR_DETAIL,
  ScreenId.CUSTOMERS_LIST,
  ScreenId.CUSTOMER_DETAIL,
  ScreenId.AI_IDEA_VALIDATION,
  ScreenId.INCORPORATION_READINESS,
  ScreenId.PROCEED_ANYWAY,
  ScreenId.DOCUMENTS,
  ScreenId.INVESTOR_READINESS,
  ScreenId.FINANCIALS_ONBOARDING
]);

// Placeholder for missing screens
const PlaceholderScreen: React.FC<{ title: string; onNavigate: (id: ScreenId) => void }> = ({ title }) => (
  <div className="p-10 flex flex-col items-center justify-center h-full text-center">
    <div className="text-4xl mb-4">🚧</div>
    <h2 className="text-2xl font-bold text-slate-700 mb-2">{title}</h2>
    <p className="text-slate-500">This screen is under construction.</p>
  </div>
);

export const ScreenContent: React.FC<ScreenContentProps> = ({ screenId, onNavigate }) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({
        top: 0,
        left: 0,
        behavior: 'auto',
      });
    }
  }, [screenId]);

  const renderContent = () => {
    switch (screenId) {
      // --- A. GLOBAL ---
      case ScreenId.APP_SHELL:
        return <PlaceholderScreen title="App Shell" onNavigate={onNavigate} />;
      case ScreenId.NOTIFICATIONS:
        return <PlaceholderScreen title="Notifications" onNavigate={onNavigate} />;

      // --- B. ONBOARDING ---
      case ScreenId.ACCOUNT_CREATION:
        return <AccountCreationScreen onNavigate={onNavigate} />;
      case ScreenId.FOUNDERS_LIST:
        return <FoundersListScreen onNavigate={onNavigate} />;
      case ScreenId.COMPANY_INFORMATION:
        return <CompanyCreationScreen onNavigate={onNavigate} active={true} />;
      case ScreenId.FINANCIALS_ONBOARDING:
        return <FinancialsScreen onNavigate={onNavigate} />;
      case ScreenId.FOUNDERS_ALIGNMENT:
        return <FoundersAlignmentScreen onNavigate={onNavigate} />;

      // --- C. FOUNDERS & EQUITY ---
      case ScreenId.FOUNDER_PROFILE:
        return <PlaceholderScreen title="Founder Profile" onNavigate={onNavigate} />;
      case ScreenId.COFOUNDER_FINDING:
        return <PlaceholderScreen title="Co-Founder Finding" onNavigate={onNavigate} />;
      case ScreenId.ALIGNMENT_OVERVIEW:
        return <PlaceholderScreen title="Alignment Overview" onNavigate={onNavigate} />;
      case ScreenId.EQUITY_MODELING:
        return <PlaceholderScreen title="Equity Modeling" onNavigate={onNavigate} />;
      case ScreenId.SCENARIO_SIMULATOR:
        return <PlaceholderScreen title="Scenario Simulator" onNavigate={onNavigate} />;
      case ScreenId.LOCK_ALIGNMENT:
        return <PlaceholderScreen title="Lock Alignment" onNavigate={onNavigate} />;
      case ScreenId.ALIGNMENT_HISTORY:
        return <PlaceholderScreen title="Alignment History" onNavigate={onNavigate} />;
      case ScreenId.MY_ROLE:
        return <PlaceholderScreen title="My Role" onNavigate={onNavigate} />;

      // --- D. AI & TEAM ---
      case ScreenId.AI_ADVISORS_HOME:
        return <PlaceholderScreen title="AI Advisors" onNavigate={onNavigate} />;
      case ScreenId.AI_ADVISOR_PANEL:
        return <PlaceholderScreen title="Advisor Panel" onNavigate={onNavigate} />;
      case ScreenId.TEAM_EMPLOYEES:
        return <PlaceholderScreen title="Team & Employees" onNavigate={onNavigate} />;
      case ScreenId.AI_EMPLOYEE_DETAIL:
        return <PlaceholderScreen title="AI Employee Detail" onNavigate={onNavigate} />;


      // --- E. COMPANY INTELLIGENCE ---
      case ScreenId.COMPANY_DASHBOARD:
        return <CompanyDashboardScreen onNavigate={onNavigate} />;
      case ScreenId.INVESTOR_READINESS:
        return <InvestorReadinessScreen onNavigate={onNavigate} />;
      case ScreenId.SUB_ORG_DETAIL:
        return <PlaceholderScreen title="Sub Org Detail" onNavigate={onNavigate} />;
      case ScreenId.VALIDATION_CHECKLIST:
        return <PlaceholderScreen title="Validation Checklist" onNavigate={onNavigate} />;
      case ScreenId.BUILD_STATUS:
        return <PlaceholderScreen title="Build Status" onNavigate={onNavigate} />;
      case ScreenId.FINANCIAL_DASHBOARD:
        return <PlaceholderScreen title="Financial Dashboard" onNavigate={onNavigate} />;
      case ScreenId.RELEVANT_CONNECTIONS:
        return <PlaceholderScreen title="Relevant Connections" onNavigate={onNavigate} />;
      case ScreenId.STAGES_CAPITAL:
        return <PlaceholderScreen title="Stages & Capital" onNavigate={onNavigate} />;

      // --- F. EXTERNAL RELATIONSHIPS ---
      case ScreenId.INVESTORS_LIST:
        return <PlaceholderScreen title="Investors List" onNavigate={onNavigate} />;
      case ScreenId.INVESTOR_DETAIL:
        return <PlaceholderScreen title="Investor Detail" onNavigate={onNavigate} />;
      case ScreenId.CUSTOMERS_LIST:
        return <PlaceholderScreen title="Customers List" onNavigate={onNavigate} />;
      case ScreenId.CUSTOMER_DETAIL:
        return <PlaceholderScreen title="Customer Detail" onNavigate={onNavigate} />;

      // --- G. AI & IDEA ---
      case ScreenId.AI_IDEA_VALIDATION:
        return <AIIdeaValidationScreen onNavigate={onNavigate} active={true} />;

      // --- H. GATES & SYSTEM ---
      case ScreenId.INCORPORATION_READINESS:
        return <PlaceholderScreen title="Incorporation Readiness" onNavigate={onNavigate} />;
      case ScreenId.PROCEED_ANYWAY:
        return <PlaceholderScreen title="Proceed Anyway" onNavigate={onNavigate} />;
      case ScreenId.DOCUMENTS:
        return <PlaceholderScreen title="Documents" onNavigate={onNavigate} />;

      default:
        return <div className="p-10 text-center text-slate-400">Screen content not implemented yet.</div>;
    }
  };

  const content = renderContent();

  if (scrollableScreens.has(screenId)) {
    return (
      <div
        ref={scrollRef}
        className="h-full overflow-y-auto bg-slate-50"
      >
        {content}
      </div>
    );
  }

  return <>{content}</>;
};

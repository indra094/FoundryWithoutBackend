import React, { useState, useEffect, useRef } from 'react';
import { NavGroup, ScreenId } from '../types';
import {
  Menu, Bell, Search, Lock, AlertTriangle, CheckCircle,
  Circle, PlayCircle, ChevronDown, Plus, Home, Rocket, Brain,
  Users, Target, Briefcase, DollarSign, Bot, FileText
} from 'lucide-react';
import { ScreenContent } from '../screens/ScreenContent';
import { AuthService } from '../services/AuthService';
import { WorkspaceService } from '../services/WorkspaceService';
import { ProgressBar, FoundryLogo } from './UI';
import type { User, Workspace } from '../types';

// BEFORE ONBOARDING - Minimal, completion-focused navigation
const beforeOnboardingNav: NavGroup[] = [
  {
    label: "Dashboard",
    screens: [
      { id: ScreenId.COMPANY_DASHBOARD, label: "Dashboard" }
    ]
  },
  {
    label: "Get Started",
    screens: [
      { id: ScreenId.ACCOUNT_CREATION, label: "Your Info" },
      { id: ScreenId.FOUNDERS_LIST, label: "Founding Team" },
      { id: ScreenId.COMPANY_INFORMATION, label: "Company Information" },
      { id: ScreenId.FINANCIALS_ONBOARDING, label: "Financials" }
    ]
  }/*,
  {
    label: "System",
    screens: [
      { id: ScreenId.NOTIFICATIONS, label: "Notifications" },
    ]
  }*/
];

// AFTER ONBOARDING - Full operating system navigation
const afterOnboardingNav: NavGroup[] = [
  {
    label: "Dashboard & Account Setup",
    screens: [
      { id: ScreenId.COMPANY_DASHBOARD, label: "Dashboard" },
      { id: ScreenId.ACCOUNT_CREATION, label: "Your Information" },
    ]
  },
  {
    label: "Founders and Alignment insights",
    screens: [
      { id: ScreenId.FOUNDERS_LIST, label: "Founders" },
      { id: ScreenId.FOUNDERS_ALIGNMENT, label: "Founder Alignment" },
    ]
  },
  {
    label: "Organization and Idea Insights",
    screens: [
      { id: ScreenId.COMPANY_INFORMATION, label: "Organization Information" },
      { id: ScreenId.AI_IDEA_VALIDATION, label: "Idea Insights" },
      //{ id: ScreenId.AI_IDEA_VALIDATION, label: "Idea Validation" },
      //{ id: ScreenId.FOUNDERS_ALIGNMENT, label: "Founder Alignment" },
      //{ id: ScreenId.STAGES_CAPITAL, label: "Stages & Capital" },
    ]
  },
  {
    label: "Financials and Investment Insights",
    screens: [
      { id: ScreenId.FINANCIALS_ONBOARDING, label: "Financials" },
      { id: ScreenId.INVESTOR_READINESS, label: "Investor Insights" }
      /*{ id: ScreenId.FOUNDERS_LIST, label: "Founders" },
      { id: ScreenId.COMPANY_INFORMATION, label: "Company Information" },
      { id: ScreenId.MY_ROLE, label: "My Role" },
      { id: ScreenId.TEAM_EMPLOYEES, label: "Team & Employees" },
      { id: ScreenId.EQUITY_MODELING, label: "Equity Modeling" },
      { id: ScreenId.ALIGNMENT_OVERVIEW, label: "Founder Alignment" },*/
    ]
  },
  /*
  {
    label: "Customers",
    screens: [
      { id: ScreenId.CUSTOMERS_LIST, label: "Customer Discovery" },
      { id: ScreenId.VALIDATION_CHECKLIST, label: "Validation Checklist" },
    ]
  },
  {
    label: "Investors",
    screens: [
      { id: ScreenId.INVESTORS_LIST, label: "Investor Signals" },
      { id: ScreenId.RELEVANT_CONNECTIONS, label: "Connections" },
    ]
  },
  {
    label: "Financials",
    screens: [
      { id: ScreenId.FINANCIAL_DASHBOARD, label: "Financial Dashboard" },
      { id: ScreenId.SUB_ORG_DETAIL, label: "Company Intelligence" },
      { id: ScreenId.BUILD_STATUS, label: "Build Status" },
    ]
  },
  {
    label: "AI Advisors",
    screens: [
      { id: ScreenId.AI_ADVISORS_HOME, label: "Advisory Home" },
    ]
  },
  {
    label: "System",
    screens: [
      { id: ScreenId.NOTIFICATIONS, label: "Notifications" },
      { id: ScreenId.DOCUMENTS, label: "Documents" },
    ]
  } */
];


type ScreenStatus = 'locked' | 'partial' | 'accessible';

export const Layout: React.FC = () => {
  const [workspace, setWorkspace] = useState(WorkspaceService.getCachedWorkspace());

  const initialScreen = ScreenId.COMPANY_DASHBOARD;

  const [currentScreen, setCurrentScreen] = useState<ScreenId>(initialScreen);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [switcherOpen, setSwitcherOpen] = useState(false);
  const [workspaces, setWorkspaces] = useState<any[]>([]);
  const [user, setUser] = useState(AuthService.getCachedUser());
  const [onboardingProgress, setOnboardingProgress] = useState(0);
  // Ref for switcher to detect outside clicks
  const switcherRef = useRef<HTMLDivElement>(null);
  // Add state for profile dropdown
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const unsubscribe = AuthService.onUserChange((updatedUser) => {
      setUser(updatedUser);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const refreshData = async () => {
      const u = AuthService.getCachedUser();
      if (!u) return;

      console.log("layout user", u.current_org_id);

      // Fetch workspace from server
      const user = await AuthService.getUserByEmail(u.email);
      const w = await WorkspaceService.fetchWorkspaceFromServer(user.current_org_id);

      setWorkspace(w);

      // Fetch workspaces list
      try {
        const list = await WorkspaceService.getWorkspaces(u.email);
        setWorkspaces(list);
      } catch (e) {
        console.error("Layout: Error fetching workspaces", e);
      }

      // Update onboarding progress
      if (w) {
        const progressMap = [0, 20, 40, 60, 80, 100];
        setOnboardingProgress(progressMap[Math.min(w.onboarding_step, 5)]);
      }
    };

    // Initial load
    refreshData();

    // Subscription to workspace changes
    const unsubscribe = WorkspaceService.onWorkspaceChange((w) => {
      console.log("[Layout] Workspace updated:", w);
      setWorkspace(w);

      if (w) {
        const progressMap = [0, 20, 40, 60, 80, 100];
        setOnboardingProgress(progressMap[Math.min(w.onboarding_step, 5)]);
      }
    });

    // Outside click handler for switcher/profile
    const handleClickOutside = (e: MouseEvent) => {
      if (switcherRef.current && !switcherRef.current.contains(e.target as Node)) {
        setSwitcherOpen(false);
      }
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setProfileMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      unsubscribe();
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Determine status of each screen based on onboarding step
  const getScreenStatus = (screenId: ScreenId, isActivationMode: boolean): ScreenStatus => {
    const step = workspace?.onboarding_step || 1;

    // Always accessible
    if ([ScreenId.APP_SHELL, ScreenId.NOTIFICATIONS, ScreenId.COMPANY_DASHBOARD].includes(screenId)) return 'accessible';

    // During activation (before onboarding complete)
    if (isActivationMode) {
      // Onboarding screens - only current and previous are accessible
      const onboarding_steps = [
        { id: ScreenId.COMPANY_DASHBOARD, minStep: 0 },
        { id: ScreenId.ACCOUNT_CREATION, minStep: 1 },
        { id: ScreenId.FOUNDERS_LIST, minStep: 2 },
        { id: ScreenId.COMPANY_INFORMATION, minStep: 3 },
        { id: ScreenId.FINANCIALS_ONBOARDING, minStep: 4 },
      ];

      const onboarding_step = onboarding_steps.find(s => s.id === screenId);
      if (onboarding_step) {
        return step >= onboarding_step.minStep ? 'accessible' : 'locked';
      }

      // Everything else is locked during activation
      return 'locked';
    }

    // After onboarding - everything is accessible
    return 'accessible';
  };

  const getInitials = () => {
    const name = user?.fullName?.trim();
    if (name) return name.charAt(0).toUpperCase();
    const email = user?.email?.trim();
    if (email) return email.charAt(0).toUpperCase();
    return 'U';
  };

  const handleNavClick = (screenId: ScreenId, status: ScreenStatus) => {
    if (status === 'locked') return; // Do nothing if locked
    setCurrentScreen(screenId);
    setMobileMenuOpen(false);
    setSwitcherOpen(false);
  };

  const handleSwitchWorkspace = async (w: any) => {
    await AuthService.setCurrentWorkspace(w);
    setWorkspace(w);
    setWorkspace(w);
    setSwitcherOpen(false);
    setCurrentScreen(ScreenId.COMPANY_DASHBOARD);
  };

  const handleCreateNewCompany = async () => {
    setSwitcherOpen(false);
    const w = await WorkspaceService.createWorkspace(user?.email || '');
    await AuthService.setCurrentWorkspace(w);
    setWorkspace(w);
    setWorkspace(w);
    setCurrentScreen(ScreenId.COMPANY_DASHBOARD);

    // Refresh list
    const list = await WorkspaceService.getWorkspaces(user?.email || '');
    setWorkspaces(list);
  };

  const companyName = workspace?.name || "New Startup";
  const onboarding_step = workspace?.onboarding_step ?? 0;

  const stage =
    onboarding_step < 5
      ? "Onboarding in progress."
      : "Onboarding complete.";

  // Determine which navigation to show
  const isActivationMode = (workspace?.onboarding_step || 0) < 5;
  const currentNav = isActivationMode ? beforeOnboardingNav : afterOnboardingNav;

  // Hide search/notifications during early onboarding to minimize distraction
  const isSetupMode = (workspace?.onboarding_step || 0) < 5;

  return (
    <div className="flex h-screen w-full bg-white text-slate-900 font-sans overflow-hidden">
      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-slate-200 text-slate-600 transform transition-transform duration-300 md:relative md:translate-x-0 flex flex-col ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}>

        {/* Brand Header */}
        <div
          className="p-4 border-b border-slate-100 flex items-center gap-3 cursor-pointer hover:bg-slate-50 transition-colors shrink-0"
          onClick={() => setCurrentScreen(ScreenId.COMPANY_DASHBOARD)}
        >
          <div className="w-10 h-10 flex items-center justify-center">
            <FoundryLogo className="w-full h-full rounded-lg" />
          </div>
          <span className="font-bold text-slate-900 tracking-wide text-xl">Foundry</span>
        </div>

        {/* Progress Bar Area - Only show during activation */}
        {isActivationMode && (
          <div className="p-4 border-b border-slate-100 bg-slate-50/50">
            <div className="flex justify-between text-xs font-bold text-slate-400 uppercase mb-2">
              <span>Setup Progress</span>
              <span>{onboardingProgress}%</span>
            </div>
            <ProgressBar value={onboardingProgress} height="h-1.5" className="bg-slate-200" color="bg-indigo-500" />
          </div>
        )}

        {/* Navigation List */}
        <nav className="flex-1 overflow-y-auto p-4 space-y-6 scrollbar-hide">
          {currentNav.map((group) => (
            <div key={group.label} className="animate-in fade-in slide-in-from-left-2 duration-300">
              <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3 pl-2">{group.label}</h3>
              <ul className="space-y-0.5">
                {group.screens.map((screen) => {
                  const status = getScreenStatus(screen.id, isActivationMode);
                  const isActive = currentScreen === screen.id;

                  let Icon = Circle;
                  let statusColor = "text-slate-400";
                  let containerClass = "hover:bg-slate-50 text-slate-600";

                  if (isActive) {
                    Icon = PlayCircle;
                    statusColor = "text-indigo-600";
                    containerClass = "bg-indigo-50 text-indigo-700 shadow-sm border border-indigo-100";
                  } else if (status === 'locked') {
                    Icon = Lock;
                    statusColor = "text-slate-300";
                    containerClass = "text-slate-400 cursor-not-allowed opacity-60";
                  } else if (status === 'partial') {
                    Icon = AlertTriangle;
                    statusColor = "text-amber-500";
                    containerClass = "hover:bg-slate-50 text-slate-600";
                  } else {
                    // Accessible
                    Icon = CheckCircle;
                    statusColor = "text-emerald-500";
                    containerClass = "hover:bg-slate-50 text-slate-600";
                  }

                  return (
                    <li key={screen.id} className="relative group/tooltip">
                      <button
                        onClick={() => handleNavClick(screen.id, status)}
                        className={`w-full flex items-center gap-3 px-3 py-2 text-xs font-medium rounded-md transition-all ${containerClass}`}
                        title={status === 'locked' ? "Complete onboarding to unlock." : ""}
                      >
                        <Icon className={`w-3.5 h-3.5 ${statusColor}`} />
                        <span className="truncate">{screen.label}</span>

                        {/* Status Indicators */}
                        {status === 'partial' && <span className="ml-auto w-1.5 h-1.5 rounded-full bg-amber-500"></span>}
                        {status === 'locked' && <Lock className="ml-auto w-3 h-3 opacity-50" />}
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </nav>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        {/* Top Header */}
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-4 md:px-6 shrink-0">
          <div className="flex items-center gap-3">
            <button className="md:hidden p-2 text-slate-600" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
              <Menu />
            </button>

            {/* Company Switcher */}
            <div ref={switcherRef} className="relative">
              <div
                className="flex items-center gap-2 px-3 py-1.5 hover:bg-slate-50 rounded-lg cursor-pointer transition-colors group"
                onClick={() => setSwitcherOpen(!switcherOpen)}
              >
                <div className="flex flex-col">
                  <span className="font-bold text-slate-900 text-lg leading-none">{companyName}</span>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tight mt-1">Switch Company</span>
                </div>
                <ChevronDown className={`w-4 h-4 text-slate-400 group-hover:text-slate-600 transition-transform ${switcherOpen ? 'rotate-180' : ''}`} />
              </div>

              {switcherOpen && (
                <div className="absolute top-full left-0 mt-2 w-72 bg-white border border-slate-200 rounded-2xl shadow-2xl z-[100] overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                  <div className="p-3 border-b border-slate-100 bg-slate-50/50">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-2">Your Companies</span>
                  </div>
                  <div className="max-h-60 overflow-y-auto py-1">
                    {workspaces.map((w) => (
                      <button
                        key={w.id}
                        onClick={() => handleSwitchWorkspace(w)}
                        className={`w-full flex items-center justify-between px-4 py-3 hover:bg-indigo-50 transition-colors text-left ${workspace?.id === w.id ? 'bg-indigo-50/50' : ''}`}
                      >
                        <div>
                          <div className={`font-bold ${workspace?.id === w.id ? 'text-indigo-600' : 'text-slate-700'}`}>{w.name}</div>
                          <div className="text-[10px] text-slate-400 font-medium">{w.onboarding_step === 5 ? 'Onboarding complete.' : 'Onboarding in progress.'}</div>
                        </div>
                        {workspace?.id === w.id && <CheckCircle className="w-4 h-4 text-indigo-500" />}
                      </button>
                    ))}
                  </div>
                  <button
                    onClick={handleCreateNewCompany}
                    className="w-full flex items-center gap-3 px-4 py-4 border-t border-slate-100 hover:bg-emerald-50 text-emerald-600 transition-colors text-left"
                  >
                    <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center">
                      <Plus className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="font-bold text-sm">Create New Company</div>
                      <div className="text-[10px] text-emerald-500/70 font-medium">Start your next venture</div>
                    </div>
                  </button>
                </div>
              )}
            </div>

            {stage && (
              <span className="hidden sm:inline-block px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 text-xs border border-indigo-100 font-medium ml-2">
                {stage}
              </span>
            )}
          </div>

          <div className="flex items-center gap-4">
            {/* Only show search after setup is well underway */}
            {/* {!isSetupMode && (
              <div className="relative hidden md:block">
                <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                <input type="text" placeholder="Search anything..." className="pl-9 pr-4 py-2 border border-slate-200 rounded-full text-sm bg-slate-50 focus:bg-white focus:ring-2 focus:ring-indigo-100 outline-none w-64 transition-all" />
              </div>
            )} */}

            {/* Notifications */}
            {/* <button className="relative p-2 text-slate-500 hover:bg-slate-50 rounded-full" onClick={() => setCurrentScreen(ScreenId.NOTIFICATIONS)}>
              <Bell className="w-5 h-5" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
            </button> */}
            <div className="h-6 w-px bg-slate-200 mx-2 hidden md:block"></div>

            {/* User Profile */}
            <div ref={profileRef} className="relative">
              <div
                className="flex items-center gap-3 cursor-pointer hover:bg-slate-50 p-1.5 rounded-full pr-3 transition-colors"
                onClick={() => setProfileMenuOpen(!profileMenuOpen)}
              >
                <div className="w-8 h-8 rounded-full bg-indigo-500 flex items-center justify-center text-white font-bold text-xs border border-slate-200 shadow-sm">
                  {getInitials()}
                </div>
                <div className="hidden md:block text-left">
                  {user?.fullName ? (
                    <>
                      <div className="text-sm font-bold text-slate-800 leading-none">{user.fullName}</div>
                      <div className="text-[10px] text-slate-500 leading-none mt-1">{user.email}</div>
                    </>
                  ) : (
                    <div className="text-sm font-bold text-slate-800 leading-none">{user?.email || "Guest"}</div>
                  )}
                </div>
                <svg className="w-4 h-4 text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="m6 9 6 6 6-6" />
                </svg>
              </div>

              {/* Dropdown Menu */}
              {profileMenuOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white border border-slate-200 rounded-2xl shadow-2xl z-[100] overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                  <button
                    className="w-full text-left px-4 py-3 hover:bg-slate-50 transition-colors text-sm font-medium text-slate-700"
                    onClick={() => {
                      setProfileMenuOpen(false);
                      setCurrentScreen(ScreenId.ACCOUNT_CREATION); // Navigate to user info screen
                    }}
                  >
                    Change User Info
                  </button>
                  <button
                    className="w-full text-left px-4 py-3 hover:bg-slate-50 transition-colors text-sm font-medium text-red-600"
                    onClick={() => {
                      setProfileMenuOpen(false);
                      AuthService.logout();
                      window.location.reload(); // Or navigate to login
                    }}
                  >
                    Log Out
                  </button>
                </div>
              )}
            </div>

          </div>
        </header>

        {/* Screen Content Wrapper */}
        <main className="flex-1 overflow-hidden relative bg-slate-50/50">
          <ScreenContent
            screenId={currentScreen}
            onNavigate={setCurrentScreen}
            active={currentScreen === ScreenId.COMPANY_INFORMATION}
          />
        </main>
      </div>
    </div>
  );
};
import React, { useState, useRef, useEffect } from 'react';
import { ScreenId } from '../types';
import { Button } from '../components/UI';
import { UserIcon, Mail, Loader2, ArrowRight, Calendar, RefreshCcw } from 'lucide-react';
import { AuthService } from '../services/AuthService';
import { WorkspaceService } from '../services/WorkspaceService';
import { TeamService } from '../services/TeamService';
import type { User, Workspace } from '../types';


interface ScreenProps {
  onNavigate: (id: ScreenId) => void;
}

export const AccountCreationScreen: React.FC<ScreenProps> = ({ onNavigate }) => {
  const [fullName, setFullName] = useState(AuthService.getCachedUser()?.fullName || '');
  const [email, setEmail] = useState(AuthService.getCachedUser()?.email || '');
  const [role, setRole] = useState<string | null>(null);
  const [roleLoading, setRoleLoading] = useState(true);

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [retryLocked, setRetryLocked] = useState(false);
  const [retryTimer, setRetryTimer] = useState(0);
  const [workspace, setWorkspace] = useState<Workspace | null>(null);
  const [isOnboardingComplete, setIsOnboardingComplete] = useState(false);
  let currentUser: User | null = null;
  let currentWorkspace: Workspace | null = null;
  const [industry_experience, setindustry_experience] = useState<number | null>(null);


  const hasLoaded = useRef(false);
  const loadWorkspace = async () => {
    const user = AuthService.getCachedUser();
    if (!user?.current_org_id) return;

    const ws = await WorkspaceService.fetchWorkspaceFromServer(user.current_org_id);
    setWorkspace(ws);
    setIsOnboardingComplete((ws?.onboarding_step ?? 0) >= 5);
  };

  const loadAllData = async () => {
    try {
      await loadWorkspace();
      const user = AuthService.getCachedUser();
      if (!user) return;

      const userByEmail = await AuthService.getUserByEmail(user.email);
      setFullName(userByEmail.fullName);
      setEmail(userByEmail.email);
      setindustry_experience(userByEmail.industry_experience ?? null);

      //if (!user.current_org_id) return;

      //await loadWorkspace();
    } catch (err) {
      console.error("Failed to load user/org info", err);
    } finally {
      setRoleLoading(false);
    }
  };

  useEffect(() => {
    if (!hasLoaded.current) {
      loadAllData();
      hasLoaded.current = true;
    }
  }, []);

  // --- Handle refresh click ---
  const handleRefresh = async () => {
    setIsLoading(true);
    await loadAllData();
    setIsLoading(false);
  };


  const handleContinue = async () => {
    if (!fullName || !email) return;

    setIsLoading(true);
    setError(null);

    try {
      const user = AuthService.getCachedUser();
      const ws = await WorkspaceService.fetchWorkspaceFromServer(user?.current_org_id);
      console.log(industry_experience)
      // Only now do we call RPCs
      await AuthService.updateUser({ fullName, email, industry_experience, current_org_id: ws?.id });

      if (ws && user) {
        await TeamService.setUserOrgInfo(user.id, ws.id, "ADMIN", 100, "", 60);
      }

      if (ws && !isOnboardingComplete) {
        await WorkspaceService.setOnboarding(ws.id, Math.max(ws?.onboarding_step || 0, 2));
        onNavigate(ScreenId.FOUNDERS_LIST);
      }
    } catch (err: any) {
      setError(err?.message || "Something went wrong");

      setRetryLocked(true);
      setRetryTimer(5);

      const timer = setInterval(() => {
        setRetryTimer((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            setRetryLocked(false);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } finally {
      setIsLoading(false);
    }
  };


  const roles = ['Founder', 'Executive', 'Investor', 'Advisor'];
  return (
    <div className="max-w-md mx-auto py-12 px-6">
      <header className="text-center mb-10">
        <h1 className="text-3xl font-bold text-slate-900 mb-2">Your Info</h1>
        <p className="text-slate-500">Let's get to know you first.</p>
        <button
          onClick={handleRefresh}
          disabled={isLoading}
          className="p-2 rounded-full hover:bg-slate-100 transition"
        >
          <RefreshCcw className={`w-6 h-6 ${isLoading ? 'animate-spin' : ''}`} />
        </button>
      </header>

      <div className="space-y-6">
        <div>
          <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Full Name</label>
          <div className="relative">
            <UserIcon className="absolute left-3 top-3 w-5 h-5 text-slate-400" />
            <input
              type="text"
              className="w-full pl-11 pr-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500 outline-none transition-all"
              placeholder="Full Name"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Email Address</label>
          <div className="relative">
            <Mail className="absolute left-3 top-3 w-5 h-5 text-slate-400" />
            <input
              type="email"
              className="w-full pl-11 pr-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500 outline-none transition-all"
              placeholder="email@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
        </div>

        {/* NEW: Industry Experience */}
        <div>
          <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">
            Industry Experience (years) <span className="text-slate-400 font-normal">(optional)</span>
          </label>
          <div className="relative">
            <Calendar className="absolute left-3 top-3 w-5 h-5 text-slate-400" />
            <input
              type="number"
              min={0}
              step={1}
              className="w-full pl-11 pr-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500 outline-none transition-all"
              placeholder="e.g. 3"
              value={industry_experience ?? ''}
              onChange={(e) => {
                const val = e.target.value;
                const num = val === '' ? null : parseInt(val);
                if (num === null || (Number.isInteger(num) && num >= 0)) {
                  setindustry_experience(num);
                }
              }}
            />
          </div>
        </div>

        <div className="pt-4">
          <Button
            fullWidth
            className="h-14 rounded-xl text-lg flex items-center justify-center gap-2"
            onClick={handleContinue}
            disabled={!fullName || !email || isLoading || retryLocked}
          >
            {isLoading ? (
              <Loader2 className="w-6 h-6 animate-spin" />
            ) : retryLocked ? (
              <>Retry in {retryTimer}s</>
            ) : isOnboardingComplete ? (
              <>Save</>
            ) : (
              <>Save & Continue <ArrowRight className="w-6 h-6" /></>
            )}
          </Button>

          {error && (
            <p className="mt-3 text-sm text-red-500 text-center">
              {error}
            </p>
          )}
        </div>
      </div>
    </div>
  );

};

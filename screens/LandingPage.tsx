import React, { useState } from 'react';
import { Button, FoundryLogo } from '../components/UI';
import { Users, PieChart, Cpu, Rocket, ChevronRight, X, Loader2 } from 'lucide-react';
import { AuthService } from '../services/AuthService';

export const LandingPage: React.FC<{ onEnterApp: () => void }> = ({ onEnterApp }) => {
  const [authMode, setAuthMode] = useState<'login' | 'signup' | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Form State for Validation
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const openLogin = () => {
    setAuthMode('login');
    setFullName('');
    setEmail('');
    setPassword('');
    setErrorMsg(null);
  };

  const openSignup = () => {
    setAuthMode('signup');
    setFullName('');
    setEmail('');
    setPassword('');
    setErrorMsg(null);
  };

  const closeAuth = () => {
    setAuthMode(null);
    setErrorMsg(null);
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg(null);

    try {
      if (authMode === 'signup') {
        // Create new user, step 1 of onboarding
        await AuthService.signup(fullName, email, password);
      } else {
        // Login existing user, retrieve workspace data
        await AuthService.login(email, password);
      }

      onEnterApp();
    } catch (error: any) {
      console.error("Auth failed", error);
      setErrorMsg(error.message || "Authentication failed. Please check your credentials.");

      // If 404/User not found, maybe suggest signup?
      if (error.message && error.message.includes("404")) {
        setErrorMsg("Account not found. Please sign up first.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    console.log("Google Login Clicked");
    setIsLoading(true);
    try {
      // Must match seeded user email for now
      const user = await AuthService.googleSignup("indra094@gmail.com");
      console.log("Google Signup Success:", user);
      setIsLoading(false);
      onEnterApp();
    } catch (e) {
      console.error("Google Signup Failed:", e);
      alert("Google Login failed: Account must exist in database.");
      setIsLoading(false);
    }
  };

  const isSignup = authMode === 'signup';

  const isFormValid = isSignup
    ? fullName.trim() !== '' && email.trim() !== '' && password.trim() !== ''
    : email.trim() !== '' && password.trim() !== '';

  return (
    <div className="min-h-screen bg-white font-sans text-slate-900">
      {/* Auth Modal Overlay */}
      {authMode && (
        <div className="fixed inset-0 z-[100] overflow-y-auto bg-slate-400/20 backdrop-blur-sm animate-in fade-in duration-200" onClick={closeAuth}>
          <div className="min-h-full flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden relative animate-in zoom-in-95 duration-200" onClick={(e) => e.stopPropagation()}>
              <button
                onClick={closeAuth}
                disabled={isLoading}
                className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors disabled:opacity-50"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="p-8 pt-10">
                <div className="text-center mb-8">
                  <div className="inline-flex justify-center mb-4 transform scale-125"><FoundryLogo /></div>
                  <h2 className="text-2xl font-bold text-slate-900">
                    {isSignup ? 'Create your account' : 'Welcome back'}
                  </h2>
                  <p className="text-slate-500 mt-2 text-sm">
                    {isSignup ? 'Start building your startup operating system' : 'Log in to your Foundry workspace'}
                  </p>
                </div>


                <div className="relative mb-6">
                  <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-200"></div></div>
                  <div className="relative flex justify-center text-xs uppercase tracking-wide font-semibold"><span className="px-3 bg-white text-slate-400">Sign in with email</span></div>
                </div>



                {errorMsg && (
                  <div className="mb-6 p-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg flex items-start gap-2">
                    <span className="mt-0.5">⚠️</span>
                    <span>{errorMsg}</span>
                  </div>
                )}

                <form onSubmit={handleAuthSubmit} className="space-y-4">
                  {isSignup && (
                    <div className="space-y-1 animate-in slide-in-from-top-2 duration-200">
                      <label className="block text-sm font-semibold text-slate-700 ml-1">Full Name</label>
                      <input
                        type="text"
                        required
                        disabled={isLoading}
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        placeholder="Jane Founder"
                        className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 outline-none transition-all placeholder:text-slate-400 disabled:bg-slate-50 disabled:text-slate-500"
                      />
                    </div>
                  )}
                  <div className="space-y-1">
                    <label className="block text-sm font-semibold text-slate-700 ml-1">Email</label>
                    <input
                      type="email"
                      required
                      disabled={isLoading}
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="name@company.com"
                      className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 outline-none transition-all placeholder:text-slate-400 disabled:bg-slate-50 disabled:text-slate-500"
                      autoFocus={!isSignup}
                    />
                  </div>
                  <div className="space-y-1">
                    <div className="flex justify-between ml-1">
                      <label className="block text-sm font-semibold text-slate-700">Password</label>
                    </div>
                    <input
                      type="password"
                      required
                      disabled={isLoading}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 outline-none transition-all placeholder:text-slate-400 disabled:bg-slate-50 disabled:text-slate-500"
                    />
                  </div>
                  <Button
                    fullWidth
                    disabled={isLoading || !isFormValid}
                    className="h-12 text-base shadow-lg shadow-indigo-200/50 mt-2 flex items-center justify-center gap-2"
                  >
                    {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                    {isSignup ? 'Create Account' : 'Log In'}
                  </Button>
                </form>

                <div className="mt-6 text-center text-sm text-slate-500">
                  {isSignup ? (
                    <>Already have an account? <button onClick={openLogin} disabled={isLoading} className="text-indigo-600 font-semibold hover:underline disabled:opacity-50">Log in</button></>
                  ) : (
                    <>Don't have an account? <button onClick={openSignup} disabled={isLoading} className="text-indigo-600 font-semibold hover:underline disabled:opacity-50">Sign up</button></>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b border-slate-100 bg-white/80 backdrop-blur-md">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 cursor-pointer" onClick={scrollToTop}>
            <FoundryLogo />
            <span className="text-xl font-bold tracking-tight">Foundry</span>
          </div>
          <div className="flex items-center gap-4">
            <button onClick={openLogin} className="text-sm font-medium text-slate-600 hover:text-indigo-600 hidden md:block">Log in</button>
            <Button onClick={openSignup} className="rounded-full px-6">Sign Up</Button>
          </div>
        </div>
      </header>

      {/* Hero and other sections remain same... */}
      <section className="pt-20 pb-32 px-4">
        <div className="container mx-auto max-w-4xl text-center">
          <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-slate-900 mb-6">

            Align, Decide, <span className="text-indigo-600">Act.</span>
          </h1>
          <p className="text-xl text-slate-600 mb-10 max-w-2xl mx-auto leading-relaxed">
            Make founder decisions clear before they become expensive.
            Foundry is the operating system for early-stage alignment, equity modeling, and diligence.
          </p>
        </div>
      </section>


      <section className="px-8 py-16 bg-gray-50">
        <h2 className="text-3xl font-semibold text-center mb-4">
          Understand Your Startup Like an Investor
        </h2>
        <p className="text-center text-gray-600 mb-12">
          We analyze your startup the same way investors do — team, idea,
          market, and financials.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto">
          <FeatureBox
            title="Analyze Your Startup"
            icon="📊"
            description="Structured evaluation of founders, idea, market, and financial health."
          />
          <FeatureBox
            title="AI-Driven Insights"
            icon="🧠"
            description="Surface the single biggest risks and leverage points investors care about."
          />
          <FeatureBox
            title="Clear Next Actions"
            icon="🎯"
            description="Concrete steps to improve alignment, traction, and readiness to raise."
          />
        </div>
      </section>

      {/* ============ HOW IT WORKS ============ */}
      <section className="px-8 py-16">
        <h3 className="text-2xl font-semibold text-center mb-10">
          How It Works
        </h3>

        <div className="flex flex-col md:flex-row justify-center items-center gap-8 text-center">
          <Step number="1" text="Enter your startup details" />
          <Step number="2" text="We analyze your data in real time" />
          <Step number="3" text="Get an investor-style dashboard" />
        </div>
      </section>

      {/* ============ WHAT YOU’LL SEE ============ */}
      <section className="px-8 py-16 bg-gray-50">
        <h3 className="text-2xl font-semibold text-center mb-12">
          What You’ll See
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto">
          <FeatureBox
            title="Executive Summary"
            icon="📌"
            description="A plain-English snapshot of your startup’s overall health."
          />
          <FeatureBox
            title="Killer Insight"
            icon="🔥"
            description="The single most important factor helping or hurting investment."
          />
          <FeatureBox
            title="Investor Readiness Signal"
            icon="📈"
            description="A clear signal showing how ready you are to raise capital."
          />
        </div>
      </section>

      {/* ============ GET STARTED ============ */}
      <section className="px-8 py-20 text-center">
        <h3 className="text-3xl font-semibold mb-4">
          See Your Startup Through an Investor’s Eyes
        </h3>
        <p className="text-gray-600 mb-8">
          No fluff. No generic advice. Just clarity.
        </p>

        <button onClick={openSignup} className="px-8 py-4 bg-black text-white rounded-lg text-lg">
          Get Started
        </button>
      </section>

      <footer className="py-12 bg-white border-t border-slate-100">
        <div className="container mx-auto px-4 text-center text-slate-500 text-sm">
          <p>© 2026 Foundry Inc. Building the future of company building.</p>
        </div>
      </footer>
    </div >
  );
};

interface FeatureBoxProps {
  title: string;
  description: string;
  icon: string;
}

const FeatureBox: React.FC<FeatureBoxProps> = ({ title, description, icon }) => (
  <div className="bg-white border rounded-xl p-6 shadow-sm hover:shadow-md transition">
    <div className="text-3xl mb-4">{icon}</div>
    <h4 className="text-lg font-semibold mb-2">{title}</h4>
    <p className="text-gray-600 text-sm">{description}</p>
  </div>
);

interface StepProps {
  number: string;
  text: string;
}

const Step: React.FC<StepProps> = ({ number, text }) => (
  <div className="flex flex-col items-center">
    <div className="w-10 h-10 rounded-full bg-black text-white flex items-center justify-center mb-2">
      {number}
    </div>
    <p className="text-gray-700 text-sm">{text}</p>
  </div>
);

import React, { useState, useEffect } from 'react';
import {
    Building,
    Loader2,
    ArrowRight,
    CheckCircle2,
    Target,
    MapPin,
    Briefcase,
    Users,
    RefreshCw
} from 'lucide-react';
import { AuthService } from '../services/AuthService';
import { WorkspaceService } from '../services/WorkspaceService';
import { ScreenId } from '../types';

// --- CSS Styles (Light Mode) ---

const styles = `
  :root {
    --primary: #4f46e5;
    --primary-hover: #4338ca;
    --primary-light: #eef2ff;
    --text-main: #0f172a;
    --text-muted: #64748b;
    --text-light: #94a3b8;
    --bg-page: #f8fafc;
    --bg-card: #ffffff;
    --border: #e2e8f0;
    --danger: #ef4444;
    --danger-bg: #fef2f2;
    --success: #22c55e;
  }

  .container {
    max-width: 800px;
    margin: 0 auto;
    padding: 40px 20px;
  }

  /* Typography */
  h1 { font-size: 2rem; font-weight: 800; color: var(--text-main); letter-spacing: -0.025em; margin-bottom: 0.5rem; }
  h2 { font-size: 1.25rem; font-weight: 700; color: var(--text-main); margin-bottom: 1rem; margin-top: 2rem; }
  .subtitle { color: var(--text-muted); font-size: 1.1rem; margin-bottom: 2.5rem; }
  
  .label {
    display: block;
    font-size: 0.75rem;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    color: var(--text-light);
    margin-bottom: 0.5rem;
  }
  
  .required { color: var(--danger); margin-left: 2px; }

  /* Forms */
  .form-section {
    background: var(--bg-card);
    border: 1px solid var(--border);
    border-radius: 16px;
    padding: 32px;
    margin-bottom: 24px;
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.02);
  }

  .input-group { margin-bottom: 24px; position: relative; }
  
  .input-wrapper { position: relative; }
  .input-icon {
    position: absolute;
    left: 16px;
    top: 50%;
    transform: translateY(-50%);
    color: var(--text-light);
    pointer-events: none;
  }

  input[type="text"], textarea {
    width: 100%;
    padding: 14px 16px;
    background: #fff;
    border: 1px solid var(--border);
    border-radius: 12px;
    font-size: 1rem;
    color: var(--text-main);
    transition: all 0.2s;
    outline: none;
    font-family: inherit;
  }

  .has-icon { padding-left: 48px !important; }

  input[type="text"]:focus, textarea:focus {
    border-color: var(--primary);
    box-shadow: 0 0 0 4px var(--primary-light);
  }

  input.error, textarea.error {
    border-color: var(--danger);
    background-color: var(--danger-bg);
  }

  .error-msg {
    font-size: 0.8rem;
    color: var(--danger);
    margin-top: 6px;
    display: flex;
    align-items: center;
    gap: 4px;
  }

  /* Grid Buttons (Company Type / Stage) */
  .grid-options {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(100px, 1fr));
    gap: 12px;
  }

  .option-btn {
    padding: 12px;
    border: 1px solid var(--border);
    background: white;
    border-radius: 12px;
    font-size: 0.9rem;
    font-weight: 600;
    color: var(--text-muted);
    cursor: pointer;
    transition: all 0.2s;
  }

  .option-btn:hover { border-color: var(--primary); color: var(--primary); }
  
  .option-btn.selected {
    background: var(--primary-light);
    border-color: var(--primary);
    color: var(--primary);
    box-shadow: 0 2px 4px rgba(79, 70, 229, 0.1);
  }

  /* Main Button */
  .btn-primary {
    width: 100%;
    height: 56px;
    background-color: var(--primary);
    color: white;
    border: none;
    border-radius: 14px;
    font-size: 1.1rem;
    font-weight: 700;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 10px;
    cursor: pointer;
    transition: all 0.2s;
    box-shadow: 0 4px 6px -1px rgba(79, 70, 229, 0.2);
  }

  .btn-primary:hover:not(:disabled) {
    background-color: var(--primary-hover);
    transform: translateY(-1px);
    box-shadow: 0 6px 8px -1px rgba(79, 70, 229, 0.3);
  }

  .btn-primary:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
  }

  .btn-retry {
    margin-top: 12px;
    background-color: white;
    color: var(--text-main);
    border: 1px solid var(--border);
  }
  .btn-retry:hover { background-color: var(--bg-page); }

  /* Animations */
  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(10px); }
    to { opacity: 1; transform: translateY(0); }
  }

  .animate-fade-in { animation: fadeIn 0.4s ease forwards; }

  /* Two Column Grid */
  .grid-2 {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 24px;
  }

  @media (max-width: 640px) {
    .grid-2 { grid-template-columns: 1fr; }
    .container { padding: 20px 16px; }
  }
`;

// --- Component ---

interface ScreenProps {
    onNavigate: (id: ScreenId) => void;
    active: boolean;
}

type FormData = {
    name: string;
    type: string;
    problem: string;
    solution: string;
    industry: string;
    geography: string;
    stage: string;
    customer: string;
};

type TouchedState = {
    name: boolean;
    type: boolean;
    problem: boolean;
    solution: boolean;
};

export const CompanyCreationScreen: React.FC<ScreenProps> = ({ onNavigate, active }) => {
    // --- State ---
    const [formData, setFormData] = useState<FormData>({
        name: '',
        type: '',
        problem: '',
        solution: '',
        industry: '',
        geography: '',
        stage: '',
        customer: ''
    });

    const [touched, setTouched] = useState<Record<keyof TouchedState, boolean>>({
        name: false,
        type: false,
        problem: false,
        solution: false
    });

    // Remove unused currentWorkspace, name, type state
    const [isLoading, setIsLoading] = useState(false);
    const [retryCooldown, setRetryCooldown] = useState(0);
    const [error, setError] = useState<string | null>(null);
    const [customType, setCustomType] = useState('');


    // --- Effects ---

    const handleCreate = async () => {
        if (!formData.name || !formData.type || !formData.problem || !formData.solution) return;

        setIsLoading(true);
        setError(null);

        try {
            const workspace = WorkspaceService.getCachedWorkspace();
            if (!workspace) return;
            await WorkspaceService.updateWorkspace(workspace.id, {
                ...formData,
                onboarding_step: Math.max(workspace.onboarding_step, 4)
            });


            if (workspace.onboarding_step < 5) {
                onNavigate(ScreenId.FINANCIALS_ONBOARDING);
            }
        } catch (err: any) {
            setError(err?.message || "Something went wrong.");
            setRetryCooldown(5);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSave = async () => {
        if (!formData.name || !formData.type || !formData.problem || !formData.solution) return;

        setIsLoading(true);
        setError(null);

        try {
            const workspace = WorkspaceService.getCachedWorkspace();
            if (!workspace) return;
            await WorkspaceService.updateWorkspace(workspace.id, {
                ...formData,
                onboarding_step: Math.max(workspace.onboarding_step, 4)
            });

            if (workspace.onboarding_step < 5) {
                onNavigate(ScreenId.FINANCIALS_ONBOARDING);
            }
        } catch (err: any) {
            setError(err?.message || "Something went wrong.");
            setRetryCooldown(5);
        } finally {
            setIsLoading(false);
        }
    };




    // --- Handlers ---

    const handleChange = <K extends keyof FormData>(field: K, value: FormData[K]) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        if (error) setError(null);
    };

    const handleBlur = (field: keyof TouchedState) => {
        setTouched(prev => ({ ...prev, [field]: true }));
    };
    const requiredFields: (keyof TouchedState)[] = [
        'name',
        'type',
        'problem',
        'solution'
    ];


    const validate = () => {
        let valid = true;
        const newTouched = { ...touched };

        requiredFields.forEach(field => {
            newTouched[field] = true;
            if (!formData[field]) valid = false;
        });

        setTouched(newTouched);
        return valid;
    };


    // Always get latest onboarding_step from workspace
    const [onboarding_step, setOnboardingStep] = useState(0);


    // Unified fetch function
    const loadWorkspaceData = async () => {
        const orgId = AuthService.getCachedUser()?.current_org_id;
        if (!orgId) return;

        // Fetch workspace info
        const ws = await WorkspaceService.fetchWorkspaceFromServer(orgId);

        // Update form data
        setFormData(prev => ({
            ...prev,
            name: ws.name ?? prev.name,
            type: ws.type ?? prev.type,
            problem: ws.problem ?? prev.problem,
            solution: ws.solution ?? prev.solution,
            industry: ws.industry ?? prev.industry,
            geography: ws.geography ?? prev.geography,
            stage: ws.stage ?? prev.stage,
            customer: ws.customer ?? prev.customer,
        }));

        // Update onboarding step
        setOnboardingStep(ws?.onboarding_step || 0);
    };

    // On page load
    useEffect(() => {
        if (!active) return;
        loadWorkspaceData();
    }, [active]); // only runs on mount / when active becomes true

    // On manual refresh
    const handleRefresh = async () => {
        await loadWorkspaceData();
    };
    // --- Render Helpers ---

    const isError = (field: keyof TouchedState) =>
        touched[field] && !formData[field];

    const isFormValid =
        formData.name &&
        formData.type &&
        formData.problem &&
        formData.solution;
    return (
        <>
            <style>{styles}</style>
            <div className="container animate-fade-in">
                <header style={{ textAlign: 'center', marginBottom: '40px' }}>
                    <h1>Create Your Company</h1>
                    <p className="subtitle">Let's define the core identity and strategy of your venture.</p>

                    {/* Refresh button on its own line */}
                    <div style={{ marginTop: '16px' }}>
                        <button
                            onClick={handleRefresh}
                            title="Refresh"
                            className="p-2 rounded-full hover:bg-slate-100 transition"
                            disabled={isLoading} // optional
                        >
                            <RefreshCw className={`w-6 h-6 text-slate-500 ${isLoading ? "animate-spin" : ""}`} />
                        </button>
                    </div>
                </header>


                {/* --- Section 1: Company Identity --- */}
                <div className="form-section">
                    <h2><Building size={20} style={{ display: 'inline', marginRight: 8, verticalAlign: 'text-bottom' }} /> Identity</h2>

                    <div className="input-group">
                        <label className="label">Company Name <span className="required">*</span></label>
                        <div className="input-wrapper">
                            <Building className="input-icon" size={18} />
                            <input
                                type="text"
                                className={`has-icon ${isError('name') ? 'error' : ''}`}
                                placeholder="e.g. Acme Corp"
                                value={formData.name}
                                onChange={e => handleChange('name', e.target.value)}
                                onBlur={() => handleBlur('name')}
                            />
                        </div>
                        {isError('name') && <div className="error-msg">Company name is required</div>}
                    </div>

                    <div className="input-group">
                        <label className="label">Company Type <span className="required">*</span></label>
                        <div className="grid-options">
                            {['SaaS', 'Marketplace', 'HardTech', 'FinTech', 'Consumer', 'Other'].map(t => (
                                <button
                                    type="button"
                                    key={t}
                                    className={`option-btn ${formData.type === t ? 'selected' : ''}`}
                                    onClick={() => {
                                        handleChange('type', t);
                                        if (t !== 'Other') setCustomType(''); // reset custom type if not Other
                                    }}
                                >
                                    {t}
                                </button>
                            ))}
                        </div>

                        {/* Show text input if "Other" is selected */}
                        {formData.type === 'Other' && (
                            <div style={{ marginTop: 12 }}>
                                <input
                                    type="text"
                                    className={`has-icon ${isError('type') ? 'error' : ''}`}
                                    placeholder="Enter your company type"
                                    value={customType}
                                    onChange={e => setCustomType(e.target.value)}
                                    onBlur={(e) => handleChange('type', e.target.value)}
                                />
                                {isError('type') && <div className="error-msg">Please enter a type</div>}
                            </div>
                        )}
                    </div>



                </div>

                {/* --- Section 2: Strategy Basics --- */}
                <div className="form-section">
                    <h2><Target size={20} style={{ display: 'inline', marginRight: 8, verticalAlign: 'text-bottom' }} /> Strategy Basics</h2>

                    <div className="input-group">
                        <label className="label">Problem Statement <span className="required">*</span></label>
                        <textarea
                            rows={3}
                            className={isError('problem') ? 'error' : ''}
                            placeholder="What specific pain point are you solving?"
                            value={formData.problem}
                            onChange={e => handleChange('problem', e.target.value)}
                            onBlur={() => handleBlur('problem')}
                        />
                        {isError('problem') && <div className="error-msg">Problem statement is required</div>}
                    </div>

                    <div className="input-group">
                        <label className="label">Proposed Solution <span className="required">*</span></label>
                        <textarea
                            rows={3}
                            className={isError('solution') ? 'error' : ''}
                            placeholder="How does your product solve this problem?"
                            value={formData.solution}
                            onChange={e => handleChange('solution', e.target.value)}
                            onBlur={() => handleBlur('solution')}
                        />
                        {isError('solution') && <div className="error-msg">Solution is required</div>}
                    </div>

                    <div className="grid-2">
                        <div className="input-group">
                            <label className="label">Industry</label>
                            <div className="input-wrapper">
                                <Briefcase className="input-icon" size={18} />
                                <input
                                    type="text"
                                    className="has-icon"
                                    placeholder="e.g. AI, Health"
                                    value={formData.industry}
                                    onChange={e => handleChange('industry', e.target.value)}
                                />
                            </div>
                        </div>
                        <div className="input-group">
                            <label className="label">Geography</label>
                            <div className="input-wrapper">
                                <MapPin className="input-icon" size={18} />
                                <input
                                    type="text"
                                    className="has-icon"
                                    placeholder="e.g. Global, US"
                                    value={formData.geography}
                                    onChange={e => handleChange('geography', e.target.value)}
                                />
                            </div>
                        </div>
                    </div>

                    <div className="input-group">
                        <label className="label">Target Customer</label>
                        <div className="input-wrapper">
                            <Users className="input-icon" size={18} />
                            <input
                                type="text"
                                className="has-icon"
                                placeholder="Who are you building for?"
                                value={formData.customer}
                                onChange={e => handleChange('customer', e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="input-group">
                        <label className="label">Current Stage</label>
                        <div className="grid-options">
                            {["Idea", "Pre-Seed", "Seed", "Series A"].map(s => (
                                <button
                                    type="button"
                                    key={s}
                                    className={`option-btn ${formData.stage === s ? 'selected' : ''}`}
                                    onClick={() => handleChange('stage', s)}
                                >
                                    {s}
                                </button>
                            ))}

                        </div>
                    </div>
                </div>

                {/* --- Actions --- */}
                <div style={{ paddingBottom: 60 }}>
                    {error && (
                        <div style={{ marginBottom: 16, padding: 12, borderRadius: 8, background: '#fef2f2', color: '#dc2626', fontSize: '0.9rem', border: '1px solid #fecaca' }}>
                            {error}
                        </div>
                    )}

                    {/* Continue flow */}
                    {onboarding_step !== 5 && (
                        <button
                            className="btn-primary"
                            onClick={handleCreate}
                            disabled={isLoading || !isFormValid}
                        >
                            {isLoading ? <Loader2 className="animate-spin" /> : <>Save <ArrowRight size={20} /></>}
                        </button>
                    )}

                    {/* SAVE flow when onboarding_step === 5 */}
                    {onboarding_step === 5 && (
                        <button
                            className="btn-primary"
                            onClick={handleSave}
                            disabled={isLoading || !isFormValid}
                        >
                            {isLoading ? <Loader2 className="animate-spin" /> : <>Save</>}
                        </button>
                    )}

                    {error && (
                        <button
                            className="btn-primary btn-retry"
                            disabled={retryCooldown > 0}
                            onClick={onboarding_step === 5 ? handleSave : handleCreate}
                        >
                            {retryCooldown > 0
                                ? `Retry available in ${retryCooldown}s`
                                : 'Retry'}
                        </button>
                    )}
                </div>

            </div>
        </>
    );
};


import React, { useState, useEffect } from 'react';
import {
    DollarSign,
    TrendingUp,
    TrendingDown,
    Minus,
    ArrowRight,
    Loader2,
    RefreshCw
} from 'lucide-react';
import { AuthService } from '../services/AuthService';
import { FinancialService } from '../services/FinancialService';
import { WorkspaceService } from '../services/WorkspaceService';
import { ScreenId, Financials } from '../types';

const styles = `
  :root {
    --primary: #4f46e5;
    --primary-hover: #4338ca;
    --bg-page: #f8fafc;
    --bg-card: #ffffff;
    --border: #e2e8f0;
    --text-main: #0f172a;
    --text-muted: #64748b;
    --danger: #ef4444;
  }

  .container {
    max-width: 800px;
    margin: 0 auto;
    padding: 40px 20px;
  }

  h1 { font-size: 2rem; font-weight: 800; color: var(--text-main); margin-bottom: 0.5rem; }
  p.subtitle { color: var(--text-muted); font-size: 1.1rem; margin-bottom: 2.5rem; }

  .card {
    background: var(--bg-card);
    border: 1px solid var(--border);
    border-radius: 16px;
    padding: 32px;
    margin-bottom: 24px;
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.02);
  }

  .section-title {
    font-size: 0.9rem;
    font-weight: 700;
    text-transform: uppercase;
    color: var(--text-muted);
    letter-spacing: 0.05em;
    margin-bottom: 20px;
    border-bottom: 1px solid var(--border);
    padding-bottom: 10px;
  }

  .input-group { margin-bottom: 24px; }
  .label { 
    display: block; 
    font-size: 0.85rem; 
    font-weight: 600; 
    color: var(--text-main); 
    margin-bottom: 8px; 
  }

  .required { color: var(--danger); margin-left: 2px; }
  
  input[type="number"], input[type="text"] {
    width: 100%;
    padding: 12px 16px;
    border: 1px solid var(--border);
    border-radius: 10px;
    font-size: 1rem;
    outline: none;
    transition: all 0.2s;
  }
  
  input:focus { border-color: var(--primary); box-shadow: 0 0 0 3px #eef2ff; }

  .pills {
    display: flex;
    gap: 10px;
    flex-wrap: wrap;
  }

  .pill {
    padding: 8px 16px;
    border: 1px solid var(--border);
    border-radius: 20px;
    font-size: 0.9rem;
    font-weight: 500;
    color: var(--text-muted);
    cursor: pointer;
    background: white;
    transition: all 0.2s;
    display: flex;
    align-items: center;
    gap: 6px;
  }

  .pill:hover { border-color: var(--primary); color: var(--primary); }
  .pill.active {
    background: var(--primary);
    color: white;
    border-color: var(--primary);
  }

  .slider-container {
    position: relative;
    padding: 10px 0;
  }
  
  .slider-labels {
    display: flex;
    justify-content: space-between;
    font-size: 0.8rem;
    color: var(--text-muted);
    font-weight: 600;
  }

  input[type="range"] {
    width: 100%;
    cursor: pointer;
  }

  .btn-primary {
    width: 100%;
    height: 52px;
    background: var(--primary);
    color: white;
    border: none;
    border-radius: 12px;
    font-size: 1rem;
    font-weight: 700;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 10px;
    transition: all 0.2s;
  }
  .btn-primary:hover:not(:disabled) { background: var(--primary-hover); transform: translateY(-1px); }
  .btn-primary:disabled { opacity: 0.6; cursor: not-allowed; }

  .btn-secondary {
    width: 100%;
    height: 48px;
    background: white;
    color: var(--text-muted);
    border: 1px solid var(--border);
    border-radius: 12px;
    font-size: 0.95rem;
    font-weight: 600;
    cursor: pointer;
    margin-top: 12px;
    transition: all 0.2s;
  }
  .btn-secondary:hover { background: #f1f5f9; color: var(--text-main); }

  .est-runway {
    background: #ecfdf5;
    color: #047857;
    padding: 16px;
    border-radius: 12px;
    margin-top: 16px;
    display: flex;
    align-items: center;
    gap: 12px;
    font-weight: 600;
  }

  .hint-icon {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 18px;
    height: 18px;
    border-radius: 50%;
    border: 1px solid #cbd5e1;
    color: #475569;
    font-size: 12px;
    cursor: pointer;
    margin-left: 8px;
  }

  .hint-popup {
    position: absolute;
    top: 22px;
    left: 0;
    width: 240px;
    padding: 10px;
    border-radius: 10px;
    background: white;
    box-shadow: 0 6px 16px rgba(0,0,0,0.12);
    color: #334155;
    font-size: 0.85rem;
    z-index: 10;
  }

  .hint {
    font-size: 0.75rem;
    color: #94a3b8;
    margin-top: 6px;
  }
`;

interface ScreenProps {
    onNavigate: (id: ScreenId) => void;
}



export const FinancialsScreen: React.FC<ScreenProps> = ({ onNavigate }) => {

    const [data, setData] = useState<Financials>({
        org_id: '',
        monthly_revenue: undefined,
        revenue_trend: undefined, // Growing, Flat, Declining
        revenue_stage: undefined, // Pre-revenue, Early, Recurring
        cash_in_bank: undefined,
        monthly_burn: undefined,
        cost_structure: 'Variable', // Fixed vs Variable slider? Using string for now
        pricing_model: undefined, // Subscription, Usage, One-time, Enterprise
        price_per_customer: undefined,
        customers_in_pipeline: undefined,
        data_confidence: 'Rough',
        expense_pattern: 50, // default value
    });


    type TouchedState = {
        revenue_stage?: boolean;
        revenue_trend?: boolean;
        monthly_revenue?: boolean;
        monthly_burn?: boolean;
        cash_in_bank?: boolean;
    };

    const [touched, setTouched] = useState<TouchedState>({});
    const requiredFields: (keyof TouchedState)[] = [
        'revenue_stage',
        'revenue_trend',
        'monthly_revenue',
        'monthly_burn',
        'cash_in_bank'
    ];

    const validate = () => {
        let valid = true;
        const newTouched = { ...touched };

        requiredFields.forEach(field => {
            newTouched[field] = true;
            if (
                data[field as keyof Financials] === undefined ||
                data[field as keyof Financials] === null ||
                data[field as keyof Financials] === ''
            ) {
                valid = false;
            }
        });

        setTouched(newTouched);
        return valid;
    };


    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [workspace, setWorkspace] = useState<any>(null);
    const loadWorkspace = async () => {
        const user = AuthService.getCachedUser();
        if (!user?.current_org_id) return;

        const ws = await WorkspaceService.fetchWorkspaceFromServer(user.current_org_id);
        setWorkspace(ws);
        isOnboarding = ws?.onboarding_step < 5;
    };
    // Unified load function
    const loadFinancials = async () => {
        try {
            setLoading(true); // optional, show loader during refresh
            const orgId = AuthService.getCachedUser()?.current_org_id;
            if (!orgId) return;

            const fetched = await FinancialService.getFinancials(orgId);

            if (fetched) {
                setData(prev => ({ ...prev, ...fetched, org_id: orgId }));
            } else {
                setData(prev => ({ ...prev, org_id: orgId }));
            }
        } catch (e) {
            console.error("Failed to load financials", e);
        } finally {
            setLoading(false);
        }
    };

    // On page enter
    useEffect(() => {
        loadFinancials();
        loadWorkspace();
    }, []); // only runs once on mount

    // Manual refresh
    const handleRefresh = async () => {
        await loadFinancials();
    };


    // Handlers
    const handleChange = (field: keyof Financials, value: any) => {
        setData(prev => ({ ...prev, [field]: value }));
    };

    const handleSave = async () => {

        if (!validate()) return;

        setSaving(true);
        try {
            // Make a copy and fill 0 for empty numeric fields
            const dataToSave = { ...data };
            ['monthly_revenue', 'monthly_burn', 'expense_pattern', 'cash_in_bank', 'price_per_customer', 'customers_in_pipeline'].forEach(field => {
                if (dataToSave[field as keyof Financials] === undefined || dataToSave[field as keyof Financials] === '') {
                    (dataToSave as any)[field] = 0;
                }
            });

            let workspace = WorkspaceService.getCachedWorkspace();
            await FinancialService.updateFinancials(data.org_id, dataToSave);

            if (!workspace || (workspace?.onboarding_step && workspace.onboarding_step <= 5)) {
                await WorkspaceService.setOnboarding(data.org_id, Math.max(workspace?.onboarding_step ?? 0, 5));
            }

            if (workspace?.onboarding_step < 5) {
                onNavigate(ScreenId.COMPANY_DASHBOARD);
            }
        } catch (e) {
            console.error(e);
            alert("Failed to save.");
        } finally {
            setSaving(false);
        }
    };



    const handleSkip = async () => {
        let workspace = WorkspaceService.getCachedWorkspace();
        if (!workspace) return;
        setSaving(true);
        try {
            // ONLY update onboarding step, do NOT save form data
            await WorkspaceService.setOnboarding(workspace.id, 5);
            onNavigate(ScreenId.COMPANY_DASHBOARD);
        } catch (e) {
            console.error(e);
        } finally {
            setSaving(false);
        }
    };

    // Derived
    const calculateRunway = () => {
        if (
            data.cash_in_bank === undefined ||
            data.monthly_burn === undefined ||
            data.monthly_burn <= 0
        ) {
            return null;
        }

        return (data.cash_in_bank / data.monthly_burn).toFixed(1);
    };

    const runway = calculateRunway();
    let isOnboarding = workspace?.onboarding_step < 5;

    if (loading) return <div style={{ display: 'flex', justifyContent: 'center', paddingTop: 100 }}><Loader2 className="animate-spin" /></div>;
    const isFormValid =
        data.revenue_stage !== undefined && data.revenue_stage !== '' && data.revenue_stage !== null &&
        data.revenue_trend !== undefined && data.revenue_trend !== '' && data.revenue_trend !== null &&
        data.monthly_revenue !== undefined && data.monthly_revenue !== null &&
        data.monthly_burn !== undefined && data.monthly_burn !== null &&
        data.cash_in_bank !== undefined && data.cash_in_bank !== null;
    return (
        <>
            <style>{styles}</style>
            <div className="container animate-fade-in">
                <header style={{ textAlign: 'center', marginBottom: '40px' }}>
                    <h1>Financial Snapshot</h1>
                    <p className="subtitle">Enter your current financial reality</p>
                    {/* Refresh button below subtitle */}
                    <div style={{ marginTop: '16px' }}>
                        <button
                            onClick={handleRefresh}
                            title="Refresh"
                            className="p-2 rounded-full hover:bg-slate-100 transition"
                            disabled={loading} // optional
                        >
                            <RefreshCw className={`w-6 h-6 text-slate-500 ${loading ? "animate-spin" : ""}`} />
                        </button>
                    </div>
                </header>

                {/* --- REVENUE --- */}
                <div className="card">
                    <div className="section-title">Revenue</div>

                    <div className="input-group">
                        <label className="label">Stage <span className="required">*</span></label>
                        <div className="pills">
                            {['Pre-revenue', 'Early', 'Recurring'].map(v => (
                                <div
                                    key={v}
                                    className={`pill ${data.revenue_stage === v ? 'active' : ''}`}
                                    onClick={() => handleChange('revenue_stage', v)}
                                >
                                    {v}
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="input-group">
                        <label className="label">Current Monthly Revenue <span className="required">*</span></label>
                        <div style={{ position: 'relative' }}>
                            <DollarSign size={16} style={{ position: 'absolute', left: 12, top: 14, color: '#94a3b8' }} />
                            <input
                                type="text"
                                inputMode="numeric"
                                pattern="[0-9]*"
                                style={{ paddingLeft: 36 }}
                                placeholder="0"
                                value={data.monthly_revenue !== undefined && data.monthly_revenue !== null ? data.monthly_revenue.toString() : ''}
                                onChange={e => handleChange(
                                    'monthly_revenue',
                                    e.target.value === '' ? undefined : parseInt(e.target.value, 10)
                                )}
                            />
                        </div>
                    </div>

                    <div className="input-group">
                        <label className="label">Trend <span className="required">*</span></label>
                        <div className="pills">
                            {[
                                { val: 'Growing', icon: TrendingUp },
                                { val: 'Flat', icon: Minus },
                                { val: 'Declining', icon: TrendingDown }
                            ].map(item => (
                                <div
                                    key={item.val}
                                    className={`pill ${data.revenue_trend === item.val ? 'active' : ''}`}
                                    onClick={() => handleChange('revenue_trend', item.val)}
                                >
                                    <item.icon size={16} /> {item.val}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* --- EXPENSES --- */}
                <div className="card">
                    <div className="section-title">Expenses</div>

                    <div className="input-group">
                        <label className="label">Average Monthly Expenses <span className="required">*</span></label>
                        <div style={{ position: 'relative' }}>
                            <DollarSign size={16} style={{ position: 'absolute', left: 12, top: 14, color: '#94a3b8' }} />
                            <input
                                type="text"
                                inputMode="numeric"
                                pattern="[0-9]*"
                                style={{ paddingLeft: 36 }}
                                placeholder="0"
                                value={data.monthly_burn !== undefined && data.monthly_burn !== null ? data.monthly_burn : ''}
                                onChange={e => handleChange('monthly_burn', parseInt(e.target.value) || 0)}
                            />
                        </div>
                    </div>

                    <div className="input-group">
                        <label className="label">Expense Behavior</label>
                        <div className="slider-container">
                            <div className="slider-labels">
                                <span>Mostly the same</span>
                                <span>Changes with growth</span>
                            </div>
                            <input
                                type="range"
                                min="0"
                                max="100"
                                value={data.expense_pattern}
                                onChange={e => handleChange('expense_pattern', parseInt(e.target.value, 10))}
                            />
                        </div>
                    </div>
                </div>

                {/* --- RUNWAY --- */}
                <div className="card">
                    <div className="section-title">Runway</div>

                    <div className="input-group">
                        <label className="label">Cash Reserves <span className="required">*</span></label>
                        <div style={{ position: 'relative' }}>
                            <DollarSign size={16} style={{ position: 'absolute', left: 12, top: 14, color: '#94a3b8' }} />
                            <input
                                type="text"
                                inputMode="numeric"
                                pattern="[0-9]*"
                                style={{ paddingLeft: 36 }}
                                placeholder="0"
                                value={data.cash_in_bank !== undefined && data.cash_in_bank !== null ? data.cash_in_bank : ''}
                                onChange={e => handleChange('cash_in_bank', parseInt(e.target.value) || 0)}
                            />
                        </div>
                    </div>

                    {runway && (
                        <div className="est-runway">
                            <span style={{ fontSize: '1.5rem' }}>🧮</span>
                            <div>
                                <div style={{ fontSize: '0.8rem', opacity: 0.8 }}>Estimated Runway</div>
                                <div style={{ fontSize: '1.1rem' }}>{runway} months</div>
                            </div>
                        </div>
                    )}
                </div>

                {/* --- PRICING --- */}
                <div className="card">
                    <div className="section-title">Pricing (Optional)</div>

                    <div className="input-group">
                        <label className="label">Monthly revenue per customer</label>
                        <div style={{ position: 'relative' }}>
                            <DollarSign size={16} style={{ position: 'absolute', left: 12, top: 14, color: '#94a3b8' }} />
                            <input
                                type="text"
                                inputMode="numeric"
                                pattern="[0-9]*"
                                style={{ paddingLeft: 36 }}
                                placeholder="0"
                                value={data.price_per_customer || ''}
                                onChange={e => handleChange('price_per_customer', parseFloat(e.target.value) || 0)}
                            />
                        </div>
                    </div>

                    <div className="input-group">
                        <label className="label">Customers in Pipeline / Month</label>
                        <input
                            type="text"
                            inputMode="numeric"
                            pattern="[0-9]*"
                            placeholder="0"
                            value={data.customers_in_pipeline || ''}
                            onChange={e => handleChange('customers_in_pipeline', parseInt(e.target.value) || 0)}
                        />
                    </div>

                    <div className="input-group">
                        <label className="label">Pricing Model</label>
                        <div className="pills">
                            {['Subscription', 'Usage', 'One-time', 'Enterprise'].map(v => (
                                <div
                                    key={v}
                                    className={`pill ${data.pricing_model === v ? 'active' : ''}`}
                                    onClick={() => handleChange('pricing_model', v)}
                                >
                                    {v}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* --- DATA CONFIDENCE --- */}
                <div style={{ marginBottom: 40, textAlign: 'center' }}>
                    <label className="label" style={{ marginBottom: 16 }}>Data Confidence</label>
                    <div className="pills" style={{ justifyContent: 'center' }}>
                        {['Rough', 'Precise'].map(v => (
                            <div
                                key={v}
                                className={`pill ${data.data_confidence === v ? 'active' : ''}`}
                                onClick={() => handleChange('data_confidence', v)}
                            >
                                {v}
                            </div>
                        ))}
                    </div>
                </div>

                {/* --- ACTIONS --- */}
                <div style={{ paddingBottom: 60 }}>
                    <button
                        className="btn-primary"
                        onClick={handleSave}
                        disabled={saving || !isFormValid}
                    >
                        {saving ? <Loader2 className="animate-spin" /> : (isOnboarding ? <>Save & Continue <ArrowRight size={20} /></> : 'Save Changes')}
                    </button>


                </div>

            </div>
        </>
    );
};

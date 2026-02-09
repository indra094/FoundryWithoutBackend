
import React, { useState, useRef, useEffect } from 'react';
import { ScreenId } from '../types';
import { Button, Card, Badge } from '../components/UI';
import {
    TrendingUp, AlertTriangle, CheckCircle, XCircle,
    Target, Users, DollarSign, Brain, ArrowRight,
    Shield, Briefcase, FileText, ChevronRight,
    RefreshCw
} from 'lucide-react';
import { AuthService } from '../services/AuthService';
import { AnalysisService } from '../services/AnalysisService';
import { format } from 'date-fns';
import { InvestorReadiness } from '../models'; // Import model

import { Info } from "lucide-react";


interface InvestorReadinessScreenProps {
    // orgId is fetched internally, removed from required props to match usage in ScreenContent
    onNavigate: (id: ScreenId) => void;
}

// Use model type directly or compatible local type
type InvestorReadinessData = InvestorReadiness;


const InvestorReadinessSkeleton = () => {
    return (
        <div className="p-6 md:p-10 space-y-8 max-w-7xl mx-auto pb-20">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-3">
                    <div className="h-5 w-48 bg-slate-200 rounded animate-pulse" />
                    <div className="h-10 w-72 bg-slate-200 rounded animate-pulse" />
                    <div className="h-4 w-96 bg-slate-200 rounded animate-pulse" />
                </div>

                <div className="flex gap-3">
                    <div className="h-10 w-40 bg-slate-200 rounded animate-pulse" />
                    <div className="h-10 w-48 bg-slate-200 rounded animate-pulse" />
                </div>

            </div>
            <div className="flex items-center gap-3 text-sm text-slate-500">
                <span className="h-3 w-3 rounded-full bg-slate-300 animate-pulse" />
                <span>
                    Insights are being generated. This can take a few seconds.
                </span>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* LEFT COLUMN */}
                <div className="lg:col-span-4 space-y-6">
                    {/* Score Card */}
                    <Card className="p-6 md:p-8 border-slate-200 shadow-xl">
                        <div className="h-5 w-32 bg-slate-200 rounded animate-pulse mb-6" />
                        <div className="h-20 w-full bg-slate-200 rounded animate-pulse mb-4" />
                        <div className="h-4 w-48 bg-slate-200 rounded animate-pulse mb-4" />
                        <div className="h-4 w-full bg-slate-200 rounded animate-pulse" />
                    </Card>

                    {/* Recommendation - Light Theme Skeleton */}
                    <Card className="p-6 md:p-8 border-slate-200 bg-white text-slate-900 shadow-xl">
                        <div className="h-5 w-40 bg-slate-200 rounded animate-pulse mb-6" />
                        <div className="h-8 w-56 bg-slate-200 rounded animate-pulse mb-4" />
                        <div className="h-4 w-full bg-slate-200 rounded animate-pulse mb-6" />
                        <div className="h-10 w-full bg-slate-300 rounded animate-pulse" />
                    </Card>


                    {/* Top Fixes */}
                    <Card className="p-6 border-slate-200 shadow-sm">
                        <div className="h-6 w-60 bg-slate-200 rounded mb-4 animate-pulse" />
                        <div className="space-y-3">
                            {[1, 2, 3].map((i) => (
                                <div key={i} className="flex items-center gap-3">
                                    <div className="h-5 w-5 rounded-full bg-slate-200 animate-pulse" />
                                    <div className="h-4 w-3/4 bg-slate-200 rounded animate-pulse" />
                                </div>
                            ))}
                        </div>
                    </Card>
                </div>

                {/* RIGHT COLUMN */}
                <div className="lg:col-span-8 space-y-6">
                    {/* Investor Type + Mindset */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <Card className="p-6 border-slate-200">
                            <div className="h-5 w-40 bg-slate-200 rounded animate-pulse mb-6" />
                            <div className="h-6 w-60 bg-slate-200 rounded animate-pulse mb-4" />
                            <div className="space-y-3">
                                <div className="h-4 w-full bg-slate-200 rounded animate-pulse" />
                                <div className="h-4 w-3/4 bg-slate-200 rounded animate-pulse" />
                            </div>
                            <div className="mt-6 pt-4 border-t border-slate-100">
                                <div className="h-4 w-48 bg-slate-200 rounded animate-pulse mb-2" />
                                <div className="h-4 w-64 bg-slate-200 rounded animate-pulse" />
                            </div>
                        </Card>

                        <Card className="p-6 border-slate-200 bg-indigo-50/50">
                            <div className="h-5 w-44 bg-slate-200 rounded animate-pulse mb-6" />
                            <div className="space-y-4">
                                <div className="h-4 w-full bg-slate-200 rounded animate-pulse" />
                                <div className="h-4 w-5/6 bg-slate-200 rounded animate-pulse" />
                            </div>
                        </Card>
                    </div>

                    {/* Simulated Reaction */}
                    <Card className="p-6 border-slate-200">
                        <div className="h-5 w-52 bg-slate-200 rounded animate-pulse mb-6" />
                        <div className="space-y-4">
                            {[1, 2, 3].map((i) => (
                                <div key={i} className="flex items-center gap-4">
                                    <div className="h-4 w-28 bg-slate-200 rounded animate-pulse" />
                                    <div className="h-3 flex-1 bg-slate-200 rounded animate-pulse" />
                                    <div className="h-4 w-10 bg-slate-200 rounded animate-pulse" />
                                </div>
                            ))}
                        </div>
                    </Card>

                    {/* Pushbacks + Demands */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <Card className="p-6 border-slate-200">
                            <div className="h-5 w-48 bg-slate-200 rounded animate-pulse mb-6" />
                            <div className="space-y-6">
                                {[1, 2, 3].map((i) => (
                                    <div key={i}>
                                        <div className="h-4 w-3/4 bg-slate-200 rounded animate-pulse mb-2" />
                                        <div className="space-y-2">
                                            <div className="h-3 w-full bg-slate-200 rounded animate-pulse" />
                                            <div className="h-3 w-5/6 bg-slate-200 rounded animate-pulse" />
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <div className="h-10 w-full bg-slate-200 rounded mt-6 animate-pulse" />
                        </Card>

                        <Card className="p-6 border-slate-200 bg-slate-50">
                            <div className="h-5 w-56 bg-slate-200 rounded animate-pulse mb-6" />
                            <div className="space-y-4">
                                {[1, 2, 3, 4].map((i) => (
                                    <div key={i} className="flex items-start gap-3">
                                        <div className="h-4 w-4 bg-slate-200 rounded animate-pulse mt-1" />
                                        <div>
                                            <div className="h-4 w-28 bg-slate-200 rounded animate-pulse mb-2" />
                                            <div className="h-3 w-40 bg-slate-200 rounded animate-pulse" />
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <div className="mt-6 p-3 bg-amber-50 border border-amber-100 rounded-lg">
                                <div className="h-4 w-72 bg-slate-200 rounded animate-pulse" />
                            </div>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    );
};

interface InfoTooltipProps {
    content: string;
}

export const InfoTooltip: React.FC<InfoTooltipProps> = ({ content }) => {
    const [open, setOpen] = useState(false);

    return (
        <div className="relative inline-flex">
            <button
                type="button"
                onClick={() => setOpen(!open)}
                className="ml-1 text-slate-400 hover:text-slate-600 focus:outline-none"
            >
                <Info className="w-4 h-4" />
            </button>

            {open && (
                <div className="absolute z-50 top-6 left-1/2 -translate-x-1/2 w-64 rounded-lg border border-slate-200 bg-white shadow-xl p-3 text-xs text-slate-600">
                    {content}
                </div>
            )}
        </div>
    );
};


export const InvestorReadinessScreen: React.FC<InvestorReadinessScreenProps> = ({ onNavigate }) => {

    const [data, setData] = useState<InvestorReadinessData | null>(null);
    const [loading, setLoading] = useState(true);

    const [updating, setUpdating] = useState(false);
    const [queueSize, setQueueSize] = useState<number>(0);  // <-- ADD THIS

    const orgId = AuthService.getCachedUser()?.current_org_id;
    const queueSizeRef = useRef(queueSize);

    // Function to fetch investor readiness
    const fetchInvestorReadiness = async () => {
        if (!orgId) return false;

        try {
            setLoading(true);

            const response = await AnalysisService.getInvestorReadiness(orgId);

            if (response && response.investor_readiness) {
                const readiness = response.investor_readiness;

                // Format last_updated
                readiness.last_updated = new Date(readiness.last_updated).toLocaleString();

                setData(readiness as unknown as InvestorReadinessData);
                setQueueSize(response.size ?? 0);
                setUpdating(false);

                return true;
            } else {
                setUpdating(true);
                return false;
            }
        } catch (e) {
            console.error("Failed to fetch investor readiness", e);
            setUpdating(true);
            return false;
        } finally {
            setLoading(false);
        }
    };

    // Load on page enter
    useEffect(() => {
        if (!orgId) return;
        fetchInvestorReadiness();
    }, [orgId]);

    // Manual refresh
    const handleRefresh = async () => {
        await fetchInvestorReadiness();
    };

    // Render skeleton if loading
    if (loading || !data) {
        return (
            <div className="flex flex-col items-center gap-4">
                {/* Refresh button above skeleton */}
                <button
                    onClick={handleRefresh}
                    title="Refresh"
                    className="p-2 rounded-full hover:bg-slate-100 transition"
                    disabled={loading}
                >
                    <RefreshCw className={`w-6 h-6 text-slate-500 ${loading ? "animate-spin" : ""}`} />
                </button>

                <InvestorReadinessSkeleton />
            </div>
        );
    }


    const readinessScore = data.readiness_score;
    const isReady = readinessScore >= 70;
    // Map API data to UI
    const pushbacks = data.pushbacks;
    const fixes = data.fixes;
    const demands = data.demands.map((d) => ({
        ...d,
        icon:
            d.icon === "equity" ? <DollarSign className="w-4 h-4" /> :
                d.icon === "control" ? <Users className="w-4 h-4" /> :
                    d.icon === "milestones" ? <Target className="w-4 h-4" /> :
                        <FileText className="w-4 h-4" />
    }));
    const verdictIconMap = {
        high: <XCircle className="w-6 h-6" />,
        medium: <AlertTriangle className="w-6 h-6" />,
        low: <CheckCircle className="w-6 h-6" />
    };

    const simulatedReaction = ["Reject", "Soft Interest", "Fund"].map(label => {
        const item = data.simulated_reaction.find(r => r.label === label);

        return {
            label,
            value: item?.value ?? 0,
            color:
                label === "Reject" ? "bg-red-500" :
                    label === "Soft Interest" ? "bg-amber-400" :
                        "bg-emerald-500",
            icon:
                label === "Reject" ? <XCircle className="w-4 h-4 text-red-500" /> :
                    label === "Soft Interest" ? <Briefcase className="w-4 h-4 text-amber-500" /> :
                        <DollarSign className="w-4 h-4 text-emerald-500" />
        };
    });

    return (
        <div className="p-6 md:p-10 space-y-8 max-w-7xl mx-auto pb-20">

            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight">Investor Readiness</h1>
                    <p className="text-slate-500 font-medium mt-1">
                        AI-driven analysis of your fundraising potential
                    </p>

                    {/* Refresh button below subtitle */}
                    <div className="mt-4 flex justify-start md:justify-start">
                        <button
                            onClick={handleRefresh}
                            title="Refresh"
                            className="p-2 rounded-full hover:bg-slate-100 transition"
                            disabled={loading} // optional
                        >
                            <RefreshCw
                                className={`w-6 h-6 text-slate-500 ${loading ? "animate-spin" : ""}`}
                            />
                        </button>
                    </div>
                </div>
            </div>


            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

                {/* LEFT COLUMN */}
                <div className="lg:col-span-4 space-y-6">

                    {/* Readiness Score Card */}
                    <div className="bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden relative">
                        <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-red-500 via-amber-400 to-emerald-500"></div>
                        <div className="p-6 md:p-8 text-center relative z-10">
                            <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4">Readiness Score</h3>
                            <div className="flex items-center justify-center mb-2">
                                 <span className={`text-6xl font-black tracking-tighter ${isReady ? 'text-emerald-500' : 'text-slate-900'}`}>
                                    {Math.min(Math.max(readinessScore || 0, 0), 100)}
                                </span>
                            </div>
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-50 border border-red-100 text-red-700 text-xs font-bold uppercase mb-6">
                                <AlertTriangle className="w-3 h-3" />
                                {isReady ? "Ready" : "Not Ready"}
                            </div>
                            <p className="text-sm text-slate-600 italic leading-relaxed">
                                {data.summary_insight}
                            </p>

                        </div>
                    </div>

                    {/* Recommendation - Light Theme */}
                    <div className="bg-white rounded-2xl shadow-xl border border-slate-200 p-6 md:p-8 text-slate-900 relative overflow-hidden group">
                        <div className="absolute -right-10 -top-10 w-40 h-40 bg-indigo-200/20 rounded-full blur-3xl group-hover:bg-indigo-200/30 transition-all"></div>

                        <h3 className="text-xs font-black text-indigo-500 uppercase tracking-widest mb-4">Recommendation</h3>

                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-10 h-10 rounded-full bg-emerald-100/50 flex items-center justify-center text-emerald-600 border border-emerald-200">
                                <CheckCircle className="w-6 h-6" />
                            </div>
                            <span className="text-xl font-bold">{data.recommendation.verdict}</span>
                        </div>

                        <p className="text-slate-700 text-sm leading-relaxed mb-6">
                            {data.recommendation.reason}
                        </p>

                    </div>


                    {/* Fixes */}
                    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
                        <h3 className="text-sm font-bold text-slate-800 mb-4 flex items-center gap-2">
                            <CheckCircle className="w-4 h-4 text-emerald-500" />
                            Top 3 Fixes to Become Pitch-Ready
                        </h3>
                        <ul className="space-y-3">
                            {fixes.map((fix, i) => (
                                <li key={i} className="flex items-start gap-3 text-sm text-slate-600">
                                    <span className="flex-shrink-0 w-5 h-5 rounded-full bg-slate-100 flex items-center justify-center text-xs font-bold text-slate-500 mt-0.5">{i + 1}</span>
                                    <span>{fix}</span>
                                </li>
                            ))}
                        </ul>
                    </div>

                </div>

                {/* CENTER/RIGHT COLUMN */}
                <div className="lg:col-span-8 space-y-6">

                    {/* Investor Type */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
                            <div className="flex justify-between items-start mb-4">
                                <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest">Likely Investor Type</h3>
                                <Target className="w-5 h-5 text-indigo-500" />
                            </div>

                            <div className="text-lg font-bold text-slate-900 mb-4">
                                🎯 Most likely: {data.investor_type.primary}
                            </div>

                            <div className="space-y-3 text-sm border-t border-slate-100 pt-4">
                                <div className="flex justify-between">
                                    <span className="text-slate-500">Sector Fit</span>
                                    <span className="font-bold text-emerald-600">{data.investor_type.sectorFit}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-slate-500">Stage Fit</span>
                                    <span className="font-bold text-amber-500">{data.investor_type.stageFit}</span>
                                </div>
                            </div>

                            <div className="mt-4 pt-4 border-t border-slate-100">
                                <span className="text-xs font-bold text-slate-400 uppercase block mb-2">Mismatch Flags</span>
                                <ul className="space-y-1">
                                    {data.investor_type.mismatchFlags.map((flag, i) => (
                                        <li key={i} className="text-xs text-red-600 font-medium flex items-center gap-2">
                                            <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span> {flag}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>

                        {/* Investor Mindset */}
                        <div className="bg-indigo-50/50 rounded-2xl border border-indigo-100 p-6 flex flex-col justify-center relative">
                            <Brain className="absolute top-6 right-6 w-12 h-12 text-indigo-200 opacity-50" />
                            <h3 className="text-xs font-black text-indigo-400 uppercase tracking-widest mb-4">Investor Mindset</h3>
                            <div className="space-y-4 relative z-10">
                                {data.investor_mindset_quotes?.map((quote, i) => (
                                    <blockquote
                                        key={i}
                                        className="border-l-4 border-indigo-200 pl-4 py-1 italic text-slate-700 text-sm"
                                    >
                                        “{quote}”
                                    </blockquote>
                                ))}

                            </div>
                        </div>
                    </div>

                    {/* Simulated Reaction */}
                    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
                        <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-6">Likely Pitch Reaction</h3>
                        <div className="space-y-4">
                            {simulatedReaction.map((item, i) => (
                                <div key={i} className="flex items-center gap-4">
                                    <div className="w-28 flex items-center gap-2 text-sm font-bold text-slate-700 shrink-0">
                                        {item.icon}
                                        {item.label}
                                    </div>
                                    <div className="flex-1 h-3 bg-slate-100 rounded-full overflow-hidden">
                                        <div className={`h-full ${item.color} transition-all duration-1000 ease-out`} style={{ width: `${item.value}%` }}></div>
                                    </div>
                                    <div className="w-10 text-right text-sm font-bold text-slate-500">{item.value}%</div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Pushbacks & Demands */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                        {/* Pushbacks */}
                        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 h-full">
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="text-sm font-bold text-slate-800">Expected Pushback</h3>
                                <Shield className="w-4 h-4 text-slate-400" />
                            </div>

                            <div className="space-y-6">
                                {pushbacks.map((pb, i) => (
                                    <div key={i}>
                                        <div className="text-sm font-bold text-slate-900 mb-1 flex items-center gap-2">
                                            <span className="w-5 h-5 rounded-full bg-slate-100 text-slate-500 text-xs flex items-center justify-center flex-shrink-0">{i + 1}</span>
                                            “{pb.title}”
                                        </div>
                                        <ul className="pl-9 space-y-1">
                                            {pb.points.map((pt, j) => (
                                                <li key={j} className="text-xs text-slate-500 list-disc list-outside ml-3">
                                                    {pt}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                ))}
                            </div>

                            <button
                                className="w-full mt-6 py-2 border border-slate-200 rounded-lg text-xs font-bold text-slate-600 hover:bg-slate-50 transition-colors"
                                onClick={() => {
                                    const textToCopy = pushbacks
                                        .map(
                                            (pb, i) =>
                                                `${i + 1}. ${pb.title}\n${pb.points.map((pt) => `- ${pt}`).join("\n")}`
                                        )
                                        .join("\n\n");

                                    navigator.clipboard.writeText(textToCopy)
                                        .then(() => alert("Copied to clipboard!"))
                                        .catch(() => alert("Failed to copy."));
                                }}
                            >
                                Copy to Pitch Notes
                            </button>

                        </div>

                        {/* Demands */}
                        <div className="bg-slate-50 rounded-2xl border border-slate-200 p-6 h-full">
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="text-sm font-bold text-slate-800">What Investors Will Demand</h3>
                                <Briefcase className="w-4 h-4 text-slate-400" />
                            </div>

                            <div className="space-y-4">
                                {demands.map((demand, i) => (
                                    <div key={i} className="flex items-start gap-3 text-sm">
                                        <div className="mt-0.5 text-slate-400 shrink-0">{demand.icon}</div>
                                        <div>
                                            <span className="font-semibold text-slate-900 block">{demand.label}</span>
                                            <span className="text-slate-600 block text-xs mt-0.5">{demand.value}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="mt-6 p-3 bg-amber-50 border border-amber-100 rounded-lg text-xs text-amber-800 font-medium italic">
                                “{data.demand_warning}”
                            </div>

                        </div>

                    </div>

                </div>

            </div>
        </div>
    );
};

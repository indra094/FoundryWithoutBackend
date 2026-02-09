
import { ScreenId } from '../types';
import { Button, Card, Badge } from '../components/UI';
import { Lightbulb, Target, TrendingUp, AlertCircle, Users, DollarSign, Calendar, ArrowRight, RefreshCw } from 'lucide-react';

import React, { useState, useRef, useEffect } from "react";
import { Info } from "lucide-react";
import { AuthService } from '../services/AuthService';
import { AnalysisService } from '../services/AnalysisService';
import { AIIdeaAnalysis } from '../models'; // Import the model

interface TooltipProps {
    content: string;
}

export const Tooltip: React.FC<TooltipProps> = ({ content }) => {
    const [open, setOpen] = useState(false);

    const ref = useRef<HTMLDivElement>(null);

    // close when clicking outside
    useEffect(() => {
        const onClick = (e: MouseEvent) => {
            if (ref.current && !ref.current.contains(e.target as Node)) {
                setOpen(false);
            }
        };
        document.addEventListener("mousedown", onClick);
        return () => document.removeEventListener("mousedown", onClick);
    }, []);



    return (
        <div className="relative inline-flex items-center" ref={ref}>
            <Info
                className="w-4 h-4 text-slate-400 hover:text-slate-600 cursor-pointer"
                onClick={() => setOpen((prev) => !prev)}
            />

            {open && (
                <div className="absolute left-1/2 top-full mt-2 w-64 -translate-x-1/2
                        rounded-lg bg-slate-900 text-white text-xs
                        px-3 py-2 z-50 shadow-xl">
                    {content}
                </div>
            )}
        </div>
    );
};
interface ScreenProps {
    onNavigate: (id: ScreenId) => void;
    active: boolean;
}

const IdeaValidationSkeleton = () => {
    return (
        <div className="p-8 max-w-7xl mx-auto flex gap-8">
            {/* Left column */}
            <div className="flex-1 space-y-8">
                {/* Header */}
                <div className="flex justify-between items-end">
                    <div className="space-y-3">
                        <div className="h-10 w-72 bg-slate-200 rounded animate-pulse" />
                        <div className="h-4 w-96 bg-slate-200 rounded animate-pulse" />
                    </div>
                    <div className="h-4 w-40 bg-slate-200 rounded animate-pulse" />
                </div>

                <div className="flex items-center gap-3 text-sm text-slate-500">
                    <span className="h-3 w-3 rounded-full bg-slate-300 animate-pulse" />
                    <span>
                        Analysis is being calculated. This can take a few seconds.
                    </span>
                </div>

                {/* Cards grid */}
                <div className="grid md:grid-cols-2 gap-6">
                    {[1, 2, 3, 4].map((i) => (
                        <Card key={i} className="p-6 border-slate-100">
                            <div className="h-6 w-40 bg-slate-200 rounded mb-4 animate-pulse" />
                            <div className="space-y-4">
                                <div className="h-4 bg-slate-200 rounded animate-pulse" />
                                <div className="h-4 bg-slate-200 rounded w-3/4 animate-pulse" />
                                <div className="h-4 bg-slate-200 rounded w-1/2 animate-pulse" />
                            </div>
                        </Card>
                    ))}
                </div>

                {/* Personas */}
                <Card className="p-6 border-slate-100">
                    <div className="h-6 w-60 bg-slate-200 rounded mb-6 animate-pulse" />
                    <div className="grid md:grid-cols-3 gap-4">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                                <div className="h-4 bg-slate-200 rounded w-2/3 mb-3 animate-pulse" />
                                <div className="h-3 bg-slate-200 rounded w-full mb-2 animate-pulse" />
                                <div className="h-3 bg-slate-200 rounded w-5/6 animate-pulse" />
                            </div>
                        ))}
                    </div>
                </Card>
            </div>

            {/* Right column (sidebar) */}
            <div className="w-80 shrink-0">
                <aside className="sticky top-8 space-y-6">
                    <Card className="p-6 bg-white text-slate-900 border-slate-100 shadow-xl overflow-hidden relative">
                        <div className="h-6 w-48 bg-slate-200 rounded mb-6 animate-pulse" />

                        <div className="space-y-6">
                            <div className="h-4 bg-slate-200 rounded w-3/4 animate-pulse" />
                            <div className="h-4 bg-slate-200 rounded w-full animate-pulse" />
                            <div className="h-4 bg-slate-200 rounded w-2/3 animate-pulse" />

                            <div className="pt-6 border-t border-slate-100">
                                <div className="space-y-4">
                                    {[1, 2, 3].map((i) => (
                                        <div key={i} className="h-3 bg-slate-200 rounded w-full animate-pulse" />
                                    ))}
                                </div>
                            </div>

                            <div className="h-12 bg-slate-200 rounded animate-pulse" />
                        </div>
                    </Card>
                </aside>
            </div>
        </div>
    );
};

// Use the model from models.tsx or define a compatible one
type IdeaAnalysis = AIIdeaAnalysis;


const ideaAnalysisTitles: Record<string, string> = {
    seed_funding_probability: "Seed Funding Probability",
    market: "Market Analysis",
    investor: "Investor Verdict",
    strengths: "Strengths",
    weaknesses: "Weaknesses",
    personas: "Customer Personas",
    roadmap: "Roadmap",
};

export const AIIdeaValidationScreen: React.FC<ScreenProps> = ({ onNavigate, active }) => {
    // --- State ---
    const [analysis, setAnalysis] = useState<IdeaAnalysis | null>(null);
    const showOrFallback = (value: any, fallback = "Analysis not yet generated. Try reloading the page.") => {
        if (value === null || value === undefined) return fallback;
        if (typeof value === "string" && value.trim() === "") return fallback;
        if (Array.isArray(value) && value.length === 0) return fallback;
        if (typeof value === 'object' && value.verdict) return value.verdict;
        return value;
    };
    const isAnalysisIncomplete = (data: IdeaAnalysis) => {
        // Check all required fields
        if (data.seed_funding_probability === undefined) return true;
        if (!data.market || data.market.tam_value === undefined || data.market.growth_rate_percent === undefined || !data.market.insight) return true;
        if (!data.investor || !data.investor.verdict) return true;
        if (!data.strengths?.length || !data.weaknesses?.length) return true;
        if (!data.personas?.length) return true;
        if (!data.roadmap || !data.roadmap.milestones?.length) return true;

        return false;
    };

    const [canProceedToReadiness, setCanProceedToReadiness] = useState(false);

    const [isLoading, setIsLoading] = useState(true);
    const [modalPersona, setModalPersona] = useState<{
        name: string;
        pain: string;
        solution: string;
    } | null>(null);

    const [updating, setUpdating] = useState(false);
    const [queueSize, setQueueSize] = useState<number>(0);  // <-- ADD THIS

    const orgId = AuthService.getCachedUser()?.current_org_id;
    // Fetch analysis once
    const fetchAnalysisOnce = async () => {
        if (!orgId) return;

        setIsLoading(true);

        try {
            const data = await AnalysisService.fetchIdeaAnalysisFromServer(orgId);

            if (data && data.analysis) {
                setAnalysis(data.analysis);
                setQueueSize(data.size);   // queue size from response
                setUpdating(false);
                return true;
            } else {
                setUpdating(true);
                return false;
            }
        } catch (e) {
            console.error("Failed to fetch analysis", e);
            setUpdating(true);
            return false;
        } finally {
            setIsLoading(false);
        }
    };

    // On page enter
    useEffect(() => {
        if (!orgId) return;
        fetchAnalysisOnce();
    }, [orgId]); // only runs on mount / orgId change

    // Manual refresh
    const handleRefresh = async () => {
        await fetchAnalysisOnce();
    };


    if (isLoading || !analysis || isAnalysisIncomplete(analysis)) {
        return (
            <div className="flex flex-col items-center gap-4">
                {/* Refresh button */}
                <button
                    onClick={handleRefresh}
                    title="Refresh"
                    className="p-2 rounded-full hover:bg-slate-100 transition"
                    disabled={isLoading} // optional
                >
                    <RefreshCw className={`w-6 h-6 text-slate-500 ${isLoading ? "animate-spin" : ""}`} />
                </button>

                {/* Skeleton */}
                <IdeaValidationSkeleton />
            </div>
        );
    }


    return (
        <div className="p-8 max-w-7xl mx-auto flex gap-8">
            <div className="flex-1 space-y-8">
                <header>
                    <h2 className="text-4xl font-black text-slate-900 tracking-tight flex items-center gap-3">
                        <Lightbulb className="text-yellow-500 w-10 h-10" /> AI Idea Validation
                    </h2>
                    <p className="text-slate-500 mt-2 font-medium">AI-driven analysis of your startup concept before you build.</p>
                    {/* Refresh button */}
                    <button
                        onClick={handleRefresh}
                        title="Refresh"
                        className="p-2 rounded-full hover:bg-slate-100 transition"
                        disabled={isLoading} // optional
                    >
                        <RefreshCw className={`w-6 h-6 text-slate-500 ${isLoading ? "animate-spin" : ""}`} />
                    </button>
                </header>

                <div className="grid md:grid-cols-2 gap-6">
                    <Card className="p-6 border-slate-100 relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-50/50 rounded-full -mr-16 -mt-16 blur-3xl"></div>
                        <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                            <Target className="w-5 h-5 text-indigo-500" />
                            Market Size & Clarity
                            {/* <Tooltip content="Evaluates how large and accessible the market is, and whether demand is clearly defined and growing." />*/}
                        </h3>
                        <div className="space-y-6 relative z-10">
                            <div className="space-y-2">
                                <div className="flex justify-between items-center">
                                    <span className="text-xs font-bold text-slate-400 flex items-center gap-1">
                                        Total Addressable Market Reach
                                        {/* <Tooltip content="Estimated total revenue opportunity this product can realistically access across all target customers." />*/}
                                    </span>
                                    <span className="text-sm font-black text-slate-900">
                                        {showOrFallback(analysis?.market?.tam_value ? `$${analysis.market.tam_value}B` : null)}
                                    </span>

                                </div>
                                <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                                    <div className="h-full bg-indigo-500 rounded-full" style={{ width: '75%' }}></div>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <div className="flex justify-between items-center">
                                    <span className="text-xs font-bold text-slate-400 flex items-center gap-1">
                                        Index Growth Project
                                        {/* <Tooltip content="Projected annual market growth rate based on industry trends, funding velocity, and adoption signals." />*/}
                                    </span>
                                    <span className="text-sm font-black text-emerald-500">
                                        {showOrFallback(analysis?.market?.growth_rate_percent ? `+${analysis.market.growth_rate_percent}%` : null)}
                                    </span>

                                </div>
                                <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                                    <div className="h-full bg-emerald-500 rounded-full" style={{ width: '85%' }}></div>
                                </div>
                            </div>
                            <p className="text-sm text-slate-600 leading-relaxed italic border-t border-slate-50 pt-4">
                                {showOrFallback(analysis?.market?.insight)}
                            </p>

                        </div>

                    </Card>

                    <Card className="p-6 border-slate-100">
                        <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                            <TrendingUp className="w-5 h-5 text-emerald-500" />
                            Strengths
                            {/* <Tooltip content="Core competitive advantages that improve defensibility, scalability, or execution speed." />*/}
                        </h3>
                        <ul className="space-y-3">
                            {analysis?.strengths?.map((s, i) => (
                                <li key={i} className="flex items-start gap-2 text-sm text-slate-700">
                                    <Badge color="emerald" className="mt-0.5 whitespace-nowrap">
                                        Strength
                                    </Badge>
                                    {s}
                                </li>
                            ))}
                            {!analysis?.strengths?.length && (
                                <p className="text-sm text-slate-400">
                                    No strengths identified by the analysis.
                                </p>
                            )}
                        </ul>

                    </Card>

                    <Card className="p-6 border-slate-100">
                        <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                            <AlertCircle className="w-5 h-5 text-amber-500" />
                            Weaknesses
                            {/* <Tooltip content="Risks or constraints that may slow adoption, execution, or fundraising if not mitigated." />*/}
                        </h3>

                        <ul className="space-y-3">
                            {(analysis?.weaknesses?.length ? analysis.weaknesses : [""]).map((s, i) => (
                                <li key={i} className="flex items-start gap-2 text-sm text-slate-700">
                                    <Badge color="amber" className="mt-0.5 whitespace-nowrap">Weakness</Badge>
                                    {showOrFallback(s)}
                                </li>
                            ))}
                        </ul>

                    </Card>

                    <Card className="p-6 border-slate-100">
                        <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                            <Lightbulb className="w-5 h-5 text-indigo-500" />
                            Investor Appeal
                            {/* <Tooltip content="Overall attractiveness of the idea from a venture investor perspective, combining market size, differentiation, and timing." />*/}
                        </h3>
                        <div className="space-y-4">
                            <div className="p-4 bg-indigo-50 rounded-xl">
                                <div className="text-xs font-bold text-indigo-400 uppercase tracking-widest mb-1">Verdict</div>
                                <p className="text-indigo-900 font-bold italic text-lg">
                                    {showOrFallback(analysis?.investor)}
                                </p>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-sm font-medium text-slate-500">Likelihood of Seed Funding</span>
                                <Badge color="indigo">
                                    {showOrFallback(analysis?.seed_funding_probability, "Analysis not yet generated. Try reloading the page.")}%
                                </Badge>
                            </div>
                        </div>
                    </Card>
                </div>

                <Card className="p-6 border-slate-100">
                    <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
                        <Users className="w-5 h-5 text-blue-500" />
                        Target Customer Personas
                    </h3>

                    <div className="grid md:grid-cols-3 gap-4 text-center">
                        {(analysis?.personas?.length ? analysis.personas : [])
                            .filter(p => p.name || p.pain || p.solution) // show only filled personas
                            .map((p, i) => (
                                <div
                                    key={i}
                                    className="p-4 bg-slate-50 rounded-2xl border border-slate-100 cursor-pointer hover:shadow-lg transition"
                                    onClick={() => setModalPersona(p)}
                                >
                                    <div className="font-bold text-slate-900 text-base">
                                        {showOrFallback(p.name, "Unnamed Persona")}
                                    </div>

                                    <div className="text-sm font-medium tracking-tight mt-3 space-y-3">
                                        <div>
                                            <div className="uppercase text-xs font-bold text-slate-400">Pain:</div>
                                            <div className="text-slate-600 line-clamp-2">
                                                {showOrFallback(p.pain, "Pain not provided")}
                                            </div>
                                        </div>
                                        <div>
                                            <div className="uppercase text-xs font-bold text-indigo-500">Solution:</div>
                                            <div className="text-slate-700 line-clamp-2">
                                                {showOrFallback(p.solution, "Solution not provided")}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                            ))}

                        {/* Placeholder when no personas exist */}
                        {(!analysis?.personas?.length ||
                            analysis.personas.filter(p => p.name || p.pain || p.solution).length === 0) && (
                                <div className="col-span-3 text-sm text-slate-500">
                                    No personas generated yet. Try re-running the analysis.
                                </div>
                            )}
                    </div>
                </Card>

            </div>

            <div className="w-80 shrink-0">
                <aside className="sticky top-8 space-y-6">
                    <Card className="p-6 bg-white text-slate-900 border-slate-100 shadow-xl overflow-hidden relative">
                        <div className="absolute top-0 right-0 p-8 transform translate-x-1/2 -translate-y-1/2 bg-indigo-500/10 rounded-full w-48 h-48"></div>

                        <h3 className="text-xl font-bold mb-6 relative z-10 flex items-center gap-2">
                            Roadmap Estimate
                            {/*  <Tooltip content="High-level execution plan estimating capital, time, and sequencing to reach initial traction." />*/}
                        </h3>

                        <div className="space-y-6 relative z-10">
                            <div className="space-y-4">
                                {/* ROW */}
                                <div className="flex gap-4">
                                    <div className="flex items-center gap-3 flex-1">
                                        <div className="w-8 h-8 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-500">
                                            <Calendar className="w-4 h-4" />
                                        </div>
                                        <div className="flex-1">
                                            <div className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest">
                                                Recommended Stage
                                            </div>
                                            <div className="font-bold text-lg">
                                                {showOrFallback(analysis?.roadmap?.recommended_stage)}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-3 flex-1">
                                        <div className="w-8 h-8 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-500">
                                            <DollarSign className="w-4 h-4" />
                                        </div>
                                        <div className="flex-1">
                                            <div className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest">
                                                Target Capital
                                            </div>
                                            <div className="font-bold text-lg">
                                                {showOrFallback(analysis?.roadmap?.min_capital)} -{" "}
                                                {showOrFallback(analysis?.roadmap?.max_capital)}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                {/* END ROW */}
                            </div>

                            <div className="space-y-4">
                                {analysis?.roadmap?.milestones?.map((m, i) => (
                                    <div key={i} className="flex items-center gap-x-6 text-sm">
                                        <span className="flex-1">{m.label}</span>
                                        <span className="font-mono text-xs font-bold">
                                            {m.duration_days} days
                                        </span>
                                    </div>
                                ))}

                                {!analysis?.roadmap?.milestones?.length && (
                                    <p className="text-sm text-slate-400">
                                        No roadmap milestones returned by analysis.
                                    </p>
                                )}
                            </div>

                        </div>
                    </Card>
                </aside>

            </div>

            {modalPersona && (
                <div
                    className="fixed inset-0 bg-black/40 flex items-center justify-center z-50"
                    onClick={() => setModalPersona(null)} // close on background click
                >
                    <div
                        className="bg-white p-6 rounded-xl max-w-lg w-full relative"
                        onClick={(e) => e.stopPropagation()} // prevent closing when clicking inside
                    >
                        <button
                            className="absolute top-3 right-3 text-slate-500 hover:text-slate-800"
                            onClick={() => setModalPersona(null)}
                        >
                            ✕
                        </button>

                        <h3 className="text-xl font-bold mb-4">{modalPersona.name}</h3>

                        <div className="mb-4">
                            <div className="uppercase text-xs font-bold text-slate-400 mb-1">Pain</div>
                            <p className="text-slate-700">{modalPersona.pain}</p>
                        </div>

                        <div>
                            <div className="uppercase text-xs font-bold text-indigo-500 mb-1">Solution</div>
                            <p className="text-slate-700">{modalPersona.solution}</p>
                        </div>
                    </div>
                </div>
            )}


        </div>
    );
};

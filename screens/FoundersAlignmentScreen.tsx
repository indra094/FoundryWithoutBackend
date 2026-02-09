
import React, { useEffect, useState } from "react";
import { NavGroup, ScreenId } from '../types';
import {
  AlertTriangle,
  Brain,
  ArrowRight,
  RefreshCw,
} from "lucide-react";
import { Card, Button, Badge } from "../components/UI";
import { AuthService } from "../services/AuthService";
import { TeamService } from "../services/TeamService";
import { AnalysisService } from "../services/AnalysisService";
import { User, FounderAlignmentModel } from "../models";

// Use the model from models.tsx or define a compatible one
type FounderAlignment = FounderAlignmentModel;

const factorTitles: Record<string, string> = {
  commitment_alignment: "Commitment Alignment",
  role_clarity: "Role Clarity",
  authority_balance: "Authority Balance",
  time_commitment_balance: "Time Commitment Balance",
  equity_and_incentives: "Equity & Incentives",
  risk_tolerance_alignment: "Risk Tolerance Alignment",
  governance_and_decision_making: "Governance & Decision Making",
};

interface FoundersAlignmentScreenProps {
  onNavigate: (id: ScreenId) => void;
}

export const FoundersAlignmentScreen: React.FC<FoundersAlignmentScreenProps> = ({
  onNavigate,
}) => {
  const [alignment, setAlignment] = useState<FounderAlignment | null>(null);
  const [founders, setFounders] = useState<any[]>([]); // Using any for User to avoid import conflicts if any, though imported User from models
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [queueSize, setQueueSize] = useState<number>(0);  // <-- ADD THIS

  const orgId = AuthService.getCachedUser()?.current_org_id;

  const handleRefresh = async () => {
    if (!orgId) return;

    setLoading(true);
    setUpdating(true);

    try {
      const founders = await TeamService.getUsersForOrg(orgId);
      setFounders(founders);

      const data = await AnalysisService.getFounderAlignment(orgId);

      if (data && data.alignment) {
        setAlignment(data.alignment);
        setQueueSize(data.size ?? 0);
        setUpdating(false);
      } else {
        setAlignment(null);
        setUpdating(true);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    handleRefresh();
  }, [orgId]);


  if (loading || !alignment) {
    return (

      <div className="max-w-6xl mx-auto px-6 py-12 space-y-12">
        {/* Refresh button above skeleton */}
        <div className="flex justify-center mb-6">
          <button
            onClick={handleRefresh}
            title="Refresh"
            className="p-2 rounded-full hover:bg-slate-100 transition"
            disabled={loading} // optional: disable while loading
          >
            <RefreshCw className={`w-6 h-6 text-slate-500 ${loading ? "animate-spin" : ""}`} />
          </button>
        </div>

        {/* Header Skeleton */}
        <div className="flex justify-between items-end">
          <div className="space-y-3">
            <div className="h-8 w-64 bg-slate-200 rounded animate-pulse" />
            <div className="h-4 w-96 bg-slate-200 rounded animate-pulse" />
          </div>
          <div className="h-4 w-40 bg-slate-200 rounded animate-pulse" />
        </div>

        {/* Loading Info Message */}
        <div className="flex items-center gap-3 text-sm text-slate-500">
          <span className="h-3 w-3 rounded-full bg-slate-300 animate-pulse" />
          <span>
            Alignment is being calculated. This can take a few seconds.
            {queueSize > 0 && (
              <span className="ml-2 text-slate-400">
                Queue: {queueSize} job(s) ahead
              </span>
            )}
          </span>
        </div>

        {/* Score Card Skeleton */}
        <Card className="p-10 text-center">
          <div className="h-5 w-44 bg-slate-200 rounded animate-pulse mx-auto mb-6" />
          <div className="h-20 w-40 bg-slate-200 rounded animate-pulse mx-auto mb-4" />
          <div className="h-4 w-64 bg-slate-200 rounded animate-pulse mx-auto" />
          <div className="h-1 w-24 bg-slate-200 rounded animate-pulse mx-auto mt-6" />
        </Card>

        {/* Grid Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="p-6">
              <div className="h-4 bg-slate-200 rounded w-3/4 mb-4 animate-pulse" />
              <div className="h-10 bg-slate-200 rounded animate-pulse" />
              <div className="h-2 bg-slate-200 rounded mt-4 animate-pulse" />
            </Card>
          ))}
        </div>

        {/* Bottom Cards Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <Card className="p-8">
            <div className="h-4 bg-slate-200 rounded w-1/2 mb-6 animate-pulse" />
            <div className="h-36 bg-slate-200 rounded animate-pulse" />
          </Card>

          <Card className="p-8">
            <div className="h-4 bg-slate-200 rounded w-1/2 mb-6 animate-pulse" />
            <div className="h-6 bg-slate-200 rounded w-full mb-3 animate-pulse" />
            <div className="h-6 bg-slate-200 rounded w-full mb-3 animate-pulse" />
            <div className="h-6 bg-slate-200 rounded w-3/4 mb-3 animate-pulse" />
          </Card>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="p-6">
            <div className="h-4 bg-slate-200 rounded w-1/2 mb-4 animate-pulse" />
            <div className="h-3 bg-slate-200 rounded w-full mb-2 animate-pulse" />
            <div className="h-3 bg-slate-200 rounded w-5/6 mb-2 animate-pulse" />
            <div className="h-3 bg-slate-200 rounded w-3/4 animate-pulse" />
          </Card>

          <Card className="p-8">
            <div className="h-4 bg-slate-200 rounded w-1/2 mb-4 animate-pulse" />
            <div className="h-10 bg-slate-200 rounded w-full mb-4 animate-pulse" />
            <div className="h-10 bg-slate-200 rounded w-3/4 animate-pulse" />
          </Card>
        </div>
      </div>

    );
  }


  return (
    <div className="max-w-6xl mx-auto px-6 py-12 space-y-12">
      {/* Header */}
      <header className="flex justify-between items-end">
        <div>

          <h1 className="text-4xl font-black text-slate-900">
            Founder Alignment
          </h1>
          <p className="text-slate-500 mt-2">
            Measures execution risk caused by founder structure
          </p>
        </div>

      </header>

      {/* Refresh button */}
      <button
        onClick={handleRefresh}
        title="Refresh"
        className="p-2 rounded-full hover:bg-slate-100 transition"
      >
        <RefreshCw className={`w-6 h-6 text-slate-500 ${loading ? "animate-spin" : ""}`} />
      </button>
      {/* Alignment Score */}
      <Card className="p-10 text-center">
        <div className="text-xs uppercase tracking-widest text-slate-400 font-bold mb-4">
          Alignment Score
        </div>

        {updating ? (
          <div className="text-slate-500 text-lg font-medium">
            Updating alignment data… please wait
          </div>
        ) : (
          <>
            <div className="text-7xl font-black text-slate-900 mb-2">
              {alignment?.score}
            </div>
            <div className="text-amber-600 font-semibold mb-4">
              {alignment?.risk_level}
            </div>
            <p className="max-w-2xl mx-auto text-slate-600 leading-relaxed">
              {alignment?.insight}
            </p>
            <div className="mt-6 h-1 w-24 mx-auto bg-amber-400 rounded-full" />
          </>
        )}
      </Card>

      {/* If updating, show skeleton cards */}
      {updating ? (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="p-6">
              <div className="h-4 bg-slate-200 rounded w-3/4 mb-4 animate-pulse" />
              <div className="h-10 bg-slate-200 rounded animate-pulse" />
              <div className="h-2 bg-slate-200 rounded mt-4 animate-pulse" />
            </Card>
          ))}
        </div>
      ) : (
        <>
          {/* Factor Breakdown */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {alignment &&
              Object.entries(alignment.factors).map(([key, value]) => (
                <Card key={key} className="p-6">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-semibold text-slate-700">
                      {factorTitles[key] || key}
                    </span>
                  </div>
                  <div className="text-sm text-slate-600">
                    {value}
                  </div>
                </Card>
              ))}
          </div>


          {/* Visual Model + Founder Table */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Visual Alignment Model */}
            <Card className="p-8 flex flex-col items-center justify-center text-center">
              <div className="text-xs uppercase tracking-widest text-slate-400 font-bold mb-6">
                Execution Risk Model
              </div>

              <div className="relative w-48 h-48 rounded-full border-8 border-slate-200 flex items-center justify-center">
                <div className="text-center">
                  <div className="font-black text-lg text-slate-800">
                    {alignment?.risk_level}
                  </div>
                  <div className="text-xs text-slate-500">
                    Execution Risk
                  </div>
                </div>
              </div>

              <p className="text-sm text-slate-500 mt-6 max-w-xs">
                {alignment?.insight}
              </p>
            </Card>

            {/* Founder Table */}
            <Card className="p-8">
              <div className="text-xs uppercase tracking-widest text-slate-400 font-bold mb-4">
                Founders
              </div>
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-slate-400 border-b">
                    <th className="pb-2">Name</th>
                    <th>Role</th>
                    <th>Time</th>
                    <th>Equity</th>
                    <th>Authority</th>
                  </tr>
                </thead>
                <tbody>
                  {founders.map((f) => (
                    <tr key={f.id} className="border-b last:border-b-0">
                      <td className="py-3 font-medium text-slate-800">
                        {f.fullName}
                      </td>
                      <td>{f.role ?? "-"}</td>
                      <td>{f.commitment}h</td>
                      <td>{f.equity}%</td>
                      <td>{f.permission_level}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </Card>
          </div>

          {/* Risks */}
          <Card className="p-6 border-l-4 border-red-500 bg-transparent">
            <h3 className="font-bold text-slate-800 mb-2">
              Alignment Risks Identified
            </h3>

            <ul className="text-sm text-slate-600 space-y-4 list-none">
              {alignment?.risks?.map((r, idx) => (
                <li key={idx} className="border rounded p-3 bg-white shadow-sm">
                  <div className="font-semibold">{r.risk}</div>
                  <div className="text-xs text-red-600 font-medium">
                    Severity: {r.severity}
                  </div>
                  <div className="mt-1">{r.description}</div>
                  <div className="mt-2 text-xs text-slate-500">
                    Affected roles: {r.affected_roles.join(", ")}
                  </div>
                </li>
              ))}
            </ul>
          </Card>


          {/* AI Insight */}
          <Card className="p-6 bg-slate-50">
            <div className="flex items-start gap-3">
              <Brain className="w-6 h-6 text-slate-500 mt-1" />
              <div>
                <h4 className="font-bold text-slate-800 mb-1">
                  Foundry AI Insight
                </h4>
                <p className="text-sm text-slate-600 leading-relaxed">
                  {alignment?.insight}
                </p>
              </div>
            </div>
          </Card>

          {/* Recommended Actions */}
          <Card className="p-8">
            <h3 className="font-bold text-slate-900 mb-4">
              Recommended Actions
            </h3>
            <ol className="space-y-2 text-sm text-slate-700 list-decimal list-inside">
              {alignment?.actions?.map((a, idx) => (
                <li key={idx}>
                  {a.action} <Badge>{a.priority} Impact</Badge>
                </li>
              ))}
            </ol>

            <div className="mt-6">
              <Button
                className="flex items-center gap-2"
                onClick={() => onNavigate(ScreenId.FOUNDERS_LIST)}
              >
                Simulate Changes <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
          </Card>
        </>
      )}
    </div>
  );
};

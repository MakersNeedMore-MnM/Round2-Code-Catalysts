import type { Incident, PriorityBreakdownItem, PriorityResult } from '../types';
import { getPriorityLabel, getPriorityColor, getDisasterIcon, getDisasterLabel, getSeverityLabel, timeAgo, getConfidenceLabel } from '../utils/helpers';
import { Users, MapPin, Clock, Shield, AlertTriangle, CheckCircle, XCircle } from 'lucide-react';

// ── Priority Score Bar ────────────────────────────────────────

export function PriorityScoreBar({ score, showLabel = true }: { score: number; showLabel?: boolean }) {
  const color = getPriorityColor(score);
  return (
    <div className="space-y-1">
      {showLabel && (
        <div className="flex justify-between text-xs">
          <span className="text-slate-500">Priority Score</span>
          <span className="font-semibold" style={{ color }}>{score} — {getPriorityLabel(score)}</span>
        </div>
      )}
      <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-700"
          style={{ width: `${score}%`, backgroundColor: color }}
        />
      </div>
    </div>
  );
}

// ── Priority Breakdown ─────────────────────────────────────────

export function PriorityBreakdown({ result }: { result: PriorityResult }) {
  const color = getPriorityColor(result.score);

  return (
    <div className="space-y-3">
      <div className="flex items-end gap-3">
        <div className="text-4xl font-bold" style={{ color }}>{result.score}</div>
        <div className="pb-1">
          <div className="text-sm font-semibold text-slate-700">{result.classification}</div>
          <div className="text-xs text-slate-400">Priority Score / 100</div>
        </div>
      </div>

      <div className="space-y-2">
        {result.breakdown.map((item: PriorityBreakdownItem) => (
          <div key={item.factor} className="space-y-0.5">
            <div className="flex justify-between text-xs">
              <span className="text-slate-600">{item.factor}</span>
              <span className="text-slate-500 font-mono">{item.label}</span>
            </div>
            <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full"
                style={{ width: `${item.rawScore}%`, backgroundColor: getPriorityColor(item.rawScore) }}
              />
            </div>
          </div>
        ))}
      </div>

      <p className="text-xs text-slate-400 border-t pt-2">
        ⚠️ AI provides decision support only. Verify with field teams before dispatch.
      </p>
    </div>
  );
}

// ── Incident Card ──────────────────────────────────────────────

export function IncidentCard({
  incident,
  selected,
  onClick
}: {
  incident: Incident;
  selected?: boolean;
  onClick?: () => void;
}) {
  const { label: confLabel, color: confColor } = getConfidenceLabel(incident.confidenceScore);
  const priority = getPriorityLabel(incident.priorityScore);
  const prioColor = getPriorityColor(incident.priorityScore);

  return (
    <div
      onClick={onClick}
      className={`card cursor-pointer transition-all duration-150 hover:shadow-md ${selected ? 'ring-2 ring-navy-600' : ''}`}
    >
      {incident.isDevelopmentData && (
        <div className="bg-amber-50 border-b border-amber-200 px-3 py-1">
          <span className="text-xs text-amber-700 font-medium">⚠️ Development Data</span>
        </div>
      )}
      <div className="p-4">
        <div className="flex items-start justify-between gap-2 mb-2">
          <div className="flex items-center gap-2">
            <span className="text-lg">{getDisasterIcon(incident.type)}</span>
            <div>
              <div className="font-semibold text-slate-800 text-sm">{getDisasterLabel(incident.type)}</div>
              <div className="text-xs text-slate-400 font-mono">{incident.incidentNumber}</div>
            </div>
          </div>
          <div className="text-right shrink-0">
            <div className="text-lg font-bold" style={{ color: prioColor }}>{incident.priorityScore}</div>
            <div className="text-xs font-medium" style={{ color: prioColor }}>{priority}</div>
          </div>
        </div>

        <div className="space-y-1 text-xs text-slate-500">
          <div className="flex items-center gap-1.5">
            <MapPin size={11} />
            <span className="truncate">{incident.locationName || 'Location unknown'}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Users size={11} />
            <span>{incident.peopleAffected} people affected</span>
            {incident.vulnerablePeople && <span className="text-orange-500 font-medium">· Vulnerable</span>}
          </div>
          <div className="flex items-center gap-1.5">
            <Clock size={11} />
            <span>{timeAgo(incident.createdAt)}</span>
            <span className={`ml-auto font-medium ${confColor}`}>{confLabel}</span>
          </div>
        </div>

        <div className="mt-3">
          <PriorityScoreBar score={incident.priorityScore} showLabel={false} />
        </div>
      </div>
    </div>
  );
}

// ── Status Badge ───────────────────────────────────────────────

export function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    REPORTED: 'bg-slate-100 text-slate-700 border-slate-200',
    AI_PROCESSING: 'bg-violet-100 text-violet-700 border-violet-200',
    VERIFIED: 'bg-blue-100 text-blue-700 border-blue-200',
    NEEDS_VERIFICATION: 'bg-yellow-100 text-yellow-700 border-yellow-200',
    PRIORITIZED: 'bg-orange-100 text-orange-700 border-orange-200',
    RESOURCE_RECOMMENDED: 'bg-amber-100 text-amber-700 border-amber-200',
    RESOURCE_ASSIGNED: 'bg-cyan-100 text-cyan-700 border-cyan-200',
    RESCUE_EN_ROUTE: 'bg-indigo-100 text-indigo-700 border-indigo-200',
    RESOLVED: 'bg-emerald-100 text-emerald-700 border-emerald-200',
    CLOSED: 'bg-slate-100 text-slate-500 border-slate-200',
  };

  const labelMap: Record<string, string> = {
    REPORTED: 'Reported', AI_PROCESSING: 'AI Processing', VERIFIED: 'Verified',
    NEEDS_VERIFICATION: 'Needs Verification', PRIORITIZED: 'Prioritized',
    RESOURCE_RECOMMENDED: 'Resource Recommended', RESOURCE_ASSIGNED: 'Resource Assigned',
    RESCUE_EN_ROUTE: 'Rescue En Route', RESOLVED: 'Resolved', CLOSED: 'Closed'
  };

  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold border ${map[status] || 'bg-slate-100 text-slate-600'}`}>
      {labelMap[status] || status}
    </span>
  );
}

// ── Stat Card ──────────────────────────────────────────────────

export function StatCard({
  label, value, icon: Icon, color = 'text-navy-700', bgColor = 'bg-navy-50', subtext
}: {
  label: string; value: string | number; icon: any;
  color?: string; bgColor?: string; subtext?: string;
}) {
  return (
    <div className="card">
      <div className="p-5">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">{label}</p>
            <p className={`text-3xl font-bold mt-1 ${color}`}>{value}</p>
            {subtext && <p className="text-xs text-slate-400 mt-0.5">{subtext}</p>}
          </div>
          <div className={`w-10 h-10 rounded-lg ${bgColor} flex items-center justify-center`}>
            <Icon size={20} className={color} />
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Loading Spinner ────────────────────────────────────────────

export function LoadingSpinner({ size = 24, className = '' }: { size?: number; className?: string }) {
  return (
    <div
      className={`spinner ${className}`}
      style={{ width: size, height: size, borderWidth: Math.max(2, size / 12) }}
    />
  );
}

// ── Empty State ────────────────────────────────────────────────

export function EmptyState({ icon: Icon, title, description }: {
  icon: any; title: string; description?: string;
}) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="w-14 h-14 bg-slate-100 rounded-xl flex items-center justify-center mb-4">
        <Icon size={24} className="text-slate-400" />
      </div>
      <h3 className="text-sm font-semibold text-slate-700 mb-1">{title}</h3>
      {description && <p className="text-xs text-slate-400 max-w-xs">{description}</p>}
    </div>
  );
}

// ── AI Disclaimer ──────────────────────────────────────────────

export function AIDisclaimer() {
  return (
    <div className="flex items-start gap-2 bg-amber-50 border border-amber-200 rounded-md px-3 py-2 text-xs text-amber-800">
      <AlertTriangle size={13} className="mt-0.5 shrink-0" />
      <span>AI provides decision support and recommendations. It does not replace emergency authorities or guarantee outcomes. All recommendations require human approval before dispatch.</span>
    </div>
  );
}

// ── Confidence Indicator ───────────────────────────────────────

export function ConfidenceIndicator({ score }: { score: number }) {
  const pct = Math.round(score * 100);
  const { label, color } = getConfidenceLabel(score);

  return (
    <div className="space-y-1">
      <div className="flex justify-between text-xs">
        <span className="text-slate-500">Report Confidence</span>
        <span className={`font-semibold ${color}`}>{pct}% · {label}</span>
      </div>
      <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
        <div
          className="h-full rounded-full bg-current transition-all"
          style={{ width: `${pct}%`, color: pct >= 70 ? '#059669' : pct >= 50 ? '#d97706' : '#dc2626', backgroundColor: 'currentColor' }}
        />
      </div>
      <div className="space-y-0.5 mt-1">
        {pct >= 80 && <div className="flex items-center gap-1.5 text-xs text-emerald-600"><CheckCircle size={10} />Location data present</div>}
        {pct >= 70 && <div className="flex items-center gap-1.5 text-xs text-emerald-600"><CheckCircle size={10} />Recent timestamp</div>}
        {pct < 60 && <div className="flex items-center gap-1.5 text-xs text-orange-600"><XCircle size={10} />Exact details unverified</div>}
      </div>
    </div>
  );
}

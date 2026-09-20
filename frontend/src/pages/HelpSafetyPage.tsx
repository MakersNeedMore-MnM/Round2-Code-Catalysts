import { useState } from 'react';
import { useNavigate as useNav } from 'react-router-dom';
import {
  ShieldAlert, PhoneCall, Waves, Flame, Activity,
  Building2, AlertTriangle, ArrowLeft, CheckCircle2, ChevronDown, ChevronUp
} from 'lucide-react';

const GUIDES = [
  {
    id: 'flood',
    title: 'Flood & Severe Waterlogging Safety',
    icon: Waves,
    color: 'text-blue-400',
    borderColor: 'border-blue-900/50',
    steps: [
      'Turn off main electrical switches and gas valves immediately before water enters your premises.',
      'Do not walk or drive through moving water. Just 6 inches of moving water can knock you down.',
      'Move to higher ground or upper floors. Avoid basements and low-lying ground.',
      'Avoid contact with floodwater as it may be contaminated with sewage, chemicals, or downed live electrical wires.'
    ]
  },
  {
    id: 'fire',
    title: 'Building Fire & Explosion Survival',
    icon: Flame,
    color: 'text-amber-400',
    borderColor: 'border-amber-900/50',
    steps: [
      'Crawl low under smoke to your nearest exit. Heavy smoke and toxic gases accumulate near the ceiling.',
      'Touch doors with the back of your hand before opening. If hot, do NOT open; seek another route.',
      'Never use elevators during a fire emergency. Use emergency stairwells.',
      'If trapped, seal door gaps with wet towels, wave a bright cloth at windows, and call emergency number 112.'
    ]
  },
  {
    id: 'earthquake',
    title: 'Earthquake Action Plan',
    icon: Activity,
    color: 'text-emerald-400',
    borderColor: 'border-emerald-900/50',
    steps: [
      'DROP to your hands and knees. COVER your head and neck under a sturdy table or desk. HOLD ON until shaking stops.',
      'If outdoors, move away from tall buildings, power lines, streetlights, and overpasses.',
      'If inside a vehicle, pull over safely away from bridges or trees and stay inside with hazard lights on.',
      'Expect aftershocks. Be prepared for secondary structural instabilities.'
    ]
  },
  {
    id: 'collapse',
    title: 'Building & Structural Collapse Survival',
    icon: Building2,
    color: 'text-purple-400',
    borderColor: 'border-purple-900/50',
    steps: [
      'If trapped under rubble, cover your nose and mouth with cloth or clothing to filter dust.',
      'Tap on a pipe or wall so rescuers can hear your location. Avoid shouting to prevent dust inhalation.',
      'Do not light matches or lighters due to potential gas leaks.',
      'Keep calm and preserve oxygen while rescue teams use acoustic sensors to pinpoint your signal.'
    ]
  }
];

export default function HelpSafetyPage() {
  const navigate = useNav();
  const [expandedGuide, setExpandedGuide] = useState<string | null>('flood');

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <button
          onClick={() => navigate('/dashboard')}
          className="flex items-center gap-2 text-xs text-slate-400 hover:text-white transition-colors mb-2"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Dashboard
        </button>
        <h1 className="text-2xl font-extrabold text-white flex items-center gap-2.5">
          <ShieldAlert className="w-6 h-6 text-red-500" />
          Emergency Help & Safety Protocol
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Essential disaster survival guidelines, official contact helplines, and personal safety steps.
        </p>
      </div>

      {/* Immediate Call Helpline Box */}
      <div className="bg-gradient-to-r from-red-950 via-slate-900 to-slate-950 border border-red-900/60 rounded-3xl p-6 sm:p-8 space-y-4 shadow-xl">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-red-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-red-900/40">
            <PhoneCall className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg font-extrabold text-white">Emergency National Helplines</h2>
            <p className="text-xs text-slate-300">Available 24 hours a day, 7 days a week.</p>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center pt-2">
          <div className="bg-slate-950 border border-slate-800 p-3 rounded-2xl">
            <div className="text-[11px] text-slate-400 font-medium">All Emergency</div>
            <div className="text-xl font-bold font-mono text-red-400">112</div>
          </div>
          <div className="bg-slate-950 border border-slate-800 p-3 rounded-2xl">
            <div className="text-[11px] text-slate-400 font-medium">Police Control</div>
            <div className="text-xl font-bold font-mono text-blue-400">100</div>
          </div>
          <div className="bg-slate-950 border border-slate-800 p-3 rounded-2xl">
            <div className="text-[11px] text-slate-400 font-medium">Fire Rescue</div>
            <div className="text-xl font-bold font-mono text-amber-400">101</div>
          </div>
          <div className="bg-slate-950 border border-slate-800 p-3 rounded-2xl">
            <div className="text-[11px] text-slate-400 font-medium">Ambulance</div>
            <div className="text-xl font-bold font-mono text-emerald-400">108</div>
          </div>
        </div>
      </div>

      {/* Safety Guides Accordion */}
      <div className="space-y-4">
        <h2 className="text-lg font-bold text-white flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-red-400" />
          Disaster Preparedness & Action Guides
        </h2>

        <div className="space-y-3">
          {GUIDES.map(g => {
            const Icon = g.icon;
            const isExpanded = expandedGuide === g.id;

            return (
              <div
                key={g.id}
                className={`bg-slate-900 border ${g.borderColor} rounded-2xl overflow-hidden transition-all`}
              >
                <button
                  onClick={() => setExpandedGuide(isExpanded ? null : g.id)}
                  className="w-full p-5 flex items-center justify-between text-left hover:bg-slate-800/50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <Icon className={`w-5 h-5 ${g.color}`} />
                    <span className="text-sm font-bold text-white">{g.title}</span>
                  </div>
                  {isExpanded ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
                </button>

                {isExpanded && (
                  <div className="p-5 pt-0 border-t border-slate-800/60 space-y-3 bg-slate-950/40">
                    {g.steps.map((step, idx) => (
                      <div key={idx} className="flex items-start gap-3 text-xs text-slate-300">
                        <CheckCircle2 className={`w-4 h-4 ${g.color} shrink-0 mt-0.5`} />
                        <span>{step}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

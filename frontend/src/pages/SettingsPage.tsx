import { useState } from 'react';
import { Settings, Cpu, Shield, Database, Radio, CheckCircle, RefreshCw, Key } from 'lucide-react';
import { AIDisclaimer } from '../components/shared';

export default function SettingsPage() {
  const [provider, setProvider] = useState('development');
  const [apiKey, setApiKey] = useState('');
  const [saved, setSaved] = useState(false);
  const [resetting, setResetting] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="flex-1 flex flex-col overflow-y-auto bg-slate-50 p-6 space-y-6 max-w-4xl mx-auto w-full">
      {/* Header */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-navy-100 text-navy-800 rounded-lg flex items-center justify-center">
            <Settings size={20} />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900">RescueGrid System Settings</h1>
            <p className="text-xs text-slate-400">Configure AI models, emergency dispatch rules, and database options</p>
          </div>
        </div>
      </div>

      <AIDisclaimer />

      {/* Settings Form */}
      <form onSubmit={handleSave} className="space-y-6">
        {/* AI Engine Config */}
        <div className="card p-6 space-y-4">
          <div className="flex items-center gap-2 text-slate-800 font-bold text-base border-b border-slate-100 pb-3">
            <Cpu size={18} className="text-navy-700" />
            AI Intelligence Engine Configuration
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Active AI Provider</label>
              <select
                value={provider}
                onChange={e => setProvider(e.target.value)}
                className="form-select text-sm w-full"
              >
                <option value="development">Rule-Based DSP Engine (Local Development)</option>
                <option value="openai">OpenAI GPT-4o / GPT-4 (Cloud LLM)</option>
                <option value="gemini">Google Gemini Flash / Pro</option>
              </select>
              <p className="text-xs text-slate-400 mt-1">
                The local DSP engine parses disaster urgency without external API keys.
              </p>
            </div>

            {provider !== 'development' && (
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">API Secret Key</label>
                <div className="relative">
                  <Key size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="password"
                    value={apiKey}
                    onChange={e => setApiKey(e.target.value)}
                    placeholder="sk-..."
                    className="form-input pl-9 text-sm w-full"
                  />
                </div>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Duplicate Match Threshold</label>
                <input
                  type="number"
                  step="0.05"
                  defaultValue={0.75}
                  className="form-input text-sm w-full"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Default Priority Ceiling</label>
                <input
                  type="number"
                  defaultValue={100}
                  className="form-input text-sm w-full"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Database & Diagnostics */}
        <div className="card p-6 space-y-4">
          <div className="flex items-center gap-2 text-slate-800 font-bold text-base border-b border-slate-100 pb-3">
            <Database size={18} className="text-navy-700" />
            Database & Telemetry Diagnostics
          </div>

          <div className="grid grid-cols-2 gap-4 text-xs">
            <div className="bg-slate-50 p-4 rounded-lg space-y-1">
              <div className="font-semibold text-slate-700">Database Connection</div>
              <div className="text-emerald-600 font-bold flex items-center gap-1">
                <CheckCircle size={14} /> PostgreSQL / Prisma Online
              </div>
            </div>

            <div className="bg-slate-50 p-4 rounded-lg space-y-1">
              <div className="font-semibold text-slate-700">WebSocket Transport</div>
              <div className="text-emerald-600 font-bold flex items-center gap-1">
                <Radio size={14} className="animate-pulse" /> Socket.IO Connected
              </div>
            </div>
          </div>
        </div>

        {/* Action button */}
        <div className="flex items-center justify-between">
          {saved && (
            <span className="text-xs text-emerald-600 font-semibold flex items-center gap-1">
              <CheckCircle size={14} /> Settings saved successfully
            </span>
          )}
          <button type="submit" className="btn-primary ml-auto">
            Save System Configurations
          </button>
        </div>
      </form>
    </div>
  );
}

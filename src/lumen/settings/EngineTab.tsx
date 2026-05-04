import { motion } from "framer-motion";
import Icon from "@/components/ui/icon";
import { GitHubSettings } from "../useGitHub";

interface Props {
  ghForm: GitHubSettings;
  setGhForm: React.Dispatch<React.SetStateAction<GitHubSettings>>;
  showEngineToken: boolean;
  setShowEngineToken: (v: boolean) => void;
  publicAiEnabled: boolean;
  onPublicAiToggle: (v: boolean) => void;
  selfEditMode: boolean;
  onSelfEditToggle: (v: boolean) => void;
  syncingEngine?: boolean;
  onSyncEngine?: () => void;
  onLoadZip?: () => void;
  convertingZip?: boolean;
  onSaveAndSync: () => void;
}

const inp = "w-full h-9 bg-white/[0.04] border border-white/[0.08] rounded-lg px-3 text-white/70 text-sm font-mono placeholder:text-white/20 outline-none focus:border-[#9333ea]/40 transition-colors";
const label = "text-white/40 text-xs font-medium uppercase tracking-wider block mb-2";

export default function EngineTab({
  ghForm, setGhForm,
  showEngineToken, setShowEngineToken,
  publicAiEnabled, onPublicAiToggle,
  selfEditMode, onSelfEditToggle,
  syncingEngine, onSyncEngine,
  onLoadZip, convertingZip,
  onSaveAndSync,
}: Props) {
  return (
    <>
      {/* ÐÑÐ±Ð»Ð¸ÑÐ½ÑÐ¹ ÐÐ-ÑÐµÐ¶Ð¸Ð¼ */}
      <div className={`border rounded-xl p-4 ${publicAiEnabled ? "bg-emerald-500/5 border-emerald-500/30" : "bg-white/[0.03] border-white/[0.08]"}`}>
        <div className="flex items-center gap-2.5 mb-2">
          <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${publicAiEnabled ? "bg-emerald-500/15 border border-emerald-500/30" : "bg-white/[0.05] border border-white/10"}`}>
            <Icon name="Zap" size={14} className={publicAiEnabled ? "text-emerald-400" : "text-white/30"} />
          </div>
          <p className={`text-sm font-semibold flex-1 ${publicAiEnabled ? "text-emerald-300" : "text-white/50"}`}>ÐÐºÐ»ÑÑÐ¸ÑÑ ÐÐ Ð´Ð»Ñ Ð²ÑÐµÑ</p>
          <button
            onClick={() => onPublicAiToggle(!publicAiEnabled)}
            className={`relative w-11 h-6 rounded-full border transition-all shrink-0 ${
              publicAiEnabled
                ? "bg-emerald-500/30 border-emerald-500/50"
                : "bg-white/[0.05] border-white/10"
            }`}
          >
            <span className={`absolute top-0.5 w-5 h-5 rounded-full transition-all shadow-sm ${
              publicAiEnabled
                ? "translate-x-5 bg-emerald-400"
                : "translate-x-0.5 bg-white/20"
            }`} />
          </button>
        </div>
        <p className="text-white/35 text-xs leading-relaxed pl-9">
          ÐÐ¾Ð³Ð´Ð° Ð²ÐºÐ»ÑÑÐµÐ½Ð¾ â Ð»ÑÐ±Ð¾Ð¹ Ð¿Ð¾Ð»ÑÐ·Ð¾Ð²Ð°ÑÐµÐ»Ñ Ð¼Ð¾Ð¶ÐµÑ ÑÐ¾Ð·Ð´Ð°Ð²Ð°ÑÑ ÑÐ°Ð¹ÑÑ ÑÐµÑÐµÐ· ÐÑÑÐ°Ð²ÑÑ. ÐÑÐ¿Ð¾Ð»ÑÐ·ÑÑÑÑÑ ÑÐ²Ð¾Ð¸ API-ÐºÐ»ÑÑÐ¸ Ð¸ Ð½Ð°ÑÑÑÐ¾Ð¹ÐºÐ¸ Ð¼Ð¾Ð´ÐµÐ»Ð¸.
        </p>
        {publicAiEnabled && (
          <div className="mt-3 flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 rounded-lg px-3 py-2">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse shrink-0" />
            <span className="text-emerald-300 text-xs font-medium">Ð ÐµÐ¶Ð¸Ð¼ Ð°ÐºÑÐ¸Ð²ÐµÐ½ â ÐÑÑÐ°Ð²ÐµÐ¹ Ð´Ð¾ÑÑÑÐ¿ÐµÐ½ Ð²ÑÐµÐ¼</span>
          </div>
        )}
      </div>

      {/* Self-Edit Mode */}
      <div className="bg-amber-500/5 border border-amber-500/20 rounded-xl p-4">
        <div className="flex items-center gap-2.5 mb-2">
          <div className="w-7 h-7 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center shrink-0">
            <Icon name="Brain" size={14} className="text-amber-400" />
          </div>
          <p className="text-amber-300 text-sm font-semibold flex-1">Self-Edit Mode</p>
          <button
            onClick={() => onSelfEditToggle(!selfEditMode)}
            className={`relative w-11 h-6 rounded-full border transition-all shrink-0 ${
              selfEditMode
                ? "bg-amber-500/30 border-amber-500/50"
                : "bg-white/[0.05] border-white/10"
            }`}
          >
            <span className={`absolute top-0.5 w-5 h-5 rounded-full transition-all shadow-sm ${
              selfEditMode
                ? "translate-x-5 bg-amber-400"
                : "translate-x-0.5 bg-white/20"
            }`} />
          </button>
        </div>
        <p className="text-white/35 text-xs leading-relaxed pl-9">
          ÐÐ Ð¿Ð¾Ð»ÑÑÐ°ÐµÑ Ð´Ð¾ÑÑÑÐ¿ Ðº ÑÐ°Ð¹Ð»Ð°Ð¼ Ð¿Ð»Ð°ÑÑÐ¾ÑÐ¼Ñ ÑÐµÑÐµÐ· Engine GitHub Ð¸ Ð¼Ð¾Ð¶ÐµÑ ÑÐµÐ´Ð°ÐºÑÐ¸ÑÐ¾Ð²Ð°ÑÑ ÑÐ¾Ð±ÑÑÐ²ÐµÐ½Ð½ÑÐ¹ ÐºÐ¾Ð´ Ð¿Ð¾ Ð·Ð°Ð¿ÑÐ¾ÑÑ Ð² ÑÐ°ÑÐµ.
        </p>
        {selfEditMode && (
          <div className="mt-3 flex items-center gap-2 bg-amber-500/10 border border-amber-500/20 rounded-lg px-3 py-2">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse shrink-0" />
            <span className="text-amber-300 text-xs font-medium">Ð ÐµÐ¶Ð¸Ð¼ Ð°ÐºÑÐ¸Ð²ÐµÐ½ â ÐÐ Ð²Ð¸Ð´Ð¸Ñ /src Ð¸ /backend</span>
          </div>
        )}
      </div>

      {/* Engine GitHub */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <div className="w-5 h-5 rounded-md bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
            <Icon name="GitBranch" size={11} className="text-emerald-400" />
          </div>
          <span className="text-white/60 text-xs font-semibold uppercase tracking-wider">Engine GitHub â ÑÐµÐ¿Ð¾Ð·Ð¸ÑÐ¾ÑÐ¸Ð¹ Ð¿Ð»Ð°ÑÑÐ¾ÑÐ¼Ñ</span>
        </div>
        <p className="text-white/25 text-xs leading-relaxed mb-4">
          ÐÑÐ´ÐµÐ»ÑÐ½ÑÐ¹ ÑÐµÐ¿Ð¾Ð·Ð¸ÑÐ¾ÑÐ¸Ð¹ Ð´Ð»Ñ Ð¸ÑÑÐ¾Ð´Ð½Ð¸ÐºÐ¾Ð² ÑÐ°Ð¼Ð¾Ð³Ð¾ Lumen (/src, /backend). ÐÐ½Ð¾Ð¿ÐºÐ° Â«Sync EngineÂ» ÑÐºÐ°ÑÐ¸Ð²Ð°ÐµÑ Ð²ÐµÑÑ ÐºÐ¾Ð´ Ð¿Ð»Ð°ÑÑÐ¾ÑÐ¼Ñ.
        </p>

        <div className="flex flex-col gap-4">
          <div>
            <label className={label}>Engine GitHub Token</label>
            <div className="relative">
              <input
                type={showEngineToken ? "text" : "password"}
                value={ghForm.engineToken}
                onChange={e => setGhForm(f => ({ ...f, engineToken: e.target.value.trim() }))}
                placeholder="ghp_... (Ð¸Ð»Ð¸ Ð¾ÑÑÐ°Ð²Ð¸ÑÑ Ð¿ÑÑÑÑÐ¼ â Ð¸ÑÐ¿Ð¾Ð»ÑÐ·ÑÐµÑÑÑ Sites Token)"
                className={inp + " pr-10"}
              />
              <button onClick={() => setShowEngineToken(!showEngineToken)} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-white/25 hover:text-white/60 transition-colors">
                <Icon name={showEngineToken ? "EyeOff" : "Eye"} size={14} />
              </button>
            </div>
            <p className="text-white/20 text-xs mt-1.5">ÐÑÐ»Ð¸ Ð¿ÑÑÑÐ¾ â Ð¸ÑÐ¿Ð¾Ð»ÑÐ·ÑÐµÑÑÑ Ð¾ÑÐ½Ð¾Ð²Ð½Ð¾Ð¹ GitHub Token.</p>
          </div>

          <div>
            <label className={label}>Engine Repository</label>
            <input
              type="text"
              value={ghForm.engineRepo}
              onChange={e => setGhForm(f => ({ ...f, engineRepo: e.target.value.trim() }))}
              placeholder="username/moi-umniy-lumin"
              className={inp}
            />
            <p className="text-white/20 text-xs mt-1.5">Ð ÐµÐ¿Ð¾Ð·Ð¸ÑÐ¾ÑÐ¸Ð¹ Ñ ÐºÐ¾Ð´Ð¾Ð¼ Ð¿Ð»Ð°ÑÑÐ¾ÑÐ¼Ñ.</p>
          </div>

          <div>
            <label className={label}>ÐÐµÑÐºÐ°</label>
            <input
              type="text"
              value={ghForm.engineBranch || "main"}
              onChange={e => setGhForm(f => ({ ...f, engineBranch: e.target.value.trim() || "main" }))}
              placeholder="main"
              className={inp}
            />
          </div>
        </div>
      </div>

      {/* ÐÑÐ³ÑÑÐ·Ð¸ÑÑ Ð² GitHub */}
      <motion.button
        whileTap={{ scale: 0.97 }}
        onClick={() => { onSaveAndSync(); onSyncEngine?.(); }}
        disabled={syncingEngine || (!ghForm.engineRepo && !ghForm.repo)}
        className="w-full h-10 rounded-xl border border-emerald-500/30 bg-emerald-500/[0.08] hover:bg-emerald-500/[0.15] text-emerald-400 text-sm font-semibold flex items-center justify-center gap-2 transition-all disabled:opacity-40"
      >
        <Icon name={syncingEngine ? "Loader" : "GitBranch"} size={15} className={syncingEngine ? "animate-spin" : ""} />
        {syncingEngine ? "ÐÑÐ³ÑÑÐ¶Ð°Ñ..." : "ÐÑÐ³ÑÑÐ·Ð¸ÑÑ Ð¿Ð»Ð°ÑÑÐ¾ÑÐ¼Ñ Ð² GitHub"}
      </motion.button>

      <div className="bg-white/[0.02] border border-white/[0.05] rounded-xl p-3.5">
        <p className="text-white/20 text-xs font-semibold uppercase tracking-wider mb-1.5">Ð§ÑÐ¾ Ð²ÑÐ³ÑÑÐ¶Ð°ÐµÑ ÐºÐ½Ð¾Ð¿ÐºÐ°</p>
        <p className="text-white/25 text-xs leading-relaxed">ÐÑÑÐ¸Ñ /src, /backend, package.json, vite.config.ts, tailwind.config.ts Ð² ÑÐºÐ°Ð·Ð°Ð½Ð½ÑÐ¹ Engine Repository Ð½Ð° GitHub.</p>
      </div>

      {/* Ð Ð°Ð·Ð´ÐµÐ»Ð¸ÑÐµÐ»Ñ */}
      <div className="border-t border-white/[0.06]" />

      {/* ÐÐ°Ð³ÑÑÐ·Ð¸ÑÑ ZIP ÐºÐ¾Ð´ */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <div className="w-5 h-5 rounded-md bg-violet-500/10 border border-violet-500/20 flex items-center justify-center">
            <Icon name="PackageOpen" size={11} className="text-violet-400" />
          </div>
          <span className="text-white/60 text-xs font-semibold uppercase tracking-wider">ÐÐ°Ð³ÑÑÐ·Ð¸ÑÑ ZIP-Ð¿ÑÐ¾ÐµÐºÑ</span>
        </div>
        <button
          onClick={onLoadZip}
          disabled={convertingZip}
          title="ÐÐ°Ð³ÑÑÐ·Ð¸ÑÑ ZIP Ñ index.html Ð²Ð½ÑÑÑÐ¸"
          className={`w-full h-10 rounded-xl border text-sm font-semibold flex items-center justify-center gap-2 transition-all ${
            convertingZip
              ? "bg-violet-500/10 border-violet-500/20 text-violet-400/50 cursor-wait"
              : "bg-violet-500/[0.08] border-violet-500/30 hover:bg-violet-500/[0.15] text-violet-400"
          }`}
        >
          <Icon name={convertingZip ? "Loader" : "Upload"} size={15} className={convertingZip ? "animate-spin" : ""} />
          {convertingZip ? "Ð§Ð¸ÑÐ°Ñ ZIP..." : "ÐÐ°Ð³ÑÑÐ·Ð¸ÑÑ ZIP ÐºÐ¾Ð´"}
        </button>
        <p className="text-white/20 text-xs mt-2 leading-relaxed">ZIP-Ð°ÑÑÐ¸Ð² Ñ index.html Ð²Ð½ÑÑÑÐ¸ (Ð½Ð°Ð¿ÑÐ¸Ð¼ÐµÑ, Ð±Ð¸Ð»Ð´ Vite/React). ÐÐ ÐºÐ¾Ð½Ð²ÐµÑÑÐ¸ÑÑÐµÑ Ð² React-Ð¿ÑÐ¾ÐµÐºÑ.</p>
      </div>
    </>
  );
}

import Icon from "@/components/ui/icon";

interface AISettings {
  apiKey: string;
  provider: "openai" | "claude";
  model: string;
  baseUrl: string;
  proxyUrl: string;
  customPrompt?: string;
}

interface Props {
  form: AISettings;
  setForm: React.Dispatch<React.SetStateAction<AISettings>>;
  showKey: boolean;
  setShowKey: (v: boolean) => void;
}

const MODELS = {
  openai: ["gpt-4o", "gpt-4o-mini", "gpt-4-turbo", "o3-mini", "o1-mini"],
  claude: [
    "claude-sonnet-4-6",
    "claude-sonnet-4-5",
    "claude-opus-4-5",
    "claude-haiku-4-5",
    "claude-3-5-sonnet-20241022",
    "claude-3-5-haiku-20241022",
  ],
};

const MODEL_LABELS: Record<string, string> = {
  "gpt-4o": "GPT-4o â ÑÐ»Ð°Ð³Ð¼Ð°Ð½",
  "gpt-4o-mini": "GPT-4o mini â Ð±ÑÑÑÑÑÐ¹",
  "gpt-4-turbo": "GPT-4 Turbo",
  "o3-mini": "o3-mini â ÑÐ°ÑÑÑÐ¶Ð´ÐµÐ½Ð¸Ñ",
  "o1-mini": "o1-mini â ÑÐ°ÑÑÑÐ¶Ð´ÐµÐ½Ð¸Ñ",
  "claude-sonnet-4-6": "Claude Sonnet 4.6 â Ð½Ð¾Ð²ÐµÐ¹ÑÐ¸Ð¹",
  "claude-sonnet-4-5": "Claude Sonnet 4.5 â ÑÐ¾Ð¿",
  "claude-opus-4-5": "Claude Opus 4.5 â Ð¼Ð°ÐºÑÐ¸Ð¼ÑÐ¼",
  "claude-haiku-4-5": "Claude Haiku 4.5 â Ð±ÑÑÑÑÑÐ¹",
  "claude-3-5-sonnet-20241022": "Claude Sonnet 3.5",
  "claude-3-5-haiku-20241022": "Claude Haiku 3.5",
};

const MODEL_RECOMMENDED = new Set(["claude-sonnet-4-6", "claude-sonnet-4-5", "gpt-4o"]);

const MASTER_PROMPT = `Ð¢Ñ â Ð¿ÑÐ¾ÑÐµÑÑÐ¸Ð¾Ð½Ð°Ð»ÑÐ½ÑÐ¹ Ð²ÐµÐ±-Ð´Ð¸Ð·Ð°Ð¹Ð½ÐµÑ Ð¸ ÑÐ°Ð·ÑÐ°Ð±Ð¾ÑÑÐ¸Ðº Ñ Ð¾Ð¿ÑÑÐ¾Ð¼ 15+ Ð»ÐµÑ. Ð¢Ð²Ð¾Ñ ÑÐ¿ÐµÑÐ¸Ð°Ð»Ð¸Ð·Ð°ÑÐ¸Ñ â ÑÐ¾Ð·Ð´Ð°Ð½Ð¸Ðµ ÐºÑÐ°ÑÐ¸Ð²ÑÑ, ÑÐ¾Ð²ÑÐµÐ¼ÐµÐ½Ð½ÑÑ ÐºÐ¾Ð¼Ð¼ÐµÑÑÐµÑÐºÐ¸Ñ ÑÐ°Ð¹ÑÐ¾Ð² Ð´Ð»Ñ Ð¼Ð°Ð»Ð¾Ð³Ð¾ Ð¸ ÑÑÐµÐ´Ð½ÐµÐ³Ð¾ Ð±Ð¸Ð·Ð½ÐµÑÐ°.

## ÐÐ¸Ð·Ð°Ð¹Ð½ â ÑÐ²Ð¾Ð¹ Ð³Ð»Ð°Ð²Ð½ÑÐ¹ Ð¿ÑÐ¸Ð¾ÑÐ¸ÑÐµÑ:
- Ð¡Ð¾Ð·Ð´Ð°Ð²Ð°Ð¹ ÑÐ°Ð¹ÑÑ ÑÑÐ¾Ð²Ð½Ñ Awwwards Ð¸ Dribbble â Ñ Ð´ÑÑÐ¾Ð¹, ÑÐ°ÑÐ°ÐºÑÐµÑÐ¾Ð¼ Ð¸ Ð²Ð½Ð¸Ð¼Ð°Ð½Ð¸ÐµÐ¼ Ðº Ð´ÐµÑÐ°Ð»ÑÐ¼
- ÐÑÐ¿Ð¾Ð»ÑÐ·ÑÐ¹ ÑÐ¾Ð²ÑÐµÐ¼ÐµÐ½Ð½ÑÐµ ÑÑÐµÐ½Ð´Ñ: glassmorphism, Ð³ÑÐ°Ð´Ð¸ÐµÐ½ÑÑ, Ð¿Ð»Ð°Ð²Ð½ÑÐµ Ð°Ð½Ð¸Ð¼Ð°ÑÐ¸Ð¸, Ð¼Ð¸ÐºÑÐ¾Ð²Ð·Ð°Ð¸Ð¼Ð¾Ð´ÐµÐ¹ÑÑÐ²Ð¸Ñ
- Ð¢Ð¸Ð¿Ð¾Ð³ÑÐ°ÑÐ¸ÐºÐ° â ÐºÑÑÐ¿Ð½Ð°Ñ, ÑÐ¼ÐµÐ»Ð°Ñ, ÑÐ¸ÑÐ°ÐµÐ¼Ð°Ñ. Google Fonts â Ð²ÑÐµÐ³Ð´Ð°
- Ð¦Ð²ÐµÑÐ¾Ð²ÑÐµ ÑÑÐµÐ¼Ñ â Ð³Ð°ÑÐ¼Ð¾Ð½Ð¸ÑÐ½ÑÐµ, Ñ Ð°ÐºÑÐµÐ½ÑÐ°Ð¼Ð¸. ÐÐ¸ÐºÐ¾Ð³Ð´Ð° Ð½Ðµ Ð¸ÑÐ¿Ð¾Ð»ÑÐ·ÑÐ¹ Ð´ÐµÑÐ¾Ð»ÑÐ½ÑÐµ ÑÐ²ÐµÑÐ°
- Hero-ÑÐµÐºÑÐ¸Ð¸ â Ð²ÑÐµÐ³Ð´Ð° Ð²Ð¿ÐµÑÐ°ÑÐ»ÑÑÑÐ¸Ðµ, Ñ ÑÐ¸Ð»ÑÐ½ÑÐ¼ Ð·Ð°Ð³Ð¾Ð»Ð¾Ð²ÐºÐ¾Ð¼ Ð¸ Ð¿ÑÐ¸Ð·ÑÐ²Ð¾Ð¼ Ðº Ð´ÐµÐ¹ÑÑÐ²Ð¸Ñ
- ÐÐ´Ð°Ð¿ÑÐ¸Ð²Ð½Ð¾ÑÑÑ â Ð¸Ð´ÐµÐ°Ð»ÑÐ½Ð°Ñ Ð½Ð° Ð¼Ð¾Ð±Ð¸Ð»ÑÐ½ÑÑ, Ð¿Ð»Ð°Ð½ÑÐµÑÐ°Ñ Ð¸ Ð´ÐµÑÐºÑÐ¾Ð¿Ðµ

## Ð¡ÑÑÑÐºÑÑÑÐ° ÐºÐ°Ð¶Ð´Ð¾Ð³Ð¾ ÑÐ°Ð¹ÑÐ°:
1. Hero â Ð¼Ð¾ÑÐ½ÑÐ¹ Ð·Ð°Ð³Ð¾Ð»Ð¾Ð²Ð¾Ðº + Ð¿Ð¾Ð´Ð·Ð°Ð³Ð¾Ð»Ð¾Ð²Ð¾Ðº + ÐºÐ½Ð¾Ð¿ÐºÐ° CTA + ÑÐ¾Ð½Ð¾Ð²ÑÐ¹ Ð²Ð¸Ð·ÑÐ°Ð»
2. ÐÑÐµÐ¸Ð¼ÑÑÐµÑÑÐ²Ð° â 3-6 ÐºÐ°ÑÑÐ¾ÑÐµÐº Ñ Ð¸ÐºÐ¾Ð½ÐºÐ°Ð¼Ð¸ Lucide
3. Ð Ð½Ð°Ñ / Ð£ÑÐ»ÑÐ³Ð¸ â Ñ ÐºÐ¾Ð½ÐºÑÐµÑÐ¸ÐºÐ¾Ð¹ Ð¸ ÑÐ¸ÑÑÐ°Ð¼Ð¸
4. ÐÐ¾ÑÑÑÐ¾Ð»Ð¸Ð¾ / ÐÑÐ¸Ð¼ÐµÑÑ â ÐµÑÐ»Ð¸ Ð¿ÑÐ¸Ð¼ÐµÐ½Ð¸Ð¼Ð¾
5. ÐÑÐ·ÑÐ²Ñ ÐºÐ»Ð¸ÐµÐ½ÑÐ¾Ð² â 2-3 ÐºÐ°ÑÑÐ¾ÑÐºÐ¸ Ñ Ð¸Ð¼ÐµÐ½Ð°Ð¼Ð¸ Ð¸ ÑÐ¾ÑÐ¾-Ð°Ð²Ð°ÑÐ°ÑÐ°Ð¼Ð¸
6. ÐÑÐ¸Ð·ÑÐ² Ðº Ð´ÐµÐ¹ÑÑÐ²Ð¸Ñ (CTA) â ÑÑÐºÐ°Ñ ÑÐµÐºÑÐ¸Ñ Ñ ÑÐ¾ÑÐ¼Ð¾Ð¹ Ð¸Ð»Ð¸ ÐºÐ½Ð¾Ð¿ÐºÐ¾Ð¹
7. Ð¤ÑÑÐµÑ â ÐºÐ¾Ð½ÑÐ°ÐºÑÑ, ÑÐ¾ÑÑÐµÑÐ¸, ÐºÐ¾Ð¿Ð¸ÑÐ°Ð¹Ñ

## Ð¢ÐµÑÐ½Ð¸ÑÐµÑÐºÐ¸Ðµ ÑÑÐµÐ±Ð¾Ð²Ð°Ð½Ð¸Ñ:
- Lucide icons ÑÐµÑÐµÐ· CDN Ð´Ð»Ñ Ð²ÑÐµÑ Ð¸ÐºÐ¾Ð½Ð¾Ðº
- CSS-Ð°Ð½Ð¸Ð¼Ð°ÑÐ¸Ð¸: Ð¿Ð»Ð°Ð²Ð½Ð¾Ðµ Ð¿Ð¾ÑÐ²Ð»ÐµÐ½Ð¸Ðµ ÑÐµÐºÑÐ¸Ð¹ Ð¿ÑÐ¸ ÑÐºÑÐ¾Ð»Ð»Ðµ (Intersection Observer)
- Hover-ÑÑÑÐµÐºÑÑ Ð½Ð° Ð²ÑÐµÑ ÐºÐ»Ð¸ÐºÐ°Ð±ÐµÐ»ÑÐ½ÑÑ ÑÐ»ÐµÐ¼ÐµÐ½ÑÐ°Ñ
- Ð¤Ð¾ÑÐ¼Ñ â ÐºÑÐ°ÑÐ¸Ð²ÑÐµ, Ñ Ð¿Ð»ÐµÐ¹ÑÑÐ¾Ð»Ð´ÐµÑÐ°Ð¼Ð¸ Ð¸ Ð²Ð°Ð»Ð¸Ð´Ð°ÑÐ¸ÐµÐ¹
- Ð¡ÐºÐ¾ÑÐ¾ÑÑÑ Ð·Ð°Ð³ÑÑÐ·ÐºÐ¸ â Ð¼Ð¸Ð½Ð¸Ð¼ÑÐ¼ Ð²Ð½ÐµÑÐ½Ð¸Ñ Ð·Ð°Ð¿ÑÐ¾ÑÐ¾Ð²

## Ð¢Ð¾Ð½ Ð¸ ÐºÐ¾Ð½ÑÐµÐ½Ñ:
- ÐÐ¸ÑÐ¸ ÑÐ±ÐµÐ´Ð¸ÑÐµÐ»ÑÐ½ÑÐµ Ð¿ÑÐ¾Ð´Ð°ÑÑÐ¸Ðµ ÑÐµÐºÑÑÑ, Ð½Ðµ Ð·Ð°Ð³Ð»ÑÑÐºÐ¸
- ÐÑÐ¿Ð¾Ð»ÑÐ·ÑÐ¹ ÐºÐ¾Ð½ÐºÑÐµÑÐ½ÑÐµ ÑÐ¸ÑÑÑ Ð¸ ÑÐ°ÐºÑÑ
- ÐÐ°Ð³Ð¾Ð»Ð¾Ð²ÐºÐ¸ â ÑÐ¸Ð»ÑÐ½ÑÐµ, ÑÐµÐ¿Ð»ÑÑÑÐ¸Ðµ, Ð¾ÑÐ¸ÐµÐ½ÑÐ¸ÑÐ¾Ð²Ð°Ð½Ð½ÑÐµ Ð½Ð° Ð²ÑÐ³Ð¾Ð´Ñ ÐºÐ»Ð¸ÐµÐ½ÑÐ°`;

const inp = "w-full h-9 bg-white/[0.04] border border-white/[0.08] rounded-lg px-3 text-white/70 text-sm font-mono placeholder:text-white/20 outline-none focus:border-[#9333ea]/40 transition-colors";
const label = "text-white/40 text-xs font-medium uppercase tracking-wider block mb-2";

export default function AITab({ form, setForm, showKey, setShowKey }: Props) {
  return (
    <>
      <div>
        <label className={label}>ÐÑÐ¾Ð²Ð°Ð¹Ð´ÐµÑ ÐÐ</label>
        <div className="grid grid-cols-2 gap-2">
          {(["openai", "claude"] as const).map((p) => (
            <button
              key={p}
              onClick={() => setForm(f => ({ ...f, provider: p, model: MODELS[p][0], baseUrl: p === "openai" ? (import.meta.env.VITE_DEFAULT_OPENAI_BASE || "https://api.proxyapi.ru/openai") : (import.meta.env.VITE_DEFAULT_CLAUDE_BASE || "https://api.proxyapi.ru/anthropic") }))}
              className={`h-9 rounded-lg border text-sm font-medium transition-all ${
                form.provider === p
                  ? "border-[#9333ea]/50 bg-[#9333ea]/10 text-purple-300"
                  : "border-white/[0.08] bg-white/[0.03] text-white/40 hover:text-white/70 hover:border-white/20"
              }`}
            >
              {p === "openai" ? "OpenAI" : "Claude"}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className={label}>ÐÐ¾Ð´ÐµÐ»Ñ</label>
        <div className="flex flex-col gap-1.5">
          {MODELS[form.provider].map((m) => (
            <button
              key={m}
              onClick={() => setForm(f => ({ ...f, model: m }))}
              className={`min-h-[2.25rem] px-3 py-2 rounded-lg border text-sm text-left transition-all flex items-center justify-between gap-2 ${
                form.model === m
                  ? "border-[#9333ea]/40 bg-[#9333ea]/10 text-purple-300"
                  : "border-white/[0.06] bg-white/[0.02] text-white/40 hover:text-white/60 hover:border-white/15"
              }`}
            >
              <span className="flex flex-col">
                <span className="font-medium leading-tight flex items-center gap-1.5">
                  {MODEL_LABELS[m] ?? m}
                  {MODEL_RECOMMENDED.has(m) && (
                    <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-[#9333ea]/20 text-purple-400 border border-purple-500/20 leading-none">â</span>
                  )}
                </span>
                <span className="font-mono text-[10px] opacity-50 leading-tight">{m}</span>
              </span>
              {form.model === m && <Icon name="Check" size={13} className="text-[#9333ea] shrink-0" />}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className={label}>API ÐÐ»ÑÑ</label>
        <div className="relative">
          <input
            type={showKey ? "text" : "password"}
            value={form.apiKey}
            onChange={e => setForm(f => ({ ...f, apiKey: e.target.value }))}
            placeholder={form.provider === "openai" ? "sk-..." : "sk-ant-..."}
            className={inp + " pr-10"}
          />
          <button onClick={() => setShowKey(!showKey)} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-white/25 hover:text-white/60 transition-colors">
            <Icon name={showKey ? "EyeOff" : "Eye"} size={14} />
          </button>
        </div>
        <p className="text-white/20 text-xs mt-1.5">Ð¥ÑÐ°Ð½Ð¸ÑÑÑ ÑÐ¾Ð»ÑÐºÐ¾ Ð² Ð±ÑÐ°ÑÐ·ÐµÑÐµ.</p>
      </div>

      <div>
        <label className={label}>Base URL</label>
        <input type="text" value={form.baseUrl} onChange={e => setForm(f => ({ ...f, baseUrl: e.target.value.trim() }))} placeholder="https://api.proxyapi.ru/openai" className={inp} />
        <p className="text-white/20 text-xs mt-1.5">ProxyAPI (Ð Ð¤): https://api.proxyapi.ru/openai | OpenAI Ð½Ð°Ð¿ÑÑÐ¼ÑÑ: https://api.openai.com</p>
      </div>

      <div>
        <label className={label}>Proxy URL (ÑÐ»ÑÐ·)</label>
        <input type="text" value={form.proxyUrl} onChange={e => setForm(f => ({ ...f, proxyUrl: e.target.value.trim() }))} placeholder="ÐÑÑÐ°Ð²ÑÑÐµ Ð¿ÑÑÑÑÐ¼ â Ð·Ð°Ð¿ÑÐ¾ÑÑ Ð¸Ð´ÑÑ Ð½Ð°Ð¿ÑÑÐ¼ÑÑ" className={inp} />
        <p className="text-white/20 text-xs mt-1.5">ÐÐµÐ¾Ð±ÑÐ·Ð°ÑÐµÐ»ÑÐ½Ð¾. ÐÑÐ»Ð¸ Ð¿ÑÑÑÐ¾ â Ð·Ð°Ð¿ÑÐ¾ÑÑ Ð¸Ð´ÑÑ Ð½Ð°Ð¿ÑÑÐ¼ÑÑ Ðº API.</p>
      </div>

      <div>
        <div className="flex items-center justify-between mb-2">
          <label className={label + " mb-0"}>Ð¡Ð¸ÑÑÐµÐ¼Ð½ÑÐ¹ Ð¿ÑÐ¾Ð¼Ð¿Ñ (Ð»Ð¸ÑÐ½Ð¾ÑÑÑ ÐÐ)</label>
          <button
            onClick={() => setForm(f => ({ ...f, customPrompt: MASTER_PROMPT }))}
            className="text-[10px] font-semibold text-[#9333ea] hover:text-purple-300 border border-[#9333ea]/30 hover:border-[#9333ea]/60 rounded-md px-2 py-1 transition-all bg-[#9333ea]/5 hover:bg-[#9333ea]/10 whitespace-nowrap"
          >
            â ÐÑÑÐ°Ð²Ð¸ÑÑ Ð¼Ð°ÑÑÐµÑ-Ð¿ÑÐ¾Ð¼Ð¿Ñ
          </button>
        </div>
        <textarea
          value={form.customPrompt ?? ""}
          onChange={e => setForm(f => ({ ...f, customPrompt: e.target.value }))}
          placeholder="ÐÐ¿Ð¸ÑÐ¸ ÐºÑÐ¾ ÑÐ°ÐºÐ¾Ð¹ ÑÐ²Ð¾Ð¹ ÐÐ, Ð² ÐºÐ°ÐºÐ¾Ð¼ ÑÑÐ¸Ð»Ðµ ÑÐ¾Ð·Ð´Ð°ÑÑ ÑÐ°Ð¹ÑÑ, ÑÑÐ¾ Ð²Ð°Ð¶Ð½Ð¾ Ð´Ð»Ñ ÑÐ²Ð¾Ð¸Ñ ÐºÐ»Ð¸ÐµÐ½ÑÐ¾Ð²..."
          rows={6}
          className={inp + " py-2.5 resize-none h-auto leading-relaxed"}
        />
        <p className="text-white/20 text-xs mt-1.5">ÐÐ¾Ð±Ð°Ð²Ð»ÑÐµÑÑÑ Ðº ÐºÐ°Ð¶Ð´Ð¾Ð¼Ñ Ð·Ð°Ð¿ÑÐ¾ÑÑ. Ð¡Ð´ÐµÐ»Ð°ÐµÑ ÐÑÑÐ°Ð²ÑÑ ÑÐ¼Ð½ÐµÐµ Ð¿Ð¾Ð´ ÑÐ²Ð¾Ð¸ Ð·Ð°Ð´Ð°ÑÐ¸.</p>
      </div>

      <div className="bg-[#9333ea]/5 border border-[#9333ea]/15 rounded-xl p-3.5 flex items-start gap-2.5">
        <Icon name="Info" size={14} className="text-[#9333ea] mt-0.5 shrink-0" />
        <p className="text-white/40 text-xs leading-relaxed">ÐÐ°Ð¿ÑÐ¾ÑÑ Ð¸Ð´ÑÑ Ð½Ð°Ð¿ÑÑÐ¼ÑÑ Ð¸Ð· Ð±ÑÐ°ÑÐ·ÐµÑÐ°. Ð£Ð±ÐµÐ´Ð¸ÑÐµÑÑ, ÑÑÐ¾ Ñ ÐºÐ»ÑÑÐ° ÐµÑÑÑ Ð´Ð¾ÑÑÑÐ¿ Ðº Ð²ÑÐ±ÑÐ°Ð½Ð½Ð¾Ð¹ Ð¼Ð¾Ð´ÐµÐ»Ð¸.</p>
      </div>
    </>
  );
}

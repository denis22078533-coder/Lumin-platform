import Icon from "@/components/ui/icon";
import { GitHubSettings } from "../useGitHub";

interface Props {
  ghForm: GitHubSettings;
  setGhForm: React.Dispatch<React.SetStateAction<GitHubSettings>>;
  showToken: boolean;
  setShowToken: (v: boolean) => void;
}

const inp = "w-full h-9 bg-white/[0.04] border border-white/[0.08] rounded-lg px-3 text-white/70 text-sm font-mono placeholder:text-white/20 outline-none focus:border-[#9333ea]/40 transition-colors";
const label = "text-white/40 text-xs font-medium uppercase tracking-wider block mb-2";

export default function GitHubTab({ ghForm, setGhForm, showToken, setShowToken }: Props) {
  return (
    <>
      <div className="bg-[#9333ea]/5 border border-[#9333ea]/20 rounded-xl p-3.5 flex items-start gap-2.5">
        <Icon name="Globe" size={14} className="text-[#9333ea] mt-0.5 shrink-0" />
        <p className="text-white/50 text-xs leading-relaxed">
          Ð ÐµÐ¿Ð¾Ð·Ð¸ÑÐ¾ÑÐ¸Ð¹ <strong className="text-white/70">ÑÐ°Ð¹ÑÐ°</strong> â ÑÑÐ´Ð° ÐÐ ÑÐ¾ÑÑÐ°Ð½ÑÐµÑ ÑÐ³ÐµÐ½ÐµÑÐ¸ÑÐ¾Ð²Ð°Ð½Ð½ÑÐ¹ <span className="font-mono">index.html</span>.
        </p>
      </div>

      <div>
        <label className={label}>GitHub Token (Sites)</label>
        <div className="relative">
          <input
            type={showToken ? "text" : "password"}
            value={ghForm.token}
            onChange={e => setGhForm(f => ({ ...f, token: e.target.value.trim() }))}
            placeholder="ghp_..."
            className={inp + " pr-10"}
          />
          <button onClick={() => setShowToken(!showToken)} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-white/25 hover:text-white/60 transition-colors">
            <Icon name={showToken ? "EyeOff" : "Eye"} size={14} />
          </button>
        </div>
        <p className="text-white/20 text-xs mt-1.5">ÐÑÐ°Ð²Ð°: <span className="font-mono">repo</span> (Contents: Read & Write).</p>
      </div>

      <div>
        <label className={label}>Repository Path</label>
        <input type="text" value={ghForm.repo} onChange={e => setGhForm(f => ({ ...f, repo: e.target.value.trim() }))} placeholder="username/my-website" className={inp} />
        <p className="text-white/20 text-xs mt-1.5">Ð¤Ð¾ÑÐ¼Ð°Ñ: <span className="font-mono">username/repo</span></p>
      </div>

      <div>
        <label className={label}>Ð¤Ð°Ð¹Ð» Ð´Ð»Ñ ÑÐµÐ´Ð°ÐºÑÐ¸ÑÐ¾Ð²Ð°Ð½Ð¸Ñ</label>
        <input type="text" value={ghForm.filePath ?? "index.html"} onChange={e => setGhForm(f => ({ ...f, filePath: e.target.value.trim() }))} placeholder="index.html" className={inp} />
        <p className="text-white/20 text-xs mt-1.5">ÐÑÑÑ Ð²Ð½ÑÑÑÐ¸ ÑÐµÐ¿Ð¾Ð·Ð¸ÑÐ¾ÑÐ¸Ñ.</p>
      </div>

      <div>
        <label className={label}>URL Ð¶Ð¸Ð²Ð¾Ð³Ð¾ ÑÐ°Ð¹ÑÐ°</label>
        <input type="text" value={ghForm.siteUrl ?? ""} onChange={e => setGhForm(f => ({ ...f, siteUrl: e.target.value.trim() }))} placeholder="https://username.github.io/repo/" className={inp} />
        <p className="text-white/20 text-xs mt-1.5">ÐÑÑÐ°Ð²ÑÑÐµ Ð¿ÑÑÑÑÐ¼ â Ð°Ð´ÑÐµÑ Ð¿Ð¾ÑÑÑÐ¾Ð¸ÑÑÑ Ð°Ð²ÑÐ¾Ð¼Ð°ÑÐ¸ÑÐµÑÐºÐ¸.</p>
      </div>

      <div className="bg-white/[0.03] border border-white/[0.06] rounded-xl p-3.5">
        <p className="text-white/30 text-xs font-semibold uppercase tracking-wider mb-1.5">ÐÐ°Ðº Ð¿Ð¾Ð»ÑÑÐ¸ÑÑ Token</p>
        <p className="text-white/30 text-xs leading-relaxed">GitHub â Settings â Developer settings â Personal access tokens â Tokens (classic) â Generate â Ð²ÑÐ±ÐµÑÐ¸ <span className="font-mono text-white/50">repo</span></p>
      </div>
    </>
  );
}

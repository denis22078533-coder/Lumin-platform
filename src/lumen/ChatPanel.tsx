import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Icon from "@/components/ui/icon";
import { Message } from "./LumenApp";

type CycleStatus = "idle" | "reading" | "generating" | "done" | "error";
export type ChatMode = "chat" | "image" | "site";

interface Props {
  status: CycleStatus;
  cycleLabel: string;
  messages: Message[];
  onSend: (text: string, mode: ChatMode) => void;
  onStop: () => void;
  onApply: (msgId: number, html: string) => Promise<void>;
  deployingId: number | null;
  deployResult: { id: number; ok: boolean; message: string } | null;
  liveUrl: string;
  onOpenPreview?: () => void;
  onLoadFromGitHub?: () => void;
  loadingFromGitHub?: boolean;
  currentFilePath?: string;
  onLoadLocalFile?: () => void;
  hasLocalFile?: boolean;
  localFileName?: string;
  pendingSql?: { sql: string; explanation: string } | null;
  hasGitHub?: boolean;
  onOpenSettings?: () => void;
}

const SUGGESTIONS = [
  { text: "Ð¡Ð°Ð¹Ñ ÐºÐ¾ÑÐµÐ¹Ð½Ð¸ Ñ Ð¼ÐµÐ½Ñ Ð¸ ÑÐ¾ÑÐ¾Ð³ÑÐ°ÑÐ¸ÑÐ¼Ð¸", icon: "Globe" },
  { text: "ÐÐ°ÑÐ¸ÑÑÐ¹ ÐºÑÐ°ÑÐ¸Ð²ÑÐ¹ Ð·Ð°ÐºÐ°Ñ Ð½Ð°Ð´ Ð¼Ð¾ÑÐµÐ¼", icon: "Image" },
  { text: "ÐÐ°Ðº ÑÐ´ÐµÐ»Ð°ÑÑ ÑÐ°Ð¹Ñ Ð·Ð°Ð¼ÐµÑÐ½ÑÐ¼ Ð² Google?", icon: "MessageCircle" },
  { text: "ÐÐµÐ½Ð´Ð¸Ð½Ð³ Ð´Ð»Ñ ÑÐ¸ÑÐ½ÐµÑ-ÐºÐ»ÑÐ±Ð° Ñ ÑÐ°ÑÐ¸ÑÐ°Ð¼Ð¸", icon: "Globe" },
];

function detectMode(text: string): ChatMode {
  const t = text.toLowerCase();
  // Ð¡Ð°Ð¹Ñ Ð¿ÑÐ¾Ð²ÐµÑÑÐµÐ¼ ÐÐÐ ÐÐ«Ð â ÐµÑÐ»Ð¸ ÐµÑÑÑ ÑÐ»Ð¾Ð²Ð¾ "ÑÐ°Ð¹Ñ/Ð»ÐµÐ½Ð´Ð¸Ð½Ð³" â ÑÑÐ¾ Ð²ÑÐµÐ³Ð´Ð° ÑÐ°Ð¹Ñ, Ð´Ð°Ð¶Ðµ ÐµÑÐ»Ð¸ ÑÐ¿Ð¾Ð¼Ð¸Ð½Ð°ÑÑÑÑ ÐºÐ°ÑÑÐ¸Ð½ÐºÐ¸
  const siteWords = /ÑÐ°Ð¹Ñ|Ð»ÐµÐ½Ð´Ð¸Ð½Ð³|ÑÑÑÐ°Ð½Ð¸Ñ|Ð¿Ð¾ÑÑÑÐ¾Ð»Ð¸Ð¾|Ð¸Ð½ÑÐµÑÐ½ÐµÑ.Ð¼Ð°Ð³Ð°Ð·Ð¸Ð½|Ð²Ð¸Ð·Ð¸ÑÐº|html|ÑÐ¾Ð·Ð´Ð°Ð¹ ÑÐ°Ð¹Ñ|ÑÐ´ÐµÐ»Ð°Ð¹ ÑÐ°Ð¹Ñ|Ð½Ð°Ð¿Ð¸ÑÐ¸ ÑÐ°Ð¹Ñ/i;
  if (siteWords.test(t)) return "site";
  // Ð¢Ð¾Ð»ÑÐºÐ¾ ÐµÑÐ»Ð¸ Ð½ÐµÑ ÑÐ»Ð¾Ð²Ð° "ÑÐ°Ð¹Ñ" â Ð¿ÑÐ¾Ð²ÐµÑÑÐµÐ¼ Ð½Ð° ÐºÐ°ÑÑÐ¸Ð½ÐºÑ
  const imageWords = /^Ð½Ð°ÑÐ¸ÑÑÐ¹|^ÑÐ³ÐµÐ½ÐµÑÐ¸|^ÑÐ¾Ð·Ð´Ð°Ð¹ ÑÐ¾ÑÐ¾|^ÑÐ¾Ð·Ð´Ð°Ð¹ ÐºÐ°ÑÑÐ¸Ð½|^ÑÐ´ÐµÐ»Ð°Ð¹ ÑÐ¾ÑÐ¾|^Ð³ÐµÐ½ÐµÑ|Ð½Ð°ÑÐ¸ÑÑÐ¹|draw |painting |photo of |image of /i;
  if (imageWords.test(t)) return "image";
  // ÐÐ¾Ð¿Ð¾Ð»Ð½Ð¸ÑÐµÐ»ÑÐ½Ð¾: ÐµÑÐ»Ð¸ ÑÐ¾Ð»ÑÐºÐ¾ Ð¿ÑÐ¾ ÐºÐ°ÑÑÐ¸Ð½ÐºÑ Ð±ÐµÐ· ÑÐ°Ð¹ÑÐ°
  const pureImageWords = /^(ÐºÑÐ°ÑÐ¸Ð²|ÑÐ³ÐµÐ½ÐµÑ|Ð½Ð°ÑÐ¸ÑÑÐ¹|Ð¿Ð¾ÐºÐ°Ð¶Ð¸|ÑÐ¾Ð·Ð´Ð°Ð¹ Ð¸Ð·Ð¾Ð±ÑÐ°Ð¶)/i;
  if (pureImageWords.test(t)) return "image";
  return "chat";
}

const CYCLE_STEPS: { key: CycleStatus; label: string; icon: string }[] = [
  { key: "reading",    label: "Ð§Ð¸ÑÐ°Ñ ÑÐµÐºÑÑÐ¸Ð¹ ÐºÐ¾Ð´...", icon: "Download" },
  { key: "generating", label: "ÐÐµÐ½ÐµÑÐ¸ÑÑÑ...",          icon: "Sparkles" },
];

const MODE_COLORS: Record<ChatMode, string> = {
  chat:  "#3b82f6",
  image: "#10b981",
  site:  "#9333ea",
};

const MODE_LABELS: Record<ChatMode, { icon: string; text: string }> = {
  chat:  { icon: "MessageCircle", text: "ÐÑÐ²ÐµÑÐ°Ñ..." },
  image: { icon: "Image",         text: "Ð Ð¸ÑÑÑ ÐºÐ°ÑÑÐ¸Ð½ÐºÑ..." },
  site:  { icon: "Globe",         text: "Ð¡Ð¾Ð·Ð´Ð°Ñ ÑÐ°Ð¹Ñ..." },
};

export default function ChatPanel({
  status, cycleLabel, messages, onSend, onStop, onApply,
  deployingId, deployResult, liveUrl, onOpenPreview,
  onLoadFromGitHub, loadingFromGitHub, currentFilePath,
  onLoadLocalFile, hasLocalFile, localFileName, pendingSql,
  hasGitHub, onOpenSettings,
}: Props) {
  const [value, setValue] = useState("");
  const [kbOffset, setKbOffset] = useState(0);
  const [lastMode, setLastMode] = useState<ChatMode>("chat");
  const [sqlCopied, setSqlCopied] = useState(false);
  const [attachedFile, setAttachedFile] = useState<{ name: string; content: string; type: "image" | "text" } | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const attachInputRef = useRef<HTMLInputElement>(null);
  const recognitionRef = useRef<SpeechRecognition | null>(null);

  const toggleRecording = useCallback(() => {
    const SpeechRecognitionAPI = (window as Window & { SpeechRecognition?: typeof SpeechRecognition; webkitSpeechRecognition?: typeof SpeechRecognition }).SpeechRecognition || (window as Window & { SpeechRecognition?: typeof SpeechRecognition; webkitSpeechRecognition?: typeof SpeechRecognition }).webkitSpeechRecognition;
    if (!SpeechRecognitionAPI) {
      alert("ÐÐ°Ñ Ð±ÑÐ°ÑÐ·ÐµÑ Ð½Ðµ Ð¿Ð¾Ð´Ð´ÐµÑÐ¶Ð¸Ð²Ð°ÐµÑ Ð³Ð¾Ð»Ð¾ÑÐ¾Ð²Ð¾Ð¹ Ð²Ð²Ð¾Ð´. ÐÐ¾Ð¿ÑÐ¾Ð±ÑÐ¹ÑÐµ Chrome Ð¸Ð»Ð¸ Safari.");
      return;
    }
    if (isRecording) {
      recognitionRef.current?.stop();
      setIsRecording(false);
      return;
    }
    const recognition = new SpeechRecognitionAPI();
    recognition.lang = "ru-RU";
    recognition.continuous = true;
    recognition.interimResults = true;
    let finalTranscript = value;
    recognition.onresult = (e: SpeechRecognitionEvent) => {
      let interim = "";
      for (let i = e.resultIndex; i < e.results.length; i++) {
        const t = e.results[i][0].transcript;
        if (e.results[i].isFinal) finalTranscript += (finalTranscript ? " " : "") + t;
        else interim = t;
      }
      const display = finalTranscript + (interim ? (finalTranscript ? " " : "") + interim : "");
      setValue(display);
      if (textareaRef.current) {
        textareaRef.current.style.height = "auto";
        textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 120) + "px";
      }
    };
    recognition.onend = () => { setIsRecording(false); };
    recognition.onerror = () => { setIsRecording(false); };
    recognitionRef.current = recognition;
    recognition.start();
    setIsRecording(true);
  }, [isRecording, value]);

  const handleCopySql = () => {
    if (!pendingSql) return;
    navigator.clipboard.writeText(pendingSql.sql).then(() => {
      setSqlCopied(true);
      setTimeout(() => setSqlCopied(false), 2000);
    });
  };
  const bottomRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const vv = window.visualViewport;
    if (!vv) return;
    const onResize = () => setKbOffset(Math.max(0, window.innerHeight - vv.height - vv.offsetTop));
    vv.addEventListener("resize", onResize);
    vv.addEventListener("scroll", onResize);
    return () => { vv.removeEventListener("resize", onResize); vv.removeEventListener("scroll", onResize); };
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, status]);

  const isActive = status === "reading" || status === "generating";
  const detectedMode = value.trim() ? detectMode(value) : lastMode;
  const activeColor = MODE_COLORS[detectedMode];

  const handleAttachFile = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = "";
    const isImage = file.type.startsWith("image/");
    if (isImage) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        const dataUrl = ev.target?.result as string;
        setAttachedFile({ name: file.name, content: dataUrl, type: "image" });
      };
      reader.readAsDataURL(file);
    } else {
      const reader = new FileReader();
      reader.onload = (ev) => {
        const text = ev.target?.result as string;
        setAttachedFile({ name: file.name, content: text, type: "text" });
      };
      reader.readAsText(file, "utf-8");
    }
  }, []);

  const handleSend = () => {
    if ((!value.trim() && !attachedFile) || isActive) return;
    let sendText = value.trim();
    if (attachedFile) {
      if (attachedFile.type === "image") {
        sendText = `[ÐÑÐ¸ÐºÑÐµÐ¿Ð»ÐµÐ½Ð¾ Ð¸Ð·Ð¾Ð±ÑÐ°Ð¶ÐµÐ½Ð¸Ðµ: ${attachedFile.name}]\n${sendText}`;
      } else {
        const preview = attachedFile.content.length > 3000 ? attachedFile.content.slice(0, 3000) + "\n...[Ð¾Ð±ÑÐµÐ·Ð°Ð½Ð¾]" : attachedFile.content;
        sendText = `Ð¤Ð°Ð¹Ð» "${attachedFile.name}":\n\`\`\`\n${preview}\n\`\`\`\n${sendText}`;
      }
      setAttachedFile(null);
    }
    if (!sendText) return;
    const mode = detectMode(sendText);
    setLastMode(mode);
    onSend(sendText, mode);
    setValue("");
    if (textareaRef.current) textareaRef.current.style.height = "auto";
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); }
  };

  const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setValue(e.target.value);
    e.target.style.height = "auto";
    e.target.style.height = Math.min(e.target.scrollHeight, 120) + "px";
  };

  // ÐÐ¾ÐºÐ°Ð·ÑÐ²Ð°ÐµÐ¼ Ð¿Ð¾Ð´ÑÐºÐ°Ð·ÐºÑ ÐºÐ°ÐºÐ¾Ð¹ ÑÐµÐ¶Ð¸Ð¼ Ð¾Ð¿ÑÐµÐ´ÐµÐ»ÑÐ½
  const modeHint = value.trim() ? (
    detectedMode === "image" ? "ð¨ Ð¡Ð¾Ð·Ð´Ð°Ð¼ ÐºÐ°ÑÑÐ¸Ð½ÐºÑ" :
    detectedMode === "site"  ? "ð Ð¡Ð¾Ð·Ð´Ð°Ð¼ ÑÐ°Ð¹Ñ" :
    "ð¬ ÐÑÐ²ÐµÑÑ Ð½Ð° Ð²Ð¾Ð¿ÑÐ¾Ñ"
  ) : null;

  return (
    <div
      className="w-full h-full flex flex-col bg-[#0a0a0f] overflow-hidden"
      style={{ paddingBottom: kbOffset > 0 ? kbOffset : undefined }}
    >
      {/* Header */}
      <div className="px-4 py-3 border-b border-white/[0.06] flex items-center gap-2 shrink-0">
        <motion.div
          className="w-1.5 h-1.5 rounded-full"
          animate={{ backgroundColor: activeColor }}
          transition={{ duration: 0.4 }}
        />
        <span className="text-white/60 text-xs font-medium tracking-wide uppercase">AI ÐÑÑÐ¸ÑÑÐµÐ½Ñ</span>
        <div className="ml-auto flex items-center gap-1.5">
          {hasGitHub ? (
            <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/25">
              <span className="w-1 h-1 rounded-full bg-emerald-400" />
              <span className="text-emerald-400 text-[10px] font-medium">GitHub</span>
            </div>
          ) : (
            <button
              onClick={onOpenSettings}
              className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/30 hover:bg-amber-500/20 transition-colors"
            >
              <span className="w-1 h-1 rounded-full bg-amber-400 animate-pulse" />
              <span className="text-amber-400 text-[10px] font-medium">ÐÐ°ÑÑÑÐ¾Ð¸ÑÑ GitHub</span>
            </button>
          )}
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 min-h-0 overflow-y-auto px-4 py-3 flex flex-col gap-3">
        <AnimatePresence initial={false}>

          {/* Empty state */}
          {messages.length === 0 && !isActive && (
            <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col gap-2 mt-2">
              <p className="text-white/25 text-xs font-medium mb-1">ÐÐ¾Ð¿ÑÐ¾Ð±ÑÐ¹ÑÐµ Ð½Ð°Ð¿Ð¸ÑÐ°ÑÑ:</p>
              {SUGGESTIONS.map((s, i) => (
                <motion.button
                  key={s.text}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.07 }}
                  onClick={() => { setValue(s.text); textareaRef.current?.focus(); }}
                  className="text-left px-3 py-2.5 rounded-lg border border-white/[0.07] bg-white/[0.03] hover:bg-white/[0.07] hover:border-white/[0.15] text-white/50 hover:text-white/80 text-xs transition-all flex items-center gap-2.5"
                >
                  <Icon name={s.icon} size={12} className="opacity-40 shrink-0" />
                  {s.text}
                </motion.button>
              ))}
            </motion.div>
          )}

          {/* Messages */}
          {messages.map((msg) => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25 }}
              className={`flex flex-col gap-1.5 ${msg.role === "user" ? "items-end" : "items-start"}`}
            >
              {/* Image message */}
              {msg.role === "assistant" && msg.html?.startsWith("__IMAGE__:") && (
                <div className="flex flex-col gap-2 items-start max-w-[92%]">
                  <img
                    src={msg.html.replace("__IMAGE__:", "")}
                    alt={msg.text}
                    className="rounded-xl border border-white/[0.10] w-full"
                    style={{ maxHeight: 320, objectFit: "cover" }}
                  />
                  <a
                    href={msg.html.replace("__IMAGE__:", "")}
                    download
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 h-6 px-2.5 rounded-md bg-white/[0.06] border border-white/[0.10] hover:bg-white/[0.12] text-white/50 hover:text-white/80 text-[10px] font-semibold transition-colors"
                  >
                    <Icon name="Download" size={10} />
                    Ð¡ÐºÐ°ÑÐ°ÑÑ
                  </a>
                </div>
              )}

              {/* Text message */}
              {!(msg.role === "assistant" && msg.html?.startsWith("__IMAGE__:")) && (
                <div
                  className={`max-w-[90%] px-3 py-2.5 rounded-xl text-xs leading-relaxed whitespace-pre-wrap ${
                    msg.role === "user"
                      ? "text-white rounded-tr-sm"
                      : "bg-white/[0.05] border border-white/[0.08] text-white/75 rounded-tl-sm"
                  }`}
                  style={msg.role === "user" ? { backgroundColor: "#9333ea99" } : {}}
                >
                  {msg.text}
                </div>
              )}

              {/* Site HTML buttons */}
              {msg.role === "assistant" && msg.html && !msg.html.startsWith("__IMAGE__:") && (
                <div className="flex items-center gap-2 ml-1 flex-wrap">
                  <button
                    onClick={() => {
                      const blob = new Blob([msg.html!], { type: "text/html" });
                      const url = URL.createObjectURL(blob);
                      const a = document.createElement("a");
                      a.href = url; a.download = "index.html"; a.click();
                      URL.revokeObjectURL(url);
                    }}
                    className="flex items-center gap-1 h-6 px-2.5 rounded-md bg-white/[0.06] border border-white/[0.10] hover:bg-white/[0.12] text-white/50 hover:text-white/80 text-[10px] font-semibold transition-colors"
                  >
                    <Icon name="Download" size={10} />
                    Ð¡ÐºÐ°ÑÐ°ÑÑ .html
                  </button>
                  {onOpenPreview && (
                    <button
                      onClick={onOpenPreview}
                      className="flex items-center gap-1 h-6 px-2.5 rounded-md bg-white/[0.06] border border-white/[0.10] hover:bg-white/[0.12] text-white/50 hover:text-white/80 text-[10px] font-semibold transition-colors"
                    >
                      <Icon name="Eye" size={10} />
                      ÐÑÐµÐ²ÑÑ
                    </button>
                  )}
                  {deployResult?.id === msg.id && (
                    <motion.span
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className={`text-[10px] font-medium ${deployResult.ok ? "text-emerald-400" : "text-red-400"}`}
                    >
                      {deployResult.ok ? "â Ð¡Ð¾ÑÑÐ°Ð½ÐµÐ½Ð¾ Ð² GitHub" : `â ${deployResult.message}`}
                    </motion.span>
                  )}
                </div>
              )}
            </motion.div>
          ))}

          {/* Processing indicator */}
          {isActive && (
            <motion.div
              key="cycle"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="flex items-center gap-2 flex-wrap"
            >
              {lastMode === "image" ? (
                <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-[10px] font-semibold"
                  style={{ backgroundColor: "#10b98118", borderColor: "#10b98135", color: "#10b981" }}>
                  <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1.2, ease: "linear" }}>
                    <Icon name="Loader2" size={10} />
                  </motion.div>
                  {cycleLabel || "Ð Ð¸ÑÑÑ ÐºÐ°ÑÑÐ¸Ð½ÐºÑ..."}
                </div>
              ) : lastMode === "chat" ? (
                <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-[10px] font-semibold"
                  style={{ backgroundColor: "#3b82f618", borderColor: "#3b82f635", color: "#3b82f6" }}>
                  <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1.2, ease: "linear" }}>
                    <Icon name="Loader2" size={10} />
                  </motion.div>
                  {cycleLabel || "ÐÑÐ¼Ð°Ñ..."}
                </div>
              ) : (
                CYCLE_STEPS.map((step) => {
                  const isCurrent = status === step.key;
                  const isDone = step.key === "reading" && status === "generating";
                  return (
                    <div key={step.key} className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-[10px] font-semibold transition-all ${
                      isCurrent ? "bg-[#9333ea]/15 border-[#9333ea]/40 text-[#9333ea]"
                      : isDone  ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
                      : "bg-white/[0.03] border-white/[0.07] text-white/25"
                    }`}>
                      {isCurrent ? (
                        <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1.2, ease: "linear" }}>
                          <Icon name="Loader2" size={10} />
                        </motion.div>
                      ) : isDone ? <Icon name="Check" size={10} /> : <Icon name={step.icon} size={10} />}
                      {isCurrent ? (cycleLabel || step.label) : step.label}
                    </div>
                  );
                })
              )}
              <button
                onClick={onStop}
                className="flex items-center gap-1 h-6 px-2.5 rounded-md bg-red-500/10 border border-red-500/20 hover:bg-red-500/20 text-red-400 text-[10px] font-semibold transition-colors"
              >
                <Icon name="Square" size={9} />
                Ð¡ÑÐ¾Ð¿
              </button>
            </motion.div>
          )}

          {/* SQL copy button */}
          {pendingSql && !isActive && (
            <motion.div
              key="sql-action"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="flex items-center gap-2 mt-1"
            >
              <button
                onClick={handleCopySql}
                className="flex items-center gap-1.5 h-7 px-3 rounded-lg border text-[10px] font-semibold transition-all"
                style={{
                  backgroundColor: sqlCopied ? "#10b98118" : "#3b82f618",
                  borderColor: sqlCopied ? "#10b98140" : "#3b82f640",
                  color: sqlCopied ? "#10b981" : "#3b82f6",
                }}
              >
                <Icon name={sqlCopied ? "Check" : "Copy"} size={10} />
                {sqlCopied ? "Ð¡ÐºÐ¾Ð¿Ð¸ÑÐ¾Ð²Ð°Ð½Ð¾!" : "Ð¡ÐºÐ¾Ð¿Ð¸ÑÐ¾Ð²Ð°ÑÑ SQL"}
              </button>
              <span className="text-white/20 text-[9px]">Ð´Ð»Ñ db_migrations/ Ð¸Ð»Ð¸ MySQL Ð½Ð° Reg.ru</span>
            </motion.div>
          )}

          <div ref={bottomRef} />
        </AnimatePresence>
      </div>

      {/* Input */}
      <div className="px-3 pb-3 pt-2 shrink-0 border-t border-white/[0.06]">
        {/* Hidden file input for attachments */}
        <input
          ref={attachInputRef}
          type="file"
          accept="image/*,.txt,.md,.html,.css,.js,.ts,.tsx,.jsx,.json,.py,.sql,.csv"
          className="hidden"
          onChange={handleAttachFile}
        />

        {/* Attached file preview */}
        <AnimatePresence>
          {attachedFile && (
            <motion.div
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 4 }}
              className="mb-2 flex items-center gap-2 bg-white/[0.05] border border-white/[0.10] rounded-lg px-2.5 py-1.5"
            >
              {attachedFile.type === "image" ? (
                <img src={attachedFile.content} alt={attachedFile.name} className="w-8 h-8 rounded object-cover shrink-0" />
              ) : (
                <div className="w-8 h-8 rounded bg-white/[0.06] flex items-center justify-center shrink-0">
                  <Icon name="FileText" size={14} className="text-white/40" />
                </div>
              )}
              <span className="text-white/60 text-xs truncate flex-1">{attachedFile.name}</span>
              <button onClick={() => setAttachedFile(null)} className="text-white/30 hover:text-white/70 transition-colors">
                <Icon name="X" size={13} />
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Recording indicator */}
        <AnimatePresence>
          {isRecording && (
            <motion.div
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 4 }}
              className="mb-2 flex items-center gap-2 bg-red-500/10 border border-red-500/30 rounded-lg px-3 py-1.5"
            >
              <motion.div
                className="w-1.5 h-1.5 rounded-full bg-red-400"
                animate={{ opacity: [1, 0.3, 1] }}
                transition={{ repeat: Infinity, duration: 1 }}
              />
              <span className="text-red-300 text-xs font-medium">Ð¡Ð»ÑÑÐ°Ñ... Ð³Ð¾Ð²Ð¾ÑÐ¸ÑÐµ Ð¿Ð¾-ÑÑÑÑÐºÐ¸</span>
              <button onClick={toggleRecording} className="ml-auto text-red-400/60 hover:text-red-400 transition-colors">
                <Icon name="X" size={12} />
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Mode hint */}
        <AnimatePresence>
          {modeHint && (
            <motion.div
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 4 }}
              className="mb-1.5 px-1 text-[10px] font-medium"
              style={{ color: activeColor + "aa" }}
            >
              {modeHint}
            </motion.div>
          )}
        </AnimatePresence>

        <div
          className="flex items-end gap-2 bg-white/[0.04] border rounded-xl px-3 py-2.5 transition-all duration-300"
          style={{ borderColor: (value.trim() || attachedFile) ? activeColor + "50" : "rgba(255,255,255,0.08)" }}
        >
          {/* Attach button */}
          <button
            onClick={() => attachInputRef.current?.click()}
            disabled={isActive}
            className="shrink-0 mb-0.5 w-6 h-6 rounded-md flex items-center justify-center text-white/25 hover:text-white/60 hover:bg-white/[0.08] transition-colors disabled:opacity-30"
            title="ÐÑÐ¸ÐºÑÐµÐ¿Ð¸ÑÑ ÑÐ°Ð¹Ð» Ð¸Ð»Ð¸ ÑÐ¾ÑÐ¾"
          >
            <Icon name="Plus" size={13} />
          </button>

          <motion.div className="shrink-0 mb-0.5 opacity-50" animate={{ color: activeColor }} transition={{ duration: 0.3 }}>
            <Icon name={detectedMode === "image" ? "Image" : detectedMode === "site" ? "Globe" : "MessageCircle"} size={14} />
          </motion.div>
          <textarea
            ref={textareaRef}
            value={value}
            onChange={handleInput}
            onKeyDown={handleKeyDown}
            placeholder="ÐÐ°Ð¿Ð¸ÑÐ¸ÑÐµ ÑÑÐ¾ ÑÐ³Ð¾Ð´Ð½Ð¾ â ÑÐ°Ñ, ÐºÐ°ÑÑÐ¸Ð½ÐºÑ Ð¸Ð»Ð¸ ÑÐ°Ð¹Ñ..."
            disabled={isActive}
            rows={1}
            className="flex-1 bg-transparent text-white/80 placeholder-white/20 text-xs resize-none outline-none leading-relaxed disabled:opacity-50"
            style={{ maxHeight: 120 }}
          />
          {/* Mic button */}
          <motion.button
            onClick={toggleRecording}
            disabled={isActive}
            className="shrink-0 w-7 h-7 rounded-lg flex items-center justify-center transition-all mb-0.5 disabled:opacity-30"
            animate={{
              backgroundColor: isRecording ? "rgba(239,68,68,0.2)" : "rgba(255,255,255,0.05)",
              borderColor: isRecording ? "rgba(239,68,68,0.5)" : "rgba(255,255,255,0.08)",
            }}
            style={{ border: "1px solid" }}
            whileTap={{ scale: 0.9 }}
            title={isRecording ? "ÐÑÑÐ°Ð½Ð¾Ð²Ð¸ÑÑ Ð·Ð°Ð¿Ð¸ÑÑ" : "ÐÐ¸ÐºÑÐ¾Ð²Ð°ÑÑ Ð³Ð¾Ð»Ð¾ÑÐ¾Ð¼"}
          >
            {isRecording ? (
              <motion.div
                animate={{ scale: [1, 1.3, 1] }}
                transition={{ repeat: Infinity, duration: 0.8 }}
              >
                <Icon name="MicOff" size={12} className="text-red-400" />
              </motion.div>
            ) : (
              <Icon name="Mic" size={12} className="text-white/40" />
            )}
          </motion.button>

          <motion.button
            onClick={handleSend}
            disabled={(!value.trim() && !attachedFile) || isActive}
            className="shrink-0 w-7 h-7 rounded-lg flex items-center justify-center text-white disabled:opacity-25 transition-all mb-0.5"
            animate={{ backgroundColor: (value.trim() || attachedFile) && !isActive ? activeColor : "rgba(255,255,255,0.08)" }}
            transition={{ duration: 0.3 }}
            whileTap={{ scale: 0.9 }}
          >
            <Icon name="ArrowUp" size={13} />
          </motion.button>
        </div>
      </div>
    </div>
  );
}
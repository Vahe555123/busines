import { useCallback, useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MessageCircle, X, Loader2, Send } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useLanguage } from "@/context/LanguageContext";
import { api, type ChatMessage } from "@/lib/api";

const SESSION_KEY = "chat_session_id";

function getOrCreateSessionId(): string {
  try {
    let id = sessionStorage.getItem(SESSION_KEY);
    if (!id) {
      id = crypto.randomUUID?.() ?? `s-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
      sessionStorage.setItem(SESSION_KEY, id);
    }
    return id;
  } catch {
    return `s-${Date.now()}`;
  }
}

export default function ChatWidget() {
  const { t } = useLanguage();
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const sessionIdRef = useRef<string>(getOrCreateSessionId());
  const listRef = useRef<HTMLDivElement>(null);

  const loadHistory = useCallback(async () => {
    setLoading(true);
    try {
      const sessionId = user ? undefined : sessionIdRef.current;
      const data = await api.chat.getHistory(sessionId);
      setConversationId(data.conversationId);
      setMessages(data.messages ?? []);
    } catch {
      setMessages([]);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (open) loadHistory();
  }, [open, loadHistory]);

  useEffect(() => {
    if (listRef.current) listRef.current.scrollTop = listRef.current.scrollHeight;
  }, [messages]);

  const handleSend = async () => {
    const text = input.trim();
    if (!text && !sending) return;
    setInput("");
    const userMsg: ChatMessage = {
      _id: `tmp-${Date.now()}`,
      role: "user",
      content: text,
      imageUrls: [],
      createdAt: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, userMsg]);
    setSending(true);
    try {
      const sessionId = user ? undefined : sessionIdRef.current;
      const res = await api.chat.send({
        conversationId: conversationId ?? undefined,
        content: text,
        sessionId,
      });
      setConversationId(res.conversationId);
      setMessages((prev) =>
        prev.map((m) => (m._id === userMsg._id ? res.userMessage : m))
      );
      setMessages((prev) => [...prev, res.assistantMessage]);
    } catch {
      setMessages((prev) => prev.filter((m) => m._id !== userMsg._id));
    } finally {
      setSending(false);
    }
  };

  return (
    <>
      <Button
        onClick={() => setOpen((o) => !o)}
        className="fixed bottom-6 right-6 z-50 h-14 w-14 rounded-full bg-gradient-primary text-white shadow-lg hover:opacity-90 md:bottom-8 md:right-8"
        aria-label={open ? t("chat.close") : t("chat.open")}
      >
        {open ? <X className="h-6 w-6" /> : <MessageCircle className="h-6 w-6" />}
      </Button>

      {open && (
        <div className="fixed bottom-24 right-6 z-50 flex h-[420px] w-[calc(100vw-3rem)] max-w-md flex-col rounded-2xl border border-white/10 bg-background/95 shadow-xl backdrop-blur md:bottom-28 md:right-8">
          <div className="border-b border-white/10 px-4 py-3">
            <h3 className="font-semibold">{t("chat.title")}</h3>
          </div>
          <div
            ref={listRef}
            className="flex-1 overflow-y-auto p-4 space-y-3"
          >
            {loading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : messages.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-6">
                {t("chat.placeholder")}
              </p>
            ) : (
              messages.map((m) => (
                <div
                  key={m._id}
                  className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[85%] rounded-2xl px-4 py-2 text-sm ${
                      m.role === "user"
                        ? "bg-primary text-primary-foreground"
                        : "bg-white/10 text-foreground"
                    }`}
                  >
                    <p className="whitespace-pre-wrap">{m.content}</p>
                  </div>
                </div>
              ))
            )}
          </div>
          <div className="border-t border-white/10 p-3 flex gap-2">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSend()}
              placeholder={t("chat.placeholder")}
              className="flex-1 bg-white/5 border-white/10"
              disabled={sending}
            />
            <Button
              onClick={handleSend}
              disabled={sending || !input.trim()}
              size="icon"
              className="shrink-0 bg-primary text-primary-foreground"
            >
              {sending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>
      )}
    </>
  );
}

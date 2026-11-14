import { useEffect, useRef, useState } from 'react';
import { Send, Trash2, Loader2, ExternalLink, AlertCircle, Globe } from 'lucide-react';
import type { AppLanguage, ChatMessage, ChatModelId, SongItem } from '../types/music';
import type { Translations } from '../i18n/translations';

interface MusicChatViewProps {
  t: Translations['chat'];
  language: AppLanguage;
  locale: string;
  activeSong: SongItem | null;
  bpm: number;
  timeSignature: string;
  messages: ChatMessage[];
  onMessagesChange: (next: ChatMessage[]) => void;
}

const MODEL_IDS: ChatModelId[] = [
  'gemini-4-hydrogen',
  'gemini-4-carbon',
  'gemini-4-argon',
  'gemini-3.1-flash-lite',
];

export function MusicChatView({
  t,
  language,
  locale,
  activeSong,
  bpm,
  timeSignature,
  messages,
  onMessagesChange,
}: MusicChatViewProps) {
  const [selectedModel, setSelectedModel] = useState<ChatModelId>('gemini-4-hydrogen');
  const [input, setInput] = useState('');
  const [includeSongContext, setIncludeSongContext] = useState(true);
  const [useWebSearch, setUseWebSearch] = useState(true);
  const [isSending, setIsSending] = useState(false);

  const threadEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    threadEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isSending]);

  const sendMessage = async (textToSend: string) => {
    const trimmed = textToSend.trim();
    if (!trimmed || isSending) return;

    const userMsg: ChatMessage = {
      id: `msg-u-${Date.now()}`,
      role: 'user',
      text: trimmed,
      timestamp: Date.now(),
    };

    const nextHistory = [...messages, userMsg];
    onMessagesChange(nextHistory);
    setInput('');
    setIsSending(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: nextHistory,
          model: selectedModel,
          language,
          useSearch: useWebSearch && selectedModel === 'gemini-4-hydrogen',
          currentSong:
            includeSongContext && activeSong
              ? {
                  title: activeSong.title,
                  artist: activeSong.artist,
                  album: activeSong.album,
                  genre: activeSong.genre,
                  bpm,
                  timeSignature,
                }
              : null,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Chat error');
      }

      const modelMsg: ChatMessage = {
        id: `msg-m-${Date.now()}`,
        role: 'model',
        text: data.reply,
        model: data.model,
        sources: data.sources,
        timestamp: Date.now(),
      };
      onMessagesChange([...nextHistory, modelMsg]);
    } catch (err) {
      const errMsg: ChatMessage = {
        id: `msg-e-${Date.now()}`,
        role: 'model',
        text: err instanceof Error ? err.message : 'Request failed.',
        model: selectedModel,
        timestamp: Date.now(),
        error: true,
      };
      onMessagesChange([...nextHistory, errMsg]);
    } finally {
      setIsSending(false);
    }
  };

  const activeRole = t.roles[selectedModel];

  return (
    <section className="lw-glass-card rounded-[22px] flex flex-col h-[calc(100vh-13rem)] min-h-[540px] overflow-hidden">
      <div className="p-4 sm:p-5 border-b border-[#D6D6CF]/70 dark:border-[#2C3027] flex flex-col gap-3.5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-lg font-bold tracking-tight text-[#20251E] dark:text-[#EEF1E6]">
              {t.title}
            </h1>
            <p className="text-xs text-[#5B5E57] dark:text-[#B8BFAE] mt-0.5">
              {t.activeRoleLabel}:{' '}
              <span className="font-semibold text-[#20251E] dark:text-[#EEF1E6]">
                {activeRole.roleName}
              </span>{' '}
              · <span className="font-mono">{selectedModel}</span>
            </p>
          </div>
          <div className="flex items-center gap-2">
            {activeSong ? (
              <button
                type="button"
                onClick={() => setIncludeSongContext((v) => !v)}
                className={`px-3 py-1.5 rounded-full border text-xs font-semibold transition-colors whitespace-nowrap cursor-pointer ${
                  includeSongContext
                    ? 'bg-[#20251E] dark:bg-[#C6F100] border-[#20251E] dark:border-[#C6F100] text-[#F4F4F0] dark:text-[#20251E]'
                    : 'bg-[#F4F4F0] dark:bg-white/5 border-[#D6D6CF] dark:border-[#2C3027] text-[#5B5E57] dark:text-[#B8BFAE]'
                }`}
              >
                {includeSongContext ? `${t.contextOn}: ${activeSong.title}` : t.contextOff}
              </button>
            ) : null}
            <button
              type="button"
              onClick={() => onMessagesChange([])}
              disabled={messages.length === 0}
              className="px-3 py-1.5 rounded-full border border-[#D6D6CF] dark:border-[#2C3027] hover:border-[#536716] dark:hover:border-[#C6F100] disabled:opacity-40 text-xs font-medium text-[#5B5E57] dark:text-[#B8BFAE] flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>{t.newChat}</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
          {MODEL_IDS.map((modelId) => {
            const item = t.roles[modelId];
            const active = selectedModel === modelId;
            return (
              <button
                key={modelId}
                type="button"
                onClick={() => setSelectedModel(modelId)}
                className={`p-2.5 rounded-xl border text-left transition-colors cursor-pointer ${
                  active
                    ? 'bg-[#20251E] dark:bg-[#C6F100] border-[#20251E] dark:border-[#C6F100] text-[#F4F4F0] dark:text-[#20251E]'
                    : 'bg-[#F4F4F0]/80 dark:bg-white/5 border-[#D6D6CF] dark:border-[#2C3027] text-[#20251E] dark:text-[#EEF1E6] hover:border-[#536716] dark:hover:border-[#C6F100]'
                }`}
              >
                <div className="text-xs font-semibold truncate">{item.roleName}</div>
                <div
                  className={`text-[11px] font-mono mt-0.5 truncate ${
                    active
                      ? 'text-[#C6F100] dark:text-[#20251E]/80'
                      : 'text-[#5B5E57] dark:text-[#B8BFAE]'
                  }`}
                >
                  {item.taskLabel}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 sm:p-5 flex flex-col gap-4 bg-[#F4F4F0]/60 dark:bg-[#0E100C]/60">
        {messages.length === 0 ? (
          <div className="my-auto max-w-xl mx-auto text-center flex flex-col items-center gap-4 py-6">
            <div>
              <h2 className="text-base font-bold text-[#20251E] dark:text-[#EEF1E6]">
                {activeRole.roleName}
              </h2>
              <p className="text-sm text-[#5B5E57] dark:text-[#B8BFAE] mt-1">
                {activeRole.description}
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 w-full">
              {t.quickPrompts.map((qp) => (
                <button
                  key={qp}
                  type="button"
                  onClick={() => void sendMessage(qp)}
                  className="p-3 rounded-xl border border-[#D6D6CF] dark:border-[#2C3027] bg-[#FBFBFA] dark:bg-[#161912] hover:border-[#536716] dark:hover:border-[#C6F100] text-left text-xs text-[#20251E] dark:text-[#EEF1E6] leading-relaxed transition-colors cursor-pointer"
                >
                  {qp}
                </button>
              ))}
            </div>
          </div>
        ) : (
          messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex flex-col max-w-3xl ${
                msg.role === 'user' ? 'self-end items-end' : 'self-start items-start'
              }`}
            >
              <div className="text-[11px] text-[#5B5E57] dark:text-[#B8BFAE] mb-1 px-1 font-mono tabular-nums">
                {msg.role === 'user' ? t.youLabel : msg.model || 'AI'} ·{' '}
                {new Date(msg.timestamp).toLocaleTimeString(locale, {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </div>
              <div
                className={`rounded-2xl px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap ${
                  msg.role === 'user'
                    ? 'bg-[#20251E] dark:bg-[#C6F100] text-[#F4F4F0] dark:text-[#20251E]'
                    : msg.error
                      ? 'bg-[#DC2626]/5 dark:bg-[#DC2626]/15 border border-[#DC2626]/25 text-[#B91C1C] dark:text-[#FCA5A5]'
                      : 'bg-[#FBFBFA] dark:bg-[#161912] border border-[#D6D6CF] dark:border-[#2C3027] text-[#20251E] dark:text-[#EEF1E6]'
                }`}
              >
                {msg.error ? (
                  <div className="flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                    <span>{msg.text}</span>
                  </div>
                ) : (
                  msg.text
                )}
              </div>
              {msg.sources && msg.sources.length > 0 ? (
                <div className="mt-2 flex flex-wrap gap-2 px-1">
                  {msg.sources.slice(0, 4).map((src, idx) => (
                    <a
                      key={`${src.uri}-${idx}`}
                      href={src.uri}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[11px] text-[#5B5E57] dark:text-[#B8BFAE] hover:text-[#20251E] dark:hover:text-[#C6F100] underline underline-offset-2 flex items-center gap-1"
                    >
                      <ExternalLink className="w-3 h-3" />
                      <span className="truncate max-w-[180px]">{src.title}</span>
                    </a>
                  ))}
                </div>
              ) : null}
            </div>
          ))
        )}

        {isSending ? (
          <div className="self-start bg-[#FBFBFA] dark:bg-[#161912] border border-[#D6D6CF] dark:border-[#2C3027] rounded-2xl px-4 py-3 text-sm text-[#5B5E57] dark:text-[#B8BFAE] flex items-center gap-2">
            <Loader2 className="w-4 h-4 animate-spin text-[#536716] dark:text-[#C6F100]" />
            <span>{t.thinkingLabel} ({selectedModel})</span>
          </div>
        ) : null}
        <div ref={threadEndRef} />
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          void sendMessage(input);
        }}
        className="p-4 border-t border-[#D6D6CF]/70 dark:border-[#2C3027] bg-[#FBFBFA] dark:bg-[#161912] flex flex-col gap-2"
      >
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={t.inputPlaceholder}
            className="flex-1 rounded-full border border-[#D6D6CF] dark:border-[#2C3027] bg-[#F4F4F0] dark:bg-[#0E100C] px-4 py-2.5 text-sm text-[#20251E] dark:text-[#EEF1E6] placeholder:text-[#5B5E57]/60 focus:outline-none focus:ring-2 focus:ring-[#536716]/30 focus:border-[#536716] dark:focus:border-[#C6F100]"
          />
          <button
            type="submit"
            disabled={isSending || !input.trim()}
            className="px-5 py-2.5 rounded-full bg-[#C6F100] hover:brightness-95 disabled:opacity-50 text-[#20251E] text-sm font-bold flex items-center gap-2 transition-all whitespace-nowrap shrink-0 cursor-pointer"
          >
            <Send className="w-4 h-4" />
            <span>{t.sendBtn}</span>
          </button>
        </div>

        {selectedModel === 'gemini-4-hydrogen' ? (
          <div className="flex items-center justify-between text-xs text-[#5B5E57] dark:text-[#B8BFAE]">
            <label className="inline-flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={useWebSearch}
                onChange={(e) => setUseWebSearch(e.target.checked)}
                className="accent-[#536716] dark:accent-[#C6F100]"
              />
              <Globe className="w-3.5 h-3.5" />
              <span>{t.webSearchToggle}</span>
            </label>
          </div>
        ) : null}
      </form>
    </section>
  );
}

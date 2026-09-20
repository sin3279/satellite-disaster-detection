import React, { useState, useRef, useEffect } from "react";
import { ChatMessage, DetectionResult, User } from "../types";
import {
  Bot,
  Send,
  Sparkles,
  ShieldAlert,
  Flame,
  Droplet,
  Compass,
  Satellite,
  User as UserIcon,
  Copy,
  Check,
  RotateCcw,
  Zap
} from "lucide-react";

interface AICopilotChatProps {
  activeResult: DetectionResult | null;
  currentUser: User | null;
  isFloating?: boolean;
  onCloseFloating?: () => void;
}

export const AICopilotChat: React.FC<AICopilotChatProps> = ({
  activeResult,
  currentUser,
  isFloating = false,
  onCloseFloating
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "welcome-1",
      sender: "copilot",
      text: `Greetings Commander. I am **Aegis-Orbital AI**, your real-time Satellite Remote Sensing & Disaster Response Copilot.\n\nI monitor orbital passes, coordinate incident response dispatches, and calculate safe evacuation routes. How can I assist your mission?`,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      actionSuggestions: [
        "🚨 Analyze active evacuation zones",
        "🔥 Wildfire containment tactics",
        "🌊 Flood contamination protocols",
        "🛰️ Check satellite constellation status"
      ]
    }
  ]);

  const [inputText, setInputText] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const handleSendMessage = async (textToSend?: string) => {
    const query = textToSend || inputText.trim();
    if (!query || isTyping) return;

    const userMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      sender: "user",
      text: query,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputText("");
    setIsTyping(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: query,
          conversationHistory: [...messages, userMsg],
          activeDisasterContext: activeResult
            ? {
                title: activeResult.title,
                location: activeResult.locationName,
                coordinates: activeResult.coordinates,
                hazard: activeResult.primaryHazard,
                severity: activeResult.severityLevel,
                damageAreaKm2: activeResult.estimatedDamageAreaKm2,
                evacuationNeeded: activeResult.immediateEvacuationNeed,
                recommendations: activeResult.emergencyResponseRecommendations
              }
            : null
        })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Communication failure with satellite downlink");
      }

      const copilotMsg: ChatMessage = {
        id: `msg-${Date.now() + 1}`,
        sender: "copilot",
        text: data.reply || "Telemetry acknowledged.",
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        actionSuggestions: data.actionSuggestions || [
          "Request updated SAR radar pass",
          "Review active USAR teams",
          "Assess infrastructure damage"
        ]
      };

      setMessages((prev) => [...prev, copilotMsg]);
    } catch (err: any) {
      const errorMsg: ChatMessage = {
        id: `err-${Date.now()}`,
        sender: "system",
        text: `⚠️ Telemetry warning: ${err.message || "Failed to reach AI model"}. Switching to tactical cache.`,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleCopyText = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div
      id="ai-copilot-chat-module"
      className={`flex flex-col bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl ${
        isFloating ? "h-[540px] w-[380px] sm:w-[440px]" : "h-[680px] w-full"
      }`}
    >
      {/* Copilot Header */}
      <div className="bg-slate-950 px-4 py-3 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center text-slate-950 shadow-md shadow-cyan-500/30">
              <Bot className="w-5 h-5" />
            </div>
            <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-500 border-2 border-slate-950 animate-pulse" />
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-xs font-bold text-slate-100 flex items-center gap-1.5">
                <span>Aegis-Orbital AI Copilot</span>
                <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
              </h3>
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800 uppercase">
                Gemini 3.8
              </span>
            </div>
            <p className="text-[11px] text-slate-400">
              Real-time Emergency Problem Solving & Tactical Guidance
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {activeResult && (
            <span className="hidden sm:inline-flex text-[10px] font-mono text-slate-400 bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
              AOI: {activeResult.primaryHazard}
            </span>
          )}

          {isFloating && onCloseFloating && (
            <button
              type="button"
              onClick={onCloseFloating}
              className="text-slate-400 hover:text-slate-200 p-1 rounded-md hover:bg-slate-800"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* Active Disaster Context Banner (If any) */}
      {activeResult && (
        <div className="bg-slate-950/80 px-4 py-2 border-b border-slate-800/80 flex items-center justify-between text-[11px] text-slate-300">
          <div className="flex items-center gap-2 truncate">
            <Compass className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
            <span className="truncate">
              Mission: <b className="text-slate-100">{activeResult.locationName}</b> ({activeResult.severityLevel} {activeResult.primaryHazard})
            </span>
          </div>
          <span className="text-[10px] font-mono text-emerald-400 shrink-0">
            Grounding Active
          </span>
        </div>
      )}

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-900/50">
        {messages.map((msg) => {
          const isUser = msg.sender === "user";
          const isSystem = msg.sender === "system";

          return (
            <div
              key={msg.id}
              className={`flex flex-col ${isUser ? "items-end" : "items-start"}`}
            >
              <div
                className={`max-w-[85%] rounded-2xl p-3.5 text-xs shadow-md ${
                  isUser
                    ? "bg-gradient-to-r from-cyan-600 to-blue-600 text-white rounded-br-none"
                    : isSystem
                    ? "bg-rose-950/80 border border-rose-800 text-rose-200"
                    : "bg-slate-950 border border-slate-800 text-slate-200 rounded-bl-none"
                }`}
              >
                {/* Sender Tag */}
                <div className="flex items-center justify-between gap-4 mb-1 text-[10px] opacity-75 font-mono">
                  <span>{isUser ? currentUser?.name || "Commander (You)" : isSystem ? "Telemetry" : "Aegis AI Copilot"}</span>
                  <span>{msg.timestamp}</span>
                </div>

                {/* Body Content */}
                <div className="whitespace-pre-line leading-relaxed">
                  {msg.text}
                </div>

                {/* Copy Action Button */}
                {!isUser && !isSystem && (
                  <div className="mt-2.5 pt-2 border-t border-slate-800/60 flex items-center justify-end">
                    <button
                      type="button"
                      onClick={() => handleCopyText(msg.id, msg.text)}
                      className="text-[10px] text-slate-400 hover:text-slate-200 flex items-center gap-1 cursor-pointer"
                    >
                      {copiedId === msg.id ? (
                        <>
                          <Check className="w-3 h-3 text-emerald-400" />
                          <span className="text-emerald-400">Copied</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3 h-3" />
                          <span>Copy Briefing</span>
                        </>
                      )}
                    </button>
                  </div>
                )}
              </div>

              {/* Action Suggestions Chips */}
              {msg.actionSuggestions && msg.actionSuggestions.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-2.5 max-w-[90%]">
                  {msg.actionSuggestions.map((suggestion, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleSendMessage(suggestion)}
                      className="px-2.5 py-1 rounded-full bg-slate-950 hover:bg-slate-800 border border-cyan-500/30 hover:border-cyan-400 text-cyan-300 text-[11px] transition-colors flex items-center gap-1 cursor-pointer"
                    >
                      <Zap className="w-3 h-3 text-cyan-400" />
                      <span>{suggestion}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          );
        })}

        {/* Typing indicator */}
        {isTyping && (
          <div className="flex items-center gap-2 text-slate-400 text-xs bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 w-fit">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-bounce" />
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-bounce [animation-delay:0.2s]" />
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-bounce [animation-delay:0.4s]" />
            <span className="text-[11px] text-slate-400 font-mono ml-1">Downlinking AI response...</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-3 bg-slate-950 border-t border-slate-800">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          className="flex items-center gap-2"
        >
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Ask Aegis-Orbital anything: routes, flood triage, satellite bands..."
            className="flex-1 bg-slate-900 border border-slate-700/80 rounded-xl px-3.5 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition-colors"
          />

          <button
            type="submit"
            disabled={!inputText.trim() || isTyping}
            className="p-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 disabled:opacity-40 disabled:cursor-not-allowed text-slate-950 font-bold transition-all shadow-md shadow-cyan-500/20 cursor-pointer"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};

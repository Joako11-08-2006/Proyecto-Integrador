import React, { useEffect, useState } from "react";
import { PaperAirplaneIcon, ChatBubbleLeftRightIcon, XMarkIcon } from "@heroicons/react/24/outline";
import { api } from "../api";
import { useAuth } from "../context/AuthContext";

const initialMsgs = [
  { from: "bot", text: "¡Hola! Soy el asistente virtual de TecnoMarket. ¿En qué puedo ayudarte hoy?" },
];

const quickReplies = ["Ver promociones", "Comparar celulares", "Métodos de pago", "Estado de pedido"];

export default function ChatWidget() {
  const { user } = useAuth();
  const isAdmin = user?.rol && (user.rol.toUpperCase() === "ADMIN" || user.rol.toUpperCase() === "SUPERADMIN");

  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState(initialMsgs);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [botError, setBotError] = useState(null);
  const [health, setHealth] = useState(null);

  const sendMessage = async (text) => {
    if (!text.trim()) return;
    const userMsg = { from: "user", text };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);
      setBotError(null);
    try {
      const data = await api.chatAsk(text);
      const botText = data.text || "Estoy aquí para ayudarte.";
      const suggestions = data.suggestions || [];
      setMessages((prev) => [...prev, { from: "bot", text: botText, suggestions }]);
    } catch (e) {
      setBotError("No pude responder ahora. Intenta nuevamente.");
      setMessages((prev) => [...prev, { from: "bot", text: "No pude responder ahora. Intenta de nuevo." }]);
    } finally {
      setLoading(false);
    }
  };

  const handleQuick = (q) => {
    setInput(q);
    sendMessage(q);
  };

  useEffect(() => {
    if (open) {
      (async () => {
        try {
          const h = await api.chatHealth();
          setHealth(h);
          if (h && h.ok) {
            setMessages((prev) => [...prev, { from: "bot", text: "IA lista" }]);
          } else {
            setMessages((prev) => [...prev, { from: "bot", text: "IA no disponible" }]);
          }
        } catch (_) {
          setHealth({ ok: false });
        }
      })();
    }
  }, [open]);

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-6 right-6 bg-blue-600 text-white rounded-full p-4 shadow-lg hover:bg-blue-700"
      >
        <ChatBubbleLeftRightIcon className="w-6 h-6" />
      </button>
    );
  }

  return (
    <div className="fixed bottom-6 right-6 w-80 md:w-96 bg-white shadow-2xl rounded-2xl border border-gray-200 overflow-hidden flex flex-col">
      <div className="bg-blue-600 text-white p-4 flex items-center justify-between">
        <div>
          <p className="font-semibold flex items-center gap-2">Asistente Virtual</p>
          <p className="text-xs text-blue-100">{health && health.ok ? "En línea" : "Sin IA"}</p>
        </div>
        <button onClick={() => setOpen(false)}>
          <XMarkIcon className="w-5 h-5" />
        </button>
      </div>

      <div className="flex-1 p-3 space-y-2 overflow-y-auto" style={{ maxHeight: "360px" }}>
        {messages.map((m, idx) => (
          <div key={idx} className={`flex ${m.from === "user" ? "justify-end" : "justify-start"}`}>
            <div
              className={`${
                m.from === "user" ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-800"
              } px-3 py-2 rounded-2xl max-w-[85%] whitespace-pre-line`}
            >
              {m.text}
              {m.suggestions && m.suggestions.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-2">
                  {m.suggestions.map((s) => (
                    <button
                      key={s}
                      onClick={() => handleQuick(s)}
                      className="text-xs bg-white text-blue-600 border border-blue-200 px-2 py-1 rounded-full"
                    >
                      {s}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}
        {loading && <p className="text-xs text-gray-400">Escribiendo...</p>}
        {botError && <p className="text-xs text-red-500">{botError}</p>}
      </div>

      <div className="border-t p-3">
        <div className="flex flex-wrap gap-2 mb-2">
          {quickReplies.map((q) => (
            <button
              key={q}
              onClick={() => handleQuick(q)}
              className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded-full hover:bg-gray-200"
            >
              {q}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && sendMessage(input)}
            placeholder="Escribe tu mensaje..."
            className="flex-1 border rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            onClick={() => sendMessage(input)}
            className="bg-blue-600 text-white rounded-xl px-3 py-2 hover:bg-blue-700"
          >
            <PaperAirplaneIcon className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

import React, { useEffect, useState } from "react";
import { PaperAirplaneIcon, ChatBubbleLeftRightIcon, XMarkIcon, PencilSquareIcon } from "@heroicons/react/24/outline";
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
  const [editing, setEditing] = useState(false);
  const [kbTitle, setKbTitle] = useState("");
  const [kbContent, setKbContent] = useState("");
  const [kbSaving, setKbSaving] = useState(false);

  useEffect(() => {
    if (isAdmin) {
      api.chatKnowledge().then((k) => {
        if (k) {
          setKbTitle(k.title || "");
          setKbContent(k.content || "");
        }
      }).catch(() => {});
    }
  }, [isAdmin]);

  const sendMessage = async (text) => {
    if (!text.trim()) return;
    const userMsg = { from: "user", text };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);
    try {
      const data = await api.chatAsk(text);
      const botText = data.text || "Estoy aquí para ayudarte.";
      const suggestions = data.suggestions || [];
      setMessages((prev) => [...prev, { from: "bot", text: botText, suggestions }]);
    } catch (e) {
      setMessages((prev) => [...prev, { from: "bot", text: "No pude responder ahora. Intenta de nuevo." }]);
    } finally {
      setLoading(false);
    }
  };

  const handleQuick = (q) => {
    setInput(q);
    sendMessage(q);
  };

  const saveKnowledge = async () => {
    if (!kbTitle.trim() || !kbContent.trim()) return;
    setKbSaving(true);
    try {
      const saved = await api.chatKnowledgeSave({ title: kbTitle, content: kbContent });
      setKbTitle(saved.title || kbTitle);
      setKbContent(saved.content || kbContent);
      setEditing(false);
    } catch (e) {
      // Silencioso para no romper el chat
    } finally {
      setKbSaving(false);
    }
  };

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
          <p className="font-semibold flex items-center gap-2">
            Asistente Virtual
            {isAdmin && (
              <button
                className="text-xs bg-white/20 px-2 py-1 rounded-lg hover:bg-white/30"
                onClick={() => setEditing((v) => !v)}
              >
                <PencilSquareIcon className="w-4 h-4 inline-block mr-1" />
                Editar bot
              </button>
            )}
          </p>
          <p className="text-xs text-blue-100">En línea</p>
        </div>
        <button onClick={() => setOpen(false)}>
          <XMarkIcon className="w-5 h-5" />
        </button>
      </div>

      {editing && (
        <div className="border-b border-gray-200 p-3 space-y-2 text-sm">
          <input
            value={kbTitle}
            onChange={(e) => setKbTitle(e.target.value)}
            placeholder="Título del conocimiento"
            className="w-full border rounded-lg px-3 py-2"
          />
          <textarea
            value={kbContent}
            onChange={(e) => setKbContent(e.target.value)}
            placeholder="Contexto que el bot debe saber (en español)"
            rows={5}
            className="w-full border rounded-lg px-3 py-2"
          />
          <div className="flex justify-end gap-2">
            <button
              onClick={() => setEditing(false)}
              className="text-gray-600 px-3 py-2 rounded-lg hover:bg-gray-100"
            >
              Cancelar
            </button>
            <button
              onClick={saveKnowledge}
              disabled={kbSaving}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-60"
            >
              {kbSaving ? "Guardando..." : "Guardar"}
            </button>
          </div>
        </div>
      )}

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

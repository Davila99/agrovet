import { useEffect } from "react";
import "@n8n/chat/style.css";
import { createChat } from "@n8n/chat";

export default function ChatBot() {
  useEffect(() => {
    const webhookUrl =
      "https://agrovets.app.n8n.cloud/webhook/f776f25c-b6ea-4453-ade5-30b0710845c1/chat";

    createChat({
      webhookUrl,
      webhookConfig: {
        method: "POST",
      },
      target: "#n8n-chat",
      mode: "window",
      initialMessages: ["👋 ¡Hola! Soy tu asistente virtual de Agrovets."],
      poweredBy: false,

      // 🌎 Traducción e interfaz
      i18n: {
        es: {
          title: "Chat con IA 💬",
          subtitle: "Pregúntame sobre temas agrícolas o veterinarios.",
          footer: "DebugDynasty © 2025",
          getStarted: "Nueva conversación",
          inputPlaceholder: "Escribe tu pregunta aquí...",
        },
      },
      defaultLanguage: "es",
    });

    // 👇 Forzar el color del texto del input a negro
    const style = document.createElement("style");
    style.innerHTML = `
      #n8n-chat input, 
      #n8n-chat textarea, 
      #n8n-chat .chat-input {
        color: #000 !important;
        caret-color: #000 !important;
      }
    `;
    document.head.appendChild(style);
  }, []);

  return (
    <div
      id="n8n-chat"
      style={{
        width: "100%",
        height: "100vh",
        backgroundColor: "#f9fafb",
        color: "#000",
        fontFamily: "Arial, sans-serif",
      }}
    />
  );
}

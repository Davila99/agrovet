import { useEffect, useRef, useState } from "react";
import AVALogo from "../../../assets/AVA.svg";
import AVAFallback from "../../../assets/logo.svg";
import "@n8n/chat/style.css";
import { createChat } from "@n8n/chat";

export default function ChatBot() {
  const containerRef = useRef(null);
  const chatRef = useRef(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const webhookUrl =
      "https://agrovets.app.n8n.cloud/webhook/f776f25c-b6ea-4453-ade5-30b0710845c1/chat";

    chatRef.current = createChat({
      webhookUrl,
      webhookConfig: { method: "POST" },
      target: "#n8n-chat-widget",
      mode: "embedded",
      initialMessages: ["👋 ¡Hola! Soy AVA, tu asistente virtual de Agrovets."],
      poweredBy: false,
      i18n: {
        es: {
          title: "AVA - Asistente Agrovets",
          subtitle: "Te ayudo con dudas agrícolas y veterinarias.",
          getStarted: "Nueva conversación",
          inputPlaceholder: "Escribe tu pregunta aquí...",
        },
      },
      defaultLanguage: "es",
    });

    const style = document.createElement("style");
    document.head.appendChild(style);

    style.innerHTML = `
      /* Forzar color visible en los campos del widget de chat */
      #n8n-chat, #n8n-chat-widget, #n8n-chat * {
        color: #000 !important;
        caret-color: #000 !important;
      }

      /* Inputs, textareas y elementos contenteditable dentro del widget */
      #n8n-chat input,
      #n8n-chat textarea,
      #n8n-chat [contenteditable],
      #n8n-chat .chat-input,
      #n8n-chat .chat-input__input,
      #n8n-chat-widget input,
      #n8n-chat-widget textarea,
      #n8n-chat-widget [contenteditable] {
        color: #000 !important;
        caret-color: #000 !important;
        background: transparent !important;
      }

      /* Placeholder visible */
      #n8n-chat ::placeholder,
      #n8n-chat-widget ::placeholder,
      #n8n-chat textarea::placeholder,
      #n8n-chat input::placeholder {
        color: rgba(0,0,0,0.6) !important;
      }
    `;
    // Reemplazar la burbuja del toggle por el logo AVA (intentos repetidos hasta que exista)
    const replaceToggleWithLogo = () => {
      const selector = ".chat-window-toggle";
      let attempts = 0;
      const maxAttempts = 15;
      const interval = setInterval(() => {
        attempts += 1;
        const toggle = document.querySelector(selector);
        if (toggle) {
          toggle.innerHTML = "";
          const img = document.createElement("img");
          img.src = AVALogo || AVAFallback;
          img.alt = "AVA";
          img.style.width = "100%";
          img.style.height = "100%";
          img.style.objectFit = "contain";

          img.onerror = function () {
            if (AVAFallback) this.src = AVAFallback;
          };
          toggle.appendChild(img);
          toggle.style.padding = "1px";
          toggle.style.background = "none";
          toggle.style.border = "none";
          toggle.style.boxShadow = "none";
          clearInterval(interval);
        } else if (attempts >= maxAttempts) {
          clearInterval(interval);
        }
      }, 200);
    };

    setTimeout(replaceToggleWithLogo, 300);

    setReady(true);

    return () => {
      try {
        if (chatRef.current && typeof chatRef.current.destroy === "function") {
          chatRef.current.destroy();
        }
      } catch (e) {}
      document.head.removeChild(style);
    };
  }, []);

  return (
    <div className="ava-container" ref={containerRef}>
      <header className="ava-header" role="banner">
        <div className="ava-avatar" aria-hidden></div>
      </header>

      <main className="ava-main" role="main">
        {/* Punto de montaje para el widget n8n chat */}
        <div id="n8n-chat-widget" style={{ flex: 1 }} />
      </main>
    </div>
  );
}

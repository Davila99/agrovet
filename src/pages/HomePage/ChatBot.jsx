import { useEffect, useRef, useState } from "react";
import AVALogo from "../../assets/AVA.svg";
import AVAFallback from "../../assets/logo.svg";
import "@n8n/chat/style.css";
import { createChat } from "@n8n/chat";

export default function ChatBot() {
  const containerRef = useRef(null);
  const chatRef = useRef(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const webhookUrl =
      "https://agrovets.app.n8n.cloud/webhook/f776f25c-b6ea-4453-ade5-30b0710845c1/chat";

    // Inicializar el chat de n8n y guardar referencia para enviar mensajes desde quick replies
    chatRef.current = createChat({
      webhookUrl,
      webhookConfig: { method: "POST" },
      target: "#n8n-chat-widget",
      mode: "window",
      initialMessages: ["👋 ¡Hola! Soy AVA, tu asistente virtual de Agrovets."],
      poweredBy: false,
      i18n: {
        es: {
          title: AVALogo ? "AVA" : "AVA",
          subtitle: "Te ayudo con dudas agrícolas y veterinarias.",
          getStarted: "Nueva conversación",
          inputPlaceholder: "Escribe tu pregunta aquí...",
        },
      },
      defaultLanguage: "es",
    });

    // Estilos globales forzados para mejor contraste
    const style = document.createElement("style");
    style.innerHTML = `
      /* Forzar color del input a negro y mejorar contraste */
      #n8n-chat-widget input, 
      #n8n-chat-widget textarea, 
      #n8n-chat-widget .chat-input {
        color: #000 !important;
        caret-color: #000 !important;
      }

      /* Personalizaciones para el contenedor de AVA */
      .ava-container {
        display: flex;
        flex-direction: column;
        height: 100%;
      }

      .ava-header {
        display: flex;

      .ava-avatar {
        width: 44px;
      }
      .ava-quick {
        display: flex;
        gap: 8px;
        padding: 12px 16px;
        flex-wrap: wrap;
      }

      .ava-quick button {
        background: #fff;
        border: 1px solid rgba(15,23,42,0.06);
        padding: 8px 12px;
        border-radius: 999px;
        cursor: pointer;
        font-size: 13px;
      }

      .ava-main {
        flex: 1 1 auto;
        min-height: 0; /* allow children to scroll */
        display: flex;
        flex-direction: column;
  }}
    `;
    document.head.appendChild(style);

    // Reemplazar la burbuja del toggle por el logo AVA (intentos repetidos hasta que exista)
    const replaceToggleWithLogo = () => {
      const selector = ".chat-window-toggle";
      let attempts = 0;
      const maxAttempts = 15;
      const interval = setInterval(() => {
        attempts += 1;
        const toggle = document.querySelector(selector);
        if (toggle) {
          // limpiar contenido y colocar imagen
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
          // ajustar estilos del toggle para centrar imagen
          toggle.style.padding = "6px";
          toggle.style.background = "none";
          toggle.style.border = "none";
          toggle.style.boxShadow = "none";
          clearInterval(interval);
        } else if (attempts >= maxAttempts) {
          clearInterval(interval);
        }
      }, 200);
    };

    // Llamar tras una pequeña espera para que createChat tenga tiempo de montar el DOM
    setTimeout(replaceToggleWithLogo, 300);

    // Marcar listo cuando createChat esté inicializado (siempre devuelve objeto)
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

  const quickReplies = [
    "¿Cuándo fertilizar?",
    "Signos de enfermedad en vacas",
    "Control de plagas en maíz",
    "Agrotécnicas sostenibles",
  ];

  // Envía un mensaje al widget n8n chat si es posible
  function sendQuickReply(text) {
    // n8n chat exposes window.n8nChat? (no garantizado) — intentar usar la referencia creada
    try {
      const chat = chatRef.current;
      if (chat && typeof chat.sendMessage === "function") {
        chat.sendMessage(text);
        return;
      }

      // Fallback: dispatch a custom event that el widget pueda escuchar
      const event = new CustomEvent("n8n-chat-message", { detail: { text } });
      window.dispatchEvent(event);
    } catch (err) {
      // Silenciar errores; el chat aún puede recibir input manualmente
      // eslint-disable-next-line no-console
      console.error("No se pudo enviar quick reply:", err);
    }
  }

  return (
    <div className="ava-container" ref={containerRef}>
      <header className="ava-header" role="banner">
        <div className="ava-avatar" aria-hidden>
          <img
            src={AVALogo}
            alt="AVA"
            style={{ width: "100%", height: "100%", borderRadius: 12 }}
            onError={(e) => {
              // si el svg está vacío o falla, usar fallback
              // @ts-ignore
              e.currentTarget.onerror = null;
              // @ts-ignore
              e.currentTarget.src = AVAFallback;
            }}
          />
        </div>
        <div>
          <div className="ava-title">AVA — Asistente Agrovets</div>
          <div className="ava-subtitle">
            Pregúntame sobre agricultura y veterinaria
          </div>
        </div>
      </header>

      <div className="ava-quick" aria-label="Sugerencias rápidas">
        {quickReplies.map((q) => (
          <button
            key={q}
            onClick={() => sendQuickReply(q)}
            type="button"
            title={`Enviar: ${q}`}
          >
            {q}
          </button>
        ))}
      </div>

      <main className="ava-main" role="main">
        {/* Punto de montaje para el widget n8n chat */}
        <div id="n8n-chat-widget" style={{ flex: 1 }} />
      </main>

      <div className="ava-footer">
        ¿Necesitas ayuda avanzada? Contacta con soporte Agrovets.
      </div>
    </div>
  );
}

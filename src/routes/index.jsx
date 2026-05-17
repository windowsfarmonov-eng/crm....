const _jsxFileName = "";import {jsxDEV as _jsxDEV} from "react/jsx-dev-runtime";import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef } from "react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "EduManage — CRM" },
      { name: "description", content: "EduManage o'quv markaz boshqaruv tizimi" },
    ],
    links: [{ rel: "stylesheet", href: "/edu-styles.css" }],
  }),
  component: Index,
});

function Index() {
  const rootRef = useRef(null);

  useEffect(() => {
    if (!rootRef.current) return;
    let cancelled = false;

    (async () => {
      const res = await fetch("/app-shell.html");
      const html = await res.text();
      if (cancelled || !rootRef.current) return;
      rootRef.current.innerHTML = html;

      // Load original sa.js
      const sa = document.createElement("script");
      sa.src = "/sa.js";
      sa.onload = () => {
        // After sa.js is loaded, install Telegram bridge
        const bridge = document.createElement("script");
        bridge.src = "/telegram-bridge.js";
        document.body.appendChild(bridge);
        // Load AI assistant
        const ai = document.createElement("script");
        ai.src = "/ai-assistant.js";
        document.body.appendChild(ai);
      };
      document.body.appendChild(sa);
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  return _jsxDEV('div', { ref: rootRef,}, void 0, false, {fileName: _jsxFileName, lineNumber: 45}, this );
}

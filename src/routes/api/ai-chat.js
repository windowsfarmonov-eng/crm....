import { createFileRoute } from "@tanstack/react-router";

// AI chat proxy.
// Tartib:
//  1) LOVABLE_API_KEY bo'lsa — Lovable AI Gateway (Gemini)
//  2) ANTHROPIC_API_KEY bo'lsa — Anthropic Claude
//  3) Hech qanday kalit bo'lmasa — bepul Pollinations API (kalit talab qilmaydi)
// Shuning uchun zipni boshqa joyda ochganda ham AI ishlaydi.
export const Route = createFileRoute("/api/ai-chat")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        let body;
        try {
          body = await request.json();
        } catch {
          return Response.json({ ok: false, error: "Invalid JSON" }, { status: 400 });
        }

        const { messages, system } = body || {};
        if (!Array.isArray(messages)) {
          return Response.json({ ok: false, error: "messages array kerak" }, { status: 400 });
        }

        const lovableKey = process.env.LOVABLE_API_KEY;
        const anthropicKey = process.env.ANTHROPIC_API_KEY;

        // 1) Lovable AI Gateway
        if (lovableKey) {
          try {
            const oaiMessages = [];
            if (system) oaiMessages.push({ role: "system", content: system });
            for (const m of messages) {
              oaiMessages.push({
                role: m.role === "assistant" ? "assistant" : "user",
                content: String(m.content || ""),
              });
            }
            const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                "Lovable-API-Key": lovableKey,
                "X-Lovable-AIG-SDK": "raw-fetch",
              },
              body: JSON.stringify({
                model: "google/gemini-3-flash-preview",
                messages: oaiMessages,
                max_tokens: 1200,
              }),
            });
            const data = await res.json().catch(() => ({}));
            if (res.ok) {
              const text = data.choices?.[0]?.message?.content || "";
              return Response.json({ ok: true, text });
            }
            if (res.status === 429)
              return Response.json({ ok: false, error: "Juda ko'p so'rov. Birozdan keyin urinib ko'ring." }, { status: 429 });
            if (res.status === 402)
              return Response.json({ ok: false, error: "AI kreditlari tugadi." }, { status: 402 });
            // boshqa xato -> pastdagi fallback'ga tushadi
            console.error("Lovable Gateway xato:", res.status, data);
          } catch (e) {
            console.error("Lovable Gateway exception:", e);
          }
        }

        // 2) Anthropic
        if (anthropicKey) {
          try {
            const res = await fetch("https://api.anthropic.com/v1/messages", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                "x-api-key": anthropicKey,
                "anthropic-version": "2023-06-01",
              },
              body: JSON.stringify({
                model: "claude-sonnet-4-20250514",
                max_tokens: 1000,
                system: system || "",
                messages,
              }),
            });
            const data = await res.json().catch(() => ({}));
            if (res.ok) {
              const text = data.content?.[0]?.text || "";
              return Response.json({ ok: true, text });
            }
            console.error("Anthropic xato:", res.status, data);
          } catch (e) {
            console.error("Anthropic exception:", e);
          }
        }

        // 3) Pollinations (kalit talab qilmaydi) — universal fallback
        try {
          const polMessages = [];
          if (system) polMessages.push({ role: "system", content: system });
          for (const m of messages) {
            polMessages.push({
              role: m.role === "assistant" ? "assistant" : "user",
              content: String(m.content || ""),
            });
          }
          const res = await fetch("https://text.pollinations.ai/openai", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              model: "openai",
              messages: polMessages,
              private: true,
            }),
          });
          const raw = await res.text();
          if (!res.ok) {
            return Response.json(
              { ok: false, error: `AI xizmati ishlamayapti (${res.status}). Keyinroq urinib ko'ring.` },
              { status: 502 }
            );
          }
          let text = "";
          try {
            const data = JSON.parse(raw);
            text = data.choices?.[0]?.message?.content || data.text || raw;
          } catch {
            text = raw;
          }
          return Response.json({ ok: true, text });
        } catch (e) {
          return Response.json(
            { ok: false, error: "AI xizmatiga ulanib bo'lmadi: " + (e?.message || e) },
            { status: 502 }
          );
        }
      },
    },
  },
});

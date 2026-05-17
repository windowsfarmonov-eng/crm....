import { createFileRoute } from "@tanstack/react-router";



export const Route = createFileRoute("/api/send-attendance")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const token = process.env.TELEGRAM_BOT_TOKEN;
        if (!token) {
          return Response.json(
            { ok: false, error: "TELEGRAM_BOT_TOKEN sozlanmagan" },
            { status: 500 }
          );
        }

        let body;
        try {
          body = await request.json();
        } catch (e) {
          return Response.json({ ok: false, error: "Invalid JSON" }, { status: 400 });
        }

        const { chatId, groupName, date, rows } = body;
        if (!chatId || !groupName || !date || !Array.isArray(rows)) {
          return Response.json({ ok: false, error: "Missing fields" }, { status: 400 });
        }

        const lines = rows
          .map((r, i) => {
            const icon =
              r.status === "K" ? "✅" : r.status === "Y" ? "❌" : r.status === "S" ? "🟡" : "⚪️";
            return `${i + 1}. ${r.fullName} ${icon}`;
          })
          .join("\n");

        const time = new Date().toLocaleTimeString("uz-UZ", {
          hour: "2-digit",
          minute: "2-digit",
        });

        const text =
          `📊 *Davomat hisoboti*\n` +
          `👥 Guruh: *${groupName}*\n` +
          `📅 Sana: *${date}*\n` +
          `⏱️ Vaqt: *${time}*\n\n` +
          `${lines}\n\n` +
          `Belgilar: ✅ Keldi · ❌ Yo'q · 🟡 Sababli · ⚪️ Belgilanmagan`;

        const res = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ chat_id: chatId, text, parse_mode: "Markdown" }),
        });

        const data = (await res.json().catch(() => ({}))) ;
        if (!res.ok || !data.ok) {
          return Response.json(
            { ok: false, error: data.description || `HTTP ${res.status}` },
            { status: 502 }
          );
        }
        return Response.json({ ok: true });
      },
    },
  },
});

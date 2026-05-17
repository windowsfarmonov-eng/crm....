/* Telegram bridge — mentor davomat belgilaganda ota-onalar guruhiga yuboradi */
(function () {
  if (typeof window === "undefined") return;

  function getRole() {
    try {
      return (window.CURRENT_USER && window.CURRENT_USER.role) || localStorage.getItem("role") || "";
    } catch (_) {
      return "";
    }
  }

  function getParentsChatId(groupId) {
    const key = "parentsChatId_" + groupId;
    let cid = localStorage.getItem(key);
    if (!cid) {
      cid = window.prompt(
        "Bu guruh uchun ota-onalar Telegram chat ID si (masalan -1001234567890):",
        ""
      );
      if (cid) localStorage.setItem(key, cid.trim());
    }
    return cid ? cid.trim() : "";
  }

  function buildRows(attKey, gid) {
    const D = window.D;
    if (!D || !D.attendance || !D.students) return [];
    const sAttGroup = D.attendance[attKey] || {};
    const students = D.students.filter((s) => s.groupId === gid);
    return students.map((s) => {
      const sKey = "s" + s.id;
      const sAtt = sAttGroup[sKey] || {};
      // latest non-empty lesson status
      let last = "";
      const LC = window.LESSON_COUNT || 12;
      for (let l = LC; l >= 1; l--) {
        const v = sAtt["l" + l];
        if (v) {
          last = v;
          break;
        }
      }
      return { fullName: s.name, status: last };
    });
  }

  async function sendReport(gid) {
    try {
      const role = getRole();
      // Faqat mentor davomat qilganida yuboriladi
      if (role && role !== "mentor") return;

      const D = window.D;
      const grp = D && D.groups && D.groups.find((g) => g.id === gid);
      if (!grp) return;

      const chatId = getParentsChatId(gid);
      if (!chatId) return;

      const year = window._attYear != null ? window._attYear : new Date().getFullYear();
      const month = window._attMonth != null ? window._attMonth : new Date().getMonth();
      const attKey = "att_" + gid + "_" + year + "_" + month;
      const rows = buildRows(attKey, gid);
      const date = new Date().toLocaleDateString("uz-UZ");

      const res = await fetch("/api/send-attendance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ chatId, groupName: grp.name, date, rows }),
      });
      const data = await res.json().catch(() => ({}));
      if (typeof window.toast === "function") {
        if (res.ok && data.ok) window.toast("📨 Ota-onalarga yuborildi");
        else window.toast("⚠️ Telegram: " + (data.error || res.status));
      }
    } catch (e) {
      console.error("[telegram-bridge]", e);
    }
  }

  // Debounce: bir necha katakni belgilashda 1.5s tinchlikdan keyin yuboradi
  let timer = null;
  function scheduleSend(gid) {
    clearTimeout(timer);
    timer = setTimeout(() => sendReport(gid), 1500);
  }

  // Wrap setAtt
  const orig = window.setAtt;
  if (typeof orig !== "function") {
    console.warn("[telegram-bridge] setAtt not found");
    return;
  }
  window.setAtt = function (attKey, sKey, lKey, val) {
    const result = orig.apply(this, arguments);
    // attKey format: att_<gid>_<year>_<month>
    const m = /^att_(\d+)_/.exec(attKey);
    if (m) scheduleSend(parseInt(m[1], 10));
    return result;
  };

  console.log("[telegram-bridge] active");
})();

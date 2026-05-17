import { j as jsxDevRuntimeExports } from "./router-D06xeh2H.js";
import { P as reactExports } from "./server-gvdq5Vwx.js";
import "node:async_hooks";
import "node:stream/web";
import "node:stream";
const _jsxFileName = "";
function Index() {
  const rootRef = reactExports.useRef(null);
  reactExports.useEffect(() => {
    if (!rootRef.current) return;
    let cancelled = false;
    (async () => {
      const res = await fetch("/app-shell.html");
      const html = await res.text();
      if (cancelled || !rootRef.current) return;
      rootRef.current.innerHTML = html;
      const sa = document.createElement("script");
      sa.src = "/sa.js";
      sa.onload = () => {
        const bridge = document.createElement("script");
        bridge.src = "/telegram-bridge.js";
        document.body.appendChild(bridge);
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
  return jsxDevRuntimeExports.jsxDEV("div", {
    ref: rootRef
  }, void 0, false, {
    fileName: _jsxFileName,
    lineNumber: 45
  }, this);
}
export {
  Index as component
};

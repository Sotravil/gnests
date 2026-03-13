(function () {
  "use strict";

  function allowed(host, domains) {
    if (!domains || !domains.length) {
      return true;
    }
    return domains.indexOf(host) >= 0;
  }

  function mountOne(cfg) {
    try {
      var host = location.hostname;
      if (!allowed(host, cfg.domains || [])) {
        if (cfg.meta && cfg.meta.devMode) {
          console.warn("GNESTS embed skipped: domain not in allowlist", host);
        }
        return;
      }

      var mount = cfg.runtime && cfg.runtime.mount ? document.querySelector(cfg.runtime.mount) : null;
      if (!mount) {
        return;
      }

      var card = document.createElement("div");
      card.style.border = "1px solid " + (cfg.theme && cfg.theme.border ? cfg.theme.border : "#d6e1e6");
      card.style.borderRadius = ((cfg.theme && cfg.theme.radius) || 12) + "px";
      card.style.padding = "12px";
      card.style.fontFamily = "system-ui, sans-serif";
      card.style.background = (cfg.theme && cfg.theme.background) || "#ffffff";
      card.style.color = (cfg.theme && cfg.theme.text) || "#111827";
      card.innerHTML = "<strong>" + String((cfg.payload && cfg.payload.title) || "Notification") + "</strong><div style='margin-top:6px;'>" + String((cfg.payload && cfg.payload.body) || "") + "</div>";

      card.addEventListener("click", function () {
        var target = cfg.payload && cfg.payload.targetUrl ? cfg.payload.targetUrl : "/";
        window.location.href = target;
      });

      mount.innerHTML = "";
      mount.appendChild(card);
    } catch (error) {
      console.error("GNESTS embed runtime error", error);
    }
  }

  function boot() {
    var list = window.GNESTS_EMBEDS || [];
    list.forEach(mountOne);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})();

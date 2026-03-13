(function () {
  "use strict";

  function makeConfig(name, draft, resolved) {
    return {
      id: "embed_" + Date.now(),
      name: name || ((draft.name || "preset") + "-embed"),
      presetRef: draft.name || "",
      source: "local",
      runtime: {
        scriptSrc: "https://cdn.jsdelivr.net/gh/Sotravil/gnests@main/dist/gnests-embed.js",
        mount: (draft.embed && draft.embed.mount) || "#gnests-slot",
        mode: (draft.embed && draft.embed.mode) || "notification",
        autostart: draft.embed ? draft.embed.autostart !== false : true
      },
      payload: {
        title: resolved.title || draft.title,
        body: resolved.body || draft.body,
        targetUrl: resolved.targetUrl || draft.targetUrl,
        icon: resolved.icon || draft.icon,
        badge: resolved.badge || draft.badge,
        image: resolved.image || draft.image,
        tag: resolved.tag || draft.tag
      },
      theme: Object.assign({}, draft.theme || {}),
      domains: Array.isArray(draft.domains) ? draft.domains.slice() : [],
      meta: Object.assign({}, draft.meta || {}),
      exportedAt: Date.now()
    };
  }

  function toJson(config) {
    return JSON.stringify(config, null, 2);
  }

  function toJs(config) {
    var json = JSON.stringify(config, null, 2);
    return [
      "window.GNESTS_EMBEDS = window.GNESTS_EMBEDS || [];",
      "window.GNESTS_EMBEDS.push(" + json + ");"
    ].join("\n");
  }

  function toHtml(config) {
    return [
      '<div id="' + String((config.runtime.mount || "#gnests-slot").replace(/^#/, "")) + '"></div>',
      '<script src="' + config.runtime.scriptSrc + '"></script>',
      "<script>",
      toJs(config),
      "</script>"
    ].join("\n");
  }

  function packageExport(config) {
    return {
      format: "package",
      files: {
        "embed-config.json": toJson(config),
        "embed-init.js": toJs(config),
        "embed-snippet.html": toHtml(config)
      }
    };
  }

  window.GNESTSEmbedExporter = {
    makeConfig: makeConfig,
    toJson: toJson,
    toJs: toJs,
    toHtml: toHtml,
    packageExport: packageExport
  };
})();

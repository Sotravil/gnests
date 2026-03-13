(function () {
  "use strict";

  function uid() {
    if (window.crypto && window.crypto.randomUUID) {
      return "cmd_" + window.crypto.randomUUID();
    }
    return "cmd_" + Date.now() + "_" + Math.random().toString(16).slice(2, 8);
  }

  function normalize(parsed, mode) {
    if (parsed.kind === "action") {
      return {
        id: uid(),
        source: "console",
        action: parsed.actionName,
        args: parsed.args || {},
        meta: {
          mode: mode || "professional",
          rawInput: parsed.raw
        }
      };
    }

    var c = parsed.command;
    var args = parsed.argsPos;
    var kv = parsed.argsKv;
    var action = "unknown";
    var out = {};

    if (c === "new") { action = "draft.new"; }
    else if (c === "reset") { action = "draft.reset"; }
    else if (c === "name") { action = "draft.setName"; out.value = args[0] || ""; }
    else if (c === "label") { action = "draft.setLabel"; out.value = args[0] || ""; }
    else if (c === "title") { action = "draft.setTitle"; out.value = args[0] || ""; }
    else if (c === "body") { action = "draft.setBody"; out.value = args[0] || ""; }
    else if (c === "tag") { action = "draft.setTag"; out.value = args[0] || ""; }
    else if (c === "open") { action = "draft.setTargetUrl"; out.value = args[0] || "/"; }
    else if (c === "icon") { action = "draft.setIcon"; out.value = args[0] || ""; }
    else if (c === "badge") { action = "draft.setBadge"; out.value = args[0] || ""; }
    else if (c === "image") { action = "draft.setImage"; out.value = args[0] || ""; }
    else if (c === "meta") { action = "draft.mergeMeta"; out.values = kv; }
    else if (c === "vars") { action = "draft.mergeVars"; out.values = kv; }
    else if (c === "preview") { action = "draft.preview"; }
    else if (c === "render") { action = "draft.render"; }
    else if (c === "show") { action = "draft.show"; }
    else if (c === "save") { action = "preset.saveLocal"; out.name = (args[0] === "as" ? args[1] : args[0]) || kv.name || ""; }
    else if (c === "load") {
      if ((args[0] || "").toLowerCase() === "repo") {
        action = "repo.load";
        out.name = args[1] || "";
      } else {
        action = "preset.loadLocal";
        out.name = args[0] || "";
      }
    }
    else if (c === "presets") { action = "preset.listLocal"; }
    else if (c === "delete" || c === "remove") { action = "preset.deleteLocal"; out.name = args[0] || ""; out.force = kv.force === "true"; }
    else if (c === "clone") { action = "preset.cloneLocal"; out.name = args[0] || ""; out.newName = args[2] || kv.as || ""; }
    else if (c === "rename") { action = "preset.renameLocal"; out.name = args[0] || ""; out.newName = args[1] || ""; }
    else if (c === "recent") { action = "preset.recent"; }
    else if (c === "last") { action = "preset.last"; }
    else if (c === "diag") { action = "system.diag"; }
    else if (c === "perm") { action = "system.perm"; }
    else if (c === "sw") { action = "system.sw"; }
    else if (c === "help") { action = "system.help"; }
    else if (c === "clear") { action = "system.clear"; }
    else if (c === "mode") { action = "system.mode"; out.value = args[0] || "medium"; }
    else if (c === "send" || c === "notify") { action = "notify.send"; out = { title: args[0] || kv.title || "", body: args[1] || kv.body || "", tag: kv.tag || "", open: kv.open || "", inline: args.length > 0 || Object.keys(kv).length > 0 }; }
    else if (c === "attempt" && (args[0] || "").toLowerCase() === "p") { action = "notify.send"; out = { title: args[1] || kv.title || "", body: kv.body || "", tag: kv.tag || "", open: kv.open || "", inline: true }; }
    else if (c === "schedule" || c === "queue") { action = "notify.schedule"; out = { title: args[0] || kv.title || "", body: args[1] || kv.body || "", inMs: parsed.durationMs || 0 }; }
    else if (c === "color" || c === "accent" || c === "background" || c === "text" || c === "border" || c === "radius" || c === "shadow") { action = "theme.set"; out.key = c; out.value = args[0] || kv.value || ""; }
    else if (c === "theme") { action = args[0] === "reset" ? "theme.reset" : "theme.show"; }
    else if (c === "domain") { action = "domain." + (args[0] || "list"); out.value = args[1] || ""; }
    else if (c === "domains") { action = "domain.list"; }
    else if (c === "assets") { action = "asset.list"; }
    else if (c === "asset") { action = "asset." + (args[0] || "list"); out.type = args[1] || ""; out.name = args[2] || ""; }
    else if (c === "embed" || c === "export" || c === "snippet") { action = "embed." + (args[0] || c); out.format = (c === "export" ? (args[0] || "embed") : (args[1] || "")); out.name = (args[0] === "save" && args[1] === "as") ? args[2] : args[1] || ""; }
    else if (c === "repo") { action = "repo." + (args[0] || "list"); out.name = args[1] || ""; }
    else if (c === "use" && (args[0] || "").toLowerCase() === "repo") { action = "repo.use"; out.name = args[1] || ""; }
    else if (c === "import") { action = "repo.import"; out.name = args[1] || args[0] || ""; }

    return {
      id: uid(),
      source: "console",
      action: action,
      args: out,
      meta: {
        mode: mode || "professional",
        rawInput: parsed.raw
      }
    };
  }

  window.GNESTSActionNormalizer = {
    normalize: normalize
  };
})();

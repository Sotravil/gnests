(function () {
  "use strict";

  function e(code, field, detail) {
    return { code: code, field: field || "", detail: detail || code };
  }

  async function execute(actionObj, ctx) {
    var R = window.GNESTSResponse;
    var DS = window.GNESTSDraftStore;
    var PS = window.GNESTSPresetStore;
    var ES = window.GNESTSEmbedStore;
    var AS = window.GNESTSAssetStore;
    var RS = window.GNESTSRepoPresetAdapter;
    var PH = window.GNESTSPlaceholderEngine;
    var EX = window.GNESTSEmbedExporter;

    var act = actionObj.action;
    var args = actionObj.args || {};

    try {
      if (act === "unknown") {
        return R.error(act, "Unknown command.", [e("UNKNOWN_COMMAND", "command", actionObj.meta.rawInput)]);
      }

      if (act === "draft.new" || act === "draft.reset") {
        var fresh = DS.resetDraft();
        return R.success(act, "Draft reset.", fresh);
      }

      if (act.indexOf("draft.set") === 0) {
        var fieldMap = {
          "draft.setName": "name",
          "draft.setLabel": "label",
          "draft.setTitle": "title",
          "draft.setBody": "body",
          "draft.setTag": "tag",
          "draft.setTargetUrl": "targetUrl",
          "draft.setIcon": "icon",
          "draft.setBadge": "badge",
          "draft.setImage": "image"
        };
        var field = fieldMap[act];
        var draftSet = DS.updateDraft(function (d) { d[field] = args.value; });
        return R.success(act, "Draft updated.", { field: field, draft: draftSet });
      }

      if (act === "draft.mergeMeta") {
        var dMeta = DS.updateDraft(function (d) {
          d.meta = d.meta || {};
          Object.assign(d.meta, args.values || {});
        });
        return R.success(act, "Metadata updated.", dMeta.meta);
      }

      if (act === "draft.mergeVars") {
        var vars = DS.mergeVars(args.values || {});
        return R.success(act, "Runtime vars updated.", vars);
      }

      if (act === "draft.show") {
        return R.success(act, "Active draft.", DS.loadDraft());
      }

      if (act === "draft.preview" || act === "draft.render") {
        var draftPreview = DS.loadDraft();
        var varsPreview = DS.loadVars();
        var rendered = PH.resolveDraft(draftPreview, varsPreview, {
          clientId: ctx.runtime.clientId,
          platform: ctx.runtime.platform
        });
        if (!rendered.ok) {
          return R.warning(act, "Rendered with unresolved placeholders.", rendered, rendered.unresolved.map(function (p) {
            return e("UNRESOLVED_PLACEHOLDER", p, "Missing placeholder value");
          }));
        }
        return R.success(act, "Rendered successfully.", rendered);
      }

      if (act === "preset.saveLocal") {
        var draftSave = DS.loadDraft();
        var nameSave = args.name || draftSave.name;
        if (!nameSave) {
          return R.error(act, "Preset name required.", [e("PRESET_NAME_REQUIRED", "name", "Use name or save as")]);
        }
        draftSave.name = nameSave;
        DS.saveDraft(draftSave);
        return R.success(act, "Preset saved locally.", PS.save(nameSave, draftSave));
      }

      if (act === "preset.listLocal") {
        var items = PS.list().map(function (x) { return { name: x.name, updatedAt: x.updatedAt, source: x.source || "local" }; });
        return R.success(act, "Local presets loaded successfully.", { count: items.length, items: items });
      }

      if (act === "preset.loadLocal") {
        var p = PS.get(args.name);
        if (!p) {
          return R.error(act, "Preset not found.", [e("PRESET_NOT_FOUND", "name", "No local preset named '" + args.name + "' exists.")]);
        }
        DS.saveDraft(JSON.parse(JSON.stringify(p)));
        PS.setRecent(p.name);
        return R.success(act, "Preset loaded.", p);
      }

      if (act === "preset.deleteLocal") {
        if (!args.name) {
          return R.error(act, "Preset name required.", [e("PRESET_NAME_REQUIRED", "name", "Provide preset name")]);
        }
        if (!PS.remove(args.name)) {
          return R.error(act, "Preset not found.", [e("PRESET_NOT_FOUND", "name", "No local preset named '" + args.name + "' exists.")]);
        }
        return R.success(act, "Preset deleted.", { name: args.name });
      }

      if (act === "preset.cloneLocal") {
        var cloned = PS.clone(args.name, args.newName);
        if (!cloned) {
          return R.error(act, "Clone failed.", [e("INVALID_ARGUMENT", "name", "Check source and destination names")]);
        }
        return R.success(act, "Preset cloned.", cloned);
      }

      if (act === "preset.renameLocal") {
        var renamed = PS.rename(args.name, args.newName);
        if (!renamed) {
          return R.error(act, "Rename failed.", [e("INVALID_ARGUMENT", "name", "Check source and destination names")]);
        }
        return R.success(act, "Preset renamed.", renamed);
      }

      if (act === "preset.last") {
        return R.success(act, "Last saved preset pointer.", { name: PS.lastSaved() });
      }

      if (act === "preset.recent") {
        return R.success(act, "Recent preset history.", { items: PS.recent() });
      }

      if (act === "repo.presets") {
        var repoItems = await RS.list(false);
        return R.success(act, "Repo presets loaded.", { count: repoItems.length, items: repoItems });
      }

      if (act === "repo.show" || act === "repo.load" || act === "repo.use") {
        var rp = await RS.loadPreset(args.name, false);
        if (act !== "repo.show") {
          DS.saveDraft(JSON.parse(JSON.stringify(rp)));
        }
        return R.success(act, "Repo preset loaded.", rp);
      }

      if (act === "repo.import") {
        var imp = await RS.loadPreset(args.name, false);
        var imported = PS.save(imp.name || args.name, imp);
        return R.success(act, "Repo preset imported.", imported);
      }

      if (act === "theme.set") {
        var draftTheme = DS.updateDraft(function (d) {
          d.theme = d.theme || {};
          var key = args.key === "radius" ? "radius" : args.key;
          d.theme[key] = args.key === "radius" ? Number(args.value || 0) : args.value;
        });
        return R.success(act, "Theme updated.", draftTheme.theme);
      }

      if (act === "theme.show") {
        return R.success(act, "Theme values.", DS.loadDraft().theme || {});
      }

      if (act === "theme.reset") {
        var resetTheme = DS.updateDraft(function (d) {
          d.theme = DS.defaults().theme;
        });
        return R.success(act, "Theme reset.", resetTheme.theme);
      }

      if (act === "domain.add") {
        if (!args.value) {
          return R.error(act, "Domain is required.", [e("DOMAIN_INVALID", "domain", "Provide domain")]);
        }
        var dAdd = DS.updateDraft(function (d) {
          d.domains = d.domains || [];
          if (d.domains.indexOf(args.value) < 0) {
            d.domains.push(args.value);
          }
        });
        return R.success(act, "Domain added.", dAdd.domains);
      }

      if (act === "domain.remove") {
        var dRemove = DS.updateDraft(function (d) {
          d.domains = (d.domains || []).filter(function (x) { return x !== args.value; });
        });
        return R.success(act, "Domain removed.", dRemove.domains);
      }

      if (act === "domain.clear") {
        var dClear = DS.updateDraft(function (d) { d.domains = []; });
        return R.success(act, "Domain allowlist cleared.", dClear.domains);
      }

      if (act === "domain.list") {
        return R.success(act, "Domain allowlist.", { items: DS.loadDraft().domains || [] });
      }

      if (act === "asset.list") {
        return R.success(act, "Assets listed.", { items: AS.list() });
      }

      if (act === "asset.show") {
        var oneAsset = AS.get(args.name);
        if (!oneAsset) {
          return R.error(act, "Asset not found.", [e("ASSET_NOT_FOUND", "name", args.name)]);
        }
        return R.success(act, "Asset loaded.", oneAsset);
      }

      if (act === "asset.remove") {
        if (!AS.remove(args.name)) {
          return R.error(act, "Asset not found.", [e("ASSET_NOT_FOUND", "name", args.name)]);
        }
        return R.success(act, "Asset removed.", { name: args.name });
      }

      if (act === "asset.clear") {
        AS.clear();
        return R.success(act, "Asset library cleared.", {});
      }

      if (act === "asset.use") {
        var aUse = AS.get(args.name);
        if (!aUse) {
          return R.error(act, "Asset not found.", [e("ASSET_NOT_FOUND", "name", args.name)]);
        }
        var map = { icon: "icon", badge: "badge", image: "image" };
        var fieldUse = map[args.type] || args.type;
        var dUse = DS.updateDraft(function (d) { d[fieldUse] = aUse.src; });
        return R.success(act, "Asset assigned to draft.", { field: fieldUse, src: aUse.src, draft: dUse });
      }

      if (act === "notify.send") {
        var draftSend = DS.loadDraft();
        var varsSend = DS.loadVars();
        var preview = window.GNESTSPlaceholderEngine.resolveDraft(draftSend, varsSend, {
          clientId: ctx.runtime.clientId,
          platform: ctx.runtime.platform
        });
        if (!preview.ok && ctx.options.strict) {
          return R.error(act, "Unresolved placeholders.", preview.unresolved.map(function (p) {
            return e("UNRESOLVED_PLACEHOLDER", p, "Missing value");
          }));
        }

        var payload = {
          id: "notif_" + Date.now(),
          title: args.inline ? (args.title || preview.resolved.title) : preview.resolved.title,
          body: args.inline ? (args.body || preview.resolved.body) : preview.resolved.body,
          targetUrl: args.inline ? (args.open || preview.resolved.targetUrl) : preview.resolved.targetUrl,
          tag: args.inline ? (args.tag || preview.resolved.tag) : preview.resolved.tag,
          icon: preview.resolved.icon,
          badge: preview.resolved.badge,
          image: preview.resolved.image,
          actions: draftSend.actions || [],
          silent: Boolean(draftSend.silent),
          requireInteraction: Boolean(draftSend.requireInteraction),
          clientTarget: "all"
        };

        if (!ctx.runtime.sendNotification) {
          return R.error(act, "Runtime bridge missing send handler.", [e("UNKNOWN_ACTION", "send", "No send bridge")]);
        }

        var ok = await ctx.runtime.sendNotification(payload);
        if (!ok) {
          return R.error(act, "Notification send failed.", [e("PERMISSION_DENIED", "permission", "Permission not granted or runtime blocked")], payload);
        }

        return R.success(act, "Notification sent.", { payload: payload, render: preview });
      }

      if (act === "notify.schedule") {
        if (!ctx.runtime.scheduleNotification) {
          return R.error(act, "Schedule bridge missing.", [e("UNKNOWN_ACTION", "schedule", "No schedule bridge")]);
        }
        var scheduled = ctx.runtime.scheduleNotification(args);
        return R.success(act, "Notification scheduled.", scheduled);
      }

      if (act.indexOf("embed.") === 0) {
        var draftEmbed = DS.loadDraft();
        var varsEmbed = DS.loadVars();
        var renderEmbed = PH.resolveDraft(draftEmbed, varsEmbed, {
          clientId: ctx.runtime.clientId,
          platform: ctx.runtime.platform
        });
        var cfg = EX.makeConfig((args.name || (draftEmbed.name || "gnests") + "-embed"), draftEmbed, renderEmbed.resolved);

        if (act === "embed.export" || act === "embed.embed" || act === "embed.js" || act === "embed.html" || act === "embed.json" || act === "embed.package") {
          var format = args.format || act.split(".")[1] || "embed";
          if (format === "embed") {
            format = "html";
          }
          var warnings = [];
          if (!cfg.domains || !cfg.domains.length) {
            warnings.push(e("EMPTY_DOMAIN_ALLOWLIST", "domains", "The embed will run on any domain because no allowlist entries were configured."));
          }
          if (format === "js") {
            return warnings.length ? R.warning(act, "Embed JS generated with warnings.", { format: format, snippet: EX.toJs(cfg), config: cfg }, warnings) : R.success(act, "Embed JS generated.", { format: format, snippet: EX.toJs(cfg), config: cfg });
          }
          if (format === "json") {
            return warnings.length ? R.warning(act, "Embed JSON generated with warnings.", { format: format, snippet: EX.toJson(cfg), config: cfg }, warnings) : R.success(act, "Embed JSON generated.", { format: format, snippet: EX.toJson(cfg), config: cfg });
          }
          if (format === "package") {
            return warnings.length ? R.warning(act, "Embed package generated with warnings.", { format: format, package: EX.packageExport(cfg), config: cfg }, warnings) : R.success(act, "Embed package generated.", { format: format, package: EX.packageExport(cfg), config: cfg });
          }
          return warnings.length ? R.warning(act, "Embed HTML generated with warnings.", { format: "html", snippet: EX.toHtml(cfg), config: cfg }, warnings) : R.success(act, "Embed HTML generated.", { format: "html", snippet: EX.toHtml(cfg), config: cfg });
        }

        if (act === "embed.save") {
          var nameSaveEmbed = args.name || cfg.name;
          return R.success(act, "Embed config saved.", ES.save(nameSaveEmbed, cfg));
        }

        if (act === "embed.load" || act === "embed.edit" || act === "embed.regenerate" || act === "embed.show") {
          var loaded = ES.get(args.name);
          if (!loaded) {
            return R.error(act, "Embed not found.", [e("EMBED_NOT_FOUND", "name", args.name)]);
          }
          return R.success(act, "Embed config loaded.", loaded);
        }

        if (act === "embed.delete" || act === "embed.remove") {
          var removed = ES.remove(args.name);
          if (!removed) {
            return R.error(act, "Embed not found.", [e("EMBED_NOT_FOUND", "name", args.name)]);
          }
          return R.success(act, "Embed config removed.", { name: args.name });
        }

        if (act === "embed.list" || act === "embed.embeds") {
          return R.success(act, "Embed configs listed.", { items: ES.list() });
        }
      }

      if (act === "system.diag") {
        if (ctx.runtime.runDiagnostics) {
          var diag = ctx.runtime.runDiagnostics();
          return R.success(act, "Diagnostics executed.", diag);
        }
        return R.error(act, "Diagnostics bridge missing.", [e("UNKNOWN_ACTION", "diag", "No diagnostics bridge")]);
      }

      if (act === "system.perm") {
        if (ctx.runtime.requestPermission) {
          await ctx.runtime.requestPermission();
          return R.success(act, "Permission request triggered.", {});
        }
        return R.error(act, "Permission bridge missing.", [e("UNKNOWN_ACTION", "perm", "No permission bridge")]);
      }

      if (act === "system.sw") {
        if (ctx.runtime.registerServiceWorker) {
          await ctx.runtime.registerServiceWorker();
          return R.success(act, "Service worker registration triggered.", {});
        }
        return R.error(act, "SW bridge missing.", [e("SERVICE_WORKER_MISSING", "sw", "No SW bridge")]);
      }

      if (act === "system.mode") {
        if (ctx.runtime.applyMode) {
          ctx.runtime.applyMode(args.value);
        }
        return R.success(act, "Mode updated.", { mode: args.value });
      }

      if (act === "system.help") {
        return R.success(act, "Help text.", { text: window.GNESTSCommandRegistry.helpText() });
      }

      if (act === "system.clear") {
        return R.success(act, "Output cleared.", { clear: true });
      }

      return R.error(act, "Unknown action.", [e("UNKNOWN_ACTION", "action", act)]);
    } catch (error) {
      return window.GNESTSResponse.error(act, "Execution failed.", [e("UNKNOWN_ACTION", "action", String(error.message || error))]);
    }
  }

  window.GNESTSActionExecutor = {
    execute: execute
  };
})();

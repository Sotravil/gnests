(function () {
  "use strict";

  var KEYS = {
    activeDraft: "gnests.console.activeDraft",
    activeVars: "gnests.console.activeVars",
    history: "gnests.console.history"
  };

  function safeRead(key, fallback) {
    try {
      var raw = localStorage.getItem(key);
      if (!raw) {
        return fallback;
      }
      return JSON.parse(raw);
    } catch (_e) {
      return fallback;
    }
  }

  function safeWrite(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch (_e) {
      return false;
    }
  }

  function now() {
    return Date.now();
  }

  function uid() {
    if (window.crypto && window.crypto.randomUUID) {
      return "draft_" + window.crypto.randomUUID();
    }
    return "draft_" + now() + "_" + Math.random().toString(16).slice(2, 8);
  }

  function defaults() {
    return {
      draftId: uid(),
      name: "",
      label: "",
      title: "",
      body: "",
      targetUrl: "/",
      tag: "",
      icon: "",
      badge: "",
      image: "",
      theme: {
        color: "#111827",
        accent: "#0ea5e9",
        background: "#ffffff",
        text: "#111827",
        border: "#d6e1e6",
        shadow: "md",
        radius: 16
      },
      domains: [],
      silent: false,
      requireInteraction: false,
      actions: [],
      meta: {},
      placeholders: {},
      embed: {
        mount: "#gnests-slot",
        mode: "notification",
        inline: false,
        autostart: true
      },
      source: "draft",
      updatedAt: now()
    };
  }

  function loadDraft() {
    return Object.assign(defaults(), safeRead(KEYS.activeDraft, {}));
  }

  function saveDraft(draft) {
    draft.updatedAt = now();
    return safeWrite(KEYS.activeDraft, draft);
  }

  function updateDraft(mutator) {
    var draft = loadDraft();
    mutator(draft);
    draft.updatedAt = now();
    saveDraft(draft);
    return draft;
  }

  function resetDraft() {
    var d = defaults();
    saveDraft(d);
    return d;
  }

  function loadVars() {
    return safeRead(KEYS.activeVars, {});
  }

  function saveVars(vars) {
    return safeWrite(KEYS.activeVars, vars || {});
  }

  function mergeVars(next) {
    var current = loadVars();
    Object.keys(next || {}).forEach(function (k) {
      current[k] = next[k];
    });
    saveVars(current);
    return current;
  }

  function pushHistory(raw) {
    var arr = safeRead(KEYS.history, []);
    arr.unshift({ t: now(), raw: raw });
    if (arr.length > 100) {
      arr.length = 100;
    }
    safeWrite(KEYS.history, arr);
  }

  window.GNESTSDraftStore = {
    keys: KEYS,
    defaults: defaults,
    loadDraft: loadDraft,
    saveDraft: saveDraft,
    updateDraft: updateDraft,
    resetDraft: resetDraft,
    loadVars: loadVars,
    saveVars: saveVars,
    mergeVars: mergeVars,
    pushHistory: pushHistory
  };
})();

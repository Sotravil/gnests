(function () {
  "use strict";

  var cache = {
    index: null,
    byName: {}
  };

  function baseUrl() {
    return "./presets";
  }

  async function loadIndex(force) {
    if (cache.index && !force) {
      return cache.index;
    }
    var res = await fetch(baseUrl() + "/index.json", { cache: "no-store" });
    if (!res.ok) {
      throw new Error("REPO_CATALOG_LOAD_FAILED");
    }
    cache.index = await res.json();
    return cache.index;
  }

  async function list(force) {
    var idx = await loadIndex(force);
    return Array.isArray(idx.items) ? idx.items : [];
  }

  async function loadPreset(name, force) {
    if (cache.byName[name] && !force) {
      return cache.byName[name];
    }
    var res = await fetch(baseUrl() + "/" + encodeURIComponent(name) + ".json", { cache: "no-store" });
    if (!res.ok) {
      throw new Error("REPO_PRESET_NOT_FOUND");
    }
    var preset = await res.json();
    preset.source = "repo";
    cache.byName[name] = preset;
    return preset;
  }

  window.GNESTSRepoPresetAdapter = {
    list: list,
    loadPreset: loadPreset,
    loadIndex: loadIndex
  };
})();

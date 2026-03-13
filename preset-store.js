(function () {
  "use strict";

  var KEYS = {
    presets: "gnests.presets.local",
    lastSaved: "gnests.presets.lastSaved",
    recent: "gnests.presets.recent"
  };

  function safeRead(key, fallback) {
    try {
      var raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : fallback;
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

  function list() {
    var map = safeRead(KEYS.presets, {});
    return Object.keys(map).sort().map(function (name) {
      return map[name];
    });
  }

  function get(name) {
    var map = safeRead(KEYS.presets, {});
    return map[name] || null;
  }

  function exists(name) {
    return Boolean(get(name));
  }

  function setRecent(name) {
    var recent = safeRead(KEYS.recent, []);
    recent = recent.filter(function (x) { return x !== name; });
    recent.unshift(name);
    if (recent.length > 20) {
      recent.length = 20;
    }
    safeWrite(KEYS.recent, recent);
  }

  function save(name, preset) {
    var map = safeRead(KEYS.presets, {});
    map[name] = Object.assign({}, preset, {
      name: name,
      updatedAt: Date.now(),
      source: preset.source || "local"
    });
    safeWrite(KEYS.presets, map);
    safeWrite(KEYS.lastSaved, name);
    setRecent(name);
    return map[name];
  }

  function remove(name) {
    var map = safeRead(KEYS.presets, {});
    var existed = Boolean(map[name]);
    delete map[name];
    safeWrite(KEYS.presets, map);

    var last = safeRead(KEYS.lastSaved, "");
    if (last === name) {
      safeWrite(KEYS.lastSaved, "");
    }

    var recent = safeRead(KEYS.recent, []).filter(function (x) { return x !== name; });
    safeWrite(KEYS.recent, recent);

    return existed;
  }

  function rename(fromName, toName) {
    var preset = get(fromName);
    if (!preset || exists(toName)) {
      return null;
    }
    remove(fromName);
    return save(toName, preset);
  }

  function clone(fromName, toName) {
    var preset = get(fromName);
    if (!preset || exists(toName)) {
      return null;
    }
    var copy = JSON.parse(JSON.stringify(preset));
    copy.clonedFrom = fromName;
    return save(toName, copy);
  }

  function clearAll() {
    safeWrite(KEYS.presets, {});
    safeWrite(KEYS.lastSaved, "");
    safeWrite(KEYS.recent, []);
  }

  function lastSaved() {
    return safeRead(KEYS.lastSaved, "");
  }

  function recent() {
    return safeRead(KEYS.recent, []);
  }

  window.GNESTSPresetStore = {
    keys: KEYS,
    list: list,
    get: get,
    exists: exists,
    save: save,
    remove: remove,
    rename: rename,
    clone: clone,
    clearAll: clearAll,
    lastSaved: lastSaved,
    recent: recent,
    setRecent: setRecent
  };
})();

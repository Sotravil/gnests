(function () {
  "use strict";

  var KEY = "gnests.embeds.local";

  function safeRead(fallback) {
    try {
      var raw = localStorage.getItem(KEY);
      return raw ? JSON.parse(raw) : fallback;
    } catch (_e) {
      return fallback;
    }
  }

  function safeWrite(value) {
    try {
      localStorage.setItem(KEY, JSON.stringify(value));
      return true;
    } catch (_e) {
      return false;
    }
  }

  function list() {
    var map = safeRead({});
    return Object.keys(map).sort().map(function (k) { return map[k]; });
  }

  function get(name) {
    var map = safeRead({});
    return map[name] || null;
  }

  function save(name, config) {
    var map = safeRead({});
    map[name] = Object.assign({}, config, { name: name, updatedAt: Date.now() });
    safeWrite(map);
    return map[name];
  }

  function remove(name) {
    var map = safeRead({});
    var existed = Boolean(map[name]);
    delete map[name];
    safeWrite(map);
    return existed;
  }

  window.GNESTSEmbedStore = {
    list: list,
    get: get,
    save: save,
    remove: remove
  };
})();

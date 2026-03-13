(function () {
  "use strict";

  var KEY = "gnests.assets.local";

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

  function get(id) {
    var map = safeRead({});
    return map[id] || null;
  }

  function save(id, asset) {
    var map = safeRead({});
    map[id] = Object.assign({}, asset, {
      id: id,
      updatedAt: Date.now()
    });
    safeWrite(map);
    return map[id];
  }

  function remove(id) {
    var map = safeRead({});
    var existed = Boolean(map[id]);
    delete map[id];
    safeWrite(map);
    return existed;
  }

  function clear() {
    safeWrite({});
  }

  function fileToDataUrl(file) {
    return new Promise(function (resolve, reject) {
      var reader = new FileReader();
      reader.onload = function () { resolve(String(reader.result || "")); };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  window.GNESTSAssetStore = {
    list: list,
    get: get,
    save: save,
    remove: remove,
    clear: clear,
    fileToDataUrl: fileToDataUrl
  };
})();

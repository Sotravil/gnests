(function () {
  "use strict";

  var PLACEHOLDER_RE = /\{\{\s*([a-zA-Z0-9_\.\-]+)\s*\}\}/g;

  function extract(value) {
    var out = [];
    var m;
    var s = String(value || "");
    while ((m = PLACEHOLDER_RE.exec(s)) !== null) {
      out.push(m[1]);
    }
    return Array.from(new Set(out));
  }

  function systemValues(runtime) {
    var d = new Date();
    return {
      date: d.toISOString().slice(0, 10),
      time: d.toTimeString().slice(0, 8),
      clientId: runtime && runtime.clientId ? runtime.clientId : "",
      platform: runtime && runtime.platform ? runtime.platform : navigator.userAgent,
      domain: location.hostname
    };
  }

  function resolveString(input, values) {
    var unresolved = [];
    var out = String(input || "").replace(PLACEHOLDER_RE, function (_all, key) {
      if (Object.prototype.hasOwnProperty.call(values, key) && values[key] !== undefined && values[key] !== null) {
        return String(values[key]);
      }
      unresolved.push(key);
      return "{{" + key + "}}";
    });
    return { value: out, unresolved: unresolved };
  }

  function resolveDraft(draft, vars, runtime) {
    var placeholders = draft.placeholders || {};
    var values = {};

    Object.assign(values, systemValues(runtime));
    Object.keys(placeholders).forEach(function (k) {
      if (placeholders[k] && placeholders[k].default !== undefined) {
        values[k] = placeholders[k].default;
      }
    });
    Object.assign(values, draft.meta || {});
    Object.assign(values, vars || {});

    var fields = ["title", "body", "targetUrl", "icon", "badge", "image", "tag"];
    var resolved = {};
    var unresolved = [];

    fields.forEach(function (f) {
      var r = resolveString(draft[f], values);
      resolved[f] = r.value;
      unresolved = unresolved.concat(r.unresolved);
    });

    unresolved = Array.from(new Set(unresolved));
    return {
      raw: draft,
      resolved: resolved,
      values: values,
      unresolved: unresolved,
      ok: unresolved.length === 0
    };
  }

  window.GNESTSPlaceholderEngine = {
    extract: extract,
    resolveDraft: resolveDraft
  };
})();

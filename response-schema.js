(function () {
  "use strict";

  function uid(prefix) {
    if (window.crypto && window.crypto.randomUUID) {
      return prefix + "_" + window.crypto.randomUUID();
    }
    return prefix + "_" + Date.now() + "_" + Math.random().toString(16).slice(2, 8);
  }

  function base(action) {
    return {
      action: action || "unknown",
      requestId: uid("req"),
      traceId: uid("trace")
    };
  }

  function success(action, message, data, warnings) {
    var b = base(action);
    return {
      ok: true,
      status: warnings && warnings.length ? "warning" : "success",
      action: b.action,
      requestId: b.requestId,
      traceId: b.traceId,
      message: message || "OK",
      data: data || null,
      warnings: warnings || [],
      errors: []
    };
  }

  function warning(action, message, data, warnings) {
    var b = base(action);
    return {
      ok: true,
      status: "warning",
      action: b.action,
      requestId: b.requestId,
      traceId: b.traceId,
      message: message || "Warning",
      data: data || null,
      warnings: warnings || [],
      errors: []
    };
  }

  function error(action, message, errors, data) {
    var b = base(action);
    return {
      ok: false,
      status: "error",
      action: b.action,
      requestId: b.requestId,
      traceId: b.traceId,
      message: message || "Error",
      data: data || null,
      warnings: [],
      errors: errors || [{ code: "UNKNOWN_ERROR", field: "", detail: "Unknown error" }]
    };
  }

  window.GNESTSResponse = {
    success: success,
    warning: warning,
    error: error
  };
})();

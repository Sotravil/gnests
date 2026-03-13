(function () {
  "use strict";

  function splitChain(input) {
    return String(input || "").split(";").map(function (s) { return s.trim(); }).filter(Boolean);
  }

  function tokenize(input) {
    var re = /"([^"\\]*(?:\\.[^"\\]*)*)"|'([^'\\]*(?:\\.[^'\\]*)*)'|\{[^]*\}|\S+/g;
    var out = [];
    var m;
    while ((m = re.exec(input)) !== null) {
      if (m[1] !== undefined) {
        out.push(m[1].replace(/\\"/g, '"'));
      } else if (m[2] !== undefined) {
        out.push(m[2].replace(/\\'/g, "'"));
      } else {
        out.push(m[0]);
      }
    }
    return out;
  }

  function parseDuration(v) {
    var s = String(v || "").trim();
    var m = s.match(/^(\d+)(s|m|h|d)$/i);
    if (!m) {
      return null;
    }
    var n = Number(m[1]);
    var u = m[2].toLowerCase();
    if (u === "s") { return n * 1000; }
    if (u === "m") { return n * 60000; }
    if (u === "h") { return n * 3600000; }
    return n * 86400000;
  }

  function parseKeyValues(tokens) {
    var kv = {};
    var pos = [];
    tokens.forEach(function (t) {
      var i = t.indexOf("=");
      if (i > 0) {
        kv[t.slice(0, i)] = t.slice(i + 1);
      } else {
        pos.push(t);
      }
    });
    return { kv: kv, pos: pos };
  }

  function parseOne(raw) {
    var tokens = tokenize(raw);
    if (!tokens.length) {
      return null;
    }

    if (tokens[0] === "action") {
      var actionName = tokens[1] || "";
      var jsonRaw = tokens.slice(2).join(" ");
      var args = {};
      if (jsonRaw) {
        args = JSON.parse(jsonRaw);
      }
      return {
        kind: "action",
        raw: raw,
        command: "action",
        actionName: actionName,
        args: args
      };
    }

    var p = parseKeyValues(tokens.slice(1));
    return {
      kind: "command",
      raw: raw,
      command: tokens[0].toLowerCase(),
      argsPos: p.pos,
      argsKv: p.kv,
      durationMs: parseDuration(p.kv.in || "")
    };
  }

  function parseChain(input) {
    return splitChain(input).map(parseOne).filter(Boolean);
  }

  window.GNESTSCommandParser = {
    splitChain: splitChain,
    tokenize: tokenize,
    parseDuration: parseDuration,
    parseOne: parseOne,
    parseChain: parseChain
  };
})();

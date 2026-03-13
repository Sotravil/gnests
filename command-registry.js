(function () {
  "use strict";

  var COMMANDS = [
    "new", "reset", "name", "label", "title", "body", "tag", "open", "icon", "badge", "image", "silent", "sticky",
    "meta", "vars", "render", "preview", "show", "save", "load", "presets", "delete", "clone", "rename", "last", "recent",
    "repo presets", "repo show", "import preset", "load repo", "use repo",
    "assets", "asset list", "asset show", "asset use", "asset remove", "asset clear",
    "color", "accent", "background", "text", "border", "radius", "shadow", "theme show", "theme reset",
    "domain add", "domain remove", "domain clear", "domains",
    "export embed", "export js", "export html", "export json", "export package", "embed save", "embed load", "embed list", "embed delete", "embed show",
    "send", "notify", "schedule", "queue",
    "diag", "perm", "sw", "mode", "help", "clear", "action"
  ];

  function helpText() {
    return [
      "GNESTS command help:",
      "send \"Hello\"",
      "send \"Hello\" \"World\" tag=demo",
      "new; name \"johnson\"; title \"hello\"; save;",
      "presets; load \"johnson\"; render; send;",
      "repo presets; import preset \"welcome-basic\";",
      "domain add \"example.com\"; export html;",
      "asset use icon \"logo-main\";",
      "embed save as \"johnson-embed\"; embed list;",
      "action notify.send {\"title\":\"Hello\",\"body\":\"World\"}"
    ].join("\n");
  }

  window.GNESTSCommandRegistry = {
    commands: COMMANDS,
    helpText: helpText
  };
})();

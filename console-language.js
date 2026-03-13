(function () {
  "use strict";

  async function execute(source, runtime) {
    var parser = window.GNESTSCommandParser;
    var normalizer = window.GNESTSActionNormalizer;
    var executor = window.GNESTSActionExecutor;
    var draftStore = window.GNESTSDraftStore;

    if (!parser || !normalizer || !executor || !draftStore) {
      throw new Error("Console modules are missing.");
    }

    var chain = parser.parseChain(source);
    var out = [];

    for (var i = 0; i < chain.length; i += 1) {
      var parsed = chain[i];
      draftStore.pushHistory(parsed.raw);
      var actionObj = normalizer.normalize(parsed, runtime.mode || "professional");
      var result = await executor.execute(actionObj, {
        runtime: runtime,
        options: {
          strict: Boolean(runtime.strict)
        }
      });
      out.push({
        raw: parsed.raw,
        action: actionObj,
        response: result
      });
    }

    return out;
  }

  function help() {
    return window.GNESTSCommandRegistry.helpText();
  }

  window.NotificationLang = {
    execute: execute,
    help: help
  };
})();

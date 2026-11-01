const EXTERNAL_REFERENCE = /^([a-z][a-z0-9+.-]*:|\/\/|#)/i;

const DEFER = /\sdefer(\s|=|$)/i;

const MODULE = /type\s*=\s*["']module["']/i;

const MISSING_ENTRY =
  '<body style="font-family: sans-serif; padding: 16px; color: #444;">Create an index.html file to see your project here.</body>';

const BRIDGE = `<script>
(() => {
  const format = (value) => {
    if (typeof value === "string") return value;
    if (value instanceof Error) return value.stack || value.message;

    try {
      return JSON.stringify(value) ?? String(value);
    } catch {
      return String(value);
    }
  };

  const send = (level, values) => {
    parent.postMessage(
      {
        source: "mini-project-preview",
        level,
        text: values.map(format).join(" "),
      },
      "*",
    );
  };

  ["log", "info", "warn", "error"].forEach((level) => {
    const original = console[level].bind(console);

    console[level] = (...values) => {
      send(level, values);
      original(...values);
    };
  });

  window.addEventListener("error", (event) => send("error", [event.message]));
  window.addEventListener("unhandledrejection", (event) =>
    send("error", [event.reason]),
  );

  const createStorage = () => {
    const data = new Map();

    return {
      getItem: (key) => (data.has(String(key)) ? data.get(String(key)) : null),
      setItem: (key, value) => {
        data.set(String(key), String(value));
      },
      removeItem: (key) => {
        data.delete(String(key));
      },
      clear: () => data.clear(),
      key: (index) => [...data.keys()][index] ?? null,
      get length() {
        return data.size;
      },
    };
  };

  ["localStorage", "sessionStorage"].forEach((name) => {
    try {
      window[name].getItem("probe");
    } catch {
      try {
        Object.defineProperty(window, name, { value: createStorage() });
      } catch {
        send("warn", [name + " is not available in the preview"]);
      }
    }
  });
})();
</script>`;

const attributeOf = (source, name) => {
  const pattern = new RegExp(`\\b${name}\\s*=\\s*["']([^"']*)["']`, "i");
  const match = source.match(pattern);

  return match ? match[1] : null;
};

const resolvePath = (reference) => {
  const resolved = [];

  reference
    .split(/[?#]/)[0]
    .split("/")
    .forEach((segment) => {
      if (segment === "" || segment === ".") return;

      if (segment === "..") resolved.pop();
      else resolved.push(segment);
    });

  return resolved.join("/");
};

const localContent = (reference, byPath) =>
  EXTERNAL_REFERENCE.test(reference)
    ? undefined
    : byPath.get(resolvePath(reference));

const inlineStyles = (html, byPath) =>
  html.replace(/<link\b[^>]*>/gi, (tag) => {
    if (!/rel\s*=\s*["']?stylesheet/i.test(tag)) return tag;

    const href = attributeOf(tag, "href");

    if (!href) return tag;

    const css = localContent(href, byPath);

    if (css === undefined) return tag;

    return `<style>${css.replace(/<\/style/gi, "<\\/style")}</style>`;
  });

const inlineScripts = (html, byPath) => {
  const deferred = [];

  const output = html.replace(
    /<script\b([^>]*)>\s*<\/script>/gi,
    (tag, attributes) => {
      const src = attributeOf(attributes, "src");

      if (!src) return tag;

      const code = localContent(src, byPath);

      if (code === undefined) return tag;

      const rest = attributes
        .replace(/\s+src\s*=\s*["'][^"']*["']/i, "")
        .replace(/\sdefer(=["'][^"']*["'])?/i, "");
      const inline = `<script${rest}>${code.replace(/<\/script/gi, "<\\/script")}</script>`;

      if (!DEFER.test(attributes) || MODULE.test(attributes)) return inline;

      deferred.push(inline);

      return "";
    },
  );

  if (deferred.length === 0) return output;

  if (/<\/body>/i.test(output)) {
    return output.replace(
      /<\/body>/i,
      (close) => `${deferred.join("")}${close}`,
    );
  }

  return `${output}${deferred.join("")}`;
};

export const buildPreviewDocument = (files) => {
  const byPath = new Map(files.map((file) => [file.path, file.content]));
  const entry = byPath.get("index.html");

  if (entry === undefined) return MISSING_ENTRY;

  const page = inlineScripts(inlineStyles(entry, byPath), byPath);

  return /<head[^>]*>/i.test(page)
    ? page.replace(/<head[^>]*>/i, (open) => `${open}${BRIDGE}`)
    : `${BRIDGE}${page}`;
};

/*!
 * FormChat embed widget — plain JS, no dependencies.
 *
 *   <script src="{APP}/widget.js" data-form="{slug}"
 *           data-color="#0f766e" data-position="left"
 *           data-prefill='{"email":"a@b.com"}'></script>
 *
 * Idempotent: including the script twice does nothing the second time.
 * Every class and id it creates is prefixed with `fw-` and it never touches
 * the host page's styles.
 */
(function () {
  "use strict";

  if (window.__fwInitialized) return;
  window.__fwInitialized = true;

  var script = document.currentScript;
  if (!script) return;

  var appOrigin;
  try {
    appOrigin = new URL(script.src).origin;
  } catch {
    return;
  }

  var slug = script.getAttribute("data-form");
  if (!slug) return;

  var dataColor = script.getAttribute("data-color");
  var dataPosition = script.getAttribute("data-position"); // "left" | "right"
  var dataPrefill = script.getAttribute("data-prefill");

  var themeColor = "#4f46e5";
  var launcherLabel = "Chat with us";
  var widgetPosition = "RIGHT"; // "RIGHT" | "LEFT"

  var launcher = null;
  var panel = null;
  var iframe = null;
  var isOpen = false;

  // ---------------------------------------------------------------------
  // Helpers
  // ---------------------------------------------------------------------
  function isMobile() {
    return window.matchMedia("(max-width: 480px)").matches;
  }

  function contrastText(hex) {
    var m = hex.match(/^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i);
    if (!m) return "#000000";
    var r = parseInt(m[1], 16) / 255;
    var g = parseInt(m[2], 16) / 255;
    var b = parseInt(m[3], 16) / 255;
    var lum = function (c) {
      return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
    };
    var y = 0.2126 * lum(r) + 0.7152 * lum(g) + 0.0722 * lum(b);
    return y > 0.179 ? "#000000" : "#ffffff";
  }

  /** Parses data-prefill defensively: a plain object of string values, max 20 keys. */
  function parsePrefill(raw) {
    if (!raw) return [];
    var parsed;
    try {
      parsed = JSON.parse(raw);
    } catch {
      return [];
    }
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) return [];

    var out = [];
    var keys = Object.keys(parsed);
    if (keys.length > 20) keys = keys.slice(0, 20);
    for (var i = 0; i < keys.length; i++) {
      var key = keys[i];
      var value = parsed[key];
      if (typeof key !== "string" || typeof value !== "string") continue;
      // Never let prefill override the reserved params.
      if (key === "src" || key === "color") continue;
      out.push([key, value]);
    }
    return out;
  }

  function buildIframeUrl() {
    var params = ["src=" + encodeURIComponent(window.location.origin)];
    if (dataColor && /^#[0-9a-fA-F]{6}$/.test(dataColor)) {
      params.push("color=" + encodeURIComponent(dataColor));
    }
    var prefill = parsePrefill(dataPrefill);
    for (var i = 0; i < prefill.length; i++) {
      params.push(encodeURIComponent(prefill[i][0]) + "=" + encodeURIComponent(prefill[i][1]));
    }
    return appOrigin + "/embed/" + encodeURIComponent(slug) + "?" + params.join("&");
  }

  // ---------------------------------------------------------------------
  // Build the UI
  // ---------------------------------------------------------------------
  function build() {
    var side = widgetPosition === "LEFT" ? "left" : "right";

    // Panel (hidden until first open).
    panel = document.createElement("div");
    panel.id = "fw-panel-" + slug;
    panel.className = "fw-panel";
    panel.setAttribute("role", "dialog");
    panel.setAttribute("aria-label", launcherLabel);
    panel.style.position = "fixed";
    panel.style.bottom = "96px";
    panel.style[side] = "24px";
    panel.style.width = "380px";
    panel.style.height = "min(640px, calc(100dvh - 120px))";
    panel.style.borderRadius = "16px";
    panel.style.overflow = "hidden";
    panel.style.boxShadow = "0 18px 48px rgba(0,0,0,0.24)";
    panel.style.background = "#ffffff";
    panel.style.zIndex = "2147483646";
    panel.style.display = "none";
    panel.style.opacity = "0";
    panel.style.transform = "translateY(12px)";
    panel.style.transition = "opacity 0.18s ease, transform 0.18s ease";
    document.body.appendChild(panel);

    // Launcher.
    launcher = document.createElement("button");
    launcher.id = "fw-btn-" + slug;
    launcher.className = "fw-btn";
    launcher.type = "button";
    launcher.setAttribute("aria-label", launcherLabel);
    launcher.setAttribute("aria-expanded", "false");
    launcher.title = launcherLabel;
    launcher.style.position = "fixed";
    launcher.style.bottom = "24px";
    launcher.style[side] = "24px";
    launcher.style.zIndex = "2147483647";
    launcher.style.width = "56px";
    launcher.style.height = "56px";
    launcher.style.borderRadius = "28px";
    launcher.style.border = "none";
    launcher.style.background = themeColor;
    launcher.style.color = contrastText(themeColor);
    launcher.style.fontSize = "24px";
    launcher.style.lineHeight = "1";
    launcher.style.cursor = "pointer";
    launcher.style.display = "inline-flex";
    launcher.style.alignItems = "center";
    launcher.style.justifyContent = "center";
    launcher.style.boxShadow = "0 4px 12px rgba(0,0,0,0.15)";
    launcher.style.transition = "transform 0.15s ease";
    launcher.textContent = "💬";
    document.body.appendChild(launcher);

    launcher.addEventListener("mouseenter", function () {
      launcher.style.transform = "scale(1.05)";
    });
    launcher.addEventListener("mouseleave", function () {
      launcher.style.transform = "scale(1)";
    });
    launcher.addEventListener("click", function () {
      togglePanel();
    });

    // Close when the iframe asks us to.
    window.addEventListener("message", function (ev) {
      if (ev.origin !== appOrigin) return;
      if (ev.data && ev.data.type === "fw:close") {
        closePanel();
      }
    });

    document.addEventListener("keydown", function (ev) {
      if (ev.key === "Escape" && isOpen) {
        closePanel();
      }
    });

    window.addEventListener("resize", function () {
      applyLayout();
    });

    applyLayout();
  }

  /** Desktop = side panel, mobile = fullscreen. */
  function applyLayout() {
    if (!panel || !launcher) return;
    var side = widgetPosition === "LEFT" ? "left" : "right";
    var mobile = isMobile();

    if (mobile) {
      panel.style.inset = "0";
      panel.style.width = "100%";
      panel.style.height = "100dvh";
      panel.style.borderRadius = "0";
      panel.style.bottom = "auto";
      panel.style[side] = "auto";
    } else {
      panel.style.inset = "auto";
      panel.style.bottom = "96px";
      panel.style[side] = "24px";
      panel.style.width = "380px";
      panel.style.height = "min(640px, calc(100dvh - 120px))";
      panel.style.borderRadius = "16px";
    }

    if (isOpen) launcher.style.display = "none";
  }

  function openPanel() {
    if (!panel || !launcher) return;
    isOpen = true;

    // Lazy-load: the iframe is created on the first open only.
    if (!iframe) {
      iframe = document.createElement("iframe");
      iframe.id = "fw-frame-" + slug;
      iframe.className = "fw-iframe";
      iframe.setAttribute("title", launcherLabel);
      iframe.style.width = "100%";
      iframe.style.height = "100%";
      iframe.style.border = "none";
      iframe.style.display = "block";
      iframe.src = buildIframeUrl();
      panel.appendChild(iframe);
    }

    panel.style.display = "block";
    panel.style.opacity = "1";
    panel.style.transform = "translateY(0)";
    launcher.setAttribute("aria-expanded", "true");
    applyLayout();

    // Move focus into the iframe.
    try {
      iframe.focus();
    } catch {
      /* focus can be blocked; not fatal */
    }
  }

  function closePanel() {
    if (!panel || !launcher) return;
    isOpen = false;
    panel.style.opacity = "0";
    panel.style.transform = "translateY(12px)";
    window.setTimeout(function () {
      if (!isOpen) panel.style.display = "none";
    }, 180);
    launcher.setAttribute("aria-expanded", "false");
    // Always bring the launcher back so the chat can be reopened.
    launcher.style.display = "inline-flex";
    // Return focus to the launcher.
    try {
      launcher.focus();
    } catch {
      /* focus can be blocked; not fatal */
    }
  }

  function togglePanel() {
    if (isOpen) {
      closePanel();
    } else {
      openPanel();
    }
  }

  // ---------------------------------------------------------------------
  // Load the form config (colour, label, position)
  // ---------------------------------------------------------------------
  fetch(appOrigin + "/api/public/forms/" + encodeURIComponent(slug), { method: "GET" })
    .then(function (res) {
      return res.ok ? res.json() : null;
    })
    .then(function (data) {
      if (data) {
        if (data.themeColor) themeColor = data.themeColor;
        if (data.launcherLabel) launcherLabel = data.launcherLabel;
        if (data.widgetPosition) widgetPosition = data.widgetPosition;
      }
      // Overrides from data attributes (validated).
      if (dataColor && /^#[0-9a-fA-F]{6}$/.test(dataColor)) themeColor = dataColor;
      if (dataPosition === "left") widgetPosition = "LEFT";
      if (dataPosition === "right") widgetPosition = "RIGHT";
      build();
    })
    .catch(function () {
      // Build with the defaults so the widget still works.
      if (dataColor && /^#[0-9a-fA-F]{6}$/.test(dataColor)) themeColor = dataColor;
      if (dataPosition === "left") widgetPosition = "LEFT";
      if (dataPosition === "right") widgetPosition = "RIGHT";
      build();
    });
})();

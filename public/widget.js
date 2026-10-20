/*!
 * FormChat embed widget — plain JS, no dependencies.
 * Include: <script src="{APP_ORIGIN}/widget.js" data-form="{slug}" [data-color="#rrggbb"] [data-position="left|right"]></script>
 * Idempotent: a second include does nothing.
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
  } catch (e) {
    return;
  }

  var slug = script.getAttribute("data-form");
  if (!slug) return;

  var dataColor = script.getAttribute("data-color");
  var dataPosition = script.getAttribute("data-position"); // "left" | "right"

  var themeColor = "#4f46e5";
  var launcherLabel = "Chat with us";
  var widgetPosition = "RIGHT"; // "RIGHT" | "LEFT"

  var rootId = "fw-root-" + slug;
  if (document.getElementById(rootId)) return;

  // ---------------------------------------------------------------------------
  // Fetch form config from the public API (same origin as this script).
  // ---------------------------------------------------------------------------
  fetch(appOrigin + "/api/public/forms/" + encodeURIComponent(slug), {
    method: "GET",
  })
    .then(function (res) {
      return res.ok ? res.json() : null;
    })
    .then(function (data) {
      if (data) {
        if (data.themeColor) themeColor = data.themeColor;
        if (data.launcherLabel) launcherLabel = data.launcherLabel;
        if (data.widgetPosition) widgetPosition = data.widgetPosition === "LEFT" ? "LEFT" : "RIGHT";
      }
      // Overrides from data attributes (validated).
      if (dataColor && /^#[0-9a-fA-F]{6}$/.test(dataColor)) themeColor = dataColor;
      if (dataPosition === "left") widgetPosition = "LEFT";
      if (dataPosition === "right") widgetPosition = "RIGHT";
      build();
    })
    .catch(function () {
      // Build with defaults if the API is unreachable.
      build();
    });

  // ---------------------------------------------------------------------------
  // Build UI.
  // ---------------------------------------------------------------------------
  function build() {
    var isMobile = window.matchMedia("(max-width: 480px)").matches;

    // Root overlay (hidden by default).
    var root = document.createElement("div");
    root.id = rootId;
    root.className = "fw-root fw-overlay";
    root.style.position = "fixed";
    root.style.top = "0";
    root.style.left = "0";
    root.style.width = "100%";
    root.style.height = "100%";
    root.style.zIndex = "2147483647";
    root.style.display = "none";
    root.style.alignItems = "center";
    root.style.justifyContent = "center";
    root.style.background = "rgba(0,0,0,0.4)";
    root.style.backdropFilter = "blur(2px)";
    root.style.webkitBackdropFilter = "blur(2px)";

    // Close button (×) for the overlay.
    var closeBtn = document.createElement("button");
    closeBtn.id = "fw-close-" + slug;
    closeBtn.className = "fw-close";
    closeBtn.type = "button";
    closeBtn.setAttribute("aria-label", "Close chat");
    closeBtn.style.position = "fixed";
    closeBtn.style.top = isMobile ? "12px" : "20px";
    closeBtn.style[widgetPosition === "LEFT" ? "right" : "left"] = isMobile ? "12px" : "20px";
    closeBtn.style.zIndex = "2147483648";
    closeBtn.style.width = "36px";
    closeBtn.style.height = "36px";
    closeBtn.style.borderRadius = "50%";
    closeBtn.style.border = "none";
    closeBtn.style.background = "#ffffff";
    closeBtn.style.color = "#111827";
    closeBtn.style.fontSize = "24px";
    closeBtn.style.lineHeight = "1";
    closeBtn.style.cursor = "pointer";
    closeBtn.style.display = "flex";
    closeBtn.style.alignItems = "center";
    closeBtn.style.justifyContent = "center";
    closeBtn.style.boxShadow = "0 2px 6px rgba(0,0,0,0.15)";
    closeBtn.type = "button";
    closeBtn.appendChild(document.createTextNode("×"));

    // Iframe.
    var iframe = document.createElement("iframe");
    iframe.id = "fw-iframe-" + slug;
    iframe.className = "fw-iframe";
    iframe.src = appOrigin + "/embed/" + encodeURIComponent(slug);
    iframe.style.border = "none";
    iframe.style.borderRadius = "12px";
    iframe.style.boxShadow = "0 20px 60px rgba(0,0,0,0.25)";
    if (isMobile) {
      iframe.style.width = "100%";
      iframe.style.height = "100%";
      iframe.style.borderRadius = "0";
    } else {
      iframe.style.width = "420px";
      iframe.style.height = "90vh";
      iframe.style.position = widgetPosition === "LEFT" ? "left" : "right";
      iframe.style.top = "0";
      iframe.style.bottom = "0";
    }

    root.appendChild(closeBtn);
    root.appendChild(iframe);
    document.body.appendChild(root);

    // ---------------------------------------------------------------------------
    // Floating launcher button (always visible).
    // ---------------------------------------------------------------------------
    var btn = document.createElement("button");
    btn.id = "fw-btn-" + slug;
    btn.className = "fw-btn";
    btn.type = "button";
    btn.ariaLabel = launcherLabel;
    btn.style.position = "fixed";
    btn.style.bottom = "24px";
    btn.style[widgetPosition] = "24px";
    btn.style.zIndex = "2147483647";
    btn.style.width = "56px";
    btn.style.height = "56px";
    btn.style.borderRadius = "28px";
    btn.style.border = "none";
    btn.style.background = themeColor;
    btn.style.color = contrastText(themeColor);
    btn.style.fontSize = "24px";
    btn.style.lineHeight = "1";
    btn.style.cursor = "pointer";
    btn.style.display = "inline-flex";
    btn.style.alignItems = "center";
    btn.style.justifyContent = "center";
    btn.style.boxShadow = "0 4px 12px rgba(0,0,0,0.15)";
    btn.style.transition = "transform 0.15s ease, opacity 0.15s ease";
    btn.appendChild(document.createTextNode("💬"));

    btn.addEventListener("mouseenter", function () {
      btn.style.transform = "scale(1.05)";
    });
    btn.addEventListener("mouseleave", function () {
      btn.style.transform = "scale(1)";
    });
    btn.addEventListener("click", function () {
      root.style.display = "flex";
      btn.style.display = "none";
      closeBtn.style.display = "flex";
      try { btn.focus(); } catch (e) {}
    });

    document.body.appendChild(btn);

    // ---------------------------------------------------------------------------
    // Close handlers: Esc key, close button, postMessage fw:close.
    // ---------------------------------------------------------------------------
    function closeChat() {
      root.style.display = "none";
      btn.style.display = "inline-flex";
      closeBtn.style.display = "none";
    }

    closeBtn.addEventListener("click", closeChat);

    document.addEventListener("keydown", function (ev) {
      if (ev.key === "Escape" && root.style.display === "flex") {
        closeChat();
      }
    });

    window.addEventListener("message", function (ev) {
      // Verify origin equals the app origin.
      if (ev.origin !== appOrigin) return;
      if (ev.data && ev.data.type === "fw:close") {
        closeChat();
      }
    });

    // Recompute mobile/desktop layout on resize.
    window.addEventListener("resize", function () {
      var nowMobile = window.matchMedia("(max-width: 480px)").matches;
      if (nowMobile !== isMobile) {
        isMobile = nowMobile;
        closeBtn.style.top = isMobile ? "12px" : "20px";
        closeBtn.style[widgetPosition === "LEFT" ? "right" : "left"] = isMobile ? "12px" : "20px";
        if (isMobile) {
          iframe.style.width = "100%";
          iframe.style.height = "100%";
          iframe.style.borderRadius = "0";
          iframe.style.position = "static";
        } else {
          iframe.style.width = "420px";
          iframe.style.height = "90vh";
          iframe.style.borderRadius = "12px";
          iframe.style.position = widgetPosition === "LEFT" ? "left" : "right";
          iframe.style.top = "0";
          iframe.style.bottom = "0";
        }
      }
    });
  }

  // ---------------------------------------------------------------------------
  // Contrast text color on themeColor (WCAG luminance).
  // ---------------------------------------------------------------------------
  function contrastText(hex) {
    var m = hex.match(/^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i);
    if (!m) return "#000000";
    var r = parseInt(m[1], 16) / 255;
    var g = parseInt(m[2], 16) / 255;
    var b = parseInt(m[3], 16) / 255;
    var lum = (function (c) {
      return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
    });
    var y = 0.2126 * lum(r) + 0.7152 * lum(g) + 0.0722 * lum(b);
    return y > 0.179 ? "#000000" : "#ffffff";
  }
})();

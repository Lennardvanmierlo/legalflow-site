/* Legalflow — landing interactions. Minimal, sub-300ms, reduced-motion aware. */
(function () {
  "use strict";
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---- Nav: border on scroll + mobile toggle ---------------------------- */
  var nav = document.querySelector(".nav");
  var onScroll = function () {
    if (nav) nav.classList.toggle("scrolled", window.scrollY > 8);
  };
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });

  var toggle = document.querySelector(".nav-toggle");
  var links = document.querySelector(".nav-links");
  if (toggle && links) {
    toggle.addEventListener("click", function () {
      links.classList.toggle("open");
    });
    links.addEventListener("click", function (e) {
      if (e.target.tagName === "A") links.classList.remove("open");
    });
  }

  /* ---- Scroll reveal ---------------------------------------------------- */
  var reveals = document.querySelectorAll(".reveal");
  if (reduce || !("IntersectionObserver" in window)) {
    reveals.forEach(function (el) { el.classList.add("in"); });
  } else {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) {
          var el = en.target;
          var d = parseInt(el.getAttribute("data-delay") || "0", 10);
          setTimeout(function () { el.classList.add("in"); }, d);
          io.unobserve(el);
        }
      });
    }, { rootMargin: "0px 0px -8% 0px", threshold: 0.12 });
    reveals.forEach(function (el) { io.observe(el); });
  }

  /* ---- Signature animation: claim -> verifying -> verified -------------- */
  /* Each footnote in the hero artifact transitions once. Honors reduced-motion
     by snapping straight to the resolved state. */
  function runGate(host) {
    var rows = Array.prototype.slice.call(host.querySelectorAll(".cite"));
    if (reduce) {
      rows.forEach(function (r) { resolve(r); });
      markDone(host);
      return;
    }
    var i = 0;
    function step() {
      if (i >= rows.length) { markDone(host); return; }
      var r = rows[i];
      r.classList.add("is-checking");
      setMark(r, "↻", "verifiëren…");
      setTimeout(function () {
        r.classList.remove("is-checking");
        resolve(r);
        i++;
        step();
      }, 230);
    }
    step();
  }
  function resolve(r) {
    var state = r.getAttribute("data-result"); // "ok" | "unconf"
    if (state === "unconf") {
      r.classList.add("is-unconf");
      setMark(r, "◻", "onbevestigd");
    } else {
      r.classList.add("is-verified");
      setMark(r, "✓", "geverifieerd");
    }
    r.setAttribute("data-state", "done");
  }
  function setMark(r, mark, label) {
    var mk = r.querySelector(".mk");
    var tx = r.querySelector(".st-tx");
    if (mk) mk.textContent = mark;
    if (tx) tx.textContent = label;
  }
  function markDone(host) {
    var foot = host.querySelector(".artifact-foot");
    if (foot) foot.classList.add("in");
  }

  var artifact = document.querySelector(".artifact[data-animate]");
  if (artifact) {
    if (reduce || !("IntersectionObserver" in window)) {
      runGate(artifact);
    } else {
      var ao = new IntersectionObserver(function (entries) {
        entries.forEach(function (en) {
          if (en.isIntersecting) { runGate(artifact); ao.disconnect(); }
        });
      }, { threshold: 0.4 });
      ao.observe(artifact);
    }
  }

  /* ---- Copy connector URL + token --------------------------------------- */
  /* PLACEHOLDER values live in data-attributes on the button (wired in Sessie B). */
  document.querySelectorAll("[data-copy], [data-copy-target]").forEach(function (btn) {
    btn.addEventListener("click", function () {
      var val = btn.getAttribute("data-copy") || "";
      // data-copy-target: kopieer de tekst van een ander element (bv. de ingebedde skill).
      var targetSel = btn.getAttribute("data-copy-target");
      if (targetSel) {
        var src = document.querySelector(targetSel);
        if (src) val = (src.textContent || "").replace(/^\s+|\s+$/g, "");
      }
      var done = function () {
        var label = btn.querySelector(".copy-label");
        var orig = label ? label.textContent : "";
        btn.classList.add("copied");
        if (label) label.textContent = btn.getAttribute("data-copied") || "Gekopieerd ✓";
        setTimeout(function () {
          btn.classList.remove("copied");
          if (label) label.textContent = orig;
        }, 2000);
      };
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(val).then(done, done);
      } else {
        var ta = document.createElement("textarea");
        ta.value = val; document.body.appendChild(ta); ta.select();
        try { document.execCommand("copy"); } catch (e) {}
        document.body.removeChild(ta); done();
      }
      // Open Claude. App-scheme (claude://) opent de desktop-app; http(s) opent een tab.
      var open = btn.getAttribute("data-open");
      if (open && open.indexOf("PLACEHOLDER") === -1) {
        if (/^https?:/.test(open)) {
          window.open(open, "_blank", "noopener");
        } else {
          // App-scheme: probeer de desktop-app, val terug op web als 'ie niet opent.
          var web = btn.getAttribute("data-open-web");
          var launched = false;
          var onBlur = function () { launched = true; };
          window.addEventListener("blur", onBlur, { once: true });
          if (web && web.indexOf("PLACEHOLDER") === -1) {
            setTimeout(function () {
              window.removeEventListener("blur", onBlur);
              if (!launched && document.visibilityState === "visible") {
                window.open(web, "_blank", "noopener");
              }
            }, 1400);
          }
          window.location.href = open;
        }
      }
    });
  });

  /* ---- Dossier: klik slaat de map open --------------------------------- */
  var folders = Array.prototype.slice.call(document.querySelectorAll("[data-folder]"));
  folders.forEach(function (folder) {
    var cover = folder.querySelector(".folder-cover");
    if (!cover) return;
    var goLink = folder.querySelector(".f-go");
    var href = goLink ? goLink.getAttribute("href") : null;
    // Voorlopig alleen de live-map (legalflow-memo): klik = openslaan + navigeren.
    var navigates = folder.classList.contains("folder-live") && href;
    cover.addEventListener("click", function () {
      if (navigates) {
        if (reduce) { window.location.href = href; return; }
        folder.classList.add("is-open", "is-opening");
        cover.setAttribute("aria-expanded", "true");
        window.setTimeout(function () { window.location.href = href; }, 640);
        return;
      }
      // preview-mappen: open/dicht in plaats (één tegelijk)
      var isOpen = folder.classList.contains("is-open");
      folders.forEach(function (f) {
        if (f !== folder) {
          f.classList.remove("is-open");
          var c = f.querySelector(".folder-cover");
          if (c) c.setAttribute("aria-expanded", "false");
        }
      });
      folder.classList.toggle("is-open", !isOpen);
      cover.setAttribute("aria-expanded", String(!isOpen));
    });
  });

  /* ---- Footer year ------------------------------------------------------ */
  var y = document.getElementById("yr");
  if (y) y.textContent = new Date().getFullYear();
})();

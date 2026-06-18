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
  document.querySelectorAll("[data-copy]").forEach(function (btn) {
    btn.addEventListener("click", function () {
      var val = btn.getAttribute("data-copy") || "";
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
      // Open Claude in a new tab if a target is provided (wired in Sessie B).
      var open = btn.getAttribute("data-open");
      if (open && open.indexOf("PLACEHOLDER") === -1) window.open(open, "_blank", "noopener");
    });
  });

  /* ---- Footer year ------------------------------------------------------ */
  var y = document.getElementById("yr");
  if (y) y.textContent = new Date().getFullYear();
})();

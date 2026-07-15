(function () {
  "use strict";

  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* Scroll progress bar */
  var progress = document.createElement("div");
  progress.id = "scroll-progress";
  document.body.appendChild(progress);
  function updateProgress() {
    var scrollTop = window.scrollY;
    var docHeight = document.documentElement.scrollHeight - window.innerHeight;
    var pct = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
    progress.style.width = pct + "%";
  }
  document.addEventListener("scroll", updateProgress, { passive: true });
  updateProgress();

  /* Back-to-top button */
  var backToTop = document.createElement("button");
  backToTop.id = "back-to-top";
  backToTop.type = "button";
  backToTop.setAttribute("aria-label", "Back to top");
  backToTop.textContent = "↑";
  document.body.appendChild(backToTop);
  backToTop.addEventListener("click", function () {
    window.scrollTo({ top: 0, behavior: reduceMotion ? "auto" : "smooth" });
  });
  function toggleBackToTop() {
    if (window.scrollY > 480) backToTop.classList.add("visible");
    else backToTop.classList.remove("visible");
  }
  document.addEventListener("scroll", toggleBackToTop, { passive: true });
  toggleBackToTop();

  /* Scroll reveal for sections and cards */
  var revealTargets = document.querySelectorAll(
    "section, .project-card, .card, .step, .llo-card, .role-callout, .stat"
  );
  if (reduceMotion || !("IntersectionObserver" in window)) {
    revealTargets.forEach(function (el) { el.classList.add("is-visible"); });
  } else {
    revealTargets.forEach(function (el) { el.classList.add("reveal"); });
    // Stagger children within the same parent (e.g. cards in a grid) instead
    // of one global counter, so long pages don't end with huge delays.
    var parents = new Map();
    revealTargets.forEach(function (el) {
      var p = el.parentElement;
      var count = parents.get(p) || 0;
      el.style.setProperty("--reveal-delay", Math.min(count, 5) * 70 + "ms");
      parents.set(p, count + 1);
    });

    var io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
    );
    revealTargets.forEach(function (el) { io.observe(el); });
  }

  /* Nav scrollspy (only matters on pages with in-page section links) */
  var navLinks = document.querySelectorAll("nav.topnav a[href^='#']");
  if (navLinks.length) {
    var sections = [];
    navLinks.forEach(function (link) {
      var id = link.getAttribute("href").slice(1);
      var sec = document.getElementById(id);
      if (sec) sections.push({ link: link, sec: sec });
    });
    var onScrollSpy = function () {
      var pos = window.scrollY + window.innerHeight * 0.3;
      var current = null;
      sections.forEach(function (item) {
        if (item.sec.offsetTop <= pos) current = item;
      });
      sections.forEach(function (item) {
        item.link.classList.toggle("active", item === current);
      });
    };
    document.addEventListener("scroll", onScrollSpy, { passive: true });
    onScrollSpy();
  }

  /* Animated stat counters */
  var stats = document.querySelectorAll(".stat[data-count]");
  if (stats.length) {
    var animateCount = function (el) {
      var target = parseInt(el.getAttribute("data-count"), 10) || 0;
      var numEl = el.querySelector(".stat-num");
      if (!numEl) return;
      if (reduceMotion) {
        numEl.textContent = target;
        return;
      }
      var duration = 900;
      var startTime = null;
      function step(ts) {
        if (!startTime) startTime = ts;
        var ratio = Math.min((ts - startTime) / duration, 1);
        var eased = 1 - Math.pow(1 - ratio, 3);
        numEl.textContent = Math.round(target * eased);
        if (ratio < 1) requestAnimationFrame(step);
      }
      requestAnimationFrame(step);
    };
    if ("IntersectionObserver" in window) {
      var statIO = new IntersectionObserver(
        function (entries) {
          entries.forEach(function (entry) {
            if (entry.isIntersecting) {
              animateCount(entry.target);
              statIO.unobserve(entry.target);
            }
          });
        },
        { threshold: 0.4 }
      );
      stats.forEach(function (el) { statIO.observe(el); });
    } else {
      stats.forEach(animateCount);
    }
  }
})();

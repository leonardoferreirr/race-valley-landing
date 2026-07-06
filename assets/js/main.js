/* ============================================================
   RACE VALLEY — main.js  (vanilla, sem dependências)
   ============================================================ */
(function () {
  'use strict';
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- Reveal on scroll ---------- */
  function setupReveal() {
    var items = Array.prototype.slice.call(document.querySelectorAll('.reveal-up, .reveal-line'));
    if (reduce || !('IntersectionObserver' in window)) {
      items.forEach(function (el) { el.classList.add('is-in'); });
      return;
    }
    // stagger by position among reveal siblings in the same parent
    items.forEach(function (el) {
      var sibs = Array.prototype.slice.call(el.parentElement.querySelectorAll(':scope > .reveal-up, :scope > .reveal-line'));
      var i = sibs.indexOf(el);
      if (i > 0) el.style.transitionDelay = Math.min(i * 70, 420) + 'ms';
    });
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add('is-in'); io.unobserve(e.target); }
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.12 });
    items.forEach(function (el) { io.observe(el); });
  }

  /* ---------- Hero reveal ---------- */
  function revealHero() {
    document.querySelectorAll('.hero .reveal-line, .hero .reveal-up').forEach(function (el, i) {
      el.style.transitionDelay = (reduce ? 0 : Math.min(i * 90, 540)) + 'ms';
      el.classList.add('is-in');
    });
  }

  /* ---------- F1 start lights ---------- */
  function runLights() {
    var pods = Array.prototype.slice.call(document.querySelectorAll('.lights__pod'));
    if (!pods.length) { revealHero(); return; }
    if (reduce) { pods.forEach(function (p) { p.classList.add('is-go'); }); revealHero(); return; }

    var i = 0;
    var on = setInterval(function () {
      if (i < pods.length) { pods[i].classList.add('is-red'); i++; return; }
      clearInterval(on);
      setTimeout(function () {                       // hold, then "lights out and away we go"
        pods.forEach(function (p) { p.classList.remove('is-red'); });
        revealHero();                                // hero bursts in the instant lights go out
        setTimeout(function () {
          pods.forEach(function (p) { p.classList.add('is-go'); });   // brand GO flash
        }, 90);
      }, 480);
    }, 240);
  }

  /* ---------- Count up ---------- */
  function countUp(el) {
    var target = parseFloat(el.getAttribute('data-count'));
    if (reduce || isNaN(target)) { return; }
    var dur = 1000, start = null;
    el.textContent = '0';
    function step(ts) {
      if (!start) start = ts;
      var p = Math.min((ts - start) / dur, 1);
      var eased = 1 - Math.pow(1 - p, 3);
      el.textContent = Math.round(eased * target).toString();
      if (p < 1) requestAnimationFrame(step);
      else el.textContent = target.toString();
    }
    requestAnimationFrame(step);
  }
  function setupCounts() {
    var nums = document.querySelectorAll('[data-count]');
    if (!('IntersectionObserver' in window)) return;
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) { if (e.isIntersecting) { countUp(e.target); io.unobserve(e.target); } });
    }, { threshold: 0.6 });
    nums.forEach(function (n) { io.observe(n); });
  }

  /* ---------- Nav scroll state ---------- */
  function setupNav() {
    var nav = document.getElementById('nav');
    if (!nav) return;
    var tick = function () { nav.classList.toggle('is-scrolled', window.scrollY > 40); };
    tick();
    window.addEventListener('scroll', tick, { passive: true });
  }

  /* ---------- Mobile menu ---------- */
  function setupMenu() {
    var burger = document.getElementById('burger');
    var menu = document.getElementById('mobileMenu');
    if (!burger || !menu) return;
    function set(open) {
      burger.setAttribute('aria-expanded', open ? 'true' : 'false');
      burger.setAttribute('aria-label', open ? 'Fechar menu' : 'Abrir menu');
      menu.setAttribute('aria-hidden', open ? 'false' : 'true');
      menu.classList.toggle('is-open', open);
      document.body.style.overflow = open ? 'hidden' : '';
    }
    burger.addEventListener('click', function () { set(burger.getAttribute('aria-expanded') !== 'true'); });
    menu.querySelectorAll('a').forEach(function (a) { a.addEventListener('click', function () { set(false); }); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') set(false); });
  }

  /* ---------- FAQ: single-open accordion ---------- */
  function setupFaq() {
    var list = document.querySelectorAll('.faq .qa');
    list.forEach(function (d) {
      d.addEventListener('toggle', function () {
        if (d.open) list.forEach(function (o) { if (o !== d) o.open = false; });
      });
    });
  }

  /* ---------- Boot ---------- */
  function boot() {
    try {
      setupNav();
      setupMenu();
      setupFaq();
      setupReveal();
      setupCounts();
      runLights();
    } catch (err) {
      // never leave the hero invisible if something throws
      revealHero();
      document.querySelectorAll('.reveal-up, .reveal-line').forEach(function (el) { el.classList.add('is-in'); });
    }
    // hard safety net: guarantee hero visible
    setTimeout(revealHero, 2600);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();

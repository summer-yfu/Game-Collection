(function () {
  var root = document.documentElement;
  var sanctum = document.getElementById("sanctum");
  var grid = document.getElementById("crystal-grid");
  if (!sanctum || !grid) return;

  var GAMES = [
    { name: "Anagram",     href: "./anagram/frontend/", theme: "dawn",  path: "anagram" },
    { name: "2048",         href: "./2048/",             theme: "ember", path: "2048" },
    { name: "Pat or Punch", href: "./pat-or-punch/",    theme: "moss",  path: "pat-or-punch" },
    { name: "Snake",        href: "./snake/",            theme: "mist",  path: "snake" },
    { name: "Moonveil",     href: "./moonveil/",         theme: "iris",  path: "moonveil" },
    { name: "Breakout",     href: "./breakout/",         theme: "void",  path: "breakout" },
    { name: "Glyphweft",    href: "./glyphweft/",        theme: "coral", path: "glyphweft" },
    { name: "Aether Loom",  href: "./aether-loom/",      theme: "frost", path: "aether-loom" },
  ];

  var reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  var raf = 0;
  var transitioning = false;

  function renderSlot(g) {
    return '<div class="crystal-slot">' +
      '<a class="crystal crystal--' + g.theme + '" href="' + g.href + '">' +
        '<span class="crystal__halo" aria-hidden="true"></span>' +
        '<span class="crystal__sparkles" aria-hidden="true"></span>' +
        '<span class="crystal__ball" aria-hidden="true">' +
          '<span class="crystal__fill"></span>' +
          '<span class="crystal__swirl"></span>' +
        '</span>' +
        '<span class="crystal__rune" aria-hidden="true"></span>' +
        '<span class="crystal__pedestal" aria-hidden="true"></span>' +
        '<span class="crystal__label">' + g.name + '</span>' +
        (g.path ? '<span class="crystal__path">' + g.path + '</span>' : '') +
      '</a>' +
    '</div>';
  }

  grid.innerHTML = GAMES.map(renderSlot).join("");

  // GSAP entrance & organic float
  if (!reducedMotion.matches && typeof gsap !== "undefined") {
    try {
      var slots = gsap.utils.toArray(".crystal-slot");
      slots.forEach(function (s) { s.style.animation = "none"; });

      var tl = gsap.timeline();

      tl.from(".sanctum__sigil", { y: -20, opacity: 0, duration: 0.5, ease: "power2.out" })
        .from(".sanctum__title", { y: -30, opacity: 0, duration: 0.7, ease: "power3.out" }, "-=0.3")
        .from(".sanctum__lede", { y: -20, opacity: 0, duration: 0.5, ease: "power2.out" }, "-=0.35")
        .from(slots, {
          y: 60,
          scale: 0.3,
          opacity: 0,
          duration: 0.9,
          ease: "back.out(1.7)",
          stagger: 0.08,
        }, "-=0.2")
        .from(".sanctum__footer", { opacity: 0, duration: 0.5 }, "-=0.3")
        .add(function () {
          slots.forEach(function (slot) {
            gsap.set(slot, { clearProps: "transform,opacity" });
            gsap.to(slot, {
              y: -10,
              duration: gsap.utils.random(3, 5),
              ease: "sine.inOut",
              yoyo: true,
              repeat: -1,
            });
          });
        });
    } catch (e) {
      var all = document.querySelectorAll(".crystal-slot");
      for (var i = 0; i < all.length; i++) all[i].style.cssText = "";
    }
  }

  function trackPointer(e) {
    if (reducedMotion.matches) return;
    cancelAnimationFrame(raf);
    raf = requestAnimationFrame(function () {
      root.style.setProperty("--mx", (e.clientX / innerWidth * 100).toFixed(1) + "%");
      root.style.setProperty("--my", (e.clientY / innerHeight * 100).toFixed(1) + "%");
    });
  }

  function clearPortalStyles() {
    var flash = document.querySelector(".portal-flash");
    if (flash) flash.style.cssText = "";
    sanctum.style.cssText = "";
    document.querySelectorAll(".crystal-slot").forEach(function (s) {
      s.style.opacity = "";
      s.style.transform = "";
    });
    document.querySelectorAll(".crystal, .crystal__halo, .crystal__rune").forEach(function (el) {
      el.style.cssText = "";
    });
    document.body.style.overflow = "";
  }

  function resetState() {
    transitioning = false;
    if (typeof anime !== "undefined") {
      anime.remove(".crystal-slot, .crystal, .crystal__halo, .crystal__rune, .portal-flash");
      anime.remove(sanctum);
    }
    clearPortalStyles();
  }

  function openPortal(link) {
    if (!link || transitioning) return;
    var href = link.getAttribute("href");
    var slot = link.closest(".crystal-slot");
    if (!href || !slot) return;

    transitioning = true;

    if (reducedMotion.matches || typeof anime === "undefined") {
      location.href = href;
      return;
    }

    var allSlots = Array.from(document.querySelectorAll(".crystal-slot"));
    var otherSlots = allSlots.filter(function (s) { return s !== slot; });
    var flash = document.querySelector(".portal-flash");
    var crystal = slot.querySelector(".crystal");
    var halo = slot.querySelector(".crystal__halo");
    var rune = slot.querySelector(".crystal__rune");

    if (typeof gsap !== "undefined") {
      allSlots.forEach(function (s) { gsap.killTweensOf(s); });
    }

    document.body.style.overflow = "hidden";

    var flashBlur = { value: 10 };

    var portalTl = anime.timeline({ easing: "easeOutQuart" });

    portalTl
      .add({
        targets: otherSlots,
        opacity: [1, 0.06],
        translateY: function () { return [0, anime.random(14, 28)]; },
        scale: [1, 0.86],
        duration: 650,
        easing: "easeInOutCubic",
      })
      .add({
        targets: crystal,
        translateY: -36,
        scale: 1.38,
        duration: 900,
        easing: "easeOutBack",
      }, 0)
      .add({
        targets: halo,
        opacity: [0.46, 1],
        scale: 2.2,
        duration: 900,
      }, 0)
      .add({
        targets: rune,
        opacity: [0.58, 1],
        rotate: 120,
        scale: 1.6,
        duration: 900,
      }, 0)
      .add({
        targets: flash,
        opacity: [0, 0.95],
        scale: [0.12, 1.5],
        duration: 950,
        easing: "easeOutExpo",
      }, 450)
      .add({
        targets: flashBlur,
        value: [10, 2],
        duration: 950,
        easing: "easeOutExpo",
        update: function () {
          flash.style.filter = "blur(" + flashBlur.value.toFixed(1) + "px)";
        },
      }, 450)
      .add({
        targets: flash,
        opacity: 1,
        scale: [1.5, 4.5],
        duration: 700,
        easing: "easeInCubic",
        begin: function () {
          flash.style.mixBlendMode = "plus-lighter";
        },
      })
      .add({
        targets: flashBlur,
        value: [2, 0],
        duration: 700,
        easing: "easeInCubic",
        update: function () {
          flash.style.filter = "blur(" + flashBlur.value.toFixed(1) + "px)";
        },
      }, "-=700")
      .add({
        targets: sanctum,
        opacity: [1, 0],
        scale: [1, 1.12],
        duration: 700,
        easing: "easeInCubic",
        complete: function () {
          location.href = href;
        },
      }, "-=700");
  }

  addEventListener("pointermove", trackPointer, { passive: true });

  grid.addEventListener("click", function (e) {
    var link = e.target.closest("a.crystal[href]");
    if (link) {
      e.preventDefault();
      openPortal(link);
    }
  });

  addEventListener("pageshow", resetState);
  addEventListener("pagehide", resetState);
})();

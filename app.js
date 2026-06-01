/* =====================================================================
   コレ買い！ — 共通挙動（全ページ共通で読み込む）
   モバイルメニュー / スクロールreveal / カウントアップ / 問い合わせデモ
   ===================================================================== */
(function(){
  "use strict";
  var reduce = window.matchMedia("(prefers-reduced-motion:reduce)").matches;

  /* ---- mobile menu ---- */
  var burger = document.getElementById("burger");
  var mobile = document.getElementById("mobile");
  if (burger && mobile) {
    burger.addEventListener("click", function () {
      var open = mobile.classList.toggle("show");
      burger.classList.toggle("open", open);
      burger.setAttribute("aria-expanded", open ? "true" : "false");
    });
    mobile.querySelectorAll("a").forEach(function (a) {
      a.addEventListener("click", function () {
        mobile.classList.remove("show");
        burger.classList.remove("open");
        burger.setAttribute("aria-expanded", "false");
      });
    });
  }

  /* ---- scroll reveal ---- */
  var rvs = document.querySelectorAll(".rv");
  if (!("IntersectionObserver" in window) || reduce) {
    rvs.forEach(function (e) { e.classList.add("in"); });
  } else {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add("in"); io.unobserve(en.target); }
      });
    }, { threshold: 0.15, rootMargin: "0px 0px -7% 0px" });
    rvs.forEach(function (e) { io.observe(e); });
  }

  /* ---- count up (confirmed values only) ---- */
  var el = document.getElementById("ec");
  if (el) {
    var to = parseFloat(el.dataset.to), dec = parseInt(el.dataset.dec || "0", 10);
    if (reduce || !("IntersectionObserver" in window)) {
      el.textContent = to.toFixed(dec);
    } else {
      var done = false;
      var io2 = new IntersectionObserver(function (entries) {
        entries.forEach(function (en) {
          if (en.isIntersecting && !done) {
            done = true;
            var t0 = null, dur = 1200;
            var step = function (ts) {
              if (!t0) t0 = ts;
              var p = Math.min((ts - t0) / dur, 1);
              var e = 1 - Math.pow(1 - p, 3);
              el.textContent = (to * e).toFixed(dec);
              if (p < 1) requestAnimationFrame(step); else el.textContent = to.toFixed(dec);
            };
            requestAnimationFrame(step);
          }
        });
      }, { threshold: 0.6 });
      io2.observe(el);
    }
  }

  /* ---- hero 3D parallax (pointer) ---- */
  var hero = document.getElementById("hero");
  var art = document.getElementById("heroArt");
  if (hero && art && !reduce && window.matchMedia("(pointer:fine)").matches) {
    var nx = 0, ny = 0, raf = null;
    var apply = function () {
      raf = null;
      art.style.transform = "rotateY(" + (nx * 11) + "deg) rotateX(" + (-ny * 8) + "deg)";
    };
    hero.addEventListener("pointermove", function (e) {
      var r = hero.getBoundingClientRect();
      nx = (e.clientX - r.left) / r.width - 0.5;
      ny = (e.clientY - r.top) / r.height - 0.5;
      if (!raf) raf = requestAnimationFrame(apply);
    });
    hero.addEventListener("pointerleave", function () {
      nx = 0; ny = 0;
      if (!raf) raf = requestAnimationFrame(apply);
    });
  }

  /* ---- contact form -> mailto fuga.n.0201@gmail.com ---- */
  var form = document.getElementById("cform");
  if (form) {
    var TOPICS = { product: "商品の予約・取扱", producer: "生産者・自治体の相談", press: "取材・メディア・コラボ", other: "その他" };
    form.addEventListener("submit", function (ev) {
      ev.preventDefault();
      if (!form.checkValidity()) { form.reportValidity(); return; }
      var picked = form.querySelector('input[name="topic"]:checked');
      var topic = picked ? (TOPICS[picked.value] || picked.value) : "お問い合わせ";
      var nm = (document.getElementById("nm") || {}).value || "";
      var em = (document.getElementById("em") || {}).value || "";
      var org = (document.getElementById("org") || {}).value || "";
      var msg = (document.getElementById("msg") || {}).value || "";
      var subject = "【コレ買い！お問い合わせ】" + topic;
      var body =
        "ご用件: " + topic + "\n" +
        "お名前: " + nm + "\n" +
        "メール: " + em + "\n" +
        "会社・団体名: " + org + "\n\n" +
        "----------------------------------------\n" +
        msg + "\n";
      var href = "mailto:fuga.n.0201@gmail.com?subject=" + encodeURIComponent(subject) + "&body=" + encodeURIComponent(body);
      window.location.href = href;

      var area = document.getElementById("formArea");
      var sent = document.getElementById("sent");
      if (area) area.style.display = "none";
      if (sent) {
        sent.style.display = "block";
        sent.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "center" });
      }
    });
  }
})();

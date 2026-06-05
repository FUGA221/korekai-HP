/* =====================================================================
   コレ買い！ — 共通挙動（全ページ共通で読み込む）
   モバイルメニュー / スクロールreveal / カウントアップ / 問い合わせデモ
   ===================================================================== */
(function(){
  "use strict";
  var reduce = window.matchMedia("(prefers-reduced-motion:reduce)").matches;

  /* ---- 背景の固定透かし「KOREKAI」（スクロールしても常に背景に透ける） ---- */
  (function () {
    var w = document.createElement("div");
    w.className = "bg-watermark";
    w.setAttribute("aria-hidden", "true");
    var s = document.createElement("span");
    s.textContent = "KOREKAI";
    w.appendChild(s);
    document.body.insertBefore(w, document.body.firstChild);
  })();

  /* ---- BudouX：日本語を文節境界で改行（不自然な改行＝語中分断・行頭助詞・行頭禁則を防ぐ） ---- */
  (function () {
    var SEL = ".lead,.cz-lead,main p,main dd,main li,.touch3 .c p,.svc3 .card>p," +
      ".cz-3 .it p,.stepr p,.vitem p,.svc-sub p,.pflow .step p,.callout p,.callout span," +
      ".stat__cap .t,.stat__cap .d,.cz-touch__lead p,.cz-touch__key,.cz-slope__sub,.evcard p,.evcta__t";
    try {
      import("https://unpkg.com/budoux@0.6.4/module/index.js").then(function (m) {
        var parser = m.loadDefaultJapaneseParser();
        document.querySelectorAll(SEL).forEach(function (el) {
          try {
            parser.applyElement(el);
            // 補正：閉じ引用符/括弧の直後では割らない（助詞の孤立防止）＋ブランド語「いいもの」は結合
            var Z = String.fromCharCode(0x200B), WJ = String.fromCharCode(0x2060);
            el.innerHTML = el.innerHTML
              .replace(new RegExp(Z + "?([“”「」『』（）])" + Z + "?", "g"), "$1")
              .replace(new RegExp("([”」』）！])([をにはがのへとも])", "g"), "$1" + WJ + "$2")
              .replace(new RegExp("いい" + Z + "もの", "g"), "いいもの");
          } catch (e) {}
        });
      }).catch(function () {}); // 失敗時はCSSのword-break:keep-allにフォールバック
    } catch (e) {}
  })();

  /* ---- notice bar（あんずフェア告知 / 全ページ注入・×で閉じ記憶） ---- */
  (function () {
    var closed = false;
    try { closed = localStorage.getItem("korekai_notice_anzufair") === "closed"; } catch (e) {}
    if (closed) return;
    var bar = document.createElement("div");
    bar.className = "notice-bar";
    bar.innerHTML =
      '<div class="wrap notice-bar__in">' +
      '<a href="events.html"><span class="tagx">News</span><span class="txt">6/28 ちくまあんずフェア出展予定 ― 詳細は後日公開</span><span class="arw" aria-hidden="true">→</span></a>' +
      '<button class="notice-bar__close" aria-label="お知らせを閉じる">×</button>' +
      '</div>';
    document.body.insertBefore(bar, document.body.firstChild);
    bar.querySelector(".notice-bar__close").addEventListener("click", function () {
      bar.classList.add("is-hidden");
      try { localStorage.setItem("korekai_notice_anzufair", "closed"); } catch (e) {}
    });
  })();

  /* ---- メニュー：横スライドのドロワー / 同ボタンで開閉トグル / 折りたたみサブ ---- */
  var mobile = document.getElementById("mobile");
  if (mobile) {
    var burger = document.getElementById("burger");
    var czMenu = document.getElementById("czMenu");
    var triggers = [burger, czMenu].filter(Boolean);

    /* ヘッダーは backdrop-filter を持つため fixed の包含ブロックになる。
       ドロワーを body 直下へ移し、確実に画面全高で固定する。 */
    document.body.appendChild(mobile);

    var backdrop = document.createElement("div");
    backdrop.className = "mobile-backdrop";
    document.body.appendChild(backdrop);

    function setMenu(open) {
      mobile.classList.toggle("show", open);
      backdrop.classList.toggle("show", open);
      document.body.classList.toggle("menu-open", open);
      triggers.forEach(function (t) {
        t.classList.toggle("open", open);
        t.setAttribute("aria-expanded", open ? "true" : "false");
        t.setAttribute("aria-label", open ? "メニューを閉じる" : "メニューを開く");
      });
    }
    triggers.forEach(function (t) {
      t.addEventListener("click", function () { setMenu(!mobile.classList.contains("show")); });
    });
    backdrop.addEventListener("click", function () { setMenu(false); });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && mobile.classList.contains("show")) {
        setMenu(false);
        if (czMenu) czMenu.focus(); else if (burger) burger.focus();
      }
    });

    /* 折りたたみ：コレ買い！について（最初は閉じ・▽で開閉） */
    var lead = mobile.querySelector(".mobile__lead");
    if (lead) {
      var subs = [], n = lead.nextElementSibling;
      while (n && n.classList && n.classList.contains("mobile__sub")) { subs.push(n); n = n.nextElementSibling; }
      if (subs.length) {
        var group = document.createElement("div");
        group.className = "mobile__group";
        lead.parentNode.insertBefore(group, subs[0]);
        subs.forEach(function (s) { group.appendChild(s); });
        lead.setAttribute("role", "button");
        lead.setAttribute("aria-expanded", "false");
        var caret = document.createElement("span");
        caret.className = "mc";
        caret.setAttribute("aria-hidden", "true");
        caret.textContent = "▽";
        lead.appendChild(caret);
        lead.addEventListener("click", function (e) {
          e.preventDefault();
          var op = group.classList.toggle("open");
          lead.classList.toggle("open", op);
          lead.setAttribute("aria-expanded", op ? "true" : "false");
        });
      }
    }

    /* 実リンクを押したらドロワーを閉じる（leadトグルは除外） */
    mobile.querySelectorAll("a:not(.mobile__lead)").forEach(function (a) {
      a.addEventListener("click", function () { setMenu(false); });
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

  /* ---- scroll effects: 進捗バー / ヘッダー浮き / ヒーロー写真ズーム ---- */
  (function () {
    var prog = document.createElement("div");
    prog.className = "scroll-prog";
    document.body.appendChild(prog);
    var hdr = document.querySelector(".hdr");
    var heroImg = document.querySelector(".hero__photo img");
    var docEl = document.documentElement;
    var ticking = false;
    function update() {
      var y = window.scrollY || docEl.scrollTop || 0;
      var max = docEl.scrollHeight - docEl.clientHeight;
      prog.style.width = (max > 0 ? (y / max * 100) : 0) + "%";
      if (hdr) hdr.classList.toggle("scrolled", y > 10);
      if (heroImg && !reduce) heroImg.style.transform = "scale(" + (1 + Math.min(y, 800) * 0.00018) + ")";
      ticking = false;
    }
    function onScroll() { if (!ticking) { ticking = true; requestAnimationFrame(update); } }
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });
    update();
  })();

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

  /* ---- contact form -> mailto fuga.n.0201@gmail.com ---- */
  var form = document.getElementById("cform");
  if (form) {
    var TOPICS = { product: "商品の予約・取扱", producer: "生産者・自治体の相談", press: "取材・メディア・コラボ", other: "その他" };

    /* inline validation（欄を離れた瞬間に朱赤で1行エラー） */
    var vfields = [].slice.call(form.querySelectorAll("#nm, #em, #msg"));
    function fieldMsg(f) {
      if (f.validity.valueMissing) return "入力してください。";
      if (f.type === "email" && f.validity.typeMismatch) return "メールアドレスの形式をご確認ください。";
      return "ご確認ください。";
    }
    function validateField(f) {
      var box = f.closest(".field");
      var err = box ? box.querySelector(".field-error") : null;
      if (f.checkValidity()) {
        f.classList.remove("invalid");
        if (err) err.remove();
        return true;
      }
      f.classList.add("invalid");
      if (!err) { err = document.createElement("p"); err.className = "field-error"; f.insertAdjacentElement("afterend", err); }
      err.textContent = fieldMsg(f);
      return false;
    }
    vfields.forEach(function (f) {
      f.addEventListener("blur", function () { f.dataset.touched = "1"; validateField(f); });
      f.addEventListener("input", function () { if (f.dataset.touched) validateField(f); });
    });

    form.addEventListener("submit", function (ev) {
      ev.preventDefault();
      if (!form.checkValidity()) { vfields.forEach(validateField); form.reportValidity(); return; }
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

  /* ---- smartphone sticky CTA (表示はCSSで900px以下のみ) ---- */
  if (!/contact/.test(location.pathname)) {
    var sc = document.createElement("div");
    sc.className = "sticky-cta";
    sc.innerHTML = '<a href="contact.html">お問い合わせ <span aria-hidden="true">→</span></a>';
    document.body.appendChild(sc);
  }
})();

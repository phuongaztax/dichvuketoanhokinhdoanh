/* =========================================================
   Trang: {{TITLE}}
   Khung tương tác chung cho trang con. Thêm tương tác riêng ở cuối file.
   ========================================================= */
(() => {
  /* Dán URL Formspree / Google Apps Script để nhận form tự động. Để trống: gửi qua Zalo/email. */
  const FORM_ENDPOINT = "";
  const PHONE = "0901455988";
  const EMAIL = "ketoannhanhaz@gmail.com";
  const PAGE = window.PAGE_NAME || document.title;

  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];
  const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- Menu mobile ---------- */
  const nav = $("#nav");
  const menuBtn = $("#menuBtn");
  if (nav && menuBtn) {
    const setOpen = (open) => {
      nav.classList.toggle("is-open", open);
      menuBtn.setAttribute("aria-expanded", open);
      menuBtn.setAttribute("aria-label", open ? "Đóng menu" : "Mở menu");
    };
    menuBtn.addEventListener("click", () => setOpen(!nav.classList.contains("is-open")));
    nav.addEventListener("click", (e) => { if (e.target.closest("a")) setOpen(false); });
    document.addEventListener("keydown", (e) => { if (e.key === "Escape") setOpen(false); });
  }

  /* ---------- Đánh dấu menu, hiện dần, đếm số ---------- */
  const countUp = (el) => {
    const end = Number(el.dataset.count) || 0;
    const suffix = el.dataset.suffix || "";
    if (reduceMotion || !end) { el.textContent = end.toLocaleString("vi-VN") + suffix; return; }
    const t0 = performance.now(), dur = 1200;
    const tick = (t) => {
      const p = Math.min(1, (t - t0) / dur);
      el.textContent = Math.round(end * (1 - Math.pow(1 - p, 3))).toLocaleString("vi-VN") + suffix;
      if (p < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  };

  if ("IntersectionObserver" in window) {
    const links = nav ? $$('a[href^="#"]:not(.btn)', nav) : [];
    const spy = new IntersectionObserver((entries) => {
      entries.forEach((en) => {
        if (en.isIntersecting) links.forEach((a) => a.classList.toggle("is-active", a.getAttribute("href") === "#" + en.target.id));
      });
    }, { rootMargin: "-45% 0px -50% 0px" });
    links.forEach((a) => { const s = $(a.getAttribute("href")); if (s) spy.observe(s); });

    const io = new IntersectionObserver((entries) => {
      entries.forEach((en) => {
        if (!en.isIntersecting) return;
        en.target.classList.add("is-in");
        $$("[data-count]", en.target).forEach(countUp);
        if (en.target.matches("[data-count]")) countUp(en.target);
        io.unobserve(en.target);
      });
    }, { threshold: 0.15 });
    $$(".service, .steps li, .reveal, .plan, .soft").forEach((el) => { el.classList.add("reveal"); io.observe(el); });
  } else {
    $$(".reveal").forEach((el) => el.classList.add("is-in"));
    $$("[data-count]").forEach(countUp);
  }

  /* ---------- Tabs (có điều khiển bằng phím mũi tên) ---------- */
  $$("[data-tabs]").forEach((box) => {
    const tabs = $$('[role="tab"]', box);
    const select = (tab) => {
      tabs.forEach((t) => {
        const on = t === tab;
        t.setAttribute("aria-selected", on);
        t.tabIndex = on ? 0 : -1;
        const panel = document.getElementById(t.getAttribute("aria-controls"));
        if (panel) panel.hidden = !on;
      });
    };
    tabs.forEach((t, i) => {
      t.addEventListener("click", () => select(t));
      t.addEventListener("keydown", (e) => {
        const d = e.key === "ArrowRight" ? 1 : e.key === "ArrowLeft" ? -1 : 0;
        if (!d) return;
        const next = tabs[(i + d + tabs.length) % tabs.length];
        select(next); next.focus();
      });
    });
  });

  /* ---------- Form liên hệ ---------- */
  const form = $("#leadForm");
  const msg = $("#formMsg");

  // Nút có data-need tự chọn nhu cầu trong form
  document.addEventListener("click", (e) => {
    const b = e.target.closest("[data-need]");
    if (!b || !form || !form.need) return;
    const v = b.dataset.need;
    if (![...form.need.options].some((o) => o.value === v)) form.need.add(new Option(v, v), 0);
    form.need.value = v;
  });

  const setMsg = (html, ok) => { msg.innerHTML = html; msg.className = "form__msg " + (ok ? "is-ok" : "is-err"); };

  if (form) form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const name = form.name.value.trim();
    const phone = form.phone.value.replace(/[^\d+]/g, "");
    const phoneOk = /^(\+84|0)\d{9,10}$/.test(phone);
    form.name.setAttribute("aria-invalid", !name);
    form.phone.setAttribute("aria-invalid", !phoneOk);
    if (!name) { setMsg("Vui lòng nhập họ tên.", false); form.name.focus(); return; }
    if (!phoneOk) { setMsg("Số điện thoại chưa đúng, ví dụ 0901 455 988.", false); form.phone.focus(); return; }

    const data = Object.fromEntries(new FormData(form));
    const text = [
      `YÊU CẦU TƯ VẤN – ${PAGE}`,
      `Họ tên: ${data.name}`,
      `SĐT/Zalo: ${data.phone}`,
      ...Object.entries(data).filter(([k]) => !["name", "phone", "note"].includes(k)).map(([k, v]) => `${k}: ${v}`),
      `Nội dung: ${data.note || "-"}`,
    ].join("\n");

    const btn = form.querySelector('button[type="submit"]');
    btn.disabled = true;
    try {
      if (FORM_ENDPOINT) {
        const res = await fetch(FORM_ENDPOINT, {
          method: "POST",
          headers: { "Content-Type": "application/json", Accept: "application/json" },
          body: JSON.stringify({ ...data, page: PAGE, message: text }),
        });
        if (!res.ok) throw new Error(res.status);
        form.reset();
        setMsg(`Cảm ơn ${esc(name)}! AZ sẽ gọi lại cho bạn trong ngày làm việc.`, true);
        return;
      }
      let copied = false;
      try { await navigator.clipboard.writeText(text); copied = true; } catch (_) { /* trình duyệt chặn */ }
      const mail = `mailto:${EMAIL}?subject=${encodeURIComponent("Yêu cầu tư vấn - " + name)}&body=${encodeURIComponent(text)}`;
      setMsg(
        `${copied ? "Đã chép nội dung yêu cầu. " : ""}Bấm để gửi cho AZ: ` +
        `<a href="https://zalo.me/${PHONE}" target="_blank" rel="noopener">Gửi qua Zalo</a>${copied ? " (dán nội dung vào tin nhắn)" : ""}` +
        ` hoặc <a href="${mail}">gửi email</a>.`, true);
    } catch (_) {
      setMsg(`Chưa gửi được. Vui lòng gọi <a href="tel:${PHONE}">0901 455 988</a> hoặc nhắn Zalo.`, false);
    } finally {
      btn.disabled = false;
    }
  });

  /* ---------- Năm ở footer ---------- */
  const year = $("#year");
  if (year) year.textContent = new Date().getFullYear();

  /* ---------- Tương tác riêng của trang (nếu có) ---------- */
})();

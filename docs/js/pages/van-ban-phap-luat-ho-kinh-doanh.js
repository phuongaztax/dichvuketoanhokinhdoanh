/* =========================================================
   Trang: Văn bản pháp luật hộ kinh doanh
   Dữ liệu văn bản ở mảng DOCS (cập nhật 11/2026). Thêm/sửa văn bản tại đây.
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

  /* ---------- Dữ liệu văn bản ---------- */
  const CATS = {
    thue:   { name: "Thuế, quản lý thuế", color: "#0F5C4D" },
    ketoan: { name: "Sổ kế toán", color: "#B7791F" },
    hoadon: { name: "Hóa đơn, chữ ký số", color: "#2563EB" },
    tmdt:   { name: "Thương mại điện tử", color: "#7C3AED" },
    dangky: { name: "Đăng ký kinh doanh", color: "#0E8BC9" },
    xuphat: { name: "Xử phạt", color: "#B9382A" },
  };

  // issued: ngày ban hành/thông qua; effective: hiệu lực; type: loại văn bản
  const DOCS = [
    { cat: "thue", type: "Nghị quyết", no: "198/2025/QH15",
      name: "Nghị quyết của Quốc hội về một số cơ chế, chính sách đặc biệt phát triển kinh tế tư nhân",
      issued: "17/05/2025", effective: "Bỏ thuế khoán, lệ phí môn bài từ 01/01/2026",
      notes: ["Hộ, cá nhân kinh doanh không áp dụng phương pháp thuế khoán từ 01/01/2026, chuyển sang tự khai, tự nộp.",
              "Chấm dứt thu, nộp lệ phí môn bài từ 01/01/2026 (khoản 7 Điều 10)."] },
    { cat: "thue", type: "Luật", no: "108/2025/QH15",
      name: "Luật Quản lý thuế (thay thế Luật Quản lý thuế 2019)",
      issued: "10/12/2025", effective: "01/07/2026 (một số điều áp dụng từ 01/01/2026)",
      notes: ["Quy định việc hộ kinh doanh tự khai, tự tính, tự nộp thuế.",
              "Hộ dùng hóa đơn điện tử, máy tính tiền có kết nối dữ liệu được hệ thống thuế hỗ trợ lập sẵn tờ khai.",
              "Sàn TMĐT có chức năng đặt hàng và thanh toán phải khấu trừ, nộp thay thuế cho người bán."] },
    { cat: "thue", type: "Luật", no: "109/2025/QH15",
      name: "Luật Thuế thu nhập cá nhân (thay thế)",
      issued: "10/12/2025", effective: "01/07/2026; thu nhập kinh doanh áp dụng từ kỳ tính thuế năm 2026",
      notes: ["Ngưỡng doanh thu chịu thuế của hộ, cá nhân kinh doanh do Chính phủ quy định (hiện là 1 tỷ đồng/năm theo NĐ 141/2026).",
              "Là căn cứ cho cách tính TNCN theo tỷ lệ trên doanh thu hoặc trên thu nhập (doanh thu trừ chi phí)."] },
    { cat: "thue", type: "Luật", no: "48/2024/QH15 & 149/2025/QH15",
      name: "Luật Thuế giá trị gia tăng 2024, được sửa đổi, bổ sung bởi Luật số 149/2025/QH15",
      issued: "149/2025: 11/12/2025", effective: "Luật sửa đổi: 01/01/2026",
      notes: ["Bãi bỏ việc nộp thuế GTGT theo phương pháp khoán với hộ, cá nhân kinh doanh.",
              "Nâng ngưỡng doanh thu không chịu thuế GTGT; mức cụ thể hiện áp dụng là 1 tỷ đồng/năm theo NĐ 141/2026."] },
    { cat: "thue", type: "Nghị định", no: "68/2026/NĐ-CP",
      name: "Quy định về chính sách thuế và quản lý thuế đối với hộ kinh doanh, cá nhân kinh doanh",
      issued: "05/03/2026", effective: "05/03/2026",
      notes: ["Văn bản chính hướng dẫn cách tính, khai, nộp thuế GTGT, TNCN của hộ kinh doanh từ năm 2026.",
              "Quy định địa điểm khai thuế, kỳ khai thuế, thông báo doanh thu.",
              "Không truy thu tiền thuế khoán các năm trước khi chuyển sang kê khai.",
              "Hộ chọn tính TNCN theo thu nhập phải áp dụng ổn định tối thiểu 2 năm liên tiếp."] },
    { cat: "thue", type: "Nghị định", no: "141/2026/NĐ-CP",
      name: "Sửa đổi, bổ sung Nghị định 68/2026/NĐ-CP và Nghị định 320/2025/NĐ-CP",
      issued: "29/04/2026", effective: "Áp dụng từ 01/01/2026",
      notes: ["Nâng ngưỡng doanh thu không phải nộp thuế GTGT, TNCN từ 500 triệu lên 1 tỷ đồng/năm.",
              "Hộ có doanh thu năm trên 1 tỷ phải dùng hóa đơn điện tử; đăng ký trong 30 ngày kể từ cuối kỳ tính thuế có doanh thu lũy kế vượt 1 tỷ."] },
    { cat: "thue", type: "Thông tư", no: "18/2026/TT-BTC",
      name: "Hướng dẫn hồ sơ, thủ tục khai thuế đối với hộ kinh doanh, cá nhân kinh doanh (thay thế Thông tư 40/2021/TT-BTC)",
      issued: "", effective: "05/03/2026",
      notes: ["Ban hành các mẫu tờ khai, thông báo doanh thu, mẫu 01/BK-STK thông báo số tài khoản, ví điện tử.",
              "Một số mẫu biểu đã được thay bằng mẫu mới tại Thông tư 50/2026/TT-BTC."] },
    { cat: "thue", type: "Thông tư", no: "50/2026/TT-BTC",
      name: "Sửa đổi, thay thế một số mẫu biểu ban hành kèm Thông tư 18/2026/TT-BTC",
      issued: "13/05/2026", effective: "Đang áp dụng",
      notes: ["Thay mẫu 01/TKN-CNKD (thông báo doanh thu), 01/CNKD (tờ khai thuế), 01/BĐS, 02/BK-KTBĐS (cho thuê bất động sản).",
              "Khi khai thuế phải dùng mẫu theo Thông tư 50, không dùng mẫu cũ."] },
    { cat: "thue", type: "Nghị định", no: "362/2025/NĐ-CP",
      name: "Hướng dẫn chấm dứt thu lệ phí môn bài; bãi bỏ Nghị định 139/2016/NĐ-CP và 22/2020/NĐ-CP",
      issued: "31/12/2025", effective: "01/01/2026",
      notes: ["Từ năm 2026 hộ kinh doanh không phải khai, nộp lệ phí môn bài.",
              "Nghĩa vụ lệ phí môn bài của các năm trước (nếu còn) vẫn phải hoàn thành."] },
    { cat: "ketoan", type: "Thông tư", no: "152/2025/TT-BTC",
      name: "Hướng dẫn chế độ kế toán cho hộ kinh doanh, cá nhân kinh doanh (thay thế Thông tư 88/2021/TT-BTC)",
      issued: "31/12/2025", effective: "01/01/2026",
      notes: ["Hộ không phải nộp GTGT, TNCN dùng sổ doanh thu mẫu S1a-HKD.",
              "Hộ nộp thuế dùng các sổ S2a–S2e, S3a-HKD tùy phương pháp tính thuế.",
              "Được lưu trữ sổ, chứng từ, hóa đơn bằng bản giấy hoặc trên phương tiện điện tử."] },
    { cat: "hoadon", type: "Nghị định", no: "123/2020/NĐ-CP & 70/2025/NĐ-CP",
      name: "Quy định về hóa đơn, chứng từ; sửa đổi, bổ sung bởi Nghị định 70/2025/NĐ-CP",
      issued: "70/2025: 20/03/2025", effective: "NĐ 70/2025: 01/06/2025",
      notes: ["Quy định hóa đơn điện tử khởi tạo từ máy tính tiền có kết nối dữ liệu với cơ quan thuế.",
              "Hướng dẫn thời điểm lập hóa đơn, xử lý hóa đơn sai sót, lưu trữ hóa đơn."] },
    { cat: "hoadon", type: "Luật", no: "20/2023/QH15",
      name: "Luật Giao dịch điện tử",
      issued: "22/06/2023", effective: "01/07/2024",
      notes: ["Căn cứ pháp lý của chữ ký số, chữ ký điện tử dùng để ký hóa đơn, tờ khai thuế.",
              "Chữ ký số từ xa (ký trên điện thoại) được công nhận khi do tổ chức được cấp phép cung cấp."] },
    { cat: "tmdt", type: "Nghị định", no: "117/2025/NĐ-CP",
      name: "Quản lý thuế đối với hoạt động kinh doanh trên nền tảng thương mại điện tử, nền tảng số",
      issued: "09/06/2025", effective: "01/07/2025",
      notes: ["Sàn có chức năng thanh toán khấu trừ, nộp thay thuế GTGT, TNCN trên từng giao dịch của người bán.",
              "Phần doanh thu sàn đã khấu trừ, nộp thay thì hộ không khai lại; doanh thu bán ngoài sàn vẫn tự khai.",
              "Số thuế sàn đã nộp thay được trừ vào nghĩa vụ cuối cùng; nộp thừa được đề nghị hoàn."] },
    { cat: "dangky", type: "Nghị định", no: "168/2025/NĐ-CP",
      name: "Về đăng ký doanh nghiệp (bao gồm đăng ký hộ kinh doanh)",
      issued: "30/06/2025", effective: "01/07/2025",
      notes: ["Hộ kinh doanh đăng ký tại cơ quan đăng ký kinh doanh cấp xã; được nộp hồ sơ qua mạng.",
              "Quy định hồ sơ, thủ tục thành lập, thay đổi, tạm ngừng, chấm dứt hộ kinh doanh."] },
    { cat: "dangky", type: "Nghị định", no: "296/2026/NĐ-CP",
      name: "Sửa đổi, bổ sung một số điều của Nghị định 168/2025/NĐ-CP",
      issued: "23/07/2026", effective: "23/07/2026",
      notes: ["Sửa quy định đăng ký hộ kinh doanh qua mạng điện tử theo hướng số hóa, đơn giản thủ tục.",
              "Sửa quy định về ủy quyền thực hiện thủ tục đăng ký hộ kinh doanh; có điều khoản chuyển tiếp cho hồ sơ đang xử lý."] },
    { cat: "xuphat", type: "Nghị định", no: "125/2020/NĐ-CP",
      name: "Xử phạt vi phạm hành chính về thuế, hóa đơn; sửa đổi bởi NĐ 102/2021/NĐ-CP và NĐ 310/2025/NĐ-CP",
      issued: "NĐ 310/2025: 02/12/2025", effective: "NĐ 310/2025: 16/01/2026",
      notes: ["Quy định mức phạt chậm nộp tờ khai, khai sai, không lập hóa đơn, sử dụng hóa đơn không hợp pháp.",
              "Áp dụng chung cho hộ kinh doanh, cá nhân kinh doanh."] },
    { cat: "xuphat", type: "Nghị định", no: "291/2026/NĐ-CP",
      name: "Sửa đổi, bổ sung Nghị định 125/2020/NĐ-CP về xử phạt vi phạm hành chính về thuế, hóa đơn",
      issued: "21/07/2026", effective: "21/07/2026",
      notes: ["Bổ sung xử phạt hành vi vi phạm về cung cấp thông tin phục vụ trao đổi thông tin về thuế.",
              "Tránh xử phạt chồng chéo giữa các hành vi; áp dụng song song với NĐ 125/2020 và các nghị định sửa đổi trước."] },
  ];

  /* ---------- Render danh mục ---------- */
  const list = $("#docList");
  const count = $("#docCount");
  const search = $("#docSearch");
  const filters = $("#docFilters");
  const total = $("#docTotal");
  if (total) total.textContent = DOCS.length;

  let activeCat = "all";
  const norm = (s) => String(s).toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/đ/g, "d");

  // Tô sáng từ khóa (so khớp không dấu), luôn escape trước khi chèn <mark>
  const highlight = (text, q) => {
    if (!q) return esc(text);
    const n = norm(text);
    const out = [];
    let i = 0, j;
    while ((j = n.indexOf(q, i)) !== -1) {
      out.push(esc(text.slice(i, j)), "<mark>", esc(text.slice(j, j + q.length)), "</mark>");
      i = j + q.length;
    }
    out.push(esc(text.slice(i)));
    return out.join("");
  };

  filters.innerHTML = [["all", "Tất cả", DOCS.length], ...Object.entries(CATS).map(([k, c]) => [k, c.name, DOCS.filter((d) => d.cat === k).length])]
    .map(([k, n, c]) => `<button type="button" class="pg-chip" data-cat="${k}" aria-pressed="${k === "all"}">${esc(n)}<small>${c}</small></button>`)
    .join("");

  function render() {
    const q = norm(search.value.trim());
    const rows = DOCS.filter((d) =>
      (activeCat === "all" || d.cat === activeCat) &&
      (!q || norm([d.no, d.name, d.type, ...d.notes].join(" ")).includes(q)));

    count.textContent = rows.length
      ? `Hiển thị ${rows.length} / ${DOCS.length} văn bản`
      : "";

    list.innerHTML = rows.length ? rows.map((d) => {
      const c = CATS[d.cat];
      const open = q && norm(d.notes.join(" ")).includes(q) ? " open" : "";
      return `
      <details class="pg-doc" style="--c:${c.color}"${open}>
        <summary>
          <span class="pg-doc__meta"><span class="pg-tag pg-tag--cat">${esc(c.name)}</span><span class="pg-tag">${esc(d.type)}</span></span>
          <span class="pg-doc__no">${highlight(d.no, q)}</span>
          <span class="pg-doc__name">${highlight(d.name, q)}</span>
          <span class="pg-doc__dates">${d.issued ? `Ban hành: ${esc(d.issued)} · ` : ""}Hiệu lực: <b>${esc(d.effective)}</b></span>
        </summary>
        <div class="pg-doc__body">
          <h4>Hộ kinh doanh cần lưu ý</h4>
          <ul>${d.notes.map((n) => `<li>${highlight(n, q)}</li>`).join("")}</ul>
        </div>
      </details>`;
    }).join("") : `<div class="pg-empty">Không tìm thấy văn bản phù hợp. Thử từ khóa khác, hoặc <a href="#lien-he" data-need="Hỏi về văn bản pháp luật hộ kinh doanh">hỏi AZ</a>.</div>`;
  }

  filters.addEventListener("click", (e) => {
    const b = e.target.closest("[data-cat]");
    if (!b) return;
    activeCat = b.dataset.cat;
    $$("[data-cat]", filters).forEach((x) => x.setAttribute("aria-pressed", x === b));
    render();
  });
  let t;
  search.addEventListener("input", () => { clearTimeout(t); t = setTimeout(render, 120); });
  render();

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
    const tick = (now) => {
      const p = Math.min(1, (now - t0) / dur);
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
        io.unobserve(en.target);
      });
    }, { threshold: 0.15 });
    $$(".service, .reveal").forEach((el) => { el.classList.add("reveal"); io.observe(el); });
  } else {
    $$(".reveal").forEach((el) => el.classList.add("is-in"));
    $$("[data-count]").forEach(countUp);
  }

  /* ---------- Form liên hệ ---------- */
  const form = $("#leadForm");
  const msg = $("#formMsg");

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
      `Nhu cầu: ${data.need}`,
      `Câu hỏi: ${data.note || "-"}`,
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
        setMsg(`Cảm ơn ${esc(name)}! AZ sẽ trả lời bạn trong ngày làm việc.`, true);
        return;
      }
      let copied = false;
      try { await navigator.clipboard.writeText(text); copied = true; } catch (_) { /* trình duyệt chặn */ }
      const mail = `mailto:${EMAIL}?subject=${encodeURIComponent("Câu hỏi pháp luật HKD - " + name)}&body=${encodeURIComponent(text)}`;
      setMsg(
        `${copied ? "Đã chép nội dung câu hỏi. " : ""}Bấm để gửi cho AZ: ` +
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
})();

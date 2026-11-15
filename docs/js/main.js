/* =========================================================
   Kế toán nhanh AZ – script trang chủ
   ========================================================= */

/* Nếu có dịch vụ nhận form (Formspree, Google Apps Script, API riêng…),
   dán URL vào đây. Để trống thì form sẽ chép nội dung và mở Zalo/email. */
const FORM_ENDPOINT = "";

const PHONE = "0901455988";
const EMAIL = "ketoannhanhaz@gmail.com";
const THRESHOLD = 1e9; // ngưỡng doanh thu không chịu thuế: 1 tỷ/năm

/* Tỷ lệ % thuế trên doanh thu theo nhóm ngành */
const RATES = [
  { id: "pp", name: "Phân phối, bán hàng hóa (tạp hóa, bán online…)", vat: 1, pit: 0.5 },
  { id: "dv", name: "Dịch vụ (cắt tóc, spa, tư vấn, giặt là…)", vat: 5, pit: 2 },
  { id: "lt", name: "Dịch vụ lưu trú (nhà nghỉ, homestay)", vat: 5, pit: 2 },
  { id: "au", name: "Dịch vụ ăn uống (quán ăn, cà phê)", vat: 3, pit: 1.5 },
  { id: "sx", name: "Sản xuất, vận tải, xây dựng có bao thầu NVL", vat: 3, pit: 1.5 },
  { id: "ts", name: "Cho thuê tài sản (nhà, phòng trọ, mặt bằng)", vat: 5, pit: 5 },
  { id: "kb", name: "Khám chữa bệnh, dạy học (không chịu GTGT)", vat: 0, pit: 2 },
  { id: "dl", name: "Đại lý xổ số, bảo hiểm, bán hàng đa cấp", vat: 0, pit: 5 },
  { id: "kh", name: "Hoạt động kinh doanh khác", vat: 2, pit: 1 },
];

const GROUPS = [
  { g: 1, range: "Đến 1 tỷ", color: "#13735F", items: ["Không nộp thuế GTGT, TNCN", "Ghi sổ doanh thu mẫu S1a-HKD", "Thông báo doanh thu năm", "Không bắt buộc hóa đơn điện tử"] },
  { g: 2, range: "1 – 3 tỷ", color: "#2A8FBF", items: ["GTGT = doanh thu × tỷ lệ ngành", "TNCN: (doanh thu − 1 tỷ) × tỷ lệ, hoặc 15% trên thu nhập", "Khai thuế theo quý", "Bắt buộc hóa đơn điện tử"] },
  { g: 3, range: "3 – 50 tỷ", color: "#E8A33A", items: ["GTGT = doanh thu × tỷ lệ ngành", "TNCN = (doanh thu − chi phí) × 17%", "Khai quý, quyết toán TNCN năm", "Sổ S2b–S2e, S3a-HKD, chứng từ chi phí"] },
  { g: 4, range: "Trên 50 tỷ", color: "#B9382A", items: ["GTGT = doanh thu × tỷ lệ ngành", "TNCN = (doanh thu − chi phí) × 20%", "Khai thuế theo tháng", "Sổ kế toán đầy đủ"] },
];

const PLANS = [
  { name: "Gói Cơ bản", forG: "Nhóm 1 · doanh thu đến 1 tỷ", price: "Từ 500.000đ", unit: "/ tháng", items: ["Mở và ghi sổ doanh thu S1a-HKD", "Theo dõi doanh thu lũy kế, báo khi gần 1 tỷ", "Thông báo doanh thu năm", "Tư vấn qua Zalo"] },
  { name: "Gói Tiêu chuẩn", forG: "Nhóm 2 · 1 – 3 tỷ", price: "Từ 800.000đ", unit: "/ tháng", featured: true, items: ["Đăng ký hóa đơn điện tử máy tính tiền", "Ghi sổ doanh thu, chi phí", "Kê khai GTGT, TNCN theo quý", "Chọn cách tính TNCN có lợi", "Đối chiếu doanh thu sàn TMĐT"] },
  { name: "Gói Nâng cao", forG: "Nhóm 3 · 3 – 50 tỷ", price: "Từ 1.500.000đ", unit: "/ tháng", items: ["Sổ S2b–S2e, S3a-HKD", "Quản lý kho, công nợ", "Kiểm soát chứng từ chi phí hợp lệ", "Kê khai quý, quyết toán TNCN năm"] },
  { name: "Gói Chuyên sâu", forG: "Nhóm 4 · trên 50 tỷ", price: "Liên hệ", unit: "", items: ["Kê khai GTGT, TNCN hằng tháng", "Sổ kế toán đầy đủ, báo cáo quản trị", "Rà soát rủi ro thuế định kỳ", "Đại diện làm việc với cơ quan thuế"] },
];

const $ = (s, el = document) => el.querySelector(s);
const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const money = (n) => Math.round(n).toLocaleString("vi-VN") + "đ";
const parseNum = (s) => Number(String(s).replace(/[^\d]/g, "")) || 0;

/* ---------- Render nhóm hộ & bảng giá ---------- */
$("#groups").innerHTML = GROUPS.map((g) => `
  <article class="group reveal" style="--c:${g.color}">
    <p class="group__no">Nhóm ${g.g}</p>
    <p class="group__range">${g.range}<small class="muted" style="font-size:.9rem;font-weight:500"> /năm</small></p>
    <ul>${g.items.map((i) => `<li>${esc(i)}</li>`).join("")}</ul>
  </article>`).join("");

$("#plans").innerHTML = PLANS.map((p) => `
  <article class="plan reveal${p.featured ? " plan--featured" : ""}">
    ${p.featured ? '<span class="plan__tag">Phổ biến nhất</span>' : ""}
    <h3>${esc(p.name)}</h3>
    <p class="plan__for">${esc(p.forG)}</p>
    <p class="plan__price"><b>${esc(p.price)}</b> <span>${esc(p.unit)}</span></p>
    <ul>${p.items.map((i) => `<li>${esc(i)}</li>`).join("")}</ul>
    <a href="#lien-he" class="btn ${p.featured ? "btn--primary" : "btn--ghost"}" data-plan="${esc(p.name)}">Chọn gói này</a>
  </article>`).join("");

/* ---------- Menu mobile ---------- */
const nav = $("#nav");
const menuBtn = $("#menuBtn");
menuBtn.addEventListener("click", () => {
  const open = nav.classList.toggle("is-open");
  menuBtn.setAttribute("aria-expanded", open);
  menuBtn.setAttribute("aria-label", open ? "Đóng menu" : "Mở menu");
});
nav.addEventListener("click", (e) => {
  if (e.target.closest("a")) {
    nav.classList.remove("is-open");
    menuBtn.setAttribute("aria-expanded", "false");
  }
});

/* ---------- Đánh dấu mục menu đang xem ---------- */
const navLinks = [...nav.querySelectorAll('a[href^="#"]:not(.btn)')];
const sections = navLinks.map((a) => $(a.getAttribute("href"))).filter(Boolean);
if ("IntersectionObserver" in window) {
  const spy = new IntersectionObserver((entries) => {
    entries.forEach((en) => {
      if (en.isIntersecting) {
        navLinks.forEach((a) => a.classList.toggle("is-active", a.getAttribute("href") === "#" + en.target.id));
      }
    });
  }, { rootMargin: "-45% 0px -50% 0px" });
  sections.forEach((s) => spy.observe(s));

  const rev = new IntersectionObserver((entries) => {
    entries.forEach((en) => { if (en.isIntersecting) { en.target.classList.add("is-in"); rev.unobserve(en.target); } });
  }, { threshold: 0.12 });
  document.querySelectorAll(".service, .steps li, .pain, .reveal").forEach((el) => { el.classList.add("reveal"); rev.observe(el); });
} else {
  document.querySelectorAll(".reveal").forEach((el) => el.classList.add("is-in"));
}

/* ---------- Công cụ tính thuế ---------- */
const cIndustry = $("#cIndustry");
const cRevenue = $("#cRevenue");
const cCost = $("#cCost");
const cPeriod = $("#cPeriod");
const out = $("#calcResult");

cIndustry.innerHTML = RATES.map((r) => `<option value="${r.id}">${esc(r.name)} · GTGT ${String(r.vat).replace(".", ",")}%, TNCN ${String(r.pit).replace(".", ",")}%</option>`).join("");
cIndustry.value = "au";

function formatInput(el) {
  const pos = el.value.length - el.selectionStart;
  const n = parseNum(el.value);
  el.value = n ? n.toLocaleString("vi-VN") : "";
  const p = Math.max(0, el.value.length - pos);
  try { el.setSelectionRange(p, p); } catch (_) { /* không hỗ trợ */ }
}

function calc() {
  const rate = RATES.find((r) => r.id === cIndustry.value);
  const k = cPeriod.value === "month" ? 12 : 1;
  const rev = parseNum(cRevenue.value) * k;
  const cost = parseNum(cCost.value) * k;
  const income = Math.max(0, rev - cost);

  let group, vat = 0, pit = 0, hint = "", rows = [];
  if (rev <= THRESHOLD) {
    group = 1;
    hint = "Hộ không phải nộp thuế GTGT, TNCN. Vẫn cần ghi sổ doanh thu và thông báo doanh thu năm.";
  } else {
    vat = rev * rate.vat / 100;
    if (rev <= 3e9) {
      group = 2;
      const pitRate = (rev - THRESHOLD) * rate.pit / 100;
      const pitIncome = income * 0.15;
      pit = Math.min(pitRate, pitIncome);
      rows.push([`TNCN theo tỷ lệ: (doanh thu − 1 tỷ) × ${String(rate.pit).replace(".", ",")}%`, money(pitRate)]);
      rows.push(["TNCN trên thu nhập: (doanh thu − chi phí) × 15%", money(pitIncome)]);
      hint = pitIncome < pitRate
        ? `Cách tính <strong>trên thu nhập</strong> có lợi hơn khoảng ${money(pitRate - pitIncome)}/năm, với điều kiện chi phí có đủ hóa đơn, chứng từ.`
        : `Cách tính <strong>theo tỷ lệ doanh thu</strong> có lợi hơn khoảng ${money(pitIncome - pitRate)}/năm và không cần chứng minh chi phí.`;
    } else if (rev <= 50e9) {
      group = 3;
      pit = income * 0.17;
      rows.push(["TNCN: (doanh thu − chi phí) × 17%", money(pit)]);
      hint = "Hộ phải ghi sổ chi phí đầy đủ và lưu hóa đơn, chứng từ để được trừ khi tính TNCN.";
    } else {
      group = 4;
      pit = income * 0.2;
      rows.push(["TNCN: (doanh thu − chi phí) × 20%", money(pit)]);
      hint = "Hộ khai thuế theo tháng và cần sổ kế toán đầy đủ.";
    }
  }
  const total = vat + pit;

  out.innerHTML = `
    <div class="result__group"><span class="badge">Nhóm ${group}</span><span class="muted">Doanh thu năm ${money(rev)}</span></div>
    <div class="result__rows">
      <div class="result__row"><span>Thuế GTGT (${String(rate.vat).replace(".", ",")}% × doanh thu)</span><b>${money(vat)}</b></div>
      ${rows.map(([a, b]) => `<div class="result__row"><span>${a}</span><b>${b}</b></div>`).join("")}
      <div class="result__row result__row--total"><span>Tổng thuế ước tính / năm</span><b>${money(total)}</b></div>
      ${total ? `<div class="result__row"><span>Bình quân mỗi quý</span><b>${money(total / 4)}</b></div>` : ""}
    </div>
    <p class="result__hint">${hint}</p>
    <a href="#lien-he" class="btn btn--amber" id="calcCta">Nhờ AZ kiểm tra số thuế này</a>`;
  out.dataset.summary = `Ngành: ${rate.name}; doanh thu năm ${money(rev)}; chi phí ${money(cost)}; nhóm ${group}; thuế ước tính ${money(total)}/năm.`;
  out.dataset.group = group;
}

[cRevenue, cCost].forEach((el) => el.addEventListener("input", () => { formatInput(el); calc(); }));
[cIndustry, cPeriod].forEach((el) => el.addEventListener("change", calc));
calc();

/* ---------- Đổ thông tin từ bảng giá / công cụ tính vào form ---------- */
const form = $("#leadForm");
const msg = $("#formMsg");
const revenueMap = { 1: "Đến 1 tỷ", 2: "1 – 3 tỷ", 3: "3 – 50 tỷ", 4: "Trên 50 tỷ" };

document.addEventListener("click", (e) => {
  const plan = e.target.closest("[data-plan]");
  if (plan) {
    form.note.value = `Tôi quan tâm ${plan.dataset.plan}.`;
    if (plan.dataset.service) form.service.value = plan.dataset.service;
  }
  if (e.target.closest("#calcCta")) {
    form.note.value = out.dataset.summary;
    form.revenue.value = revenueMap[out.dataset.group];
    form.industry.value = RATES.find((r) => r.id === cIndustry.value).name.split(" (")[0];
  }
});

/* ---------- Gửi form ---------- */
function setMsg(text, ok) {
  msg.innerHTML = text;
  msg.className = "form__msg " + (ok ? "is-ok" : "is-err");
}

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  const name = form.name.value.trim();
  const phone = form.phone.value.replace(/[^\d+]/g, "");
  form.name.setAttribute("aria-invalid", !name);
  const phoneOk = /^(\+84|0)\d{9,10}$/.test(phone);
  form.phone.setAttribute("aria-invalid", !phoneOk);
  if (!name) { setMsg("Vui lòng nhập họ tên.", false); form.name.focus(); return; }
  if (!phoneOk) { setMsg("Số điện thoại chưa đúng, ví dụ 0901 455 988.", false); form.phone.focus(); return; }

  const data = Object.fromEntries(new FormData(form));
  const text = [
    "YÊU CẦU TƯ VẤN KẾ TOÁN HỘ KINH DOANH",
    `Họ tên: ${data.name}`,
    `SĐT/Zalo: ${data.phone}`,
    `Ngành nghề: ${data.industry || "-"}`,
    `Doanh thu năm: ${data.revenue}`,
    `Dịch vụ: ${data.service}`,
    `Nội dung: ${data.note || "-"}`,
  ].join("\n");

  const btn = form.querySelector('button[type="submit"]');
  btn.disabled = true;

  if (FORM_ENDPOINT) {
    try {
      const res = await fetch(FORM_ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({ ...data, message: text }),
      });
      if (!res.ok) throw new Error(res.status);
      form.reset();
      setMsg("Đã nhận yêu cầu. AZ sẽ gọi lại cho bạn trong ngày làm việc.", true);
    } catch (_) {
      setMsg(`Chưa gửi được. Vui lòng gọi <a href="tel:${PHONE}">0901 455 988</a> hoặc nhắn Zalo.`, false);
    } finally {
      btn.disabled = false;
    }
    return;
  }

  // Không có máy chủ nhận form: chép nội dung, mời gửi qua Zalo hoặc email
  let copied = false;
  try { await navigator.clipboard.writeText(text); copied = true; } catch (_) { /* trình duyệt chặn */ }
  const mail = `mailto:${EMAIL}?subject=${encodeURIComponent("Yêu cầu tư vấn - " + data.name)}&body=${encodeURIComponent(text)}`;
  setMsg(
    `${copied ? "Đã chép nội dung yêu cầu. " : ""}Bấm để gửi cho AZ: ` +
    `<a href="https://zalo.me/${PHONE}" target="_blank" rel="noopener">Gửi qua Zalo</a>${copied ? " (dán nội dung vào tin nhắn)" : ""}` +
    ` hoặc <a href="${mail}">gửi email</a>.`,
    true
  );
  btn.disabled = false;
});

/* ---------- Năm ở footer ---------- */
$("#year").textContent = new Date().getFullYear();

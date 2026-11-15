# Website Kế toán nhanh AZ – Quy tắc & kiến trúc dự án

Website giới thiệu dịch vụ kế toán, kê khai thuế cho hộ kinh doanh và bán phần mềm MISA
(eShop, meInvoice, eSign, AMIS Kế toán HKD). Tên miền: dichvuketoanhokinhdoanh.com

## Thông tin thương hiệu (dùng thống nhất trên mọi trang)

| Mục | Giá trị |
|---|---|
| Tên | Dịch vụ kế toán nhanh AZ (logo: "Kế toán nhanh AZ") |
| Điện thoại / Zalo | 0901 455 988 (`tel:0901455988`, `https://zalo.me/0901455988`) |
| Email | ketoannhanhaz@gmail.com |
| Địa chỉ | 231-233 Lê Thánh Tôn, Phường Bến Thành, Thành phố Hồ Chí Minh, Việt Nam |
| Website | dichvuketoanhokinhdoanh.com |

Khi đổi thông tin liên hệ: sửa cả `docs/index.html` (header, liên hệ, footer, JSON-LD) và hằng số `PHONE`, `EMAIL` trong `docs/js/main.js`.

## Cấu trúc thư mục

```
Buoi1/
├── .claude/
│   ├── CLAUDE.md        # File này: quy tắc, kiến trúc
│   └── skills/tao-page/ # Skill /tao-page: SKILL.md + template/ (page.html, page.css, page.js)
├── docs/                # MÃ NGUỒN WEBSITE (thư mục duy nhất để sửa, cũng là thư mục deploy GitHub Pages)
│   ├── index.html       # Trang chủ một trang, các phần nối bằng anchor #id
│   ├── <slug>.html      # Các trang con tạo bằng /tao-page
│   ├── van-ban-phap-luat-ho-kinh-doanh.html  # Danh mục văn bản pháp luật HKD (dữ liệu: mảng DOCS trong js/pages/…, cập nhật 11/2026)
│   ├── css/style.css    # Giao diện dùng chung cho mọi trang
│   ├── css/pages/       # CSS riêng từng trang con (<slug>.css)
│   ├── js/main.js       # CHỈ cho trang chủ: dữ liệu (thuế, gói giá) + tương tác
│   ├── js/pages/        # JS riêng từng trang con (<slug>.js), không nạp main.js
│   ├── img/             # Ảnh, favicon
│   └── .nojekyll        # Để GitHub Pages phục vụ file tĩnh nguyên bản
├── backup/              # Bản cũ, chỉ để tham khảo, KHÔNG sửa, KHÔNG deploy
├── README.md
├── vercel.json          # Cấu hình Vercel: xuất bản thư mục docs/, không build
└── .gitignore
```

## Kiến trúc

- **Web tĩnh thuần** HTML + CSS + JavaScript, không framework, không bước build. Mở `docs/index.html` là chạy.
- Thư viện ngoài duy nhất: font Google "Be Vietnam Pro". Không thêm thư viện JS nếu không thật cần.
- **Các phần trang** (theo thứ tự, `id` dùng cho menu):
  hero → pain points → `#nhom-ho` → `#dich-vu` → `#phan-mem` → `#tinh-thue` → `#bang-gia` → `#quy-trinh` → cam kết → `#hoi-dap` → `#lien-he` → footer.
  Thêm phần mới thì thêm link tương ứng trong `<nav id="nav">` và footer nếu cần.
- **Dữ liệu nằm ở đầu `docs/js/main.js`**, sửa dữ liệu ở đó, không viết cứng vào HTML:
  - `RATES`: tỷ lệ % GTGT, TNCN theo nhóm ngành.
  - `GROUPS`: 4 nhóm hộ theo doanh thu (render vào `#groups`).
  - `PLANS`: 4 gói dịch vụ kế toán (render vào `#plans`).
  - `THRESHOLD`: ngưỡng doanh thu không chịu thuế (1 tỷ/năm).
- Phần phần mềm MISA, bảng dịch vụ lẻ, FAQ viết trực tiếp trong HTML.
- **Form liên hệ**: không có máy chủ. Nếu `FORM_ENDPOINT` trong `main.js` để trống, form chép nội dung và mời khách gửi qua Zalo/email. Muốn nhận tự động: dán URL Formspree / Google Apps Script vào `FORM_ENDPOINT`.
- Nút có `data-plan` (và `data-service`) sẽ tự điền form liên hệ khi bấm.

## Quy tắc nội dung

- Ngôn ngữ: tiếng Việt có dấu, văn phong ngắn gọn, xưng "AZ" – "bạn".
- **Bảng giá dịch vụ kế toán** (chỉ đổi khi chủ dự án yêu cầu):
  Nhóm 1 từ 500.000đ/tháng · Nhóm 2 từ 800.000đ/tháng · Nhóm 3 từ 1.500.000đ/tháng · Nhóm 4 liên hệ.
  Đổi giá thì cập nhật đồng thời: `PLANS`, ô số liệu ở hero, câu FAQ nhóm 1, `og:description`, `priceRange` trong JSON-LD.
- **KHÔNG cung cấp dịch vụ xin giấy phép con** (ATTP, PCCC, ANTT…). Không thêm lại vào trang.
- Chính sách thuế căn cứ: Nghị quyết 198/2025/QH15, NĐ 68/2026/NĐ-CP, NĐ 141/2026/NĐ-CP (bỏ thuế khoán từ 01/01/2026, ngưỡng 1 tỷ, 4 nhóm). Kết quả công cụ tính thuế luôn ghi là "ước tính, tham khảo".
- **Không bịa số liệu, cam kết, chứng nhận**: không viết số khách hàng, đánh giá, "đại lý chính thức MISA", giá phần mềm MISA… khi chủ dự án chưa cung cấp.
- Giữ dòng ghi chú: MISA eShop, meInvoice, eSign, AMIS là sản phẩm của Công ty Cổ phần MISA; giá theo bảng giá MISA.

## Quy tắc code

- **CSS**: dùng biến màu trong `:root` (`--green-700`, `--amber`, `--ink`, `--muted`…), không viết mã màu rời rạc cho thành phần thường.
  Tên class kiểu BEM rút gọn: `.khoi`, `.khoi__phan`, `.khoi--bien-the`.
- Nền "gradient huyền ảo": animation `aurora`, `float-a/b/c` ở `.hero`, `.section--dark`. Mọi animation mới phải tắt trong `@media (prefers-reduced-motion: reduce)`.
- **Responsive**: breakpoint 1080px (lưới 2 cột), 960px (menu thu gọn, 1 cột cho các khối 2 bên), 640px (mobile 1 cột). Không để trang cuộn ngang trên mobile.
- **JS**: chuỗi người dùng nhập/hoặc dữ liệu đưa vào `innerHTML` phải qua `esc()`. Định dạng tiền dùng `money()` (kiểu `1.000.000đ`).
- Truy cập: giữ `alt`/`aria-label`, `label` cho mọi ô nhập, focus nhìn thấy được.
- SEO: mỗi trang có `<title>`, `meta description`, `canonical`, Open Graph; cập nhật khi đổi nội dung chính.

## Quy trình làm việc

1. Chỉ sửa file trong `docs/`. Không sửa `backup/`.
2. Kiểm tra JS: `node --check docs/js/main.js`
3. Xem thử: mở `docs/index.html` bằng trình duyệt, hoặc chụp màn hình bằng Edge headless:
   `msedge --headless=new --window-size=1366,3000 --screenshot=out.png file:///d:/VideWeb02/Buoi1/docs/index.html`
   (Edge headless có độ rộng tối thiểu ~500px, kiểm tra mobile thật bằng DevTools.)
4. Deploy: `git push` lên nhánh `main` của https://github.com/phuongaztax/dichvuketoanhokinhdoanh
   - Vercel (project `dichvuketoanhokinhdoanh`, https://dichvuketoanhokinhdoanh.vercel.app) tự deploy theo `vercel.json`.
   - GitHub Pages (nếu bật): Settings → Pages → nhánh `main`, thư mục `/docs`.

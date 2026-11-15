---
name: tao-page
description: Tạo một trang web mới hoàn chỉnh (HTML + CSS + JS) cho website Kế toán nhanh AZ trong thư mục docs/, có banner, thông tin nổi bật, tiện ích/giá trị, khu vực kêu gọi hành động/liên hệ, responsive mọi thiết bị và JS tương tác. Dùng khi người dùng gõ /tao-page hoặc nhờ tạo trang/landing page mới.
argument-hint: "[mô tả trang, ví dụ: trang bán MISA eShop cho quán cà phê]"
---

# /tao-page: tạo trang mới cho website

Yêu cầu của người dùng: **$ARGUMENTS**

Nếu phần yêu cầu trống hoặc quá mơ hồ để biết trang nói về gì, hỏi lại **một câu ngắn** (trang về chủ đề gì, dành cho ai). Không hỏi gì thêm. Mọi chi tiết khác tự quyết theo các quy tắc dưới đây.

## Bước 1: Nắm quy tắc dự án

- Đọc `.claude/CLAUDE.md`. Thông tin thương hiệu, bảng giá, các điều cấm (không làm giấy phép con, không bịa số liệu, cam kết hay danh hiệu đại lý) **bắt buộc** tuân theo.
- Xem nhanh `docs/css/style.css` để dùng lại class có sẵn: `.container`, `.section`, `.section--alt`, `.section--dark`, `.section__head`, `.eyebrow`, `.btn--*`, `.card`, `.field`, `.field-row`, `.faq`, `.steps`, `.hero`, `.footer`, `.float`…

## Bước 2: Đặt tên

- `slug`: tiếng Việt không dấu, kebab-case, ngắn, chuẩn SEO. Ví dụ: `phan-mem-misa-eshop`, `ke-toan-quan-cafe`.
- Nếu `docs/<slug>.html` đã tồn tại thì báo người dùng và hỏi có ghi đè không. Không tự ghi đè.

## Bước 3: Tạo 3 file từ mẫu

Mẫu nằm cạnh file này: `template/page.html`, `template/page.css`, `template/page.js`.

| File tạo ra | Từ mẫu |
|---|---|
| `docs/<slug>.html` | `template/page.html` |
| `docs/css/pages/<slug>.css` | `template/page.css` |
| `docs/js/pages/<slug>.js` | `template/page.js` |

Thay mọi `{{...}}` bằng nội dung thật, viết riêng cho chủ đề. Không để sót placeholder.
Trang luôn nạp `css/style.css` (dùng chung) rồi mới tới CSS riêng của trang. Trang **không** nạp `js/main.js`, vì file đó chỉ dành cho trang chủ.

### Bố cục bắt buộc (theo thứ tự)

1. **Banner giới thiệu** (`.hero`, có nền gradient huyền ảo sẵn): eyebrow, H1 nêu rõ lợi ích, đoạn mô tả 1–2 câu, 2 nút (CTA chính → `#lien-he`, nút phụ → phần nội dung), 3 con số hoặc điểm nổi bật ngắn. Bên phải là một thẻ tóm tắt hợp chủ đề.
2. **Thông tin nổi bật** (`#noi-bat`): 3–4 điểm chính hoặc số liệu. Chỉ dùng số liệu có thật trong CLAUDE.md hay trang chủ, hoặc số liệu người dùng đưa. Có thể dùng `data-count` để số chạy.
3. **Tiện ích / giá trị** (`#gia-tri`): 4–6 thẻ có icon SVG nội tuyến, tiêu đề, mô tả.
4. **Nội dung chuyên sâu theo chủ đề**, chọn 1–2 khối phù hợp: tabs (`data-tabs`), bảng giá/so sánh, quy trình `.steps`, FAQ `.faq`.
5. **Kêu gọi hành động / liên hệ** (`#lien-he`): dải CTA nền `.section--dark`, rồi form liên hệ (họ tên, SĐT, nhu cầu, nội dung). Mục "nhu cầu" mặc định là chủ đề trang.
6. **Footer + nút Zalo/gọi nổi**: giữ nguyên như mẫu.

### Yêu cầu nội dung

- Tiếng Việt có dấu, xưng "AZ" – "bạn", câu ngắn, cụ thể cho đối tượng của trang.
- Viết đủ thẻ SEO: `<title>` (≤ 60 ký tự), `meta description` (≤ 160 ký tự), `canonical` `https://dichvuketoanhokinhdoanh.com/<slug>.html`, Open Graph.
- Nhắc tới phần mềm MISA thì giữ dòng ghi chú: sản phẩm của Công ty Cổ phần MISA, giá theo bảng giá MISA.
- Không bịa lời chứng thực, số khách hàng hay giá chưa được cung cấp. Thiếu thì ghi "Liên hệ báo giá".

### Yêu cầu kỹ thuật

- CSS riêng của trang chỉ chứa phần mới. Dùng biến màu `var(--...)` có sẵn, class BEM rút gọn và tiền tố riêng cho trang (ví dụ `.pg-...`) để tránh đụng CSS chung.
- Responsive theo các mốc 1080 / 960 / 640px. Trên mobile không được cuộn ngang. Animation mới phải tắt trong `prefers-reduced-motion`.
- JS dùng `template/page.js` làm khung: menu mobile, đánh dấu mục menu đang xem, hiện dần khi cuộn, đếm số, tabs, tự điền form từ nút `data-need`, kiểm tra và gửi form (Zalo/email hoặc `FORM_ENDPOINT`). Thêm tương tác riêng nếu chủ đề cần. Chuỗi người dùng nhập phải qua `esc()` trước khi đưa vào `innerHTML`.
- Truy cập: mọi ô nhập có `label`, nút chỉ có icon thì có `aria-label`, icon trang trí đặt `aria-hidden="true"`.

## Bước 4: Liên kết trang

- Thêm link tới trang mới trong cột "Dịch vụ" ở footer của `docs/index.html`. Nếu trang là dịch vụ chính thì thêm vào cả thẻ dịch vụ hoặc phần mềm liên quan trên trang chủ.
- Cập nhật mục "Cấu trúc thư mục" trong `.claude/CLAUDE.md`: thêm dòng cho `docs/<slug>.html`.

## Bước 5: Kiểm tra (bắt buộc trước khi báo xong)

1. `node --check docs/js/pages/<slug>.js`
2. Kiểm tra không còn `{{` trong 3 file mới.
3. Chụp màn hình bằng Edge headless ở 1366px và 600px, rồi đọc ảnh để soát bố cục:
   ```
   "C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe" --headless=new --disable-gpu --hide-scrollbars --window-size=1366,4000 --screenshot=<scratchpad>\<slug>-desk.png file:///d:/VideWeb02/Buoi1/docs/<slug>.html
   ```
   Có lỗi hiển thị (tràn ngang, chữ đè, khối trống) thì sửa rồi chụp lại.

## Bước 6: Báo cáo

Trả lời ngắn bằng tiếng Việt:
- Đường dẫn 3 file mới (dạng link markdown), cách mở thử.
- Các phần đã dựng và tương tác JS có trên trang.
- Những chỗ đang ghi "Liên hệ báo giá" hoặc cần người dùng cung cấp thông tin thật.

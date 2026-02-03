# 📅 Lộ trình xây dựng DevBounty Platform

## Giai đoạn 1: Khởi tạo & Hệ thống Quản trị (Tuần 1-2)
**Mục tiêu:** Xây dựng nền móng vững chắc cho User và Database.

*   **Backend (NodeJS/Express):**
    *   Thiết lập cấu trúc thư mục (MVC hoặc Clean Architecture).
    *   Kết nối MongoDB/PostgreSQL.
    *   Hệ thống Auth: Sử dụng **Firebase Auth** hoặc **Web3Auth** (để tạo ví từ Gmail như bạn mong muốn).
    *   API quản lý User Profile (nhiều Role).

*   **Frontend (ReactJS + Tailwind):**
    *   Thiết lập Layout cơ bản (Navbar, Sidebar).
    *   Trang Register/Login với logic chọn Role.

*   **Database Schema:** Thiết kế bảng `User`, `Issue`, `Application`.

## Giai đoạn 2: Marketplace & Luồng Công việc (Tuần 3)
**Mục tiêu:** Hoàn thiện tính năng cốt lõi của một sàn Job.

*   **Tính năng Post Job:** Form tạo Issue (Tiêu đề, Mô tả, Tag mảng kỹ thuật, Ngân sách).
*   **Marketplace UI:** Trang danh sách các Issue với bộ lọc (Filter) theo Category, Salary, Status.
*   **Logic Apply:** Dev nhấn "Nhận job" -> Client nhận thông báo (tích hợp **Nodemailer**).
*   **Confirm Job:** Client duyệt Dev -> Trạng thái Issue chuyển sang `Ongoing`.

## Giai đoạn 3: Chatbox Real-time & "AI Guard" (Tuần 4)
**Mục tiêu:** Phô diễn kỹ năng xử lý dữ liệu thực tế và bảo mật.

*   **Real-time Chat:** Sử dụng **Socket.io** để tạo phòng chat riêng cho từng Job.
*   **AI Integration (Cực quan trọng cho CV):**
    *   Viết Middleware ở Backend bắt sự kiện gửi file/tin nhắn.
    *   Gửi nội dung sang **OpenAI API (Moderation)** để check nội dung xấu.
    *   Viết hàm Regex quét các file nhạy cảm (`.env`, `private_key`).

*   **UI/UX:** Tích hợp `react-dropzone` để kéo thả file và `Monaco Editor` để xem code ngay trong chat.

## Giai đoạn 4: Blockchain Escrow & Smart Contract (Tuần 5)
**Mục tiêu:** Tích hợp tính năng thanh toán minh bạch.

*   **Solana/Rust (Anchor):**
    *   Viết Program đơn giản: `create_escrow` (khóa tiền), `release_funds` (trả tiền cho dev), `refund` (trả lại client).

*   **Web3 Integration:**
    *   Sử dụng `@solana/web3.js` ở Backend để gọi các hàm Smart Contract.
    *   Xử lý logic "Ví Admin": Nếu User trả tiền mặt (Fiat), Backend dùng ví Admin để thực hiện lệnh `create_escrow`.

*   **Transaction History:** Lưu vết các giao dịch (TxHash) vào Database để đối soát.

## Giai đoạn 5: GitHub Automation (Tuần 6)
**Mục tiêu:** Tự động hóa và tăng tính chuyên nghiệp.

*   **GitHub API:** Cho phép Client dán link Repo.
*   **Webhook:** Thiết lập Webhook từ GitHub gửi về NodeJS.
*   **Automated Payment:** Khi có sự kiện `pull_request.merged`, Backend kiểm tra nếu đúng Dev đó làm -> Gọi Smart Contract giải ngân tiền tự động.

## Giai đoạn 6: Hoàn thiện & Deployment (Tuần 7)
**Mục tiêu:** Tối ưu hóa và đưa sản phẩm lên môi trường thực tế.

*   **Testing:** Test luồng thanh toán và bảo mật AI.
*   **Deployment:**
    *   Frontend: **Vercel**.
    *   Backend: **Render** hoặc **Railway**.
    *   Database: **MongoDB Atlas**.

*   **Tài liệu (README):** Viết file README cực chất, có sơ đồ hệ thống, video demo và hướng dẫn cài đặt.

---

## 🛠 Bộ công cụ (Tech Stack) đề xuất

| Tầng | Công nghệ |
| --- | --- |
| **Frontend** | ReactJS, TailwindCSS, Framer Motion (hiệu ứng). |
| **Backend** | NodeJS, ExpressJS, Socket.io (chat), Multer (upload file). |
| **Database** | MongoDB (linh hoạt cho metadata) hoặc PostgreSQL. |
| **Blockchain** | Solana (Anchor Framework), Rust. |
| **AI** | OpenAI API (GPT-4o cho phân tích, Moderation cho lọc nội dung). |
| **DevOps** | Docker (nếu muốn nâng cao), GitHub Actions. |

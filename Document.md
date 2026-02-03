Đây là bản tài liệu đặc tả dự án (Project Specification Document) được biên soạn chuyên nghiệp để bạn có thể đóng gói vào hồ sơ năng lực hoặc nộp cho các nền tảng như Antigravity.

Tài liệu này tập trung vào tính kỹ thuật, tư duy giải quyết vấn đề và sự kết hợp giữa Web2 - Web3.

---

# PROJECT SPECIFICATION: BLOODY-ROAR PLATFORM

**Tagline:** *Secure Code. Transparent Payments. AI-Powered.*

---

## 1. TỔNG QUAN DỰ ÁN (PROJECT OVERVIEW)

**Bloody-Roar Platform** là một nền tảng Web3 Bug Bounty và Freelance dành riêng cho cộng đồng lập trình viên. Dự án giải quyết vấn đề niềm tin giữa người thuê (Client) và người làm (Developer) thông qua cơ chế thanh toán minh bạch bằng Smart Contract và bảo mật mã nguồn bằng AI.

### 1.1. Vấn đề giải quyết (Problem Statement)

* **Thiếu tin tưởng:** Rủi ro quỵt tiền hoặc code không đạt chất lượng.
* **Rò rỉ dữ liệu:** Nguy cơ lộ Secret Keys, API Keys khi chia sẻ mã nguồn.
* **Rào cản Crypto:** Người dùng truyền thống khó tiếp cận các nền tảng Web3 do phức tạp trong quản lý ví.

### 1.2. Giải pháp (The Solution)

* Sử dụng **Smart Contract Escrow** để giữ tiền trung gian.
* Tích hợp **AI Scanner** quét nội dung hội thoại và tệp tin độc hại.
* Áp dụng **Account Abstraction** giúp tạo ví Web3 qua Email/Social Login.

---

## 2. KIẾN TRÚC HỆ THỐNG (SYSTEM ARCHITECTURE)

### 2.1. Tech Stack

* **Frontend:** ReactJS, TailwindCSS, Socket.io-client, Solana Wallet Adapter.
* **Backend:** NodeJS (Express), MongoDB, Mongoose, JWT, Socket.io, Nodemailer.
* **Blockchain:** Solana (Anchor Framework, Rust), Web3Auth.
* **AI Integration:** OpenAI API (Content Moderation & GPT-4o-mini).
* **Integration:** GitHub API & Webhooks.

---

## 3. CÁC TÍNH NĂNG CỐT LÕI (CORE FEATURES)

### 3.1. Hybrid Authentication & Multi-Role

* Hỗ trợ đăng nhập qua Google (Web3Auth) tự động tạo ví ẩn.
* Phân quyền linh hoạt: Client (Người thuê), Developer (Người sửa lỗi), Tutor (Gia sư).

### 3.2. AI-Guard Smart Chatbox

* Hệ thống Chat Real-time hỗ trợ trao đổi mã nguồn trực tiếp.
* **AI Middleware:** Tự động quét và chặn các tin nhắn/file chứa mã độc, nội dung nhạy cảm hoặc Secret Keys (`.env`, `private_key`).
* Tích hợp trình đọc code (Monaco Editor) ngay trong giao diện chat.

### 3.3. Blockchain Escrow & Automated Payment

* Tiền thưởng được khóa trong Smart Contract ngay khi bắt đầu công việc.
* **GitHub Hook Integration:** Hệ thống tự động giải ngân tiền từ Smart Contract cho Developer ngay khi Pull Request được Client Merge thành công.
* Hỗ trợ thanh toán Fiat-to-Crypto cho người dùng không rành tiền điện tử.

---

## 4. THIẾT KẾ CƠ SỞ DỮ LIỆU (DATABASE SCHEMA)

* **Users:** Quản lý định danh, ví và điểm uy tín (Reputation).
* **Issues:** Lưu trữ thông tin lỗi, ngân sách, trạng thái và mối liên kết GitHub.
* **Applications:** Quản lý danh sách các Developer ứng tuyển cho một lỗi.
* **Messages:** Lưu vết hội thoại với cờ đánh dấu vi phạm từ AI (isFlagged).

---

## 5. LỘ TRÌNH PHÁT TRIỂN (ROADMAP)

1. **Phase 1 (Week 1-2):** Xây dựng Core Auth, Schema và hệ thống Quản lý Issue.
2. **Phase 2 (Week 3-4):** Hoàn thiện Chatbox Real-time tích hợp AI Guard.
3. **Phase 3 (Week 5-6):** Triển khai Smart Contract Escrow trên Solana Devnet và kết nối GitHub Webhook.
4. **Phase 4 (Week 7-8):** Testing, Tối ưu UX và Deploy lên môi trường Production.

---

## 6. TẦM NHÌN DỰ ÁN (VISION)

Bloody-Roar không chỉ là một công cụ hỗ trợ fix bug, mà hướng tới trở thành một hệ sinh thái Proof-of-Work cho Developer, nơi mọi dòng code chất lượng đều được ghi nhận on-chain và thanh toán sòng phẳng.

---

**Người thực hiện:** [Tên của bạn]
**Vai trò:** Fullstack Developer (NodeJS/ReactJS/Blockchain)

---

**Bạn có muốn tôi hỗ trợ thêm phần nào trong file document này không (ví dụ: chi tiết hơn về phần bảo mật AI hoặc cách thức hoạt động của Smart Contract)?**
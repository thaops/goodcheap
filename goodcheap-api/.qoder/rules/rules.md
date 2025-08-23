---
trigger: always
---
# Project Rules – Always Apply

## 0) Ngôn ngữ / Language
- **VN:** Mặc định trả lời bằng tiếng Việt. Giữ nguyên tên kỹ thuật (package, API, class, file path) bằng tiếng Anh. Code đặt tên bằng **English**; phần giải thích/bình luận bằng **Vietnamese**.
- **EN:** Default answers in Vietnamese. Keep technical terms (package, API, class, file path) in English. Code naming in English; explanations/comments in Vietnamese.

---

## 1) Ngữ cảnh & Ưu tiên / Context & Priority

### Mobile App
- Flutter (stable)
- Riverpod v3
- Clean Architecture (feature-based)

### Backend
- NestJS (Node 20 LTS)
- pnpm
- Zod
- BullMQ
- got
- Redis
- PostgreSQL (prefer Prisma)

---

## 2) Nguyên tắc Fix Bug Hiệu Quả / Effective Debugging Principles

### 🔹 2.1 Xác định rõ triệu chứng / Identify Symptoms Clearly
- VN: Mô tả bug cụ thể (when/where/expected vs actual). Luôn log state/biến tại thời điểm lỗi.  
- EN: Describe the bug clearly (when/where/expected vs actual). Always log state/variables at the error point.

### 🔹 2.2 Tái hiện & thu hẹp phạm vi / Reproduce & Narrow Scope
- VN: Luôn tái hiện bug theo cách đơn giản nhất. Tách nhỏ thành từng module để xác định phạm vi lỗi.  
- EN: Always reproduce the bug in the simplest way. Isolate into smaller modules to narrow down the scope.

### 🔹 2.3 Giả thuyết & kiểm chứng / Hypothesis & Verification
- VN: Đưa ra giả thuyết (logic/API/UI/state). Thêm log/debugger để kiểm chứng, loại bỏ giả thuyết sai.  
- EN: Form hypotheses (logic/API/UI/state). Add logs/debugger to verify and eliminate wrong assumptions.

### 🔹 2.4 Tìm nguyên nhân gốc / Find Root Cause
- VN: Không chỉ fix ở chỗ crash → phải tìm gốc gây lỗi. So sánh expected vs actual tại từng bước.  
- EN: Don’t just fix where it crashes → find the root cause. Compare expected vs actual at each step.

### 🔹 2.5 Fix + Phòng ngừa tái phát / Fix + Prevent Recurrence
- VN: Viết test case (unit/integration) hoặc automation test. Ghi chú lại nguyên nhân → để sau này không lặp lại.  
- EN: Write test cases (unit/integration) or automation tests. Document root causes to prevent recurrence.

### 🔹 2.6 Mindset khi fix bug / Debugging Mindset
- VN: Không đoán mò, mọi thay đổi phải có kiểm chứng. Chia nhỏ vấn đề, loại trừ dần. Luôn nghĩ theo hệ thống: bug ở đây có ảnh hưởng nơi khác không? Fix 1 lần cho triệt để.  
- EN: Avoid guessing; every change must be verified. Break problems into smaller parts, eliminate step by step. Always think system-wide: does this bug affect other areas? Fix once, fix thoroughly.

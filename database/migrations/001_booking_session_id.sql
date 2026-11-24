-- Chạy file này 1 lần nếu database của bạn đã được tạo từ cinema_db-3.sql bản CŨ
-- (bản mới của cinema_db-3.sql đã có sẵn 2 thay đổi dưới đây).
--
-- Vì sao cần? Trang chọn ghế giữ ghế bằng bảng booking (status = 'HOLDING').
-- Khách vãng lai chưa có UserID, nên cần một cột để biết booking HOLDING này
-- thuộc về trình duyệt nào -> session_id = clientId mà FE lưu trong localStorage.
USE cinema_db;

ALTER TABLE booking
  ADD COLUMN session_id VARCHAR(64) NULL AFTER ClientID,
  ADD INDEX idx_booking_session (session_id, ShowtimeID, status);

ALTER USER 'root'@'localhost' IDENTIFIED BY '';
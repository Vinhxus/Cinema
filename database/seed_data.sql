-- ============================================================================
-- SENEMA CINEMA BOOKING SYSTEM - COMPLETE SEED DATA (MySQL 8.0+)
-- Tương thích 100% với schema cinema_db-3_2.sql
-- Không dùng DELIMITER -> Chạy được trên cả MySQL Workbench, CLI và Node.js (mysql2)
-- ĐÃ FIX LỖI: Đồng bộ ShowtimeID thông qua SlotOrder
-- ============================================================================

USE cinema_db;

SET FOREIGN_KEY_CHECKS = 0;

TRUNCATE TABLE audit_logs;
TRUNCATE TABLE refunds;
TRUNCATE TABLE ticket;
TRUNCATE TABLE payment;
TRUNCATE TABLE order_item;
TRUNCATE TABLE order_seats;
TRUNCATE TABLE booking;
TRUNCATE TABLE showtimes;
TRUNCATE TABLE seats;
TRUNCATE TABLE seat_types;
TRUNCATE TABLE products;
TRUNCATE TABLE rooms;
TRUNCATE TABLE cinemas;
TRUNCATE TABLE movies;
TRUNCATE TABLE users;

SET FOREIGN_KEY_CHECKS = 1;

-- ============================================================================
-- 1. SEAT TYPES (Loại ghế)
-- ============================================================================
INSERT INTO seat_types (SeatTypeID, TypeCode, TypeName, BasePrice, Surcharge, SeatsPerUnit) VALUES
(1, 'standard', 'Standard', 110000.00, 0.00, 1),
(2, 'vip', 'VIP', 130000.00, 20000.00, 1),
(3, 'couple', 'Sweetbox / Couple', 280000.00, 60000.00, 2);

-- ============================================================================
-- 2. USERS (Mật khẩu mẫu đều là: Password@123)
-- ============================================================================
INSERT INTO users (UserID, name, phone_number, mail, hashed_password, UserType, cine_points, tier, birthdate) VALUES
(1, 'System Admin', '0900000001', 'admin@senema.vn', '$2b$10$2G7pbub9uTYYR1V98QYKxO1POesbik5Qz6cfjcxHSFhd4Ep6HNJRi', 'ADMIN', 0, 'VIP', '1995-05-15'),
(2, 'Nguyễn Minh (Staff Q1)', '0900000002', 'minh.staff@senema.vn', '$2b$10$2G7pbub9uTYYR1V98QYKxO1POesbik5Qz6cfjcxHSFhd4Ep6HNJRi', 'STAFF', 0, 'STANDARD', '2000-08-20'),
(3, 'Lê Hoàng Nam (Staff LM81)', '0900000003', 'nam.staff@senema.vn', '$2b$10$2G7pbub9uTYYR1V98QYKxO1POesbik5Qz6cfjcxHSFhd4Ep6HNJRi', 'STAFF', 0, 'STANDARD', '2001-02-10'),
(4, 'Alex Nguyen', '0912345678', 'alex.nguyen@example.com', '$2b$10$2G7pbub9uTYYR1V98QYKxO1POesbik5Qz6cfjcxHSFhd4Ep6HNJRi', 'CUSTOMER', 320, 'GOLD', '2003-09-12'),
(5, 'Trần Anh Thư', '0901234568', 'thu.tran@example.com', '$2b$10$2G7pbub9uTYYR1V98QYKxO1POesbik5Qz6cfjcxHSFhd4Ep6HNJRi', 'CUSTOMER', 150, 'SILVER', '2004-11-25'),
(6, 'Phạm Gia Bảo', '0987654321', 'bao.pham@example.com', '$2b$10$2G7pbub9uTYYR1V98QYKxO1POesbik5Qz6cfjcxHSFhd4Ep6HNJRi', 'CUSTOMER', 50, 'STANDARD', '2005-04-03');

-- ============================================================================
-- 3. CINEMAS (Cụm rạp SENEMA)
-- ============================================================================
INSERT INTO cinemas (CinemaID, Slug, CinemaName, Branch, Address, City, DistanceLabel, Perk, MapUrl) VALUES
(1, 'senema-nguyen-du', 'SENEMA Nguyễn Du', 'Standard 2D', '116 Nguyễn Du, Phường Bến Thành, Quận 1, TP.HCM', 'Ho Chi Minh City', '1.2km away', 'Central Location', 'https://maps.google.com/?q=116+Nguyen+Du+Ho+Chi+Minh'),
(2, 'senema-landmark-81', 'SENEMA Landmark 81', 'IMAX Laser', 'Tầng B1, Vincom Center Landmark 81, 720A Điện Biên Phủ, Bình Thạnh, TP.HCM', 'Ho Chi Minh City', '1.8km away', 'Next-Gen Laser Projector', 'https://maps.google.com/?q=Vincom+Center+Landmark+81+Ho+Chi+Minh'),
(3, 'senema-premium-lounge', 'SENEMA Premium Lounge', 'Gold Class', '151 Đồng Khởi, Phường Bến Nghé, Quận 1, TP.HCM', 'Ho Chi Minh City', '3.2km away', 'Includes Welcome Drink', 'https://maps.google.com/?q=Dong+Khoi+District+1+Ho+Chi+Minh');

-- ============================================================================
-- 4. ROOMS (Phòng chiếu - Capacity khớp 100% số ghế generate bên dưới)
-- ============================================================================
INSERT INTO rooms (RoomID, CinemaID, RoomNumber, RoomType, FormatDescription, HallNote, Capacity, Status) VALUES
(1, 1, 'Screen 01', '2D', '2D Original Audio with Vietnamese Subtitles', 'Standard 2D', 100, 'READY'),
(2, 1, 'Screen 02', '2D', '2D Original Audio with Vietnamese Subtitles', 'Standard 2D', 96, 'READY'),
(3, 1, 'Screen 03', '2D', '2D Original Audio with Vietnamese Subtitles', 'Standard 2D', 88, 'READY'),
(4, 1, 'Screen 04', '2D', '2D Original Audio with Vietnamese Subtitles', 'Standard 2D', 80, 'READY'),
(5, 2, 'Hall 01', 'IMAX Laser 2D', 'IMAX Laser 2D • Original Audio with Vietnamese Subtitles', '4K Laser', 100, 'READY'),
(6, 2, 'Hall 02', 'IMAX Laser 2D', 'IMAX Laser 2D • Original Audio with Vietnamese Subtitles', 'IMAX Laser', 100, 'READY'),
(7, 2, 'Hall 03', 'IMAX Laser 2D', 'IMAX Laser 2D • Original Audio with Vietnamese Subtitles', 'IMAX Laser', 100, 'READY'),
(8, 3, 'Gold Suite', '3D Dolby Atmos', '3D Dolby Atmos VIP Suites • Free Lounge Access', 'Butler Service', 100, 'READY');

-- ============================================================================
-- 5. MOVIES (Đầy đủ NOW_SHOWING, COMING_SOON, ENDED + TrailerUrl)
-- ============================================================================
INSERT INTO movies (MovieID, Code, Title, Subtitle, Tagline, Description, Genre, Duration, ReleaseDate, AgeRating, AgeNotice, Language, Formats, ImdbScore, AudienceScore, PosterUrl, BackdropUrl, TrailerUrl, Director, Starring, Status) VALUES
(1, 'PH001', 'Dune: Hành Tinh Cát 2', 'Dune: Part Two', 'Long live the fighters.', 'Paul Atreides unites with Chani and the Fremen while seeking revenge against the conspirators who destroyed his family.', 'Science Fiction', 166, '2026-10-15', 'T18', 'Phim dành cho khán giả từ đủ 18 tuổi trở lên (T18). Vui lòng xuất trình CCCD khi soát vé.', 'English with Vietnamese Subtitles', '2D • IMAX', 8.9, 9.1, '/assets/dune.png', '/assets/dune.png', 'https://www.youtube.com/embed/Way9Dexny3w', 'Denis Villeneuve', 'Timothée Chalamet, Zendaya, Rebecca Ferguson, Austin Butler', 'NOW_SHOWING'),
(2, 'PH002', 'Mai', 'A Film by Tran Thanh', 'Quá khứ chưa ngủ yên, ngày mai liệu sẽ đến?', 'Câu chuyện tâm lý tình cảm sâu sắc về cuộc đời của Mai và những góc khuất sau cánh cửa chung cư.', 'Psychological / Romantic', 131, '2026-10-20', 'T18', 'Phim được phổ biến đến người xem từ đủ 18 tuổi trở lên (T18).', 'Vietnamese', '2D', 8.1, 8.6, '/assets/Mai.jpg', '/assets/Mai.jpg', 'https://www.youtube.com/embed/Yz96EBNwMGw', 'Trấn Thành', 'Phương Anh Đào, Tuấn Trần, Hồng Đào', 'NOW_SHOWING'),
(3, 'PH003', 'Lật Mặt 7: Một Điều Ước', 'Face Off 7', 'Một điều ước, ngàn yêu thương.', 'Hành trình cảm động về tình mẫu tử và gia đình của bà Hai cùng 5 người con.', 'Psychological / Romantic', 138, '2026-10-25', 'T13', 'Phim được phổ biến đến người xem từ đủ 13 tuổi trở lên (T13).', 'Vietnamese', '2D', 8.5, 8.8, '/assets/conan.jpg', '/assets/conan.jpg', 'https://www.youtube.com/embed/25pO23X00wE', 'Lý Hải', 'Thanh Hiền, Trương Minh Cường, Đinh Y Nhung', 'NOW_SHOWING'),
(4, 'PH004', 'Đào, Phở và Piano', 'Dao, Pho and Piano', 'Khúc tráng ca mùa đông Hà Nội 1946.', 'Bối cảnh Hà Nội mùa đông năm 1946 trong cuộc chiến bảo vệ Thủ đô.', 'Action', 100, '2026-10-10', 'T13', 'Phim được phổ biến đến người xem từ đủ 13 tuổi trở lên (T13).', 'Vietnamese', '2D', 8.0, 8.3, '/assets/oppenheimer.jpg', '/assets/oppenheimer.jpg', 'https://www.youtube.com/embed/uYPbbksJxIg', 'Phi Tiến Sơn', 'Doãn Quốc Đam, Cao Thị Thùy Linh', 'NOW_SHOWING'),
(5, 'PH005', 'Godzilla x Kong: Đế Chế Mới', 'The New Empire', 'Rise together or fall alone.', 'Hai thực thể cổ đại Godzilla và Kong hợp sức chống lại mối đe dọa khổng lồ ẩn sâu trong lòng đất.', 'Action', 115, '2026-10-28', 'T13', 'Phim được phổ biến đến người xem từ đủ 13 tuổi trở lên (T13).', 'English with Vietnamese Subtitles', '3D • 4DX', 8.4, 8.5, '/assets/kong.jpg', '/assets/kong.jpg', 'https://www.youtube.com/embed/lV1OOlGwExM', 'Adam Wingard', 'Rebecca Hall, Brian Tyree Henry, Dan Stevens', 'NOW_SHOWING'),
(6, 'PH006', 'Exhuma: Quật Mộ Trùng Ma', 'Pamyo', 'Có những ngôi mộ không nên đụng vào.', 'Hai pháp sư, một thầy phong thủy và một chuyên gia khâm liệm cùng khai quật ngôi mộ cổ bí ẩn.', 'Horror / Mystery', 134, '2026-11-01', 'T18', 'Phim được phổ biến đến người xem từ đủ 18 tuổi trở lên (T18).', 'Korean with Vietnamese Subtitles', '2D', 8.7, 8.9, '/assets/exhuma.jpg', '/assets/exhuma.jpg', 'https://www.youtube.com/embed/rjW9E1BR_30', 'Jang Jae-hyun', 'Choi Min-sik, Kim Go-eun, Yoo Hae-jin, Lee Do-hyun', 'NOW_SHOWING'),
(7, 'PH007', 'Deadpool & Wolverine', 'Marvel Studios', 'Come together.', 'Wolverine đang hồi phục sau chấn thương thì bất ngờ chạm trán tên lính đánh thuê lắm mồm Deadpool.', 'Action', 127, '2026-11-05', 'T18', 'Phim được phổ biến đến người xem từ đủ 18 tuổi trở lên (T18).', 'English with Vietnamese Subtitles', '3D • 4DX • IMAX', 8.8, 9.0, '/assets/deadpool.jpg', '/assets/deadpool.jpg', 'https://www.youtube.com/embed/73_1biulkYk', 'Shawn Levy', 'Ryan Reynolds, Hugh Jackman, Emma Corrin', 'NOW_SHOWING'),
(8, 'PH008', 'Kung Fu Panda 4', 'DreamWorks Animation', 'Bậc thầy trở lại.', 'Po chuẩn bị trở thành Thủ lĩnh Tinh thần của Thung lũng Bình Yên và tìm người kế vị Thần Long Đại Hiệp.', 'Animation / Anime', 94, DATE_ADD(CURDATE(), INTERVAL 7 DAY), 'P', 'Phim được phép phổ biến đến người xem ở mọi độ tuổi (P).', 'English / Vietnamese Dub', '2D • 3D', 8.2, 8.4, '/assets/panda.jpg', '/assets/panda.jpg', 'https://www.youtube.com/embed/_inKs4eeHiI', 'Mike Mitchell', 'Jack Black, Awkwafina, Viola Davis', 'COMING_SOON'),
(9, 'PH009', 'Những Mảnh Ghép Cảm Xúc 2', 'Disney Pixar Inside Out 2', 'Make room for new emotions.', 'Những cảm xúc mới như Lo Âu, Ganh Tị, Chán Nản xuất hiện khi Riley chính thức bước vào tuổi dậy thì.', 'Animation / Anime', 96, DATE_ADD(CURDATE(), INTERVAL 14 DAY), 'P', 'Phim được phép phổ biến đến người xem ở mọi độ tuổi (P).', 'English / Vietnamese Dub', '2D', 8.9, 9.2, '/assets/insideout2.jpg', '/assets/insideout2.jpg', 'https://www.youtube.com/embed/LEjhY15eCx0', 'Kelsey Mann', 'Amy Poehler, Maya Hawke, Kensington Tallman', 'COMING_SOON'),
(10, 'PH010', 'Furiosa: Câu Chuyện Từ Max Điên', 'A Mad Max Saga', 'Fury is born.', 'Khi thế giới sụp đổ, Furiosa trẻ tuổi bị bắt cóc khỏi Vùng Xanh và rơi vào tay một Băng Đảng Mô Tô Vĩ Đại.', 'Action', 148, DATE_ADD(CURDATE(), INTERVAL 21 DAY), 'T18', 'Phim được phổ biến đến người xem từ đủ 18 tuổi trở lên (T18).', 'English with Vietnamese Subtitles', 'IMAX • 2D', 8.5, 8.6, '/assets/furiosa.jpg', '/assets/furiosa.jpg', 'https://www.youtube.com/embed/XJMuhwVlca4', 'George Miller', 'Anya Taylor-Joy, Chris Hemsworth', 'COMING_SOON'),
(11, 'PH011', 'Oppenheimer (Suất Chiếu Đặc Biệt)', 'Special Re-release', 'The world forever changes.', 'Câu chuyện về nhà vật lý lý thuyết J. Robert Oppenheimer và dự án Manhattan.', 'Drama / History', 180, '2026-08-01', 'T16', 'Phim phổ biến đến khán giả từ đủ 16 tuổi trở lên (T16).', 'English with Vietnamese Subtitles', 'IMAX', 8.6, 8.8, '/assets/oppenheimer.jpg', '/assets/oppenheimer.jpg', 'https://www.youtube.com/embed/uYPbbksJxIg', 'Christopher Nolan', 'Cillian Murphy, Emily Blunt, Matt Damon', 'ENDED');

-- ============================================================================
-- 6. PRODUCTS (Combo bắp nước F&B)
-- ============================================================================
INSERT INTO products (ProductID, Code, Name, Summary, Description, Image, Price, Category, Tags, Badges, IsActive) VALUES
(1, 'super-star', 'Super Star Combo', '85oz Caramel + 2 Large Cokes', '1x Large Sweet Caramel Popcorn (85oz) + 2x Large Soft Drinks (32oz Coke/Sprite) + 1x Pack Crispy M&Ms Chocolate.', '/assets/combo-superstar.png', 115000.00, 'popcorn', '["Caramel", "For 2 People", "Free Refill"]', '[{"label": "BEST SELLER", "className": "bg-red-600 text-white"}, {"label": "Save 20%", "className": "bg-amber-500 text-[#451a03]"}]', TRUE),
(2, 'solo', 'Solo Moviegoer Combo', '60oz Mixed Popcorn + Medium Drink', '1x Medium Salted & Cheese Mixed Popcorn (60oz) + 1x Medium Chilled Drink (22oz Coke, Sprite, or Fanta).', '/assets/combo-solo.png', 85000.00, 'popcorn', '["Cheese & Salt", "Single Serving"]', '[{"label": "Solo Pick", "className": "bg-gray-800 text-white"}]', TRUE),
(3, 'golden-vip', 'SENEMA Golden VIP Combo', 'Truffle Popcorn + 2 Mocktails + Nachos', '1x Truffle & Sea Salt Gourmet Popcorn Tub + 2x Premium Bottled Mocktails / Juices + Gourmet Nachos with warm cheddar cheese dip.', '/assets/combo-vip.png', 185000.00, 'signature', '["Black Truffle", "Artisan Drinks", "VIP Lounges"]', '[{"label": "Premium Gold", "className": "bg-amber-500 text-[#451a03]"}, {"label": "Chef Curated", "className": "bg-amber-100 text-[#451a03]"}]', TRUE),
(4, 'dune-tub', 'Dune: Spice Planet Exclusive Tub', 'Sandworm Tin + 2 Tumblers', 'Limited Edition Sandworm Souvenir Popcorn Tin + 2x Collectible Character Tumblers with reusable stainless straws.', '/assets/combo-dune.png', 210000.00, 'signature', '["Spiced Caramel", "Metal Tin", "Last 14 Sets"]', '[{"label": "Limited Edition", "className": "bg-red-600 text-white"}, {"label": "Collectible", "className": "bg-amber-500 text-[#451a03]"}]', TRUE),
(5, 'nachos', 'Crispy Nachos & Cheese Platter', 'Nachos + Cheddar Fondue + Salsa', 'Warm corn tortilla chips, spicy sliced jalapeño peppers, double-portion hot cheddar fondue & zesty salsa dip.', '/assets/snack-nachos.png', 75000.00, 'snacks', '["Cheddar Fondue", "Salsa Fresca", "Served Hot"]', '[{"label": "Hot & Crisp", "className": "bg-orange-600 text-white"}]', TRUE),
(6, 'sausage', 'Sausage Duo & Soda', '2 Bratwurst + Large Beverage', '2x Char-grilled German Bratwurst pork sausages with whole-grain honey mustard + 1x Large Fountain Beverage (32oz).', '/assets/snack-sausage.png', 95000.00, 'snacks', '["Grilled", "High Protein"]', '[{"label": "Savory Snack", "className": "bg-amber-700 text-white"}]', TRUE);

-- ============================================================================
-- 7. SEATS (Sinh tự động bằng WITH RECURSIVE - Khớp chính xác Capacity từng phòng)
-- ============================================================================
-- Room 1 (100 ghế): Hàng A-H (8x12 = 96) + Hàng I (4 ghế đôi = 4)
INSERT INTO seats (RoomID, SeatTypeID, SeatRow, SeatNumber, SeatLabel, IsActive)
WITH RECURSIVE r_seq AS (SELECT 1 AS r UNION ALL SELECT r + 1 FROM r_seq WHERE r < 8),
               c_seq AS (SELECT 1 AS c UNION ALL SELECT c + 1 FROM c_seq WHERE c < 12)
SELECT 1, IF(r >= 5, 2, 1), ELT(r, 'A','B','C','D','E','F','G','H'), c,
       CONCAT(ELT(r, 'A','B','C','D','E','F','G','H'), LPAD(c, 2, '0')), TRUE
FROM r_seq CROSS JOIN c_seq
ORDER BY r, c;

INSERT INTO seats (RoomID, SeatTypeID, SeatRow, SeatNumber, SeatLabel, IsActive) VALUES
(1, 3, 'I', 1, 'I01-02', TRUE),
(1, 3, 'I', 3, 'I03-04', TRUE),
(1, 3, 'I', 5, 'I05-06', TRUE),
(1, 3, 'I', 7, 'I07-08', TRUE);

-- Room 2 (96 ghế): Hàng A-H (8x12 = 96)
INSERT INTO seats (RoomID, SeatTypeID, SeatRow, SeatNumber, SeatLabel, IsActive)
WITH RECURSIVE r_seq AS (SELECT 1 AS r UNION ALL SELECT r + 1 FROM r_seq WHERE r < 8),
               c_seq AS (SELECT 1 AS c UNION ALL SELECT c + 1 FROM c_seq WHERE c < 12)
SELECT 2, IF(r >= 5, 2, 1), ELT(r, 'A','B','C','D','E','F','G','H'), c,
       CONCAT(ELT(r, 'A','B','C','D','E','F','G','H'), LPAD(c, 2, '0')), TRUE
FROM r_seq CROSS JOIN c_seq
ORDER BY r, c;

-- Room 3 (88 ghế): Hàng A-G (7x12 = 84) + Hàng H (4 ghế đôi = 4)
INSERT INTO seats (RoomID, SeatTypeID, SeatRow, SeatNumber, SeatLabel, IsActive)
WITH RECURSIVE r_seq AS (SELECT 1 AS r UNION ALL SELECT r + 1 FROM r_seq WHERE r < 7),
               c_seq AS (SELECT 1 AS c UNION ALL SELECT c + 1 FROM c_seq WHERE c < 12)
SELECT 3, IF(r >= 5, 2, 1), ELT(r, 'A','B','C','D','E','F','G'), c,
       CONCAT(ELT(r, 'A','B','C','D','E','F','G'), LPAD(c, 2, '0')), TRUE
FROM r_seq CROSS JOIN c_seq
ORDER BY r, c;

INSERT INTO seats (RoomID, SeatTypeID, SeatRow, SeatNumber, SeatLabel, IsActive) VALUES
(3, 3, 'H', 1, 'H01-02', TRUE),
(3, 3, 'H', 3, 'H03-04', TRUE),
(3, 3, 'H', 5, 'H05-06', TRUE),
(3, 3, 'H', 7, 'H07-08', TRUE);

-- Room 4 (80 ghế): Hàng A-F (6x12 = 72) + Hàng G (8 ghế VIP = 8)
INSERT INTO seats (RoomID, SeatTypeID, SeatRow, SeatNumber, SeatLabel, IsActive)
WITH RECURSIVE r_seq AS (SELECT 1 AS r UNION ALL SELECT r + 1 FROM r_seq WHERE r < 6),
               c_seq AS (SELECT 1 AS c UNION ALL SELECT c + 1 FROM c_seq WHERE c < 12)
SELECT 4, IF(r >= 4, 2, 1), ELT(r, 'A','B','C','D','E','F'), c,
       CONCAT(ELT(r, 'A','B','C','D','E','F'), LPAD(c, 2, '0')), TRUE
FROM r_seq CROSS JOIN c_seq
ORDER BY r, c;

INSERT INTO seats (RoomID, SeatTypeID, SeatRow, SeatNumber, SeatLabel, IsActive)
WITH RECURSIVE c_seq AS (SELECT 1 AS c UNION ALL SELECT c + 1 FROM c_seq WHERE c < 8)
SELECT 4, 2, 'G', c, CONCAT('G', LPAD(c, 2, '0')), TRUE FROM c_seq;

-- Rooms 5, 6, 7 (IMAX - 100 ghế/phòng): Hàng A-G (7x14 = 98) + Hàng H (2 ghế đôi = 2)
INSERT INTO seats (RoomID, SeatTypeID, SeatRow, SeatNumber, SeatLabel, IsActive)
WITH RECURSIVE rm_seq AS (SELECT 5 AS rm UNION ALL SELECT rm + 1 FROM rm_seq WHERE rm < 7),
               r_seq  AS (SELECT 1 AS r UNION ALL SELECT r + 1 FROM r_seq WHERE r < 7),
               c_seq  AS (SELECT 1 AS c UNION ALL SELECT c + 1 FROM c_seq WHERE c < 14)
SELECT rm, IF(r >= 4, 2, 1), ELT(r, 'A','B','C','D','E','F','G'), c,
       CONCAT(ELT(r, 'A','B','C','D','E','F','G'), LPAD(c, 2, '0')), TRUE
FROM rm_seq CROSS JOIN r_seq CROSS JOIN c_seq
ORDER BY rm, r, c;

INSERT INTO seats (RoomID, SeatTypeID, SeatRow, SeatNumber, SeatLabel, IsActive) VALUES
(5, 3, 'H', 1, 'H01-02', TRUE), (5, 3, 'H', 3, 'H03-04', TRUE),
(6, 3, 'H', 1, 'H01-02', TRUE), (6, 3, 'H', 3, 'H03-04', TRUE),
(7, 3, 'H', 1, 'H01-02', TRUE), (7, 3, 'H', 3, 'H03-04', TRUE);

-- Room 8 (Gold Suite - 100 ghế): Hàng A-J (10x10 = 100 ghế VIP)
INSERT INTO seats (RoomID, SeatTypeID, SeatRow, SeatNumber, SeatLabel, IsActive)
WITH RECURSIVE r_seq AS (SELECT 1 AS r UNION ALL SELECT r + 1 FROM r_seq WHERE r < 10),
               c_seq AS (SELECT 1 AS c UNION ALL SELECT c + 1 FROM c_seq WHERE c < 10)
SELECT 8, 2, ELT(r, 'A','B','C','D','E','F','G','H','I','J'), c,
       CONCAT(ELT(r, 'A','B','C','D','E','F','G','H','I','J'), LPAD(c, 2, '0')), TRUE
FROM r_seq CROSS JOIN c_seq
ORDER BY r, c;

-- ============================================================================
-- 8. SHOWTIMES (Sinh tự động 6 ngày từ hôm nay CURDATE() -> CURDATE() + 5)
-- Mỗi ngày có 23 suất chiếu across 3 rạp, 8 phòng -> Tổng 138 suất chiếu
-- SỬ DỤNG SlotOrder ĐỂ FIX CỐ ĐỊNH ShowtimeID CHO KHỚP VỚI BƯỚC 9
-- ============================================================================
INSERT INTO showtimes (MovieID, RoomID, ShowDate, StartTime, EndTime, Format, BaseTicketPrice, Status)
WITH RECURSIVE day_seq AS (
    SELECT 0 AS d
    UNION ALL
    SELECT d + 1 FROM day_seq WHERE d < 5
),
template_slots AS (
    -- Rạp 2: SENEMA Landmark 81 (IMAX Laser)
    SELECT 1 AS SlotOrder, 1 AS MovieID, 5 AS RoomID, '09:30:00' AS StartTime, '12:16:00' AS EndTime, 'IMAX Laser 2D' AS Format, 140000.00 AS BaseTicketPrice, 'SCHEDULED' AS Status
    UNION ALL SELECT 2, 1, 7, '14:00:00', '16:46:00', 'IMAX Laser 2D', 140000.00, 'SCHEDULED'
    UNION ALL SELECT 3, 1, 6, '17:30:00', '20:16:00', 'IMAX Laser 2D', 140000.00, 'SCHEDULED'
    UNION ALL SELECT 4, 1, 5, '20:15:00', '23:01:00', 'IMAX Laser 2D', 140000.00, 'SCHEDULED'
    UNION ALL SELECT 5, 7, 5, '22:45:00', '00:52:00', 'IMAX Laser 2D', 150000.00, 'SCHEDULED'

    -- Rạp 3: SENEMA Premium Lounge (Gold Class)
    UNION ALL SELECT 6, 1, 8, '18:45:00', '21:31:00', '3D Dolby Atmos VIP Suites', 190000.00, 'SCHEDULED'
    UNION ALL SELECT 7, 2, 8, '21:15:00', '23:26:00', '3D Dolby Atmos VIP Suites', 190000.00, 'SCHEDULED'

    -- Rạp 1: SENEMA Nguyễn Du - Screen 01
    UNION ALL SELECT 8, 1, 1, '10:30:00', '13:16:00', '2D Vietnamese Subs', 90000.00, 'SCHEDULED'
    UNION ALL SELECT 9, 2, 1, '13:36:00', '15:47:00', '2D Kỹ thuật số', 90000.00, 'SCHEDULED'
    UNION ALL SELECT 10, 1, 1, '17:45:00', '20:31:00', '2D Vietnamese Subs', 110000.00, 'CHECKIN_OPEN'
    UNION ALL SELECT 11, 2, 1, '20:51:00', '23:02:00', '2D Kỹ thuật số', 110000.00, 'SCHEDULED'

    -- Rạp 1: SENEMA Nguyễn Du - Screen 02
    UNION ALL SELECT 12, 2, 2, '11:00:00', '13:11:00', '2D Kỹ thuật số', 90000.00, 'SCHEDULED'
    UNION ALL SELECT 13, 3, 2, '14:00:00', '16:18:00', '2D', 90000.00, 'SCHEDULED'
    UNION ALL SELECT 14, 2, 2, '18:00:00', '20:11:00', '2D Kỹ thuật số', 110000.00, 'SCHEDULED'
    UNION ALL SELECT 15, 3, 2, '20:36:00', '22:54:00', '2D', 110000.00, 'SCHEDULED'

    -- Rạp 1: SENEMA Nguyễn Du - Screen 03
    UNION ALL SELECT 16, 3, 3, '10:00:00', '12:18:00', '2D', 90000.00, 'SCHEDULED'
    UNION ALL SELECT 17, 5, 3, '13:00:00', '14:55:00', '3D • 4DX', 110000.00, 'SCHEDULED'
    UNION ALL SELECT 18, 6, 3, '18:30:00', '20:44:00', '2D Lồng tiếng', 110000.00, 'SCHEDULED'
    UNION ALL SELECT 19, 7, 3, '21:10:00', '23:17:00', '3D • 4DX', 130000.00, 'SCHEDULED'

    -- Rạp 1: SENEMA Nguyễn Du - Screen 04
    UNION ALL SELECT 20, 4, 4, '11:30:00', '13:10:00', '2D', 70000.00, 'SCHEDULED'
    UNION ALL SELECT 21, 4, 4, '15:00:00', '16:40:00', '2D', 70000.00, 'SCHEDULED'
    UNION ALL SELECT 22, 4, 4, '19:00:00', '20:40:00', '2D', 90000.00, 'SCHEDULED'
    UNION ALL SELECT 23, 6, 4, '21:00:00', '23:14:00', '2D Lồng tiếng', 110000.00, 'SCHEDULED'
)
SELECT
    t.MovieID,
    t.RoomID,
    DATE_ADD(CURDATE(), INTERVAL d.d DAY) AS ShowDate,
    t.StartTime,
    t.EndTime,
    t.Format,
    t.BaseTicketPrice,
    IF(d.d = 0, t.Status, 'SCHEDULED') AS Status
FROM day_seq d
CROSS JOIN template_slots t
ORDER BY ShowDate ASC, t.SlotOrder ASC;

-- ============================================================================
-- 9. BOOKING, ORDER_SEATS, ORDER_ITEM, PAYMENT, TICKET, REFUNDS, AUDIT_LOGS
-- Bao phủ đủ các kịch bản test cho cả 4 thành viên:
--   - Booking 1: PAID (2 ghế VIP + 1 Combo bắp nước -> có vé VALID để test Check-in)
--   - Booking 2: PAID (1 ghế VIP -> vé đã USED để test cảnh báo vé đã check-in)
--   - Booking 3: HOLDING (2 ghế đang giữ -> test hiển thị ghế HELD & job nhả ghế)
--   - Booking 4: PAID (88 ghế đã đặt trên ShowtimeID=1 -> còn 12 ghế -> test nhãn "Chỉ còn 12 ghế")
--   - Booking 5: PAID (100 ghế đã đặt trên ShowtimeID=6 -> còn 0 ghế -> test nhãn "Hết vé")
--   - Booking 6: REFUNDED (đã hủy & hoàn tiền -> test lịch sử hoàn tiền & audit_logs)
-- ============================================================================

INSERT INTO booking (BookingID, BookingCode, ShowtimeID, StaffID, ClientID, customer_name, customer_email, customer_phone, send_zalo, age_confirmed, age_confirmed_at, seats_subtotal, fb_subtotal, discount_amount, total_amount, points_earned, fb_pickup_code, status, Channel, hold_expires_at) VALUES
(1, 'SN-2026-88492X', 4, NULL, 4, 'Alex Nguyen', 'alex.nguyen@example.com', '0912345678', TRUE, 'T18', NOW(), 280000.00, 115000.00, 0.00, 395000.00, 39, 'FB-88492', 'PAID', 'ONLINE', DATE_ADD(NOW(), INTERVAL 10 MINUTE)),
(2, 'SN-2026-101308', 10, NULL, 5, 'Trần Anh Thư', 'thu.tran@example.com', '0901234568', TRUE, 'T18', NOW(), 110000.00, 0.00, 0.00, 110000.00, 11, NULL, 'PAID', 'ONLINE', DATE_ADD(NOW(), INTERVAL 10 MINUTE)),
(3, 'SN-2026-HOLD01', 4, NULL, 6, 'Phạm Gia Bảo', 'bao.pham@example.com', '0987654321', TRUE, 'T18', NOW(), 280000.00, 0.00, 0.00, 280000.00, 0, NULL, 'HOLDING', 'ONLINE', DATE_ADD(NOW(), INTERVAL 7 MINUTE)),
(4, 'SN-2026-BULK88', 1, 2, NULL, 'Đoàn Công Ty ABC', 'hr@abc-corp.vn', '0909888777', FALSE, 'T18', NOW(), 12320000.00, 0.00, 0.00, 12320000.00, 0, NULL, 'PAID', 'COUNTER', DATE_ADD(NOW(), INTERVAL 10 MINUTE)),
(5, 'SN-2026-FULL00', 6, 2, NULL, 'Sự Kiện Ra Mắt Phim', 'event@senema.vn', '0909111222', FALSE, 'T18', NOW(), 19000000.00, 0.00, 0.00, 19000000.00, 0, NULL, 'PAID', 'COUNTER', DATE_ADD(NOW(), INTERVAL 10 MINUTE)),
(6, 'SN-2026-RF0001', 12, NULL, 4, 'Alex Nguyen', 'alex.nguyen@example.com', '0912345678', TRUE, 'T18', NOW(), 180000.00, 0.00, 0.00, 180000.00, 0, NULL, 'REFUNDED', 'ONLINE', DATE_SUB(NOW(), INTERVAL 1 HOUR));

-- Ghế cho Booking 1 (Showtime 4 - Room 5: 2 ghế F12, F13)
INSERT INTO order_seats (BookingID, ShowtimeID, SeatID, Price, SeatStatus)
SELECT 1, 4, SeatID, 140000.00, 'BOOKED'
FROM seats WHERE RoomID = 5 AND SeatLabel IN ('F12', 'F13');

-- Ghế cho Booking 2 (Showtime 10 - Room 1: 1 ghế E06)
INSERT INTO order_seats (BookingID, ShowtimeID, SeatID, Price, SeatStatus)
SELECT 2, 10, SeatID, 110000.00, 'BOOKED'
FROM seats WHERE RoomID = 1 AND SeatLabel = 'E06';

-- Ghế đang giữ cho Booking 3 (Showtime 4 - Room 5: 2 ghế G07, G08 -> SeatStatus = HELD)
INSERT INTO order_seats (BookingID, ShowtimeID, SeatID, Price, SeatStatus)
SELECT 3, 4, SeatID, 140000.00, 'HELD'
FROM seats WHERE RoomID = 5 AND SeatLabel IN ('G07', 'G08');

-- 88 ghế đã bán cho Booking 4 (Showtime 1 - Room 5 -> Còn đúng 12 ghế trống!)
INSERT INTO order_seats (BookingID, ShowtimeID, SeatID, Price, SeatStatus)
SELECT 4, 1, SeatID, 140000.00, 'BOOKED'
FROM seats WHERE RoomID = 5 ORDER BY SeatID ASC LIMIT 88;

-- 100 ghế đã bán cho Booking 5 (Showtime 6 - Room 8 -> Còn 0 ghế trống - Hết vé!)
INSERT INTO order_seats (BookingID, ShowtimeID, SeatID, Price, SeatStatus)
SELECT 5, 6, SeatID, 190000.00, 'BOOKED'
FROM seats WHERE RoomID = 8;

-- Ghế đã nhả của Booking 6 (Showtime 12 - Room 2 -> SeatStatus = RELEASED)
INSERT INTO order_seats (BookingID, ShowtimeID, SeatID, Price, SeatStatus)
SELECT 6, 12, SeatID, 90000.00, 'RELEASED'
FROM seats WHERE RoomID = 2 AND SeatLabel IN ('D05', 'D06');

-- Combo bắp nước cho Booking 1
INSERT INTO order_item (BookingID, ProductID, Quantity, UnitPrice) VALUES
(1, 1, 1, 115000.00);

-- Thanh toán MoMo
INSERT INTO payment (PaymentID, BookingID, Amount, Method, Partner, TransactionRef, momo_trans_id, status, payment_time, transaction_log) VALUES
(1, 1, 395000.00, 'CAPTURE_WALLET', 'MOMO', 'MOMO-2026-88492X', '4092837465', 'SUCCESS', NOW(), '{"resultCode": 0, "message": "Successful.", "partnerCode": "MOMO"}'),
(2, 2, 110000.00, 'CAPTURE_WALLET', 'MOMO', 'MOMO-2026-101308', '4092837466', 'SUCCESS', NOW(), '{"resultCode": 0, "message": "Successful.", "partnerCode": "MOMO"}'),
(3, 4, 12320000.00, 'CASH', 'COUNTER', 'CASH-2026-BULK88', NULL, 'SUCCESS', NOW(), '{"channel": "COUNTER", "staffId": 2}'),
(4, 5, 19000000.00, 'CASH', 'COUNTER', 'CASH-2026-FULL00', NULL, 'SUCCESS', NOW(), '{"channel": "COUNTER", "staffId": 2}'),
(5, 6, 180000.00, 'CAPTURE_WALLET', 'MOMO', 'MOMO-2026-RF0001', '4092837499', 'REFUNDED', DATE_SUB(NOW(), INTERVAL 2 HOUR), '{"resultCode": 0, "refunded": true}');

-- Vé điện tử (Khớp 1-1 với các ghế BOOKED của Booking 1 & 2)
INSERT INTO ticket (TicketNo, BookingID, ShowtimeID, SeatID, Barcode, jwt_token, Price, SeatRow, SeatNumber, SeatLabel, SeatType, CinemaID, RoomNumber, Gate, Date, Time, status, checkin_time, checkin_staff_id)
SELECT 
    'SN-261013-002481', 2, 10, s.SeatID, '6919-2814-43201', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.sample_token_used', 110000.00, s.SeatRow, s.SeatNumber, s.SeatLabel, 'VIP', 1, 'Screen 01', 'GATE 01', CURDATE(), '17:45:00', 'USED', NOW(), 2
FROM seats s
WHERE s.RoomID = 1 AND s.SeatLabel = 'E06';

INSERT INTO ticket (TicketNo, BookingID, ShowtimeID, SeatID, Barcode, jwt_token, Price, SeatRow, SeatNumber, SeatLabel, SeatType, CinemaID, RoomNumber, Gate, Date, Time, status)
SELECT 
    CONCAT('SN-2026-', s.SeatLabel), 1, 4, s.SeatID, CONCAT('2249-3414-', s.SeatID), 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.sample_token_valid', 140000.00, s.SeatRow, s.SeatNumber, s.SeatLabel, 'VIP', 2, 'Hall 01', 'GATE 01', CURDATE(), '20:15:00', 'VALID'
FROM seats s
WHERE s.RoomID = 5 AND s.SeatLabel IN ('F12', 'F13');

-- Hoàn tiền mẫu cho Booking 6
INSERT INTO refunds (RefundID, RefundReference, BookingID, PaymentID, OriginalPaidAmount, CancellationFee, RefundAmount, RefundRatePercent, RefundDestination, Reason, Status, RequestedAt, CompletedAt) VALUES
(1, 'RF-2026-0001', 6, 5, 180000.00, 0.00, 180000.00, 100, 'MoMo E-Wallet', 'Khách hàng hủy vé trước giờ chiếu > 60 phút', 'COMPLETED', DATE_SUB(NOW(), INTERVAL 90 MINUTE), DATE_SUB(NOW(), INTERVAL 85 MINUTE));

-- Nhật ký kiểm toán hệ thống (Audit Logs)
INSERT INTO audit_logs (UserID, Action, Details, IPAddress) VALUES
(1, 'SYSTEM_SEED_INIT', '{"module": "discovery_and_booking", "version": "1.0"}', '127.0.0.1'),
(4, 'AGE_CONFIRMATION', '{"bookingCode": "SN-2026-88492X", "ageConfirmed": "T18"}', '115.79.32.10'),
(2, 'TICKET_CHECKIN', '{"ticketNo": "SN-261013-002481", "gate": "GATE 01"}', '192.168.1.15'),
(4, 'TICKET_REFUND_REQUEST', '{"bookingCode": "SN-2026-RF0001", "refundAmount": 180000}', '115.79.32.10');
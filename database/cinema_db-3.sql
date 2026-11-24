-- Change to T..., generate seats, showtimes dynamically, change cinema name to SENEMA, drop tables: Promotions, Price Rules, change to On delete restrict on foreign keys of booking, and refunds tables, add parameter to idx_showtime_date'
DROP DATABASE IF EXISTS cinema_db;
CREATE DATABASE cinema_db
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE cinema_db;

CREATE TABLE users (
    UserID INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    phone_number VARCHAR(20) UNIQUE NULL,
    mail VARCHAR(255) UNIQUE NOT NULL,
    hashed_password VARCHAR(255) NOT NULL,
    UserType ENUM('CUSTOMER', 'STAFF', 'ADMIN') DEFAULT 'CUSTOMER',
    cine_points INT DEFAULT 0,
    tier ENUM('STANDARD', 'SILVER', 'GOLD', 'VIP') DEFAULT 'STANDARD',
    birthdate DATE NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE movies (
    MovieID INT AUTO_INCREMENT PRIMARY KEY,
    Code VARCHAR(20) UNIQUE NOT NULL,
    Title VARCHAR(255) NOT NULL,
    Subtitle VARCHAR(255) NULL,
    Tagline VARCHAR(500) NULL,
    Description TEXT NULL,
    Genre VARCHAR(255) NOT NULL,
    Duration INT NOT NULL,
    ReleaseDate DATE NULL,
    AgeRating ENUM('P', 'T13', 'T16', 'T18') DEFAULT 'P',
    AgeNotice TEXT NULL,
    Language VARCHAR(100) DEFAULT 'English with Vietnamese Subtitles',
    Formats VARCHAR(255) DEFAULT '2D',
    ImdbScore DECIMAL(3, 1) DEFAULT 0.0,
    AudienceScore DECIMAL(3, 1) DEFAULT 0.0,
    PosterUrl VARCHAR(500) NULL,
    BackdropUrl VARCHAR(500) NULL,
    TrailerUrl VARCHAR(500) NULL,
    Director VARCHAR(255) NULL,
    Starring TEXT NULL,
    Status ENUM('NOW_SHOWING', 'COMING_SOON', 'ENDED', 'DRAFT') DEFAULT 'NOW_SHOWING',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE cinemas (
    CinemaID INT AUTO_INCREMENT PRIMARY KEY,
    Slug VARCHAR(100) UNIQUE NOT NULL,
    CinemaName VARCHAR(255) NOT NULL,
    Branch VARCHAR(100) NULL,
    Address VARCHAR(500) NOT NULL,
    City VARCHAR(100) DEFAULT 'Ho Chi Minh City',
    DistanceLabel VARCHAR(50) NULL,
    Perk VARCHAR(255) NULL,
    MapUrl VARCHAR(500) NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE rooms (
    RoomID INT AUTO_INCREMENT PRIMARY KEY,
    CinemaID INT NOT NULL,
    RoomNumber VARCHAR(50) NOT NULL,
    RoomType VARCHAR(50) DEFAULT '2D',
    FormatDescription VARCHAR(255) NULL,
    HallNote VARCHAR(100) NULL,
    Capacity INT NOT NULL DEFAULT 100,
    Status ENUM('READY', 'CLEANING', 'MAINTENANCE') DEFAULT 'READY',
    FOREIGN KEY (CinemaID) REFERENCES cinemas(CinemaID) ON DELETE CASCADE,
    UNIQUE KEY uk_cinema_room (CinemaID, RoomNumber)
);

CREATE TABLE seat_types (
    SeatTypeID INT AUTO_INCREMENT PRIMARY KEY,
    TypeCode ENUM('standard', 'vip', 'couple') UNIQUE NOT NULL,
    TypeName VARCHAR(50) NOT NULL,
    BasePrice DECIMAL(12, 2) NOT NULL,
    Surcharge DECIMAL(12, 2) DEFAULT 0.00,
    SeatsPerUnit INT DEFAULT 1
);

CREATE TABLE seats (
    SeatID INT AUTO_INCREMENT PRIMARY KEY,
    RoomID INT NOT NULL,
    SeatTypeID INT NOT NULL,
    SeatRow VARCHAR(10) NOT NULL,
    SeatNumber INT NOT NULL,
    SeatLabel VARCHAR(20) NOT NULL,
    IsActive BOOLEAN DEFAULT TRUE,
    FOREIGN KEY (RoomID) REFERENCES rooms(RoomID) ON DELETE CASCADE,
    FOREIGN KEY (SeatTypeID) REFERENCES seat_types(SeatTypeID),
    UNIQUE KEY uk_room_seat_label (RoomID, SeatLabel)
);

CREATE TABLE showtimes (
    ShowtimeID INT AUTO_INCREMENT PRIMARY KEY,
    MovieID INT NOT NULL,
    RoomID INT NOT NULL,
    ShowDate DATE NOT NULL,
    StartTime TIME NOT NULL,
    EndTime TIME NOT NULL,
    Format VARCHAR(100) DEFAULT '2D Vietnamese Subs',
    BaseTicketPrice DECIMAL(12, 2) NOT NULL DEFAULT 110000.00,
    Status ENUM('SCHEDULED', 'CHECKIN_OPEN', 'COMPLETED', 'CANCELED') DEFAULT 'SCHEDULED',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (MovieID) REFERENCES movies(MovieID) ON DELETE CASCADE,
    FOREIGN KEY (RoomID) REFERENCES rooms(RoomID) ON DELETE CASCADE,
    INDEX idx_showtime_search (ShowDate, MovieID, StartTime)
);

CREATE TABLE products (
    ProductID INT AUTO_INCREMENT PRIMARY KEY,
    Code VARCHAR(50) UNIQUE NOT NULL,
    Name VARCHAR(255) NOT NULL,
    Summary VARCHAR(255) NULL,
    Description TEXT NULL,
    Image VARCHAR(500) NULL,
    Price DECIMAL(12, 2) NOT NULL,
    Category ENUM('popcorn', 'signature', 'snacks', 'beverages') DEFAULT 'popcorn',
    Tags JSON NULL,
    Badges JSON NULL,
    IsActive BOOLEAN DEFAULT TRUE
);

CREATE TABLE booking (
    BookingID INT AUTO_INCREMENT PRIMARY KEY,
    BookingCode VARCHAR(50) UNIQUE NOT NULL,
    ShowtimeID INT NOT NULL,
    StaffID INT NULL,
    ClientID INT NULL,
    -- Mã phiên của trình duyệt (clientId lưu ở localStorage) -> biết ghế HOLDING là của ai, kể cả khách vãng lai
    session_id VARCHAR(64) NULL,
    customer_name VARCHAR(255) NOT NULL,
    customer_email VARCHAR(255) NOT NULL,
    customer_phone VARCHAR(20) NOT NULL,
    send_zalo BOOLEAN DEFAULT TRUE,
    age_confirmed ENUM('P', 'T13', 'T16', 'T18') DEFAULT 'P',
    age_confirmed_at DATETIME NULL,
    seats_subtotal DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
    fb_subtotal DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
    discount_amount DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
    total_amount DECIMAL(12, 2) NOT NULL,
    points_earned INT DEFAULT 0,
    fb_pickup_code VARCHAR(50) NULL,
    status ENUM('HOLDING', 'CHECKOUT_PENDING', 'PAID', 'CANCELED', 'REFUNDED', 'EXPIRED') DEFAULT 'HOLDING',
    Channel ENUM('ONLINE', 'COUNTER') DEFAULT 'ONLINE',
    hold_expires_at DATETIME NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (ShowtimeID) REFERENCES showtimes(ShowtimeID) ON DELETE RESTRICT,
    FOREIGN KEY (StaffID) REFERENCES users(UserID) ON DELETE SET NULL,
    FOREIGN KEY (ClientID) REFERENCES users(UserID) ON DELETE SET NULL,
    INDEX idx_booking_status_exp (status, hold_expires_at),
    INDEX idx_booking_session (session_id, ShowtimeID, status)
);

CREATE TABLE order_seats (
    OrderSeatID INT AUTO_INCREMENT PRIMARY KEY,
    BookingID INT NOT NULL,
    ShowtimeID INT NOT NULL,
    SeatID INT NOT NULL,
    Price DECIMAL(12, 2) NOT NULL,
    SeatStatus ENUM('HELD', 'BOOKED', 'RELEASED') DEFAULT 'HELD',
    ActiveLock TINYINT GENERATED ALWAYS AS (IF(SeatStatus IN ('HELD', 'BOOKED'), 1, NULL)) VIRTUAL,
    FOREIGN KEY (BookingID) REFERENCES booking(BookingID) ON DELETE CASCADE,
    FOREIGN KEY (ShowtimeID) REFERENCES showtimes(ShowtimeID) ON DELETE CASCADE,
    FOREIGN KEY (SeatID) REFERENCES seats(SeatID) ON DELETE CASCADE,
    UNIQUE KEY uk_booking_seat (BookingID, SeatID),
    UNIQUE KEY uk_active_showtime_seat (ShowtimeID, SeatID, ActiveLock)
);

CREATE TABLE order_item (
    BookingID INT NOT NULL,
    ProductID INT NOT NULL,
    Quantity INT NOT NULL,
    UnitPrice DECIMAL(12, 2) NOT NULL,
    PRIMARY KEY (BookingID, ProductID),
    FOREIGN KEY (BookingID) REFERENCES booking(BookingID) ON DELETE CASCADE,
    FOREIGN KEY (ProductID) REFERENCES products(ProductID)
);

CREATE TABLE payment (
    PaymentID INT AUTO_INCREMENT PRIMARY KEY,
    BookingID INT NOT NULL,
    Amount DECIMAL(12, 2) NOT NULL,
    Method VARCHAR(50) DEFAULT 'CAPTURE_WALLET',
    Partner VARCHAR(50) DEFAULT 'MOMO',
    TransactionRef VARCHAR(100) NOT NULL UNIQUE,
    momo_trans_id VARCHAR(100) NULL,
    status ENUM('CREATED', 'PENDING', 'SUCCESS', 'FAILED', 'CANCELED', 'REFUNDED', 'NEED_RECONCILE') DEFAULT 'CREATED',
    payment_time DATETIME NULL,
    transaction_log JSON NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (BookingID) REFERENCES booking(BookingID) ON DELETE CASCADE
);

CREATE TABLE ticket (
    TicketNo VARCHAR(50) PRIMARY KEY,
    BookingID INT NOT NULL,
    ShowtimeID INT NOT NULL,
    SeatID INT NOT NULL,
    Barcode VARCHAR(50) UNIQUE NOT NULL,
    jwt_token TEXT NOT NULL,
    Price DECIMAL(12, 2) NOT NULL,
    SeatRow VARCHAR(10) NOT NULL,
    SeatNumber INT NOT NULL,
    SeatLabel VARCHAR(20) NOT NULL,
    SeatType VARCHAR(50) NOT NULL,
    CinemaID INT NOT NULL,
    RoomNumber VARCHAR(50) NOT NULL,
    Gate VARCHAR(20) DEFAULT 'GATE 01',
    Date DATE NOT NULL,
    Time TIME NOT NULL,
    status ENUM('VALID', 'USED', 'CANCELED', 'REFUNDED') DEFAULT 'VALID',
    checkin_time DATETIME NULL,
    checkin_staff_id INT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (BookingID) REFERENCES booking(BookingID) ON DELETE CASCADE,
    FOREIGN KEY (ShowtimeID) REFERENCES showtimes(ShowtimeID),
    FOREIGN KEY (SeatID) REFERENCES seats(SeatID),
    FOREIGN KEY (CinemaID) REFERENCES cinemas(CinemaID),
    FOREIGN KEY (checkin_staff_id) REFERENCES users(UserID) ON DELETE SET NULL
);

CREATE TABLE refunds (
    RefundID INT AUTO_INCREMENT PRIMARY KEY,
    RefundReference VARCHAR(50) UNIQUE NOT NULL,
    BookingID INT NOT NULL,
    PaymentID INT NOT NULL,
    OriginalPaidAmount DECIMAL(12, 2) NOT NULL,
    CancellationFee DECIMAL(12, 2) DEFAULT 0.00,
    RefundAmount DECIMAL(12, 2) NOT NULL,
    RefundRatePercent INT NOT NULL DEFAULT 100,
    RefundDestination VARCHAR(100) DEFAULT 'MoMo E-Wallet',
    Reason VARCHAR(255) NULL,
    Status ENUM('PROCESSING', 'COMPLETED', 'REJECTED') DEFAULT 'COMPLETED',
    RequestedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CompletedAt DATETIME NULL,
    FOREIGN KEY (BookingID) REFERENCES booking(BookingID) ON DELETE RESTRICT,
    FOREIGN KEY (PaymentID) REFERENCES payment(PaymentID) ON DELETE RESTRICT
);

CREATE TABLE audit_logs (
    LogID INT AUTO_INCREMENT PRIMARY KEY,
    UserID INT NULL,
    Action VARCHAR(255) NOT NULL,
    Details JSON NULL,
    IPAddress VARCHAR(45) NULL,
    CreatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (UserID) REFERENCES users(UserID) ON DELETE SET NULL
);

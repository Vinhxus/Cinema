# HƯỚNG DẪN KIẾN TRÚC & TIÊU CHUẨN BACKEND EXPRESS (SENEMA PROJECT)

Tài liệu này hướng dẫn chi tiết cách tổ chức mã nguồn, quy chuẩn lập trình và quy trình tạo một module/tính năng mới trên nền tảng Backend Express đã được xây dựng sẵn cho dự án Cinema.

---

## 1. Cấu Trúc Thư Mục Chuẩn (`be/src/`)

Dự án áp dụng mô hình phân lớp chuẩn (Layered Architecture):
**Router -> Validator -> Controller -> Service -> Repository -> Database**

```text
be/
├── .env.example              # Mẫu biến môi trường
├── .env                      # File biến môi trường thực tế (không commit git)
├── package.json              # Khai báo dependency ("type": "module" -> dùng ES Modules)
├── seathandlers.js           # Xử lý logic Real-time Socket.io cho giữ/chọn ghế
├── server.js                 # Điểm khởi chạy Express server & Socket.io
└── src/
    ├── config/
    │   └── db.js             # Kết nối MySQL Connection Pool (mysql2/promise)
    ├── controllers/          # Nhận request, gọi service, trả response HTTP
    ├── middlewares/
    │   ├── authMiddleware.js # verifyToken (JWT) & authorizeRoles (RBAC)
    │   ├── errorHandler.js   # Bắt và xử lý lỗi tập trung
    │   └── validate.js       # Middleware validate body/query/params bằng Zod
    ├── repositories/         # Tương tác trực tiếp với Database qua Raw SQL
    ├── routes/               # Định nghĩa các endpoint URL
    │   └── index.js          # Router tổng (mount vào /api)
    ├── services/             # Xử lý nghiệp vụ (Business logic)
    ├── utils/
    │   ├── AppError.js       # Class tạo lỗi tùy chỉnh (statusCode, details)
    │   └── response.js       # Hàm chuẩn hóa format JSON phản hồi
    └── validators/           # Định nghĩa schema kiểm tra dữ liệu bằng Zod
```

> **Lưu ý về ES Module:** Dự án sử dụng `"type": "module"` trong `package.json`. Khi `import` các file nội bộ, bắt buộc phải có đuôi file `.js` (Ví dụ: `import pool from '../config/db.js';`).

---

## 2. Chuẩn Dữ Liệu Trả Về (API Response Format)

Mọi endpoint API trong toàn bộ hệ thống **BẮT BUỘC** phải tuân theo format JSON cố định sau:

```json
{
  "success": boolean,
  "data": any | null,
  "error": {
    "message": string,
    "details": any
  } | null
}
```

Để đảm bảo đồng bộ, luôn dùng các hàm trợ giúp từ `src/utils/response.js`:

```javascript
import { sendSuccess, sendError } from '../utils/response.js';

// Khi thành công (status mặc định là 200, hoặc truyền 201 khi tạo mới):
return sendSuccess(res, data, 200);

// Khi thất bại:
return sendError(res, 'Thông báo lỗi', 400, details);
```

---

## 3. Quy Tắc Xử Lý Lỗi (Error Handling)

Tất cả các lỗi phát sinh trong Controller/Service nên được ném ra bằng class `AppError` hoặc bắt qua `try-catch` và chuyển tiếp cho `next(err)`. Middleware `src/middlewares/errorHandler.js` sẽ tự động bắt và trả về mã HTTP tương ứng:

```javascript
import { AppError } from '../utils/AppError.js';

// Ví dụ quăng lỗi nghiệp vụ:
throw new AppError('Không tìm thấy phòng chiếu', 404);
throw new AppError('Email đã được đăng ký', 409, { email });
```

### Các mã lỗi được tự động chuyển đổi:
- **`AppError`**: Trả về đúng `statusCode` và `details` đã khai báo.
- **`ZodError`**: Tự động trả về HTTP `400 Bad Request` kèm danh sách trường bị lỗi.
- **MySQL `ER_DUP_ENTRY`**: Tự động trả về HTTP `409 Conflict`.
- **MySQL `ER_NO_REFERENCED_ROW_2`**: Tự động trả về HTTP `400 Bad Request` (Khóa ngoại không hợp lệ).
- **JWT `JsonWebTokenError` / `TokenExpiredError`**: Tự động trả về HTTP `401 Unauthorized`.

---

## 4. Xác Thực & Phân Quyền (Auth & RBAC)

Hệ thống hỗ trợ 3 quyền chính theo đúng schema database (`users.UserType`):
- `CUSTOMER`: Khách hàng xem phim, đặt vé online.
- `STAFF`: Nhân viên soát vé, bán vé tại quầy.
- `ADMIN`: Quản trị viên quản lý phim, phòng chiếu, suất chiếu, giá vé, thống kê.

Sử dụng middleware từ `src/middlewares/authMiddleware.js`:

```javascript
import { verifyToken, authorizeRoles } from '../middlewares/authMiddleware.js';

// 1. Chỉ cần đăng nhập (Token hợp lệ)
router.get('/profile', verifyToken, profileController.getProfile);

// 2. Phân quyền chỉ cho Admin
router.post('/movies', verifyToken, authorizeRoles('ADMIN'), movieController.createMovie);

// 3. Phân quyền cho cả Staff và Admin
router.post('/checkin', verifyToken, authorizeRoles('STAFF', 'ADMIN'), checkinController.checkinTicket);
```

---

## 5. Hướng Dẫn Từng Bước Viết Module Mới (Ví dụ: Quản lý Phim `movies`)

### Bước 1: Tạo Schema Validate với Zod (`src/validators/movie.validator.js`)
Dùng để kiểm tra tính hợp lệ của request payload trước khi vào controller:

```javascript
import { z } from 'zod';

export const createMovieSchema = {
  body: z.object({
    code: z.string().trim().min(2).max(20),
    title: z.string().trim().min(1).max(255),
    genre: z.string().trim().min(1),
    duration: z.coerce.number().positive(),
    ageRating: z.enum(['P', 'T13', 'T16', 'T18']).default('P'),
  }),
};
```

---

### Bước 2: Viết Tương Tác Database trong Repository (`src/repositories/movie.repository.js`)
Chỉ viết Raw SQL và dùng pool từ `src/config/db.js`:

```javascript
import pool from '../config/db.js';

export async function findAllMovies() {
  const [rows] = await pool.query('SELECT * FROM movies ORDER BY MovieID DESC');
  return rows;
}

export async function findMovieById(id) {
  const [rows] = await pool.query('SELECT * FROM movies WHERE MovieID = ? LIMIT 1', [id]);
  return rows[0] || null;
}

export async function createMovie(data) {
  const [result] = await pool.query(
    'INSERT INTO movies (Code, Title, Genre, Duration, AgeRating) VALUES (?, ?, ?, ?, ?)',
    [data.code, data.title, data.genre, data.duration, data.ageRating]
  );
  return findMovieById(result.insertId);
}
```

---

### Bước 3: Viết Nghiệp Vụ trong Service (`src/services/movie.service.js`)
Thực hiện các logic kiểm tra dữ liệu, tính toán trước khi lưu hoặc trả về:

```javascript
import * as movieRepository from '../repositories/movie.repository.js';
import { AppError } from '../utils/AppError.js';

export async function getAllMovies() {
  return await movieRepository.findAllMovies();
}

export async function getMovieDetail(id) {
  const movie = await movieRepository.findMovieById(id);
  if (!movie) {
    throw new AppError('Phim không tồn tại', 404);
  }
  return movie;
}

export async function addMovie(data) {
  return await movieRepository.createMovie(data);
}
```

---

### Bước 4: Viết Controller Tiếp Nhận Request (`src/controllers/movie.controller.js`)

```javascript
import * as movieService from '../services/movie.service.js';
import { sendSuccess } from '../utils/response.js';

export async function getAll(req, res, next) {
  try {
    const movies = await movieService.getAllMovies();
    return sendSuccess(res, movies, 200);
  } catch (err) {
    return next(err);
  }
}

export async function getById(req, res, next) {
  try {
    const movie = await movieService.getMovieDetail(req.params.id);
    return sendSuccess(res, movie, 200);
  } catch (err) {
    return next(err);
  }
}

export async function create(req, res, next) {
  try {
    const newMovie = await movieService.addMovie(req.body);
    return sendSuccess(res, newMovie, 201);
  } catch (err) {
    return next(err);
  }
}
```

---

### Bước 5: Định Nghĩa Routes (`src/routes/movie.routes.js`)
Gắn validate middleware và controller vào router:

```javascript
import { Router } from 'express';
import { validate } from '../middlewares/validate.js';
import { createMovieSchema } from '../validators/movie.validator.js';
import * as movieController from '../controllers/movie.controller.js';
import { verifyToken, authorizeRoles } from '../middlewares/authMiddleware.js';

const router = Router();

router.get('/', movieController.getAll);
router.get('/:id', movieController.getById);
router.post(
  '/',
  verifyToken,
  authorizeRoles('ADMIN'),
  validate(createMovieSchema),
  movieController.create
);

export default router;
```

---

### Bước 6: Đăng Ký Route vào Router Tổng (`src/routes/index.js`)

```javascript
import { Router } from 'express';
import movieRoutes from './movie.routes.js';
// ... các routes khác

const router = Router();

// Endpoint kiểm tra server & kết nối DB
router.get('/health', ...);

// Đăng ký route mới (sẽ có tiền tố /api/movies)
router.use('/movies', movieRoutes);

export default router;
```

---

## 6. Lưu Ý Quan Trọng Khi Phát Triển

1. **Transaction trong MySQL:**
   Khi thực hiện các thao tác ghi dữ liệu phức tạp liên quan nhiều bảng (ví dụ: Tạo vé, cập nhật layout ghế, hoàn tiền):
   ```javascript
   const conn = await pool.getConnection();
   try {
     await conn.beginTransaction();
     // Thực thi các câu lệnh bằng `conn.query(...)` thay vì `pool.query(...)`
     await conn.commit();
   } catch (err) {
     await conn.rollback();
     throw err;
   } finally {
     conn.release();
   }
   ```
2. **Không chỉnh sửa trực tiếp `be/seathandlers.js`**: Socket.io server đã được tích hợp song song với Express trong `be/server.js`. Các API thanh toán/đặt vé khi hoàn tất có thể gọi trực tiếp hàm `markBooked(io, showtimeId, seatIds)` từ `seathandlers.js`.
3. **Bảo mật file môi trường:** Không bao giờ push file `.env` lên GitHub. Chỉ cập nhật các key mới vào file `.env.example`.


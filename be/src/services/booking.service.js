import QRCode from 'qrcode';
import AppError from '../utils/AppError.js';
import * as bookingRepo from '../repositories/booking.repository.js';

const money = (v) => Math.round(Number(v) || 0);

/** Gom các cột chung của 1 đơn thành object gọn cho FE */
const toBookingDto = (b) => ({
  bookingCode: b.BookingCode,
  status: b.needSupport ? 'NEED_SUPPORT' : b.bookingStatus, // PAID | REFUNDED | NEED_SUPPORT | ...
  createdAt: b.createdAt,
  movie: {
    id: b.MovieID,
    title: b.movieTitle,
    posterUrl: b.posterUrl,
    ageRating: b.ageRating,
    duration: b.duration,
  },
  showtime: {
    date: b.showDate, // "2026-12-02"
    startTime: b.startTime, // "21:15"
    endTime: b.endTime,
    format: b.format,
  },
  cinema: { name: b.cinemaName, branch: b.branch, address: b.address, room: b.roomNumber },
  amounts: {
    seats: money(b.seats_subtotal),
    fb: money(b.fb_subtotal),
    discount: money(b.discount_amount),
    total: money(b.total_amount),
  },
});

export async function getHistory(clientId) {
  const rows = await bookingRepo.findHistoryBySession(clientId);
  return rows.map((b) => ({
    ...toBookingDto(b),
    seatLabels: b.seatLabels ? b.seatLabels.split(', ') : [],
    ticketCount: Number(b.ticketCount),
  }));
}

export async function getBookingDetail(bookingCode, clientId) {
  const b = await bookingRepo.findBookingByCode(bookingCode, clientId);
  // Không phân biệt "không tồn tại" và "không phải của bạn" -> không lộ mã đơn của người khác
  if (!b) throw new AppError('Booking not found', 404);

  const [tickets, payment] = await Promise.all([
    bookingRepo.findTicketsOfBooking(b.BookingID),
    bookingRepo.findMainPaymentOfBooking(b.BookingID),
  ]);

  // QR chứa JWT của vé (đã ký bằng JWT_SECRET khi xuất vé) -> quầy soát vé verify được, khách không tự chế được.
  // Sinh ảnh ở server để FE không cần cài thêm thư viện QR.
  const ticketDtos = await Promise.all(
    tickets.map(async (t) => ({
      ticketNo: t.ticketNo,
      seatLabel: t.seatLabel,
      seatType: t.seatType,
      price: money(t.price),
      barcode: t.barcode,
      gate: t.gate,
      status: t.status,
      qrDataUrl: await QRCode.toDataURL(t.jwtToken, { margin: 1, width: 280, errorCorrectionLevel: 'M' }),
    }))
  );

  return {
    ...toBookingDto({ ...b, needSupport: payment?.status === 'NEED_RECONCILE' }),
    customer: { name: b.customerName, email: b.customerEmail, phone: b.customerPhone },
    payment: payment && {
      transactionRef: payment.transactionRef,
      partner: payment.partner,
      method: payment.method,
      amount: money(payment.amount),
      status: payment.status,
      paidAt: payment.paidAt,
    },
    tickets: ticketDtos,
  };
}

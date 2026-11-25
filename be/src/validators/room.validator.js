import { z } from 'zod';

const roomFields = {
  cinemaId: z.coerce.number().int().positive().optional(),
  cinema_id: z.coerce.number().int().positive().optional(),
  roomNumber: z.string().trim().min(1).max(50).optional(),
  room_number: z.string().trim().min(1).max(50).optional(),
  roomType: z.string().trim().max(50).optional(),
  room_type: z.string().trim().max(50).optional(),
  formatDescription: z.string().trim().max(255).optional().nullable(),
  format_description: z.string().trim().max(255).optional().nullable(),
  hallNote: z.string().trim().max(100).optional().nullable(),
  hall_note: z.string().trim().max(100).optional().nullable(),
  capacity: z.coerce.number().int().min(0).optional(),
  status: z.enum(['READY', 'CLEANING', 'MAINTENANCE']).optional(),
};

const seatItemSchema = z.object({
  seatId: z.coerce.number().int().positive().optional(),
  seat_id: z.coerce.number().int().positive().optional(),
  seatRow: z.string().trim().min(1).max(10).optional(),
  seat_row: z.string().trim().min(1).max(10).optional(),
  seatNumber: z.coerce.number().int().positive().optional(),
  seat_number: z.coerce.number().int().positive().optional(),
  seatLabel: z.string().trim().min(1).max(20).optional(),
  seat_label: z.string().trim().min(1).max(20).optional(),
  seatTypeId: z.coerce.number().int().positive().optional(),
  seat_type_id: z.coerce.number().int().positive().optional(),
  seatType: z.string().trim().optional(),
  seat_type: z.string().trim().optional(),
  typeCode: z.string().trim().optional(),
  type_code: z.string().trim().optional(),
  isActive: z.boolean().optional(),
  is_active: z.boolean().optional(),
  status: z.enum(['ACTIVE', 'BROKEN', 'MAINTENANCE', 'INACTIVE']).optional(),
});

export const roomIdParamSchema = {
  params: z.object({
    id: z.coerce.number().int().positive(),
  }),
};

export const listRoomsSchema = {
  query: z.object({
    cinema_id: z.coerce.number().int().positive().optional(),
    cinemaId: z.coerce.number().int().positive().optional(),
    status: z.enum(['READY', 'CLEANING', 'MAINTENANCE']).optional(),
  }),
};

export const createRoomSchema = {
  body: z
    .object(roomFields)
    .refine((d) => Boolean(d.cinemaId || d.cinema_id), {
      message: 'cinema_id is required',
      path: ['cinema_id'],
    })
    .refine((d) => Boolean(d.roomNumber || d.room_number), {
      message: 'room_number is required',
      path: ['room_number'],
    }),
};

export const updateRoomSchema = {
  params: roomIdParamSchema.params,
  body: z
    .object(roomFields)
    .refine((obj) => Object.keys(obj).length > 0, {
      message: 'At least one field is required for update',
    }),
};

export const updateRoomLayoutSchema = {
  params: roomIdParamSchema.params,
  body: z.object({
    replaceAll: z.boolean().optional(),
    replace_all: z.boolean().optional(),
    seats: z.array(seatItemSchema).min(1),
  }),
};

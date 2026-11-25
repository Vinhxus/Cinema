import { z } from 'zod';

const priceRuleFields = {
  typeCode: z.enum(['standard', 'vip', 'couple']).optional(),
  type_code: z.enum(['standard', 'vip', 'couple']).optional(),
  typeName: z.string().trim().min(1).max(50).optional(),
  type_name: z.string().trim().min(1).max(50).optional(),
  basePrice: z.coerce.number().min(0).optional(),
  base_price: z.coerce.number().min(0).optional(),
  surcharge: z.coerce.number().min(0).optional(),
  seatsPerUnit: z.coerce.number().int().positive().optional(),
  seats_per_unit: z.coerce.number().int().positive().optional(),
};

export const priceRuleIdParamSchema = {
  params: z.object({
    id: z.coerce.number().int().positive(),
  }),
};

export const listPriceRulesSchema = {
  query: z.object({
    typeCode: z.enum(['standard', 'vip', 'couple']).optional(),
    type_code: z.enum(['standard', 'vip', 'couple']).optional(),
  }),
};

export const createPriceRuleSchema = {
  body: z
    .object(priceRuleFields)
    .refine((d) => Boolean(d.typeCode || d.type_code), {
      message: 'type_code is required',
      path: ['type_code'],
    })
    .refine((d) => Boolean(d.typeName || d.type_name), {
      message: 'type_name is required',
      path: ['type_name'],
    })
    .refine((d) => d.basePrice !== undefined || d.base_price !== undefined, {
      message: 'base_price is required',
      path: ['base_price'],
    }),
};

export const updatePriceRuleSchema = {
  params: priceRuleIdParamSchema.params,
  body: z
    .object(priceRuleFields)
    .refine((obj) => Object.keys(obj).length > 0, {
      message: 'At least one field is required for update',
    }),
};

export const applyShowtimeSurchargeSchema = {
  body: z
    .object({
      cinemaId: z.coerce.number().int().positive().optional(),
      cinema_id: z.coerce.number().int().positive().optional(),
      roomId: z.coerce.number().int().positive().optional(),
      room_id: z.coerce.number().int().positive().optional(),
      dateFrom: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
      date_from: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
      dateTo: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
      date_to: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
      startTimeFrom: z.string().regex(/^\d{2}:\d{2}(:\d{2})?$/).optional(),
      start_time_from: z.string().regex(/^\d{2}:\d{2}(:\d{2})?$/).optional(),
      startTimeTo: z.string().regex(/^\d{2}:\d{2}(:\d{2})?$/).optional(),
      start_time_to: z.string().regex(/^\d{2}:\d{2}(:\d{2})?$/).optional(),
      weekendOnly: z.boolean().optional(),
      weekend_only: z.boolean().optional(),
      baseTicketPrice: z.coerce.number().min(0).optional(),
      base_ticket_price: z.coerce.number().min(0).optional(),
      surchargeDelta: z.coerce.number().optional(),
      surcharge_delta: z.coerce.number().optional(),
    })
    .refine(
      (d) =>
        d.baseTicketPrice !== undefined ||
        d.base_ticket_price !== undefined ||
        d.surchargeDelta !== undefined ||
        d.surcharge_delta !== undefined,
      {
        message: 'Either base_ticket_price or surcharge_delta is required',
        path: ['base_ticket_price'],
      }
    ),
};

import pool from '../config/db.js';
import * as priceRuleRepository from '../repositories/priceRule.repository.js';
import { AppError } from '../utils/AppError.js';

function pickDefined(target, key, value) {
  if (value !== undefined) {
    target[key] = value;
  }
}

function mapPriceRuleFields(payload) {
  const mapped = {};
  pickDefined(mapped, 'TypeCode', payload.typeCode ?? payload.type_code);
  pickDefined(mapped, 'TypeName', payload.typeName ?? payload.type_name);
  pickDefined(mapped, 'BasePrice', payload.basePrice ?? payload.base_price);
  pickDefined(mapped, 'Surcharge', payload.surcharge);
  pickDefined(
    mapped,
    'SeatsPerUnit',
    payload.seatsPerUnit ?? payload.seats_per_unit
  );
  return mapped;
}

export async function listPriceRules(query) {
  return priceRuleRepository.findAll({
    typeCode: query.typeCode ?? query.type_code,
  });
}

export async function createPriceRule(payload) {
  const data = mapPriceRuleFields(payload);
  return priceRuleRepository.create(data);
}

export async function updatePriceRule(seatTypeId, payload) {
  const existing = await priceRuleRepository.findById(seatTypeId);
  if (!existing) {
    throw new AppError('Price rule not found', 404);
  }

  const fields = mapPriceRuleFields(payload);
  return priceRuleRepository.update(seatTypeId, fields);
}

export async function deletePriceRule(seatTypeId) {
  const existing = await priceRuleRepository.findById(seatTypeId);
  if (!existing) {
    throw new AppError('Price rule not found', 404);
  }

  const inUse = await priceRuleRepository.isAssignedToSeats(seatTypeId);
  if (inUse) {
    throw new AppError(
      'Cannot delete seat type price rule currently assigned to room seats',
      400
    );
  }

  await priceRuleRepository.remove(seatTypeId);
  return { deletedId: seatTypeId };
}

export async function applyShowtimeSurcharge(payload) {
  const filters = {
    cinemaId: payload.cinemaId ?? payload.cinema_id,
    roomId: payload.roomId ?? payload.room_id,
    dateFrom: payload.dateFrom ?? payload.date_from,
    dateTo: payload.dateTo ?? payload.date_to,
    startTimeFrom: payload.startTimeFrom ?? payload.start_time_from,
    startTimeTo: payload.startTimeTo ?? payload.start_time_to,
    weekendOnly: payload.weekendOnly ?? payload.weekend_only ?? false,
    baseTicketPrice: payload.baseTicketPrice ?? payload.base_ticket_price,
    surchargeDelta: payload.surchargeDelta ?? payload.surcharge_delta,
  };

  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    const updatedShowtimes = await priceRuleRepository.applyShowtimeSurcharge(
      filters,
      conn
    );
    await conn.commit();
    return { updatedShowtimes };
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }
}

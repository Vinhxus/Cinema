import * as cinemaRepository from '../repositories/cinema.repository.js';
import { AppError } from '../utils/AppError.js';

function pickDefined(target, key, value) {
  if (value !== undefined) {
    target[key] = value;
  }
}

function mapCinemaFields(payload) {
  const mapped = {};
  pickDefined(mapped, 'Slug', payload.slug);
  pickDefined(
    mapped,
    'CinemaName',
    payload.cinemaName ?? payload.cinema_name ?? payload.name
  );
  pickDefined(mapped, 'Branch', payload.branch);
  pickDefined(mapped, 'Address', payload.address);
  pickDefined(mapped, 'City', payload.city);
  pickDefined(
    mapped,
    'DistanceLabel',
    payload.distanceLabel ?? payload.distance_label
  );
  pickDefined(mapped, 'Perk', payload.perk);
  pickDefined(mapped, 'MapUrl', payload.mapUrl ?? payload.map_url);
  return mapped;
}

export async function listCinemas(filters) {
  return cinemaRepository.findAll(filters);
}

export async function createCinema(payload) {
  const data = mapCinemaFields(payload);
  return cinemaRepository.create(data);
}

export async function updateCinema(cinemaId, payload) {
  const existing = await cinemaRepository.findById(cinemaId);
  if (!existing) {
    throw new AppError('Cinema not found', 404);
  }

  const fields = mapCinemaFields(payload);
  return cinemaRepository.update(cinemaId, fields);
}

export async function deleteCinema(cinemaId) {
  const existing = await cinemaRepository.findById(cinemaId);
  if (!existing) {
    throw new AppError('Cinema not found', 404);
  }

  const hasBookings = await cinemaRepository.hasBookingsOrTickets(cinemaId);
  if (hasBookings) {
    throw new AppError(
      'Cannot delete cinema because it has existing bookings or tickets',
      400
    );
  }

  await cinemaRepository.remove(cinemaId);
  return { deletedId: cinemaId };
}

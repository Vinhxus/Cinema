import * as roomService from '../services/room.service.js';
import { sendSuccess } from '../utils/response.js';

export async function list(req, res, next) {
  try {
    const rooms = await roomService.listRooms(req.query);
    return sendSuccess(res, rooms);
  } catch (err) {
    return next(err);
  }
}

export async function create(req, res, next) {
  try {
    const room = await roomService.createRoom(req.body);
    return sendSuccess(res, room, 201);
  } catch (err) {
    return next(err);
  }
}

export async function update(req, res, next) {
  try {
    const room = await roomService.updateRoom(req.params.id, req.body);
    return sendSuccess(res, room);
  } catch (err) {
    return next(err);
  }
}

export async function remove(req, res, next) {
  try {
    const result = await roomService.deleteRoom(req.params.id);
    return sendSuccess(res, result);
  } catch (err) {
    return next(err);
  }
}

export async function getLayout(req, res, next) {
  try {
    const layout = await roomService.getRoomLayout(req.params.id);
    return sendSuccess(res, layout);
  } catch (err) {
    return next(err);
  }
}

export async function updateLayout(req, res, next) {
  try {
    const layout = await roomService.updateRoomLayout(req.params.id, req.body);
    return sendSuccess(res, layout);
  } catch (err) {
    return next(err);
  }
}

import * as ticketService from '../services/ticket.service.js';
import { sendSuccess } from '../utils/response.js';

export const getTicketDetails = async (req, res, next) => {
    try {
        const { id } = req.params;
        const tickets = await ticketService.getTicketByNo(id);
        return sendSuccess(res, tickets);
    } catch (error) {
        next(error);
    }
};

export const lookupTicket = async (req, res, next) => {
    try {
        const { code, phone } = req.query;
        const tickets = await ticketService.lookupTickets({ code, phone });
        return sendSuccess(res, tickets);
    } catch (error) {
        next(error);
    }
};

export const cancelTicket = async (req, res, next) => {
    try {
        const { id } = req.params;
        const result = await ticketService.cancelTicketAndRefund(id);
        return sendSuccess(res, result);
    } catch (error) {
        next(error);
    }
};
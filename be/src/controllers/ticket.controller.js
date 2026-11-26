import * as ticketService from '../services/ticket.service.js';
import { sendSuccess } from '../utils/response.js';

export const getTicketDetails = async (req, res, next) => {
    try {
        const { id } = req.params;
        const ticket = await ticketService.getTicketById(id);
        return sendSuccess(res, ticket, 'Lấy chi tiết vé thành công');
    } catch (error) {
        next(error);
    }
};

export const lookupTicket = async (req, res, next) => {
    try {
        const { code, phone } = req.query;
        const tickets = await ticketService.lookupTicket({ code, phone });
        return sendSuccess(res, tickets, 'Tra cứu vé thành công');
    } catch (error) {
        next(error);
    }
};

export const cancelTicket = async (req, res, next) => {
    try {
        const { id } = req.params;
        const result = await ticketService.cancelTicket(id);
        return sendSuccess(res, result, 'Hủy vé và hoàn tiền thành công');
    } catch (error) {
        next(error);
    }
};
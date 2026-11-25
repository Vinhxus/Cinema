import * as priceRuleService from '../services/priceRule.service.js';
import { sendSuccess } from '../utils/response.js';

export async function list(req, res, next) {
  try {
    const rules = await priceRuleService.listPriceRules(req.query);
    return sendSuccess(res, rules);
  } catch (err) {
    return next(err);
  }
}

export async function create(req, res, next) {
  try {
    const rule = await priceRuleService.createPriceRule(req.body);
    return sendSuccess(res, rule, 201);
  } catch (err) {
    return next(err);
  }
}

export async function update(req, res, next) {
  try {
    const rule = await priceRuleService.updatePriceRule(
      req.params.id,
      req.body
    );
    return sendSuccess(res, rule);
  } catch (err) {
    return next(err);
  }
}

export async function remove(req, res, next) {
  try {
    const result = await priceRuleService.deletePriceRule(req.params.id);
    return sendSuccess(res, result);
  } catch (err) {
    return next(err);
  }
}

export async function applyShowtimeSurcharge(req, res, next) {
  try {
    const result = await priceRuleService.applyShowtimeSurcharge(req.body);
    return sendSuccess(res, result);
  } catch (err) {
    return next(err);
  }
}

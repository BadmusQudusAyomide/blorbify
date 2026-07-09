import { asyncHandler } from '../middleware/asyncHandler.js';
import { ok } from '../utils/response.js';
import { generateProductDescription } from '../services/ai.service.js';

export const createProductDescription = asyncHandler(async (req, res) => {
  const { name, category, price, type } = req.body || {};
  const result = await generateProductDescription({ name, category, price, type });
  return ok(res, { data: result });
});

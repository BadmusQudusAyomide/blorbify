import { asyncHandler } from '../middleware/asyncHandler.js';
import { ok } from '../utils/response.js';
import {
  createLogisticsCompany,
  deleteLogisticsCompany,
  listLogisticsCompanies,
  updateLogisticsCompany,
} from '../services/logistics.service.js';

export const getLogisticsCompanies = asyncHandler(async (req, res) => {
  const data = await listLogisticsCompanies();
  return ok(res, { data });
});

export const postLogisticsCompany = asyncHandler(async (req, res) => {
  const data = await createLogisticsCompany(req.body || {});
  return ok(res, { data }, 201);
});

export const putLogisticsCompany = asyncHandler(async (req, res) => {
  const data = await updateLogisticsCompany(req.params.companyId, req.body || {});
  return ok(res, { data });
});

export const removeLogisticsCompany = asyncHandler(async (req, res) => {
  await deleteLogisticsCompany(req.params.companyId);
  return ok(res, { data: { ok: true } });
});

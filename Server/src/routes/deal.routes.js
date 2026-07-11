import { Router } from "express";
import { createDeal, getDeals, updateDealStatus, deleteDeal } from "../controllers/deal.controller.js";
import authMiddleware from "../middlewares/auth.middleware.js";

const dealRouter = Router();

dealRouter.post('/', authMiddleware, createDeal);
dealRouter.get('/', authMiddleware, getDeals);
dealRouter.put('/:id/status', authMiddleware, updateDealStatus);
dealRouter.delete('/:id', authMiddleware, deleteDeal);

export default dealRouter;

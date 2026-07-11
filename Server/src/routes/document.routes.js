import { Router } from "express";
import { uploadDocument, getDocuments, signDocument, shareDocument, deleteDocument } from "../controllers/document.controller.js";
import authMiddleware from "../middlewares/auth.middleware.js";
import { upload } from "../middlewares/multer.middleware.js";

const documentRouter = Router();

documentRouter.post('/', authMiddleware, upload.single('file'), uploadDocument);
documentRouter.get('/', authMiddleware, getDocuments);
documentRouter.put('/:id/sign', authMiddleware, signDocument);
documentRouter.put('/:id/share', authMiddleware, shareDocument);
documentRouter.delete('/:id', authMiddleware, deleteDocument);

export default documentRouter;

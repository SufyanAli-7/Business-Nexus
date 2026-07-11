import { Router } from "express";
import { scheduleMeeting, getMeetings, updateMeetingStatus, deleteMeeting } from "../controllers/meeting.controller.js";
import authMiddleware from "../middlewares/auth.middleware.js";

const meetingRouter = Router();

meetingRouter.post('/', authMiddleware, scheduleMeeting);
meetingRouter.get('/', authMiddleware, getMeetings);
meetingRouter.put('/:id/status', authMiddleware, updateMeetingStatus);
meetingRouter.delete('/:id', authMiddleware, deleteMeeting);

export default meetingRouter;

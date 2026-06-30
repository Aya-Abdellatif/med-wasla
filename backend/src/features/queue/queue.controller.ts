import type { Request, Response, NextFunction } from "express";
import * as queueService from "./queue.service.js";

export const join = async (req: Request, res: Response, next: NextFunction) => {
	try {
		const user = req.user!;
		const { specialistId, appointmentId } = req.body;
		const result = await queueService.joinQueue(user.id, specialistId, appointmentId);
		res.status(201).json({ status: "success", data: result });
	} catch (err) {
		next(err);
	}
};

export const getQueue = async (req: Request, res: Response, next: NextFunction) => {
	try {
		const specialistId = req.params.specialistId as string;
        const q = await queueService.getQueue(specialistId);
		res.status(200).json({ status: "success", data: q ?? { entries: [] } });
	} catch (err) {
		next(err);
	}
};

export const myPosition = async (req: Request, res: Response, next: NextFunction) => {
	try {
		const user = req.user!;
		const result = await queueService.getMyPosition(user.id);
		res.status(200).json({ status: "success", data: result });
	} catch (err) {
		next(err);
	}
};

export const leave = async (req: Request, res: Response, next: NextFunction) => {
	try {
		const user = req.user!;
		const { appointmentId } = req.body;
		await queueService.leaveQueue(user.id, appointmentId);
		res.status(200).json({ status: "success", message: "Left queue" });
	} catch (err) {
		next(err);
	}
};

export const nextPatient = async (req: Request, res: Response, next: NextFunction) => {
	try {
		const user = req.user!;
		const result = await queueService.callNext(user.id);
		res.status(200).json({ status: "success", data: result });
	} catch (err) {
		next(err);
	}
};

export const setStatus = async (req: Request, res: Response, next: NextFunction) => {
	try {
		const user = req.user!;
		const { active } = req.body;
		const q = await queueService.setQueueStatus(user.id, !!active);
		res.status(200).json({ status: "success", data: q });
	} catch (err) {
		next(err);
	}
};

export const getQueueForAppointment = async (req: Request, res: Response, next: NextFunction) => {
	try {		
		const appointmentId = req.params.appointmentId as string;
		const result = await queueService.getQueueForAppointment(appointmentId);
		res.status(200).json({ status: "success", data: result });
	} catch (err) {
		next(err);
	}
};

export default {};


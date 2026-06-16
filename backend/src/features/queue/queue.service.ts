import mongoose from "mongoose";
import Queue from "../../models/queue.model.js";
import MedicalSpecialist from "../../models/medicalSpecialist.model.js";
import { Types } from "mongoose";
import AppError from "../../utils/AppError.js";

const startOfDay = (d: Date) => {
	const dt = new Date(d);
	dt.setHours(0, 0, 0, 0);
	return dt;
};

export const joinQueue = async (patientId: string, specialistId: string, appointmentId: string) => {
	const date = startOfDay(new Date());

	let queue = await Queue.findOne({ specialistId: specialistId, date });

	if (!queue) {
		queue = new Queue({ specialistId: specialistId, date, entries: [] });
	}

	// ensure not already in queue for same appointment
	const already = queue.entries.find((e) => e.patientId.toString() === patientId || e.appointmentId.toString() === appointmentId);
	if (already) throw new AppError("Already in queue", 400);

	const nextNumber = queue.entries.length === 0 ? 1 : Math.max(...queue.entries.map((e) => e.queueNumber)) + 1;

	queue.entries.push({ patientId: new Types.ObjectId(patientId), appointmentId: new Types.ObjectId(appointmentId), queueNumber: nextNumber, status: "waiting" });

	await queue.save();

	return { queueNumber: nextNumber, queue };
};

export const getQueue = async (specialistId: string) => {
	const date = startOfDay(new Date());
	const queue = await Queue.findOne({ specialistId, date }).lean();
	return queue;
};

export const getMyPosition = async (patientId: string) => {
	const date = startOfDay(new Date());
	const queue = await Queue.findOne({ date, "entries.patientId": patientId });
	if (!queue) throw new AppError("Not in any queue", 404);

	const entry = queue.entries.find((e) => e.patientId.toString() === patientId);
	if (!entry) throw new AppError("Not in any queue", 404);

	if (entry.status !== "waiting") return { position: 0, status: entry.status };

	const position = entry.queueNumber - (queue.currentNumber || 0);
	return { position, queue, entry };
};

export const leaveQueue = async (patientId: string, appointmentId?: string) => {
	const date = startOfDay(new Date());
	const query: any = { date };
	if (appointmentId) query["entries.appointmentId"] = appointmentId;
	query["entries.patientId"] = patientId;

	const queue = await Queue.findOne(query);
	if (!queue) throw new AppError("Queue entry not found", 404);

	const idx = queue.entries.findIndex((e) => e.patientId.toString() === patientId && (!appointmentId || e.appointmentId.toString() === appointmentId));
	if (idx === -1) throw new AppError("Queue entry not found", 404);

	// mark as cancelled
	queue.entries[idx].status = "cancelled";
	await queue.save();
	return { success: true };
};

export const callNext = async (specialistUserId: string) => {
	const specialist = await MedicalSpecialist.findOne({ userId: specialistUserId });
	if (!specialist) throw new AppError("Specialist profile not found", 404);

	const date = startOfDay(new Date());
	const queue = await Queue.findOne({ specialistId: specialist._id, date });
	if (!queue) throw new AppError("Queue not found", 404);

	if (!queue.isActive) throw new AppError("Queue is not active", 400);

	// find next waiting entry
	const waiting = queue.entries.filter((e) => e.status === "waiting");
	if (waiting.length === 0) return { message: "No waiting patients" };

	const next = waiting.reduce((prev, cur) => (cur.queueNumber < prev.queueNumber ? cur : prev));

	next.status = "in_progress";
	queue.currentNumber = next.queueNumber;
	await queue.save();

	return { next };
};

export const setQueueStatus = async (specialistUserId: string, active: boolean) => {
	const specialist = await MedicalSpecialist.findOne({ userId: specialistUserId });
	if (!specialist) throw new AppError("Specialist profile not found", 404);

	const date = startOfDay(new Date());
	const queue = await Queue.findOne({ specialistId: specialist._id, date });
	if (!queue) {
		// create queue doc to set status
		const q = new Queue({ specialistId: specialist._id, date, entries: [], isActive: active });
		await q.save();
		return q;
	}

	queue.isActive = active;
	await queue.save();
	return queue;
};

export default {};


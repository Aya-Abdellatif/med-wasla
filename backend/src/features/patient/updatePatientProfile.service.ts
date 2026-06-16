import User from "../../models/user.model.js";
import bcrypt from "bcrypt";
import AppError from "../../utils/AppError.js";
import { governorate } from "../../models/user.model.js";


export interface UpdatePatientProfileDto {
    name?: string;
    email?: string;
    phone?: string;
    governorate?: string;
    address?: string;
    password?: string;
    dob?: Date;
}

export const updatePatientProfileByUserId = async (_id: string, data: UpdatePatientProfileDto) => {

    const patient = await User.findOne({ _id });

    console.log("patient: ", patient);

    console.log("collection: ", User.collection);


    if (!patient) {
        throw new AppError("Patient profile not found", 404);
    }

    if (data.name !== undefined) patient.name = data.name;
    if (data.email !== undefined) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(data.email)) {
            throw new AppError("Invalid email format", 400);
        }
        patient.email = data.email;
    }
    if (data.phone !== undefined) {
        const cleanedPhone = data.phone.trim().replace(/[\s-]/g, "");
        const egyptPhoneRegex = /^0?1[0125][0-9]{8}$/;

        if (!egyptPhoneRegex.test(cleanedPhone)) {
            throw new AppError("Invalid Egyptian phone number", 400);
        }

        const normalizedPhone = cleanedPhone.startsWith("0")
            ? cleanedPhone
            : `0${cleanedPhone}`;

        patient.phone = normalizedPhone;
    }
    if (data.governorate !== undefined) {
        if (!governorate.includes(data.governorate)) {
            throw new AppError("Invalid governorate", 400);
        }
        patient.governorate = data.governorate;
    }
    if (data.address !== undefined) patient.address = data.address;
    if (data.dob !== undefined) patient.dob = data.dob;

    if (data.password) {
        patient.password = await bcrypt.hash(data.password, 10);
    }

    await patient.save();

    return patient;
};
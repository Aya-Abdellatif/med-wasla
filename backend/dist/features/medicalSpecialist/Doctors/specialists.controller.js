import { getAllSpecialistsService, getSpecialistByIdService, getSpecialistsBySpecializationService, updateSpecialistProfileService, updateAvailabilityService, updateFeesService, SpecialistsService, } from "./specialists.service.js";
// ─── Public Endpoints ─────────────────────────────────────────────────────────
/**
 * GET /api/specialists
 * Get all specialists with optional filtering and search
 */
export const getAllSpecialists = async (req, res) => {
    try {
        const result = await getAllSpecialistsService(req.query);
        res.status(200).json({ success: true, data: result });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
/**
 * GET /api/specialists/:id
 * Get a single specialist's profile by their MongoDB _id
 */
export const getSpecialistById = async (req, res) => {
    try {
        const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
        const specialist = await getSpecialistByIdService(id);
        res.status(200).json({ success: true, data: specialist });
    }
    catch (error) {
        const status = error.message === "Specialist not found" ? 404 : 500;
        res.status(status).json({ success: false, message: error.message });
    }
};
/**
 * GET /api/specialists/specialization/:name
 * Get all approved specialists filtered by specialization name
 */
export const getSpecialistsBySpecialization = async (req, res) => {
    try {
        const name = Array.isArray(req.params.name)
            ? req.params.name[0]
            : req.params.name;
        const specialists = await getSpecialistsBySpecializationService(name);
        res.status(200).json({ success: true, data: specialists });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
// ─── Protected Endpoints (main — JWT auth via routes) ─────────────────────────
export const updateProfile = async (req, res) => {
    try {
        const userId = req.user._id;
        const specialist = await updateSpecialistProfileService(userId, req.body);
        res.status(200).json({ success: true, data: specialist });
    }
    catch (error) {
        const status = error.message === "Specialist profile not found" ? 404 : 400;
        res.status(status).json({ success: false, message: error.message });
    }
};
export const updateAvailability = async (req, res) => {
    try {
        const userId = req.user._id;
        const specialist = await updateAvailabilityService(userId, req.body);
        res.status(200).json({ success: true, data: specialist });
    }
    catch (error) {
        const status = error.message === "Specialist profile not found" ? 404 : 400;
        res.status(status).json({ success: false, message: error.message });
    }
};
export const updateFees = async (req, res) => {
    try {
        const userId = req.user._id;
        const specialist = await updateFeesService(userId, req.body);
        res.status(200).json({ success: true, data: specialist });
    }
    catch (error) {
        const status = error.message === "Specialist profile not found" ? 404 : 400;
        res.status(status).json({ success: false, message: error.message });
    }
};
// ─── Specialist dashboard (your branch) ─────────────────────────────────────
export class SpecialistsController {
    static async getMe(req, res) {
        try {
            const user = req.user;
            const profile = await SpecialistsService.getProfile(user._id);
            res.status(200).json({ success: true, data: profile });
        }
        catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    }
    static async updateProfile(req, res) {
        try {
            const user = req.user;
            const updated = await SpecialistsService.updateProfile(user._id, req.body);
            res.status(200).json({
                success: true,
                message: "Profile updated and verification status reset to pending",
                data: updated,
            });
        }
        catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    }
    static async addCertificate(req, res) {
        try {
            const user = req.user;
            const updated = await SpecialistsService.addCertificate(user._id, req.body);
            res.status(200).json({ success: true, data: updated });
        }
        catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    }
}
//# sourceMappingURL=specialists.controller.js.map
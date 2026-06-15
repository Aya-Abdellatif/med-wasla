import { SpecialistsService } from "./specialists.service.js";
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
            // بنختار الداتا اللي مسموح تتعدل من الـ body
            const updated = await SpecialistsService.updateProfile(user._id, req.body);
            res.status(200).json({
                success: true,
                message: "Profile updated and verification status reset to pending",
                data: updated
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
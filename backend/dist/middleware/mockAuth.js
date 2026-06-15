import User from "../models/user.model.js";
/**
 * Mock authentication middleware.
 * Reads the `x-user-id` header to simulate a logged-in user.
 * Attaches the full User document to `req.user`.
 *
 * Usage from frontend: set header `x-user-id: <userId>` on every request.
 * Usage from Postman:  add header `x-user-id: <userId>`.
 */
export async function mockAuth(req, res, next) {
    const userId = req.headers["x-user-id"];
    if (!userId) {
        res.status(401).json({ success: false, message: "Missing x-user-id header (mock auth)" });
        return;
    }
    try {
        const user = await User.findById(userId);
        if (!user) {
            res.status(404).json({ success: false, message: "User not found" });
            return;
        }
        // Attach user to request object
        req.user = user;
        next();
    }
    catch (error) {
        res.status(500).json({ success: false, message: "Auth error", error: error.message });
    }
}
//# sourceMappingURL=mockAuth.js.map
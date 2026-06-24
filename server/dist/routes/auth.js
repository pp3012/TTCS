"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const AuthController_1 = require("../controllers/AuthController");
const authMiddleware_1 = require("../middleware/authMiddleware");
const router = (0, express_1.Router)();
router.post('/register', (req, res) => AuthController_1.authController.register(req, res));
router.post('/login', (req, res) => AuthController_1.authController.login(req, res));
router.get('/profile', authMiddleware_1.authenticate, (req, res) => AuthController_1.authController.getProfile(req, res));
router.put('/change-password', authMiddleware_1.authenticate, (req, res) => AuthController_1.authController.changePassword(req, res));
exports.default = router;
//# sourceMappingURL=auth.js.map
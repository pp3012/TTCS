"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const AdminController_1 = require("../controllers/AdminController");
const authMiddleware_1 = require("../middleware/authMiddleware");
const router = (0, express_1.Router)();
router.use(authMiddleware_1.authenticate, authMiddleware_1.requireAdmin);
router.get('/users', (req, res) => AdminController_1.adminController.getUsers(req, res));
router.get('/users/:id', (req, res) => AdminController_1.adminController.getUserById(req, res));
router.put('/users/:id', (req, res) => AdminController_1.adminController.updateUser(req, res));
router.delete('/users/:id', (req, res) => AdminController_1.adminController.deleteUser(req, res));
router.get('/stats/subjects', (req, res) => AdminController_1.adminController.getSubjectStats(req, res));
router.get('/stats/users', (req, res) => AdminController_1.adminController.getUserStats(req, res));
exports.default = router;
//# sourceMappingURL=admin.js.map
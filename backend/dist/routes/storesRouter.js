"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const storesController_1 = require("../controllers/storesController");
const router = (0, express_1.Router)();
router.get('/stores', storesController_1.getStores);
exports.default = router;

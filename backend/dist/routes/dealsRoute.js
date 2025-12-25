"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const dealsController_1 = require("../controllers/dealsController");
const router = (0, express_1.Router)();
router.get('/deals', dealsController_1.getGenDeals);
exports.default = router;

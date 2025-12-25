"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const gameDetailsController_1 = require("../controllers/gameDetailsController");
const router = (0, express_1.Router)();
router.get('/games/game/:id', gameDetailsController_1.getGameDetails);
exports.default = router;

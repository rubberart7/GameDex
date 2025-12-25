"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const errorHandler = (err, req, res, next) => {
    res.status(500).json({ msg: "Invalid request." });
    return;
};
exports.default = errorHandler;

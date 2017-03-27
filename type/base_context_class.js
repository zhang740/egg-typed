"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class BaseContextClass {
    constructor(ctx) {
        this.ctx = ctx;
        this.app = ctx.app;
        this.config = ctx.app.config;
        this.service = ctx.service;
    }
}
exports.BaseContextClass = BaseContextClass;

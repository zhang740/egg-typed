"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class Controller {
    constructor(ctx) {
        this.ctx = ctx;
        this.app = ctx.app;
        this.config = ctx.app.config;
        this.service = ctx.service;
    }
}
exports.Controller = Controller;

"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.VideoModule = void 0;
const common_1 = require("@nestjs/common");
const video_controller_1 = require("./video.controller");
const gemini_service_1 = require("../ai/gemini.service");
const unfurl_module_1 = require("../unfurl/unfurl.module");
let VideoModule = class VideoModule {
};
exports.VideoModule = VideoModule;
exports.VideoModule = VideoModule = __decorate([
    (0, common_1.Module)({
        imports: [unfurl_module_1.UnfurlModule],
        controllers: [video_controller_1.VideoController],
        providers: [
            {
                provide: 'GeminiService',
                useClass: gemini_service_1.GeminiService,
            },
        ],
    })
], VideoModule);
//# sourceMappingURL=video.module.js.map
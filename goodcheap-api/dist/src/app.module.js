"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const unfurl_module_1 = require("./unfurl/unfurl.module");
const analyze_module_1 = require("./analyze/analyze.module");
const psychology_module_1 = require("./psychology/psychology.module");
const cache_module_1 = require("./cache/cache.module");
const queue_module_1 = require("./queue/queue.module");
const database_module_1 = require("./database/database.module");
const video_module_1 = require("./video/video.module");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule.forRoot({ isGlobal: true }),
            unfurl_module_1.UnfurlModule,
            analyze_module_1.AnalyzeModule,
            psychology_module_1.PsychologyModule,
            cache_module_1.CacheModule,
            queue_module_1.QueueModule,
            database_module_1.DatabaseModule,
            video_module_1.VideoModule,
        ],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map
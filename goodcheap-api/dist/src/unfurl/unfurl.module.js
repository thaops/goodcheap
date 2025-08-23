"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UnfurlModule = void 0;
const common_1 = require("@nestjs/common");
const unfurl_service_1 = require("./unfurl.service");
const unfurl_controller_1 = require("./unfurl.controller");
let UnfurlModule = class UnfurlModule {
};
exports.UnfurlModule = UnfurlModule;
exports.UnfurlModule = UnfurlModule = __decorate([
    (0, common_1.Module)({
        providers: [
            unfurl_service_1.UnfurlService,
            {
                provide: 'UnfurlService',
                useExisting: unfurl_service_1.UnfurlService,
            },
            {
                provide: 'UnfurlInterface',
                useExisting: unfurl_service_1.UnfurlService,
            },
        ],
        controllers: [unfurl_controller_1.UnfurlController],
        exports: [unfurl_service_1.UnfurlService, 'UnfurlService', 'UnfurlInterface'],
    })
], UnfurlModule);
//# sourceMappingURL=unfurl.module.js.map
"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AnalyzeModule = void 0;
const common_1 = require("@nestjs/common");
const analyze_controller_1 = require("./analyze.controller");
const analyze_service_1 = require("./analyze.service");
const response_mapper_1 = require("./response.mapper");
const psychology_service_1 = require("../psychology/psychology.service");
const gemini_service_1 = require("../ai/gemini.service");
const unfurl_module_1 = require("../unfurl/unfurl.module");
const reviews_module_1 = require("../reviews/reviews.module");
const evidence_validator_1 = require("./evidence.validator");
const evidence_aggregator_1 = require("./evidence.aggregator");
const evidence_aggregator_interface_1 = require("../common/interfaces/evidence-aggregator.interface");
let AnalyzeModule = class AnalyzeModule {
};
exports.AnalyzeModule = AnalyzeModule;
exports.AnalyzeModule = AnalyzeModule = __decorate([
    (0, common_1.Module)({
        imports: [unfurl_module_1.UnfurlModule, reviews_module_1.ReviewsModule],
        providers: [
            analyze_service_1.AnalyzeService,
            psychology_service_1.PsychologyService,
            {
                provide: 'EvidenceValidator',
                useClass: evidence_validator_1.EvidenceValidator,
            },
            {
                provide: evidence_aggregator_interface_1.EVIDENCE_AGGREGATOR_TOKEN,
                useClass: evidence_aggregator_1.EvidenceAggregator
            },
            {
                provide: 'ResponseMapper',
                useClass: response_mapper_1.ResponseMapper
            },
            {
                provide: 'GeminiService',
                useClass: gemini_service_1.GeminiService
            }
        ],
        controllers: [analyze_controller_1.AnalyzeController],
        exports: [analyze_service_1.AnalyzeService],
    })
], AnalyzeModule);
//# sourceMappingURL=analyze.module.js.map
"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProductResponseModel = exports.DebugModel = exports.ShippingModel = exports.ReviewItemModel = void 0;
const swagger_1 = require("@nestjs/swagger");
class ReviewItemModel {
    authorAvatar;
    authorName;
    createdAt;
    helpfulCount;
    id;
    images;
    rating;
    text;
}
exports.ReviewItemModel = ReviewItemModel;
__decorate([
    (0, swagger_1.ApiProperty)({ required: false, type: String, nullable: true }),
    __metadata("design:type", String)
], ReviewItemModel.prototype, "authorAvatar", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ required: false, type: String, nullable: true }),
    __metadata("design:type", String)
], ReviewItemModel.prototype, "authorName", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ required: false, type: String, format: 'date-time', nullable: true }),
    __metadata("design:type", String)
], ReviewItemModel.prototype, "createdAt", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ required: false, type: Number, nullable: true }),
    __metadata("design:type", Number)
], ReviewItemModel.prototype, "helpfulCount", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ required: false, type: String, nullable: true }),
    __metadata("design:type", String)
], ReviewItemModel.prototype, "id", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ required: false, type: [String], nullable: true }),
    __metadata("design:type", Array)
], ReviewItemModel.prototype, "images", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ required: false, type: Number, nullable: true }),
    __metadata("design:type", Number)
], ReviewItemModel.prototype, "rating", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ type: String }),
    __metadata("design:type", String)
], ReviewItemModel.prototype, "text", void 0);
class ShippingModel {
    cod;
    freeThreshold;
    maxDays;
    minDays;
}
exports.ShippingModel = ShippingModel;
__decorate([
    (0, swagger_1.ApiProperty)({ required: false, type: Boolean, nullable: true }),
    __metadata("design:type", Boolean)
], ShippingModel.prototype, "cod", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ required: false, type: Number, nullable: true }),
    __metadata("design:type", Number)
], ShippingModel.prototype, "freeThreshold", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ required: false, type: Number, nullable: true }),
    __metadata("design:type", Number)
], ShippingModel.prototype, "maxDays", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ required: false, type: Number, nullable: true }),
    __metadata("design:type", Number)
], ShippingModel.prototype, "minDays", void 0);
class DebugModel {
    rawHtml;
    truncated;
    error;
    message;
}
exports.DebugModel = DebugModel;
__decorate([
    (0, swagger_1.ApiProperty)({ required: false, type: String, nullable: true }),
    __metadata("design:type", Object)
], DebugModel.prototype, "rawHtml", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ required: false, type: Boolean, nullable: true }),
    __metadata("design:type", Boolean)
], DebugModel.prototype, "truncated", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ required: false, type: String, nullable: true }),
    __metadata("design:type", String)
], DebugModel.prototype, "error", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ required: false, type: String, nullable: true }),
    __metadata("design:type", String)
], DebugModel.prototype, "message", void 0);
let ProductResponseModel = class ProductResponseModel {
    finalUrl;
    source;
    productId;
    title;
    images;
    price;
    currency;
    discountPrice;
    ratingAvg;
    reviewCount;
    shopName;
    shopId;
    description;
    specs;
    returnPolicy;
    returnWindowDays;
    buyerProtection;
    warranty;
    shipping;
    reviewsSample;
    _debug;
};
exports.ProductResponseModel = ProductResponseModel;
__decorate([
    (0, swagger_1.ApiProperty)({ type: String, format: 'uri' }),
    __metadata("design:type", String)
], ProductResponseModel.prototype, "finalUrl", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ enum: ['tiktok', 'shopee', 'lazada', 'other'] }),
    __metadata("design:type", String)
], ProductResponseModel.prototype, "source", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ required: false, type: String, nullable: true }),
    __metadata("design:type", String)
], ProductResponseModel.prototype, "productId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ required: false, type: String, nullable: true }),
    __metadata("design:type", String)
], ProductResponseModel.prototype, "title", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ type: [String] }),
    __metadata("design:type", Array)
], ProductResponseModel.prototype, "images", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ required: false, type: Number, nullable: true }),
    __metadata("design:type", Number)
], ProductResponseModel.prototype, "price", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ required: false, type: String, nullable: true }),
    __metadata("design:type", String)
], ProductResponseModel.prototype, "currency", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ required: false, type: Number, nullable: true }),
    __metadata("design:type", Number)
], ProductResponseModel.prototype, "discountPrice", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ required: false, type: Number, nullable: true }),
    __metadata("design:type", Number)
], ProductResponseModel.prototype, "ratingAvg", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ required: false, type: Number, nullable: true }),
    __metadata("design:type", Number)
], ProductResponseModel.prototype, "reviewCount", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ required: false, type: String, nullable: true }),
    __metadata("design:type", String)
], ProductResponseModel.prototype, "shopName", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ required: false, type: String, nullable: true }),
    __metadata("design:type", String)
], ProductResponseModel.prototype, "shopId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ required: false, type: String, nullable: true }),
    __metadata("design:type", String)
], ProductResponseModel.prototype, "description", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        required: false,
        nullable: true,
        type: 'object',
        additionalProperties: { type: 'string' },
    }),
    __metadata("design:type", Object)
], ProductResponseModel.prototype, "specs", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ required: false, type: String, nullable: true }),
    __metadata("design:type", String)
], ProductResponseModel.prototype, "returnPolicy", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ required: false, type: Number, nullable: true }),
    __metadata("design:type", Number)
], ProductResponseModel.prototype, "returnWindowDays", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        required: false,
        nullable: true,
        oneOf: [{ type: 'string' }, { type: 'boolean' }],
    }),
    __metadata("design:type", Object)
], ProductResponseModel.prototype, "buyerProtection", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ required: false, type: String, nullable: true }),
    __metadata("design:type", String)
], ProductResponseModel.prototype, "warranty", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ required: false, type: ShippingModel, nullable: true }),
    __metadata("design:type", ShippingModel)
], ProductResponseModel.prototype, "shipping", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ required: false, type: [ReviewItemModel], nullable: true }),
    __metadata("design:type", Array)
], ProductResponseModel.prototype, "reviewsSample", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ required: false, type: DebugModel, nullable: true }),
    __metadata("design:type", DebugModel)
], ProductResponseModel.prototype, "_debug", void 0);
exports.ProductResponseModel = ProductResponseModel = __decorate([
    (0, swagger_1.ApiExtraModels)(ReviewItemModel, ShippingModel, DebugModel)
], ProductResponseModel);
//# sourceMappingURL=unfurl.models.js.map
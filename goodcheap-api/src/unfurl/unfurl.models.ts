import { ApiExtraModels, ApiProperty } from '@nestjs/swagger';

export class ReviewItemModel {
  @ApiProperty({ required: false, type: String, nullable: true })
  authorAvatar?: string;

  @ApiProperty({ required: false, type: String, nullable: true })
  authorName?: string;

  @ApiProperty({ required: false, type: String, format: 'date-time', nullable: true })
  createdAt?: string;

  @ApiProperty({ required: false, type: Number, nullable: true })
  helpfulCount?: number;

  @ApiProperty({ required: false, type: String, nullable: true })
  id?: string;

  @ApiProperty({ required: false, type: [String], nullable: true })
  images?: string[];

  @ApiProperty({ required: false, type: Number, nullable: true })
  rating?: number;

  @ApiProperty({ type: String })
  text!: string;
}

export class ShippingModel {
  @ApiProperty({ required: false, type: Boolean, nullable: true })
  cod?: boolean;

  @ApiProperty({ required: false, type: Number, nullable: true })
  freeThreshold?: number;

  @ApiProperty({ required: false, type: Number, nullable: true })
  maxDays?: number;

  @ApiProperty({ required: false, type: Number, nullable: true })
  minDays?: number;
}

export class DebugModel {
  @ApiProperty({ required: false, type: String, nullable: true })
  rawHtml?: string | null;

  @ApiProperty({ required: false, type: Boolean, nullable: true })
  truncated?: boolean;

  @ApiProperty({ required: false, type: String, nullable: true })
  error?: string;

  @ApiProperty({ required: false, type: String, nullable: true })
  message?: string;
}

@ApiExtraModels(ReviewItemModel, ShippingModel, DebugModel)
export class ProductResponseModel {
  @ApiProperty({ type: String, format: 'uri' })
  finalUrl!: string;

  @ApiProperty({ enum: ['tiktok', 'shopee', 'lazada', 'other'] as const })
  source!: 'tiktok' | 'shopee' | 'lazada' | 'other';

  @ApiProperty({ required: false, type: String, nullable: true })
  productId?: string;

  @ApiProperty({ required: false, type: String, nullable: true })
  title?: string;

  @ApiProperty({ type: [String] })
  images!: string[];

  @ApiProperty({ required: false, type: Number, nullable: true })
  price?: number;

  @ApiProperty({ required: false, type: String, nullable: true })
  currency?: string;

  @ApiProperty({ required: false, type: Number, nullable: true })
  discountPrice?: number;

  @ApiProperty({ required: false, type: Number, nullable: true })
  ratingAvg?: number;

  @ApiProperty({ required: false, type: Number, nullable: true })
  reviewCount?: number;

  @ApiProperty({ required: false, type: String, nullable: true })
  shopName?: string;

  @ApiProperty({ required: false, type: String, nullable: true })
  shopId?: string;

  @ApiProperty({ required: false, type: String, nullable: true })
  description?: string;

  @ApiProperty({
    required: false,
    nullable: true,
    type: 'object' as any,
    additionalProperties: { type: 'string' },
  })
  specs?: Record<string, string>;

  @ApiProperty({ required: false, type: String, nullable: true })
  returnPolicy?: string;

  @ApiProperty({ required: false, type: Number, nullable: true })
  returnWindowDays?: number;

  @ApiProperty({
    required: false,
    nullable: true,
    oneOf: [{ type: 'string' }, { type: 'boolean' }],
  } as any)
  buyerProtection?: string | boolean;

  @ApiProperty({ required: false, type: String, nullable: true })
  warranty?: string;

  @ApiProperty({ required: false, type: ShippingModel, nullable: true })
  shipping?: ShippingModel;

  @ApiProperty({ required: false, type: [ReviewItemModel], nullable: true })
  reviewsSample?: ReviewItemModel[];

  @ApiProperty({ required: false, type: DebugModel, nullable: true })
  _debug?: DebugModel;
}

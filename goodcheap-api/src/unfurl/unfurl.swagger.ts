export const ProductDtoSwaggerSchema = {
  type: 'object',
  properties: {
    finalUrl: { type: 'string', format: 'uri' },
    source: { type: 'string', enum: ['tiktok', 'shopee', 'lazada', 'other'] },
    productId: { type: 'string', nullable: true },

    title: { type: 'string', nullable: true },
    images: { type: 'array', items: { type: 'string' } },
    price: { type: 'number', nullable: true },
    currency: { type: 'string', nullable: true },
    discountPrice: { type: 'number', nullable: true },

    ratingAvg: { type: 'number', nullable: true },
    reviewCount: { type: 'number', nullable: true },

    shopName: { type: 'string', nullable: true },
    shopId: { type: 'string', nullable: true },

    description: { type: 'string', nullable: true },
    specs: { type: 'object', additionalProperties: { type: 'string' }, nullable: true },

    returnPolicy: { type: 'string', nullable: true },
    returnWindowDays: { type: 'number', nullable: true },
    buyerProtection: {
      oneOf: [
        { type: 'string' },
        { type: 'boolean' }
      ],
      nullable: true,
    },
    warranty: { type: 'string', nullable: true },
    shipping: {
      type: 'object',
      properties: {
        cod: { type: 'boolean', nullable: true },
        freeThreshold: { type: 'number', nullable: true },
        maxDays: { type: 'number', nullable: true },
        minDays: { type: 'number', nullable: true },
      },
      nullable: true,
    },

    reviewsSample: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          authorAvatar: { type: 'string', nullable: true },
          authorName: { type: 'string', nullable: true },
          createdAt: { type: 'string', format: 'date-time', nullable: true },
          helpfulCount: { type: 'number', nullable: true },
          id: { type: 'string', nullable: true },
          images: { type: 'array', items: { type: 'string' }, nullable: true },
          rating: { type: 'number', nullable: true },
          text: { type: 'string' },
        },
      },
      nullable: true,
    },

    _debug: {
      type: 'object',
      properties: {
        rawHtml: { type: 'string', nullable: true },
        truncated: { type: 'boolean', nullable: true },
        error: { type: 'string', nullable: true },
        message: { type: 'string', nullable: true },
      },
      nullable: true,
    },
  },
  required: ['finalUrl', 'source', 'images'],
};

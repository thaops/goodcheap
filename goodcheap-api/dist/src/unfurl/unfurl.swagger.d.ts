export declare const ProductDtoSwaggerSchema: {
    type: string;
    properties: {
        finalUrl: {
            type: string;
            format: string;
        };
        source: {
            type: string;
            enum: string[];
        };
        productId: {
            type: string;
            nullable: boolean;
        };
        title: {
            type: string;
            nullable: boolean;
        };
        images: {
            type: string;
            items: {
                type: string;
            };
        };
        price: {
            type: string;
            nullable: boolean;
        };
        currency: {
            type: string;
            nullable: boolean;
        };
        discountPrice: {
            type: string;
            nullable: boolean;
        };
        ratingAvg: {
            type: string;
            nullable: boolean;
        };
        reviewCount: {
            type: string;
            nullable: boolean;
        };
        shopName: {
            type: string;
            nullable: boolean;
        };
        shopId: {
            type: string;
            nullable: boolean;
        };
        description: {
            type: string;
            nullable: boolean;
        };
        specs: {
            type: string;
            additionalProperties: {
                type: string;
            };
            nullable: boolean;
        };
        returnPolicy: {
            type: string;
            nullable: boolean;
        };
        returnWindowDays: {
            type: string;
            nullable: boolean;
        };
        buyerProtection: {
            oneOf: {
                type: string;
            }[];
            nullable: boolean;
        };
        warranty: {
            type: string;
            nullable: boolean;
        };
        shipping: {
            type: string;
            properties: {
                cod: {
                    type: string;
                    nullable: boolean;
                };
                freeThreshold: {
                    type: string;
                    nullable: boolean;
                };
                maxDays: {
                    type: string;
                    nullable: boolean;
                };
                minDays: {
                    type: string;
                    nullable: boolean;
                };
            };
            nullable: boolean;
        };
        reviewsSample: {
            type: string;
            items: {
                type: string;
                properties: {
                    authorAvatar: {
                        type: string;
                        nullable: boolean;
                    };
                    authorName: {
                        type: string;
                        nullable: boolean;
                    };
                    createdAt: {
                        type: string;
                        format: string;
                        nullable: boolean;
                    };
                    helpfulCount: {
                        type: string;
                        nullable: boolean;
                    };
                    id: {
                        type: string;
                        nullable: boolean;
                    };
                    images: {
                        type: string;
                        items: {
                            type: string;
                        };
                        nullable: boolean;
                    };
                    rating: {
                        type: string;
                        nullable: boolean;
                    };
                    text: {
                        type: string;
                    };
                };
            };
            nullable: boolean;
        };
        _debug: {
            type: string;
            properties: {
                rawHtml: {
                    type: string;
                    nullable: boolean;
                };
                truncated: {
                    type: string;
                    nullable: boolean;
                };
                error: {
                    type: string;
                    nullable: boolean;
                };
                message: {
                    type: string;
                    nullable: boolean;
                };
            };
            nullable: boolean;
        };
    };
    required: string[];
};

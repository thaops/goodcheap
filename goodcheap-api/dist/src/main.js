"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const app_module_1 = require("./app.module");
const config_1 = require("@nestjs/config");
const swagger_1 = require("@nestjs/swagger");
const express_1 = require("express");
async function bootstrap() {
    const app = await core_1.NestFactory.create(app_module_1.AppModule, { cors: true });
    const config = app.get(config_1.ConfigService);
    const startPort = Number(config.get('PORT') ?? 3000);
    const bodyLimit = String(config.get('JSON_BODY_LIMIT') ?? '2mb');
    app.use((0, express_1.json)({ limit: bodyLimit }));
    app.use((0, express_1.urlencoded)({ extended: true, limit: bodyLimit }));
    const swaggerEnabled = String(config.get('SWAGGER_ENABLE') ?? '1') === '1';
    if (swaggerEnabled) {
        const swaggerPath = String(config.get('SWAGGER_PATH') ?? 'docs').replace(/^\/+/, '');
        const title = String(config.get('SWAGGER_TITLE') ?? 'GoodCheap API');
        const description = String(config.get('SWAGGER_DESCRIPTION') ?? 'API documentation');
        const version = String(config.get('SWAGGER_VERSION') ?? '1.0');
        const swaggerConfig = new swagger_1.DocumentBuilder()
            .setTitle(title)
            .setDescription(description)
            .setVersion(version)
            .build();
        const document = swagger_1.SwaggerModule.createDocument(app, swaggerConfig);
        swagger_1.SwaggerModule.setup(swaggerPath, app, document);
        console.log(`Swagger UI available at /${swaggerPath}`);
    }
    let bound = false;
    for (let i = 0; i < 10; i++) {
        const port = startPort + i;
        try {
            await app.listen(port);
            console.log(`GoodCheap API listening on :${port}`);
            bound = true;
            break;
        }
        catch (err) {
            if (err && err.code === 'EADDRINUSE') {
                console.warn(`Port ${port} in use, trying ${port + 1}...`);
                continue;
            }
            throw err;
        }
    }
    if (!bound) {
        throw new Error(`No available port starting from ${startPort}.`);
    }
}
bootstrap();
//# sourceMappingURL=main.js.map
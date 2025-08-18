"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const app_module_1 = require("./app.module");
const config_1 = require("@nestjs/config");
async function bootstrap() {
    const app = await core_1.NestFactory.create(app_module_1.AppModule, { cors: true });
    const config = app.get(config_1.ConfigService);
    const startPort = Number(config.get('PORT') ?? 3000);
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
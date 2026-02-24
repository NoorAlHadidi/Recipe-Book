import { createServer } from 'http';
import { env } from '@/utils';
import { logger } from '@/utils/logger.util';
import app from '@/app';
import { databaseClient } from '@/database';

async function main() {
    const server = createServer(app);

    // initialize database connection
    await databaseClient.connect();

    const port = env.get('PORT');

    server.listen(port, () => {
        logger.debug(`Server is running on port ${port}.⬆️ `);
        logger.debug(`Swagger docs available at http://localhost:${port}/api-docs`);
    });
}

main();
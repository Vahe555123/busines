import 'dotenv/config';
import http from 'http';
import { connectDatabase } from './config/database.js';
import { createApp } from './app.js';
import { createSocketServer } from './socket.js';

const PORT = process.env.PORT ?? 3001;

async function bootstrap() {
  await connectDatabase();
  const app = createApp();
  const server = http.createServer(app);
  createSocketServer(server);
  server.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
  });
}

bootstrap().catch((err) => {
  console.error('Failed to start:', err);
  process.exit(1);
});

import http from 'http';
import { createApp } from './app';
import { env } from './config/env';
import { initSocketServer } from './config/socket';

const app = createApp();
const httpServer = http.createServer(app);

initSocketServer(httpServer);

httpServer.listen(env.port, () => {
  console.log(`Backend listening on port ${env.port} (${env.nodeEnv})`);
});

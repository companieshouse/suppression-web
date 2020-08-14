import { Server } from './Server';

const server = new Server(Number(process.env.PORT) || 3000);
server.start();

import {Server} from './server';

const server = new Server(Number(process.env.PORT) || 3000);
server.start();

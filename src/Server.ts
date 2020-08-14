import 'reflect-metadata';
import { ApplicationFactory } from './ApplicationFactory';
import './controllers/index';

export class Server {
    constructor(private port: number) {
    }

    public start(): void {
        ApplicationFactory.createInstance().listen(this.port, () => {
            console.log(('  App is running at http://localhost:%d'), this.port);
            console.log('   Press CTRL-C to stop\n');
        });
    }
}

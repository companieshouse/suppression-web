import { Application } from 'express';
import { Container } from 'inversify';
import { InversifyExpressServer } from 'inversify-express-utils';
import { createContainer } from './ContainerFactory';
import { createExpressConfig } from './ExpressConfigFunctionFactory';

export class ApplicationFactory {
    public static createInstance(container: Container = createContainer()): Application {
        const server = new InversifyExpressServer(container);
        server.setConfig(createExpressConfig());
        return server.build();
    }
}

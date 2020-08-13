import { Container } from 'inversify';
import { buildProviderModule } from 'inversify-binding-decorators';

export function createContainer(): Container {
    const container = new Container();
    container.load(buildProviderModule());
    return container;
}

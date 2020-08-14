import { BaseHttpController, controller, httpGet } from 'inversify-express-utils';
import { ROOT_URI } from '../routes/paths';

@controller(ROOT_URI)
export class HomeController extends BaseHttpController {

    @httpGet('')
    public async sayHello(): Promise<string> {
        return new Promise<string>((resolve, reject) =>
            this.httpContext.response
                .status(200)
                .render('index', (err: Error, html: string) => err ? reject(err) : resolve(html)));
    }
}

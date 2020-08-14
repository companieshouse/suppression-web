import { NextFunction, Request, Response } from 'express';

export class HomeController {

    public sayHello = (req: Request, res: Response, next: NextFunction) => res.render('index');
}

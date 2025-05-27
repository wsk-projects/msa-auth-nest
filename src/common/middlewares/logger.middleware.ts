import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class LoggerMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction): void {
    console.log('--- [HTTP Request] ---');
    console.log(`${req.method} ${req.originalUrl} HTTP/${req.httpVersion}`);
    console.log('Headers:', req.headers);
    console.log('Body:', req.body);
    console.log('------------------------');
    next();
  }
}

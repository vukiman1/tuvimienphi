import { type NextFunction, type Request, type Response } from 'express';

const BASIC_SCHEME = 'Basic';

export function createQueueBoardAuth(user: string, password: string, isProduction: boolean) {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!password) {
      if (isProduction) {
        res.status(503).send('Queue dashboard is disabled: set QUEUE_BOARD_PASSWORD to enable it.');
        return;
      }
      next();
      return;
    }

    const [scheme, encoded] = (req.headers.authorization ?? '').split(' ');
    if (scheme === BASIC_SCHEME && encoded) {
      const [providedUser, providedPassword] = Buffer.from(encoded, 'base64').toString().split(':');
      if (providedUser === user && providedPassword === password) {
        next();
        return;
      }
    }

    res.setHeader('WWW-Authenticate', `${BASIC_SCHEME} realm="queues"`);
    res.status(401).send('Authentication required');
  };
}

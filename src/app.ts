import { PORT } from './utils/exportEnv';
import { winstonLogger } from './utils';
import morgan from 'morgan';

import {
  globalErrorHandler,
  globalNotFoundHandler,
} from './middlewares/common';

import express from 'express';
import type { Request, Response } from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import path from 'path';

const init = () => {
  const app = express();
  app.use(express.static(path.join(__dirname, 'public')));

  app.use(bodyParser.json());
  app.use(bodyParser.urlencoded({ extended: true }));
  app.use(cors());
  app.use(helmet());
  app.use(compression());
  app.use(morgan('dev'));

  app.get('/', (req: Request, res: Response) => {
    winstonLogger.info('Log');
    res.send(`Hello, TypeScript Express!  ${PORT} `);
  });

  app.use(globalNotFoundHandler);
  app.use(globalErrorHandler);

  app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
  });
};

init();

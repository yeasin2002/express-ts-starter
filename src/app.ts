import express, { Request, Response } from 'express';
import { PORT } from './utils/exportEnv';
import { logger } from './utils';

const app = express();

app.use(express.json());

app.get('/', (request: Request, response: Response) => {
  logger.info('GET / - Home route accessed');
  response.status(200).send('Hello Yeasin');
});

app
  .listen(PORT, () => {
    console.log('Server running at PORT: ', PORT);
  })
  .on('error', (error) => {
    // gracefully handle error
    throw new Error(error.message);
  });

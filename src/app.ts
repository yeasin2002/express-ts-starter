import express, { Request, Response } from 'express';
import { PORT } from './utils/exportEnv';

const app = express();

app.get('/', (request: Request, response: Response) => {
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

import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { initDB } from './db.js';
import todosRouter from './routes/todos.js';

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.PORT ?? 3001;
const isProduction = process.env.NODE_ENV === 'production';

app.use(cors());
app.use(express.json());

app.use('/api/todos', todosRouter);

app.get('/health', (_req, res) => {
  res.json({ status: 'ok' });
});

if (isProduction) {
  const clientDist = path.join(__dirname, '../../dist/client');
  app.use(express.static(clientDist));
  app.get('*', (_req, res) => {
    res.sendFile(path.join(clientDist, 'index.html'));
  });
}

async function start() {
  await initDB();
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

start().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});

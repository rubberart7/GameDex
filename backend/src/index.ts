import cors from 'cors';
import express from 'express';

const app = express();

app.use(cors({ origin: 'http://localhost:3000' })); // allow frontend origin

app.get('/api/hello', (req, res) => {
  res.json({ message: 'Hello from backend!' });
});

const PORT = 4000;
app.listen(PORT, () => console.log(`Server running on ${PORT}`));

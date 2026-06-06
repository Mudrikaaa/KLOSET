import express from 'express';
import { json } from 'body-parser';
import { exampleRouter } from './components/example';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(json());
app.use('/api/example', exampleRouter);

app.get('/', (req, res) => {
    res.send('Welcome to my project!');
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
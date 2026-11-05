import express from 'express';
import type { Request, Response } from 'express';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 3000;  
const API_KEY = process.env.TRELLO_API_KEY!;
const TOKEN = process.env.TRELLO_TOKEN!;
const TOTAL_CARD_ID = process.env.TOTAL_CARD_ID!;
const DONE_CARD_ID = process.env.DONE_CARD_ID!;
const RESULT_CARD_ID = process.env.RESULT_CARD_ID!;

app.head('/webhook', (req: Request, res: Response) => {
    res.status(200).send('OK');
});

app.post('/webhook', async (req: Request, res: Response) => {
    res.status(200).send('OK');

    try {
        const [totalRes, doneRes] = await Promise.all([
            fetch(`https://api.trello.com/1/cards/${TOTAL_CARD_ID}?key=${API_KEY}&token=${TOKEN}`),
            fetch(`https://api.trello.com/1/cards/${DONE_CARD_ID}?key=${API_KEY}&token=${TOKEN}`)
        ]);

const totalData = (await totalRes.json()) as { name: string };
const doneData = (await doneRes.json()) as { name: string };

const totalCount = parseInt(totalData.name.replace(/\D/g, ''), 10) || 0;
const doneCount = parseInt(doneData.name.replace(/\D/g, ''), 10) || 0;

if (totalCount > 0) {
    const percentage = Math.round((doneCount / totalCount) * 100);
    const newName = 'edistymisprosentti: ' + percentage + '%';

    await fetch(`https://api.trello.com/1/cards/${RESULT_CARD_ID}?key=${API_KEY}&token=${TOKEN}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newName })
    });
console.log(`Updated result card name to: ${newName}`);
}
    } catch (error) {
        console.error('Error updating result card:', error);
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
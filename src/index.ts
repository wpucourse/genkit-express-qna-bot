import express from 'express';
import { qnaFlow } from './helpers/genkit';

(async function init() {
  try {
    const app = express();

    app.use(express.urlencoded({ extended: true }));
    app.use(express.json());

    app.post('/generate-answer', (req, res) => {
      qnaFlow(req.body.question)
        .then((result) => {
          return res.status(200).json(result);
        })
        .catch((error) => {
          return res.status(500).json(error.message);
        });
    });

    app.listen(process.env.PORT || 4000, () => {
      console.log(`Server is running on http://localhost:${process.env.PORT}`);
    });
  } catch (error) {
    console.log(error);
  }
})();

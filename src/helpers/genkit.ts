import { googleAI, gemini20Flash } from '@genkit-ai/googleai';
import { genkit, z } from 'genkit';
import pdf from 'pdf-parse';

// Initialize AI
const ai = genkit({
  plugins: [
    googleAI({
      apiKey: process.env.GOOGLE_GENAI_API_KEY,
    }),
  ],
  model: gemini20Flash,
});

// Fetch PDF
async function fetchPdf(url: string) {
  const response = await fetch(url);
  const buffer = await response.arrayBuffer();
  return new Uint8Array(buffer);
}

// Define Result Schema
const resultSchema = z.object({
  message: z.string(),
});

// Define QnA Flow
export const qnaFlow = ai.defineFlow(
  {
    name: 'qnaFlow',
    inputSchema: z.string(),
    outputSchema: z.object({
      message: z.string(),
    }),
  },
  async (prompt) => {
    // Fetch PDF File from cloud storage and convert it to text
    const data = await fetchPdf(process.env.PDF_URL as string);
    const pdfText = await pdf(Buffer.from(data));

    // Generate answer from AI
    const { output } = await ai.generate({
      system: `You are a chatbot who can help provide answers to any questions 
      asked based on knowledge of the documents.`,
      prompt: `${pdfText.text}\n\n${prompt}`,
      output: {
        schema: resultSchema,
      },
    });
    if (!output) {
      throw new Error('Failed to generate output');
    }
    return output;
  },
);

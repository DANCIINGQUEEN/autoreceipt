// utils/analyzeTextWithGpt.js
import OpenAI from "openai";
import { z } from "zod";
import { zodResponseFormat } from "openai/helpers/zod";

// OpenAI 초기화
const openai = new OpenAI({
  apiKey: process.env.NEXT_PUBLIC_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true,
});

const ReceiptSchema = z.object({
  date: z.string(), // YYYY-MM-DD 형식
  total_amount: z.number(),
  store_name: z.string(),
});

export async function analyzeTextWithGpt(receiptText) {
  const completion = await openai.beta.chat.completions.parse({
    model: "gpt-4o-2024-08-06",
    messages: [
      {
        role: "system",
        content:
          "You are an assistant that extracts structured payment info from text.",
      },
      {
        role: "user",
        content: `Here is the receipt text:\n\n${receiptText}\n\nPlease extract transaction date and total amountand store name.`,
      },
    ],
    response_format: zodResponseFormat(ReceiptSchema, "receipt_data"),
  });

  return completion.choices[0].message.parsed;
}

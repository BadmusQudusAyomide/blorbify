import axios from 'axios';
import { env } from './env.js';

const xaiHttp = axios.create({
  baseURL: env.xaiBaseUrl,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

export function requireXaiApiKey() {
  if (!env.xaiApiKey) {
    throw new Error('XAI_API_KEY is not configured.');
  }
}

export async function createXaiResponse(input, { effort = 'low' } = {}) {
  requireXaiApiKey();

  const response = await xaiHttp.post(
    '/v1/responses',
    {
      model: env.xaiModel,
      reasoning: { effort },
      input,
    },
    {
      headers: { Authorization: `Bearer ${env.xaiApiKey}` },
    }
  );

  return response.data;
}

// The Responses API returns output as an array of items (reasoning items,
// message items, etc.) — the text we want lives in the first message item's
// content array, not at a fixed top-level field.
export function extractXaiOutputText(responseData) {
  if (typeof responseData?.output_text === 'string') {
    return responseData.output_text;
  }

  const output = Array.isArray(responseData?.output) ? responseData.output : [];
  for (const item of output) {
    const content = Array.isArray(item?.content) ? item.content : [];
    const textPart = content.find((part) => typeof part?.text === 'string');
    if (textPart) return textPart.text;
  }

  return '';
}

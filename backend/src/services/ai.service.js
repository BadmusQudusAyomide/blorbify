import { createHttpError } from '../utils/httpError.js';
import { createXaiResponse, extractXaiOutputText } from '../config/xai.js';

const MAX_FIELD_LENGTH = 120;

function clean(value, maxLength = MAX_FIELD_LENGTH) {
  return String(value || '').trim().slice(0, maxLength);
}

export async function generateProductDescription({ name, category, price, type }) {
  const productName = clean(name);
  if (!productName) {
    throw createHttpError(400, 'Product name is required.');
  }

  const productCategory = clean(category);
  const productType = type === 'digital' ? 'digital download' : 'physical product';
  const numericPrice = Number(price);
  const priceLine = Number.isFinite(numericPrice) && numericPrice > 0
    ? `It sells for ₦${numericPrice.toLocaleString('en-NG')}.`
    : '';

  const prompt = [
    'Write a short, persuasive product description for an online store listing.',
    `Product name: ${productName}`,
    productCategory ? `Category: ${productCategory}` : '',
    `Type: ${productType}`,
    priceLine,
    'Write 2-3 sentences (max 60 words), plain text only, no markdown, no headings, no emoji, and no surrounding quotation marks. Speak directly to the customer and highlight what makes it worth buying.',
  ].filter(Boolean).join('\n');

  let responseData;
  try {
    responseData = await createXaiResponse(prompt, { effort: 'low' });
  } catch (error) {
    const status = error.response?.status;
    if (status === 401 || status === 403) {
      throw createHttpError(502, 'AI description service is not configured correctly.');
    }
    throw createHttpError(502, 'AI description service is unavailable right now. Please try again.');
  }

  const description = extractXaiOutputText(responseData).trim();
  if (!description) {
    throw createHttpError(502, 'AI description service returned an empty response.');
  }

  return { description };
}

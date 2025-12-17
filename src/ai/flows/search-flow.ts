
'use server';
/**
 * @fileoverview A search query interpretation AI flow.
 *
 * - interpretSearchQuery - A function that interprets a natural language search query.
 * - SearchQueryInput - The input type for the interpretSearchQuery function.
 * - SearchQueryOutput - The return type for the interpretSearchQuery function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { getCategories } from '@/lib/data';

const categories = getCategories().map(c => c.id);

const SearchQueryInputSchema = z.object({
  query: z.string().describe('The natural language search query from the user.'),
});
export type SearchQueryInput = z.infer<typeof SearchQueryInputSchema>;

const SearchQueryOutputSchema = z.object({
  searchTerm: z
    .string()
    .optional()
    .describe(
      'The core product or item the user is looking for. This should be a concise and generic term.'
    ),
  category: z
    .string()
    .optional()
    .describe(`The suggested product category. Must be one of: ${categories.join(', ')}`),
  condition: z
    .enum(['Nuevo', 'Usado'])
    .optional()
    .describe('The condition of the product if mentioned.'),
  minPrice: z
    .number()
    .optional()
    .describe('The minimum price extracted from the query.'),
  maxPrice: z
    .number()
    .optional()
    .describe('The maximum price extracted from the query.'),
});
export type SearchQueryOutput = z.infer<typeof SearchQueryOutputSchema>;

const prompt = ai.definePrompt({
  name: 'searchInterpreterPrompt',
  input: { schema: SearchQueryInputSchema },
  output: { schema: SearchQueryOutputSchema },
  prompt: `You are an intelligent search query interpreter for a Tijuana-based marketplace app. Your task is to analyze the user's search query and break it down into structured search parameters.

User Query: {{{query}}}

Analyze the query and extract the following information:
- The main search term (e.g., "laptop", "bicicleta", "zapatos de mujer"). This should be the core item, separate from modifiers like price, condition, or category.
- A relevant category, if it can be inferred. Available categories are: ${categories.join(', ')}.
- The product's condition, if specified (either "Nuevo" or "Usado").
- A minimum and maximum price, if mentioned.
  - For phrases like "less than 500 pesos" or "no more than 500", set maxPrice to 500.
  - For "more than 1000", set minPrice to 1000.
  - For "around 2000", you can set a range like minPrice: 1800, maxPrice: 2200.
  - If a single price is mentioned (e.g., "iPhone for 8000"), set both minPrice and maxPrice close to that value to create a narrow range.

Return the result as a JSON object matching the output schema. If a field is not present in the query, omit it from the output. Be concise with the searchTerm.`,
});


export async function interpretSearchQuery(
  input: SearchQueryInput
): Promise<SearchQueryOutput> {
  const { output } = await prompt(input);
  return output!;
}

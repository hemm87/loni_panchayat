'use server';

/**
 * @fileOverview This file defines a Genkit flow for providing proactive system feedback on tax assessment completeness.
 *
 * - adminDashboardTaxAssessmentFeedback - A function that generates feedback on tax assessment completeness.
 * - AdminDashboardTaxAssessmentFeedbackInput - The input type for the adminDashboardTaxAssessmentFeedback function.
 * - AdminDashboardTaxAssessmentFeedbackOutput - The return type for the adminDashboardTaxAssessmentFeedback function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AdminDashboardTaxAssessmentFeedbackInputSchema = z.object({
  totalProperties: z
    .number()
    .describe('The total number of properties in the system.'),
  pendingTaxes: z
    .number()
    .describe('The number of properties with pending tax assessments.'),
  paidTaxes: z
    .number()
    .describe('The number of properties with paid tax assessments.'),
  lowAssessmentAmount: z
    .number()
    .describe('The number of properties with unusually low assessment amounts.'),
  highAssessmentAmount: z
    .number()
    .describe('The number of properties with unusually high assessment amounts.'),
  incompletePropertyData: z
    .number()
    .describe(
      'The number of properties with incomplete data, such as missing area or owner information.'
    ),
});

export type AdminDashboardTaxAssessmentFeedbackInput = z.infer<
  typeof AdminDashboardTaxAssessmentFeedbackInputSchema
>;

const AdminDashboardTaxAssessmentFeedbackOutputSchema = z.object({
  feedback: z
    .string()
    .describe(
      'A summary of the overall tax assessment completeness, highlighting edge cases and anomalies.'
    ),
});

export type AdminDashboardTaxAssessmentFeedbackOutput = z.infer<
  typeof AdminDashboardTaxAssessmentFeedbackOutputSchema
>;

export async function adminDashboardTaxAssessmentFeedback(
  input: AdminDashboardTaxAssessmentFeedbackInput
): Promise<AdminDashboardTaxAssessmentFeedbackOutput> {
  return adminDashboardTaxAssessmentFeedbackFlow(input);
}

const prompt = ai.definePrompt({
  name: 'adminDashboardTaxAssessmentFeedbackPrompt',
  input: {schema: AdminDashboardTaxAssessmentFeedbackInputSchema},
  output: {schema: AdminDashboardTaxAssessmentFeedbackOutputSchema},
  prompt: `You are an expert tax assessment analyst providing feedback to a Panchayat admin based on the current state of the tax assessment system.

  Analyze the following data and provide a concise summary of the overall tax assessment completeness, highlighting any edge cases or anomalies that require attention.

  Total Properties: {{{totalProperties}}}
  Pending Taxes: {{{pendingTaxes}}}
  Paid Taxes: {{{paidTaxes}}}
  Low Assessment Amount: {{{lowAssessmentAmount}}}
  High Assessment Amount: {{{highAssessmentAmount}}}
  Incomplete Property Data: {{{incompletePropertyData}}}

  Focus on identifying potential issues such as a high number of pending taxes, significant discrepancies in assessment amounts, or a large number of properties with incomplete data.
  Provide actionable insights to help the admin quickly identify and address these issues.
`,
});

const adminDashboardTaxAssessmentFeedbackFlow = ai.defineFlow(
  {
    name: 'adminDashboardTaxAssessmentFeedbackFlow',
    inputSchema: AdminDashboardTaxAssessmentFeedbackInputSchema,
    outputSchema: AdminDashboardTaxAssessmentFeedbackOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);

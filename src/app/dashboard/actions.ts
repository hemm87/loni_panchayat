
'use server';

import {
  adminDashboardTaxAssessmentFeedback,
  type AdminDashboardTaxAssessmentFeedbackInput,
} from '@/ai/flows/admin-dashboard-tax-assessment-feedback';

export async function getTaxAssessmentFeedback(
  input: AdminDashboardTaxAssessmentFeedbackInput
) {
  try {
    const result = await adminDashboardTaxAssessmentFeedback(input);
    return { success: true, feedback: result.feedback };
  } catch (error) {
    console.error('Error generating AI feedback:', error);
    return { success: false, error: 'Failed to generate feedback from AI model.' };
  }
}

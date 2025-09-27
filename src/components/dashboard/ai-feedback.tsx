'use client';

import { useState } from 'react';
import { Bot, Sparkles } from 'lucide-react';
import { type AdminDashboardTaxAssessmentFeedbackInput } from '@/ai/flows/admin-dashboard-tax-assessment-feedback';
import { getTaxAssessmentFeedback } from '@/app/dashboard/actions';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '../ui/skeleton';

interface AiFeedbackProps {
  stats: AdminDashboardTaxAssessmentFeedbackInput;
}

export default function AiFeedback({ stats }: AiFeedbackProps) {
  const [feedback, setFeedback] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleGenerateFeedback = async () => {
    setIsLoading(true);
    setFeedback('');
    const result = await getTaxAssessmentFeedback(stats);
    if (result.success && result.feedback) {
      setFeedback(result.feedback);
    } else {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: result.error,
      });
    }
    setIsLoading(false);
  };

  return (
    <Card className="flex h-full flex-col">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Sparkles className="h-6 w-6 text-primary" />
          <CardTitle className="font-headline text-xl">
            AI Assessment Insights
          </CardTitle>
        </div>
        <CardDescription>
          Proactive system feedback on tax assessment completeness.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-1">
        {isLoading ? (
          <div className="space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
          </div>
        ) : feedback ? (
          <div className="prose prose-sm max-w-none text-foreground">
            <p>{feedback}</p>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-muted-foreground/30 bg-muted/20 p-8 text-center">
            <Bot className="h-10 w-10 text-muted-foreground/50" />
            <p className="mt-4 text-sm text-muted-foreground">
              Click the button to generate AI-powered insights and identify
              potential anomalies in your tax data.
            </p>
          </div>
        )}
      </CardContent>
      <CardFooter>
        <Button
          onClick={handleGenerateFeedback}
          disabled={isLoading}
          className="w-full bg-accent text-accent-foreground hover:bg-accent/90"
        >
          {isLoading ? (
            <>
              <Sparkles className="mr-2 h-4 w-4 animate-spin" /> Generating...
            </>
          ) : (
            <>
              <Sparkles className="mr-2 h-4 w-4" /> Generate Feedback
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  );
}


'use client';

import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface PageHeaderProps {
  title: string;
  titleHi: string;
  description?: string;
  descriptionHi?: string;
  showBackButton?: boolean;
  onBack?: () => void;
  action?: {
    label: string;
    labelHi: string;
    onClick: () => void;
    icon?: React.ReactNode;
    variant?: 'default' | 'outline' | 'ghost' | 'secondary' | 'link' | 'destructive' | null;
  };
  breadcrumbs?: Array<{
    label: string;
    onClick?: () => void;
  }>;
}

export function PageHeader({
  title,
  titleHi,
  description,
  descriptionHi,
  showBackButton,
  onBack,
  action,
  breadcrumbs,
}: PageHeaderProps) {
  return (
    <div className="mb-6 space-y-4">
      {breadcrumbs && breadcrumbs.length > 0 && (
        <div className="flex items-center text-sm text-muted-foreground">
          {breadcrumbs.map((crumb, index) => (
            <React.Fragment key={index}>
              <button
                onClick={crumb.onClick}
                className={cn('hover:underline', !crumb.onClick && 'pointer-events-none')}
                disabled={!crumb.onClick}
              >
                {crumb.label}
              </button>
              {index < breadcrumbs.length - 1 && <span className="mx-2">/</span>}
            </React.Fragment>
          ))}
        </div>
      )}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex items-center gap-4">
          {showBackButton && (
            <Button variant="outline" size="icon" onClick={onBack} className="shrink-0">
              <ArrowLeft className="h-5 w-5" />
              <span className="sr-only">Back</span>
            </Button>
          )}
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-gray-800 md:text-3xl">
              {title} • <span className="font-normal">{titleHi}</span>
            </h1>
            {description && (
              <p className="mt-1 text-muted-foreground">
                {description} • {descriptionHi}
              </p>
            )}
          </div>
        </div>
        {action && (
          <Button
            onClick={action.onClick}
            variant={action.variant || 'default'}
            className="shrink-0"
          >
            {action.icon}
            <div className="flex flex-col text-left -space-y-1">
                <span>{action.label}</span>
                <span className="text-xs opacity-80">{action.labelHi}</span>
            </div>
          </Button>
        )}
      </div>
    </div>
  );
}

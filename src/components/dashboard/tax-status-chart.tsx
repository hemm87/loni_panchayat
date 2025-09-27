'use client';

import { TrendingUp } from 'lucide-react';
import { Pie, PieChart, Cell } from 'recharts';

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart';
import type { TaxRecord } from '@/lib/types';

interface TaxStatusChartProps {
  taxes: TaxRecord[];
}

const COLORS = {
  Paid: 'hsl(var(--chart-2))',
  Unpaid: 'hsl(var(--chart-5))',
  Partial: 'hsl(var(--chart-4))',
};

export function TaxStatusChart({ taxes }: TaxStatusChartProps) {
  const statusCounts = taxes.reduce(
    (acc, tax) => {
      acc[tax.paymentStatus] = (acc[tax.paymentStatus] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>
  );

  const chartData = Object.entries(statusCounts).map(([status, count]) => ({
    status,
    count,
    fill: COLORS[status as keyof typeof COLORS],
  }));

  const totalTaxes = taxes.length;

  return (
    <Card className="flex h-full flex-col">
      <CardHeader className="items-center pb-0">
        <CardTitle>Tax Payment Status</CardTitle>
        <CardDescription>Distribution of tax records by payment status</CardDescription>
      </CardHeader>
      <CardContent className="flex-1 pb-0">
        <ChartContainer
          config={{}}
          className="mx-auto aspect-square max-h-[300px]"
        >
          <PieChart>
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent hideLabel />}
            />
            <Pie
              data={chartData}
              dataKey="count"
              nameKey="status"
              innerRadius={60}
              strokeWidth={5}
            >
              {chartData.map((entry) => (
                <Cell key={`cell-${entry.status}`} fill={entry.fill} />
              ))}
            </Pie>
          </PieChart>
        </ChartContainer>
      </CardContent>
      <CardFooter className="flex-col gap-2 text-sm">
        <div className="flex w-full items-center justify-center gap-2 font-medium leading-none">
          Total Tax Records: {totalTaxes}
        </div>
        <div className="leading-none text-muted-foreground">
          Showing distribution for all properties
        </div>
        <div className="flex w-full max-w-xs justify-center gap-4 pt-4 text-xs">
          {chartData.map(({ status, count }) => (
            <div key={status} className="flex items-center gap-1.5">
              <div className="size-2.5 rounded-full" style={{backgroundColor: COLORS[status as keyof typeof COLORS]}}></div>
              <span>{status}</span>
              <span className="font-semibold text-foreground">{count}</span>
            </div>
          ))}
        </div>
      </CardFooter>
    </Card>
  );
}

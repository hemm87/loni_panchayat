/**
 * Dashboard Charts Component
 * 
 * Displays:
 * - Monthly Revenue Bar Chart
 * - Property Distribution Pie Chart
 */

'use client';

import { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import { BarChart3, Building } from 'lucide-react';
import type { Property } from '@/lib/types';

interface DashboardChartsProps {
  properties: Property[];
}

const PIE_COLORS = ['#0088FE', '#00C49F', '#FFBB28'];

/**
 * Displays charts for revenue and property distribution
 */
export function DashboardCharts({ properties }: DashboardChartsProps) {
  const { monthlyRevenueData, propertyTypeData } = useMemo(() => {
    const monthlyRevenue: { [key: string]: number } = {};
    const propertyTypes: { [key: string]: number } = { 
      Residential: 0, 
      Commercial: 0, 
      Agricultural: 0 
    };

    properties.forEach(prop => {
      if (propertyTypes[prop.propertyType] !== undefined) {
        propertyTypes[prop.propertyType]++;
      }

      prop.taxes?.forEach(t => {
        if (t.paymentDate) {
          const month = new Date(t.paymentDate).toLocaleString('default', { month: 'short' });
          if (monthlyRevenue[month]) {
            monthlyRevenue[month] += t.amountPaid;
          } else {
            monthlyRevenue[month] = t.amountPaid;
          }
        }
      });
    });

    const monthlyRevenueData = Object.keys(monthlyRevenue).map(month => ({
      month,
      revenue: monthlyRevenue[month],
    }));

    const propertyTypeData = Object.keys(propertyTypes).map(name => ({
      name,
      value: propertyTypes[name],
    }));

    return { monthlyRevenueData, propertyTypeData };
  }, [properties]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6 mb-6 md:mb-8">
      {/* Monthly Revenue Chart */}
      <div className="bg-card rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 p-6 md:p-7 border border-border hover:border-primary/30 animate-slide-up">
        <h3 className="text-lg md:text-xl font-headline font-bold text-foreground mb-6 flex items-center gap-3">
          <div className="p-2 bg-primary/10 rounded-lg">
            <BarChart3 className="w-5 h-5 text-primary" />
          </div>
          <span>
            Monthly Revenue <span className="text-muted-foreground/60">•</span>{' '}
            <span className="font-hindi text-muted-foreground">मासिक राजस्व</span>
          </span>
        </h3>
        {monthlyRevenueData.length > 0 ? (
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={monthlyRevenueData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis tickFormatter={(value) => `₹${Number(value).toLocaleString('en-IN')}`} />
              <Tooltip formatter={(value: number) => [`₹${value.toLocaleString('en-IN')}`, 'Revenue']} />
              <Bar dataKey="revenue" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-64 flex items-center justify-center text-gray-400">
            <p>No revenue data available to display chart.</p>
          </div>
        )}
      </div>

      {/* Property Distribution Chart */}
      <div className="bg-card rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 p-6 md:p-7 border border-border hover:border-primary/30 animate-slide-up" style={{ animationDelay: '100ms' }}>
        <h3 className="text-lg md:text-xl font-headline font-bold text-foreground mb-6 flex items-center gap-3">
          <div className="p-2 bg-success/10 rounded-lg">
            <Building className="w-5 h-5 text-success" />
          </div>
          <span>
            Property Distribution <span className="text-muted-foreground/60">•</span>{' '}
            <span className="font-hindi text-muted-foreground">संपत्ति वितरण</span>
          </span>
        </h3>
        {propertyTypeData.some(d => d.value > 0) ? (
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={propertyTypeData}
                cx="50%"
                cy="50%"
                labelLine={false}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
                nameKey="name"
                label={({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
                  const RADIAN = Math.PI / 180;
                  const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
                  const x = cx + radius * Math.cos(-midAngle * RADIAN);
                  const y = cy + radius * Math.sin(-midAngle * RADIAN);

                  return (
                    <text x={x} y={y} fill="white" textAnchor={x > cx ? 'start' : 'end'} dominantBaseline="central">
                      {`${(percent * 100).toFixed(0)}%`}
                    </text>
                  );
                }}
              >
                {propertyTypeData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-64 flex items-center justify-center text-gray-400">
            <p>No property data to display distribution.</p>
          </div>
        )}
      </div>
    </div>
  );
}

/**
 * Report Filters Component
 * 
 * Provides UI for filtering reports by:
 * - Date range (from/to)
 * - Report type (all, revenue, collection, pending, property)
 */

'use client';

interface ReportFiltersProps {
  fromDate: string;
  toDate: string;
  reportType: string;
  onFromDateChange: (value: string) => void;
  onToDateChange: (value: string) => void;
  onReportTypeChange: (value: string) => void;
}

/**
 * Report filter inputs
 */
export function ReportFilters({
  fromDate,
  toDate,
  reportType,
  onFromDateChange,
  onToDateChange,
  onReportTypeChange,
}: ReportFiltersProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div className="space-y-2">
        <label className="text-sm font-bold text-foreground/90">
          From Date • से तारीख
        </label>
        <input
          type="date"
          value={fromDate}
          onChange={(e) => onFromDateChange(e.target.value)}
          className="w-full h-12 px-4 border-2 border-input rounded-lg focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none transition-all shadow-sm hover:shadow-md"
        />
      </div>
      <div className="space-y-2">
        <label className="text-sm font-bold text-foreground/90">
          To Date • तक तारीख
        </label>
        <input
          type="date"
          value={toDate}
          onChange={(e) => onToDateChange(e.target.value)}
          className="w-full h-12 px-4 border-2 border-input rounded-lg focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none transition-all shadow-sm hover:shadow-md"
        />
      </div>
      <div className="space-y-2">
        <label className="text-sm font-bold text-foreground/90">
          Report Type • रिपोर्ट प्रकार
        </label>
        <select 
          value={reportType}
          onChange={(e) => onReportTypeChange(e.target.value)}
          className="w-full h-12 px-4 border-2 border-input rounded-lg focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none transition-all bg-white shadow-sm hover:shadow-md"
        >
          <option value="all">📊 All Reports</option>
          <option value="revenue">💰 Revenue Report</option>
          <option value="collection">💳 Tax Collection</option>
          <option value="pending">⏳ Pending Taxes</option>
          <option value="property">🏠 Property Summary</option>
        </select>
      </div>
    </div>
  );
}

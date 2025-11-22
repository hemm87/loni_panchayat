
'use client';
import React, { useState, useMemo, useEffect } from 'react';
import { Home, UserPlus, Users, FileText, BarChart3, Settings, LogOut, Menu, X, Search, Download, Plus, Save, Building, AlertCircle } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import { getAuth, signOut } from 'firebase/auth';
import { useRouter } from 'next/navigation';
import { useUser, useFirestore, useCollection, useMemoFirebase, useDoc, initializeFirebase, setDocumentNonBlocking } from '@/firebase';
import { collection, doc, setDoc } from 'firebase/firestore';
import type { Property, PanchayatSettings } from '@/lib/types';
import { PropertiesTable } from '@/components/properties/properties-table';
import { RegisterPropertyForm } from '@/components/properties/register-property-form';
import { GenerateBillForm } from '@/components/billing/generate-bill-form';
import { StatsCard } from '@/components/ui/stats-card';
import { DashboardSkeleton } from '@/components/ui/loading-skeletons';
import { NoPropertiesState, NoReportsState } from '@/components/ui/empty-state';
import { PageHeader } from '@/components/ui/page-header';
import { UserRoleDisplay } from '@/components/ui/user-role-display';
import { AdminRoleFixer } from '@/components/ui/admin-role-fixer';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

const Dashboard = () => {
  const [activeMenu, setActiveMenu] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const router = useRouter();
  const { user } = useUser();
  const firestore = useFirestore();

  const handleLogout = async () => {
    const auth = getAuth();
    try {
      await signOut(auth);
      router.push('/');
    } catch (error) {
      console.error('Error signing out: ', error);
    }
  };

  // Menu Items
  const menuItems = [
    { id: 'dashboard', icon: Home, label: 'Dashboard', labelHi: 'होम' },
    { id: 'register', icon: UserPlus, label: 'Register New User', labelHi: 'नया उपयोगकर्ता पंजीकरण' },
    { id: 'users', icon: Users, label: 'Property Records', labelHi: 'संपत्ति रिकॉर्ड' },
    { id: 'bill', icon: FileText, label: 'Generate Bill / Receipt', labelHi: 'रसीद बनाएँ' },
    { id: 'bills', icon: Download, label: 'Download Bills', labelHi: 'बिल डाउनलोड करें' },
    { id: 'reports', icon: BarChart3, label: 'Reports', labelHi: 'रिपोर्ट्स' },
    { id: 'settings', icon: Settings, label: 'Settings', labelHi: 'सेटिंग्स' },
  ];
  
  const propertiesQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return collection(firestore, 'properties');
  }, [firestore]);

  const { data: properties, isLoading: collectionLoading } = useCollection<Property>(propertiesQuery);
  
  const settingsDocRef = useMemoFirebase(() => {
    if (!firestore) return null;
    return doc(firestore, 'panchayat-settings', 'config');
  }, [firestore]);

  const { data: settings, isLoading: settingsLoading } = useDoc<PanchayatSettings>(settingsDocRef);


  const handleMenuClick = (id: string) => {
    if (id === 'users') {
        router.push('/dashboard/properties');
    } else {
        setActiveMenu(id);
    }
  }

  // Dashboard Page
  const DashboardPage = ({ properties }: { properties: Property[] }) => {
    const { totalUsers, paidTaxes, pendingTaxes, totalRevenue, monthlyRevenueData, propertyTypeData } = useMemo(() => {
        if (!properties) {
          return { totalUsers: 0, paidTaxes: 0, pendingTaxes: 0, totalRevenue: 0, monthlyRevenueData: [], propertyTypeData: [] };
        }
    
        const totalUsers = properties.length;
        let paidTaxes = 0;
        let pendingTaxes = 0;
        let totalRevenue = 0;
        const monthlyRevenue: { [key: string]: number } = {};
        const propertyTypes: { [key: string]: number } = { Residential: 0, Commercial: 0, Agricultural: 0 };
    
        properties.forEach(prop => {
          if (propertyTypes[prop.propertyType] !== undefined) {
            propertyTypes[prop.propertyType]++;
          }

          const hasUnpaid = prop.taxes?.some(t => t.paymentStatus === 'Unpaid' || t.paymentStatus === 'Partial');
          if (hasUnpaid) {
            pendingTaxes++;
          } else if (prop.taxes?.length > 0) {
            paidTaxes++;
          }
    
          prop.taxes?.forEach(t => {
            totalRevenue += t.amountPaid;
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
    
        return { totalUsers, paidTaxes, pendingTaxes, totalRevenue, monthlyRevenueData, propertyTypeData };
      }, [properties]);
    
    const stats = [
      { title: 'Total Properties', titleHi: 'कुल संपत्ति', value: totalUsers.toLocaleString('en-IN'), color: 'bg-blue-500', icon: '👥' },
      { title: 'Fully Paid', titleHi: 'पूर्ण भुगतान', value: paidTaxes.toLocaleString('en-IN'), color: 'bg-green-500', icon: '✅' },
      { title: 'Dues Pending', titleHi: 'बकाया लंबित', value: pendingTaxes.toLocaleString('en-IN'), color: 'bg-orange-500', icon: '⏳' },
      { title: 'Total Revenue', titleHi: 'कुल राजस्व', value: `₹${totalRevenue.toLocaleString('en-IN')}`, color: 'bg-purple-500', icon: '💰' },
    ];

    const PIE_COLORS = ['#0088FE', '#00C49F', '#FFBB28'];

    return (
      <>
        {/* User Role & Permissions Display */}
        <div className="mb-6 md:mb-8 animate-fade-in space-y-4">
          <UserRoleDisplay />
          <AdminRoleFixer />
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-6 md:mb-8">
          {stats.map((stat, index) => (
            <StatsCard
              key={index}
              title={stat.title}
              titleHi={stat.titleHi}
              value={stat.value}
              icon={stat.icon}
              color={stat.color}
            />
          ))}
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6 mb-6 md:mb-8">
          <div className="bg-card rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 p-6 md:p-7 border border-border hover:border-primary/30 animate-slide-up">
            <h3 className="text-lg md:text-xl font-headline font-bold text-foreground mb-6 flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <BarChart3 className="w-5 h-5 text-primary" />
              </div>
              <span>Monthly Revenue <span className="text-muted-foreground/60">•</span> <span className="font-hindi text-muted-foreground">मासिक राजस्व</span></span>
            </h3>
            {monthlyRevenueData.length > 0 ? (
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={monthlyRevenueData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis 
                      tickFormatter={(value) => `₹${Number(value).toLocaleString('en-IN')}`}
                      tick={{ fontFamily: 'Noto Sans, Segoe UI, Arial Unicode MS, sans-serif' }}
                    />
                    <Tooltip 
                      formatter={(value: number) => [`₹${value.toLocaleString('en-IN')}`, 'Revenue']}
                      contentStyle={{ fontFamily: 'Noto Sans, Segoe UI, Arial Unicode MS, sans-serif' }}
                    />
                    <Bar dataKey="revenue" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-64 flex items-center justify-center text-gray-400">
                    <p>No revenue data available to display chart.</p>
                </div>
              )}
          </div>

          <div className="bg-card rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 p-6 md:p-7 border border-border hover:border-primary/30 animate-slide-up" style={{ animationDelay: '100ms' }}>
            <h3 className="text-lg md:text-xl font-headline font-bold text-foreground mb-6 flex items-center gap-3">
              <div className="p-2 bg-success/10 rounded-lg">
                <Building className="w-5 h-5 text-success" />
              </div>
              <span>Property Distribution <span className="text-muted-foreground/60">•</span> <span className="font-hindi text-muted-foreground">संपत्ति वितरण</span></span>
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
                            label={({ cx, cy, midAngle, innerRadius, outerRadius, percent, index }) => {
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

        {/* Premium Quick Actions */}
        <div className="bg-card rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 p-6 md:p-8 border border-border animate-slide-up" style={{ animationDelay: '200ms' }}>
          <h3 className="text-xl md:text-2xl font-headline font-bold text-foreground mb-8 flex items-center gap-3">
            <div className="p-2 bg-accent/10 rounded-lg">
              <Plus className="w-6 h-6 text-accent" />
            </div>
            <span>Quick Actions <span className="text-muted-foreground/60">•</span> <span className="font-hindi text-muted-foreground">त्वरित कार्य</span></span>
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            <button
              onClick={() => setActiveMenu('register')}
              className={cn(
                "group relative overflow-hidden",
                "bg-gradient-to-br from-primary/5 via-primary/10 to-primary/5",
                "border-2 border-primary/20 hover:border-primary",
                "hover:shadow-xl hover:shadow-primary/20",
                "transition-all duration-300 p-6 md:p-7 rounded-2xl text-center",
                "hover-lift active:scale-95"
              )}
            >
              <div className="relative z-10">
                <div className="bg-gradient-to-br from-primary to-primary/80 rounded-2xl w-16 h-16 flex items-center justify-center mx-auto mb-4 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300 shadow-lg">
                  <UserPlus className="w-8 h-8 text-white" />
                </div>
                <p className="font-bold text-base md:text-lg text-foreground mb-2">Register New User</p>
                <p className="text-sm text-muted-foreground font-hindi">नया उपयोगकर्ता</p>
              </div>
              <div className="absolute inset-0 bg-gradient-to-br from-primary/0 to-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </button>
            <button
              onClick={() => setActiveMenu('bill')}
              className={cn(
                "group relative overflow-hidden",
                "bg-gradient-to-br from-success/5 via-success/10 to-success/5",
                "border-2 border-success/20 hover:border-success",
                "hover:shadow-xl hover:shadow-success/20",
                "transition-all duration-300 p-6 md:p-7 rounded-2xl text-center",
                "hover-lift active:scale-95"
              )}
            >
              <div className="relative z-10">
                <div className="bg-gradient-to-br from-success to-success/80 rounded-2xl w-16 h-16 flex items-center justify-center mx-auto mb-4 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300 shadow-lg">
                  <FileText className="w-8 h-8 text-white" />
                </div>
                <p className="font-bold text-base md:text-lg text-foreground mb-2">Generate Bill</p>
                <p className="text-sm text-muted-foreground font-hindi">रसीद बनाएँ</p>
              </div>
              <div className="absolute inset-0 bg-gradient-to-br from-success/0 to-success/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </button>
            <button
              onClick={() => setActiveMenu('reports')}
              className={cn(
                "group relative overflow-hidden",
                "bg-gradient-to-br from-purple-500/5 via-purple-500/10 to-purple-500/5",
                "border-2 border-purple-500/20 hover:border-purple-500",
                "hover:shadow-xl hover:shadow-purple-500/20",
                "transition-all duration-300 p-6 md:p-7 rounded-2xl text-center",
                "hover-lift active:scale-95",
                "sm:col-span-2 lg:col-span-1"
              )}
            >
              <div className="relative z-10">
                <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl w-16 h-16 flex items-center justify-center mx-auto mb-4 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300 shadow-lg">
                  <BarChart3 className="w-8 h-8 text-white" />
                </div>
                <p className="font-bold text-base md:text-lg text-foreground mb-2">View Reports</p>
                <p className="text-sm text-muted-foreground font-hindi">रिपोर्ट देखें</p>
              </div>
              <div className="absolute inset-0 bg-gradient-to-br from-purple-500/0 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </button>
          </div>
        </div>
      </>
    );
  };

  // Register New User Page
  const RegisterPage = () => (
     <RegisterPropertyForm 
        onFormSubmit={() => router.push('/dashboard/properties')} 
        onCancel={() => setActiveMenu('dashboard')}
      />
  );

  // Generate Bill Page
  const BillPage = ({ properties, settings }: { properties: Property[], settings: PanchayatSettings | null }) => (
    <GenerateBillForm 
      properties={properties}
      settings={settings}
      onFormSubmit={() => {
        router.push('/dashboard/properties');
      }} 
      onCancel={() => setActiveMenu('dashboard')}
    />
  );

  // Download Bills Page
  const BillsPage = ({ properties, settings }: { properties: Property[], settings: PanchayatSettings | null }) => {
    const { toast } = useToast();
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState<'All' | 'Paid' | 'Unpaid' | 'Partial'>('All');

    // Get all bills from all properties
    const allBills = useMemo(() => {
      const bills: Array<{
        property: Property;
        tax: Property['taxes'][number];
      }> = [];

      properties.forEach(property => {
        property.taxes?.forEach(tax => {
          bills.push({ property, tax });
        });
      });

      // Sort by date (most recent first)
      return bills.sort((a, b) => {
        const dateA = new Date(a.tax.assessmentYear, 0, 1).getTime();
        const dateB = new Date(b.tax.assessmentYear, 0, 1).getTime();
        return dateB - dateA;
      });
    }, [properties]);

    // Filter bills based on search and status
    const filteredBills = useMemo(() => {
      return allBills.filter(({ property, tax }) => {
        const matchesSearch = searchTerm === '' || 
          property.ownerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          property.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
          tax.receiptNumber?.toLowerCase().includes(searchTerm.toLowerCase());
        
        const matchesStatus = filterStatus === 'All' || tax.paymentStatus === filterStatus;
        
        return matchesSearch && matchesStatus;
      });
    }, [allBills, searchTerm, filterStatus]);

    const handleDownloadBill = async (property: Property, tax: Property['taxes'][number]) => {
      if (!settings) {
        toast({
          variant: 'destructive',
          title: 'Error',
          description: 'Settings not configured',
        });
        return;
      }

      try {
        const { generateBillPdf } = await import('@/lib/pdf-generator');
        await generateBillPdf(property, [tax], settings);
        toast({
          title: 'Success',
          description: 'Bill downloaded successfully!',
        });
      } catch (error) {
        console.error('Error downloading bill:', error);
        toast({
          variant: 'destructive',
          title: 'Error',
          description: 'Failed to download bill',
        });
      }
    };

    return (
      <div className="space-y-6 animate-fade-in">
        {/* Header */}
        <div className="card-premium rounded-2xl shadow-xl p-6 border-2 border-border/50 backdrop-blur-sm">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-success to-success/80 flex items-center justify-center shadow-lg">
              <Download className="w-8 h-8 text-white" />
            </div>
            <div>
              <h2 className="text-3xl md:text-4xl font-headline font-bold text-gradient bg-gradient-to-r from-success to-emerald-600 bg-clip-text text-transparent">
                Download Bills
              </h2>
              <p className="text-lg text-muted-foreground mt-1">बिल डाउनलोड करें</p>
            </div>
          </div>

          {/* Filters */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search by owner name, property ID, or receipt number..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full h-12 pl-11 pr-4 border-2 rounded-xl shadow-sm hover:shadow-md transition-all focus:ring-2 focus:ring-primary/20 focus:border-primary"
              />
            </div>
            <div className="flex gap-2">
              {(['All', 'Paid', 'Unpaid', 'Partial'] as const).map((status) => (
                <button
                  key={status}
                  onClick={() => setFilterStatus(status)}
                  className={cn(
                    "px-4 py-2 rounded-lg font-semibold transition-all",
                    filterStatus === status
                      ? 'bg-gradient-to-r from-primary to-accent text-white shadow-md'
                      : 'bg-muted text-muted-foreground hover:bg-muted/70'
                  )}
                >
                  {status}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Bills List */}
        {filteredBills.length === 0 ? (
          <div className="card-premium rounded-2xl p-12 text-center">
            <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-muted flex items-center justify-center">
              <FileText className="w-12 h-12 text-muted-foreground" />
            </div>
            <h3 className="text-2xl font-bold mb-2">No Bills Found</h3>
            <p className="text-muted-foreground">
              {searchTerm || filterStatus !== 'All' 
                ? 'Try adjusting your search or filter criteria' 
                : 'No bills have been generated yet'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {filteredBills.map(({ property, tax }, index) => (
              <div
                key={`${property.id}-${tax.id}`}
                className="card-premium rounded-xl p-6 border-2 border-border/50 hover:border-primary/30 hover:shadow-lg transition-all animate-slide-up"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <div className="flex flex-col md:flex-row md:items-center gap-4">
                  {/* Bill Info */}
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-3">
                      <h3 className="text-xl font-bold text-foreground">{property.ownerName}</h3>
                      <span className={cn(
                        "px-3 py-1 rounded-full text-xs font-bold",
                        tax.paymentStatus === 'Paid' && 'bg-success/10 text-success',
                        tax.paymentStatus === 'Unpaid' && 'bg-destructive/10 text-destructive',
                        tax.paymentStatus === 'Partial' && 'bg-warning/10 text-warning'
                      )}>
                        {tax.paymentStatus}
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                      <div>
                        <p className="text-muted-foreground">Property ID</p>
                        <p className="font-semibold">{property.id}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Tax Type</p>
                        <p className="font-semibold">{tax.taxType}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Receipt No.</p>
                        <p className="font-semibold">{tax.receiptNumber || 'N/A'}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Assessment Year</p>
                        <p className="font-semibold">{tax.assessmentYear}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-6 text-sm">
                      <div>
                        <span className="text-muted-foreground">Assessed: </span>
                        <span className="font-bold text-foreground">₹{tax.assessedAmount.toLocaleString('en-IN')}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Paid: </span>
                        <span className="font-bold text-success">₹{tax.amountPaid.toLocaleString('en-IN')}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Due: </span>
                        <span className="font-bold text-destructive">₹{(tax.assessedAmount - tax.amountPaid).toLocaleString('en-IN')}</span>
                      </div>
                    </div>
                  </div>

                  {/* Download Button */}
                  <button
                    onClick={() => handleDownloadBill(property, tax)}
                    className="bg-gradient-to-r from-success to-emerald-600 text-white px-6 py-3 rounded-xl font-bold hover:shadow-lg hover:scale-105 transition-all flex items-center gap-2 justify-center"
                  >
                    <Download className="w-5 h-5" />
                    <span>Download Bill</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Summary Stats */}
        {filteredBills.length > 0 && (
          <div className="card-premium rounded-2xl p-6 border-2 border-border/50">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="text-center">
                <p className="text-sm text-muted-foreground mb-1">Total Bills</p>
                <p className="text-2xl font-bold text-foreground">{filteredBills.length}</p>
              </div>
              <div className="text-center">
                <p className="text-sm text-muted-foreground mb-1">Total Assessed</p>
                <p className="text-2xl font-bold text-foreground">
                  ₹{filteredBills.reduce((sum, { tax }) => sum + tax.assessedAmount, 0).toLocaleString('en-IN')}
                </p>
              </div>
              <div className="text-center">
                <p className="text-sm text-muted-foreground mb-1">Total Collected</p>
                <p className="text-2xl font-bold text-success">
                  ₹{filteredBills.reduce((sum, { tax }) => sum + tax.amountPaid, 0).toLocaleString('en-IN')}
                </p>
              </div>
              <div className="text-center">
                <p className="text-sm text-muted-foreground mb-1">Total Pending</p>
                <p className="text-2xl font-bold text-destructive">
                  ₹{filteredBills.reduce((sum, { tax }) => sum + (tax.assessedAmount - tax.amountPaid), 0).toLocaleString('en-IN')}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  // Reports Page
  const ReportsPage = () => {
    const [fromDate, setFromDate] = useState('');
    const [toDate, setToDate] = useState('');
    const [reportType, setReportType] = useState('all');
    const [showReport, setShowReport] = useState(false);

    const generateReport = () => {
      setShowReport(true);
    };

    // Calculate report data
    const reportData = useMemo(() => {
      if (!properties || properties.length === 0) return null;

      const totalProperties = properties.length;
      const totalTaxes = properties.reduce((sum, prop) => {
        return sum + (prop.taxes?.reduce((taxSum, tax) => taxSum + tax.assessedAmount, 0) || 0);
      }, 0);

      const paidTaxes = properties.reduce((sum, prop) => {
        return sum + (prop.taxes?.reduce((taxSum, tax) => 
          taxSum + (tax.paymentStatus === 'Paid' ? tax.assessedAmount : tax.amountPaid), 0) || 0);
      }, 0);

      const pendingTaxes = totalTaxes - paidTaxes;

      const taxesByType = properties.reduce((acc, prop) => {
        prop.taxes?.forEach(tax => {
          if (!acc[tax.taxType]) {
            acc[tax.taxType] = { total: 0, paid: 0, pending: 0, count: 0 };
          }
          acc[tax.taxType].total += tax.assessedAmount;
          acc[tax.taxType].paid += tax.paymentStatus === 'Paid' ? tax.assessedAmount : tax.amountPaid;
          acc[tax.taxType].pending += tax.paymentStatus === 'Unpaid' ? tax.assessedAmount : 
            (tax.paymentStatus === 'Partial' ? tax.assessedAmount - tax.amountPaid : 0);
          acc[tax.taxType].count++;
        });
        return acc;
      }, {} as Record<string, { total: number; paid: number; pending: number; count: number }>);

      const propertyTypeBreakdown = properties.reduce((acc, prop) => {
        acc[prop.propertyType] = (acc[prop.propertyType] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      return {
        totalProperties,
        totalTaxes,
        paidTaxes,
        pendingTaxes,
        collectionRate: totalTaxes > 0 ? (paidTaxes / totalTaxes) * 100 : 0,
        taxesByType,
        propertyTypeBreakdown,
      };
    }, [properties]);

    return (
      <div className="space-y-6">
        <div className="card-premium rounded-2xl shadow-xl p-6 md:p-10 border-2 border-border/50 backdrop-blur-sm animate-fade-in">
          <div className="flex items-center gap-4 mb-8 pb-6 border-b-2 border-gradient-primary">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-lg">
              <BarChart3 className="w-8 h-8 text-white" />
            </div>
            <div>
              <h2 className="text-3xl md:text-4xl font-headline font-bold text-gradient bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                Reports & Analytics
              </h2>
              <p className="text-lg text-muted-foreground mt-1">रिपोर्ट्स और विश्लेषण</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="space-y-2">
              <label className="text-sm font-bold text-foreground/90">
                From Date • से तारीख
              </label>
              <input
                type="date"
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
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
                onChange={(e) => setToDate(e.target.value)}
                className="w-full h-12 px-4 border-2 border-input rounded-lg focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none transition-all shadow-sm hover:shadow-md"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold text-foreground/90">
                Report Type • रिपोर्ट प्रकार
              </label>
              <select 
                value={reportType}
                onChange={(e) => setReportType(e.target.value)}
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

          <div className="flex flex-col sm:flex-row gap-4">
            <button 
              onClick={generateReport}
              className="flex-1 bg-gradient-to-r from-primary to-accent text-white px-8 h-14 rounded-xl font-bold text-lg hover:shadow-xl hover:scale-[1.02] transition-all flex items-center justify-center gap-3 shadow-lg"
            >
              <Search className="w-6 h-6" />
              <span>Generate Report • रिपोर्ट बनाएँ</span>
            </button>
            <button 
              onClick={() => window.print()}
              disabled={!showReport || !reportData}
              className="px-8 h-14 bg-success text-white rounded-xl font-bold text-lg hover:bg-success/90 hover:shadow-lg transition-all flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
            >
              <Download className="w-6 h-6" />
              <span>Export PDF</span>
            </button>
          </div>
        </div>

        {/* Report Results */}
        {showReport && reportData ? (
          <div className="space-y-6 animate-fade-in">
            {/* Summary Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-gradient-to-br from-primary/10 to-primary/5 rounded-2xl p-6 border-2 border-primary/20 shadow-lg hover:shadow-xl transition-all">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-wide">Total Properties</h3>
                  <Home className="w-8 h-8 text-primary" />
                </div>
                <p className="text-4xl font-headline font-bold text-primary">{reportData.totalProperties}</p>
                <p className="text-xs text-muted-foreground mt-2">संपत्तियों की कुल संख्या</p>
              </div>

              <div className="bg-gradient-to-br from-success/10 to-success/5 rounded-2xl p-6 border-2 border-success/20 shadow-lg hover:shadow-xl transition-all">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-wide">Total Tax Assessed</h3>
                  <FileText className="w-8 h-8 text-success" />
                </div>
                <p className="text-4xl font-headline font-bold text-success">₹{reportData.totalTaxes.toLocaleString('en-IN')}</p>
                <p className="text-xs text-muted-foreground mt-2">कुल कर निर्धारित</p>
              </div>

              <div className="bg-gradient-to-br from-info/10 to-info/5 rounded-2xl p-6 border-2 border-info/20 shadow-lg hover:shadow-xl transition-all">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-wide">Collected</h3>
                  <Download className="w-8 h-8 text-info" />
                </div>
                <p className="text-4xl font-headline font-bold text-info">₹{reportData.paidTaxes.toLocaleString('en-IN')}</p>
                <p className="text-xs text-muted-foreground mt-2">एकत्रित कर</p>
              </div>

              <div className="bg-gradient-to-br from-warning/10 to-warning/5 rounded-2xl p-6 border-2 border-warning/20 shadow-lg hover:shadow-xl transition-all">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-wide">Pending</h3>
                  <AlertCircle className="w-8 h-8 text-warning" />
                </div>
                <p className="text-4xl font-headline font-bold text-warning">₹{reportData.pendingTaxes.toLocaleString('en-IN')}</p>
                <p className="text-xs text-muted-foreground mt-2">लंबित कर</p>
              </div>
            </div>

            {/* Collection Rate */}
            <div className="bg-card rounded-2xl p-8 border-2 border-border shadow-lg">
              <h3 className="text-xl font-headline font-bold text-foreground mb-6 flex items-center gap-3">
                <div className="p-2 bg-success/10 rounded-lg">
                  <BarChart3 className="w-6 h-6 text-success" />
                </div>
                Collection Rate • संग्रह दर
              </h3>
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="flex-1 bg-muted/30 rounded-full h-8 overflow-hidden">
                    <div 
                      className="bg-gradient-to-r from-success to-success/80 h-full flex items-center justify-end px-4 transition-all duration-1000"
                      style={{ width: `${Math.min(reportData.collectionRate, 100)}%` }}
                    >
                      <span className="text-white font-bold text-sm">{reportData.collectionRate.toFixed(1)}%</span>
                    </div>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground">
                  {reportData.collectionRate >= 75 ? '✅ Excellent collection rate!' : 
                   reportData.collectionRate >= 50 ? '⚠️ Good, but can improve' : 
                   '❌ Needs immediate attention'}
                </p>
              </div>
            </div>

            {/* Tax Breakdown by Type */}
            <div className="bg-card rounded-2xl p-8 border-2 border-border shadow-lg">
              <h3 className="text-xl font-headline font-bold text-foreground mb-6 flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <FileText className="w-6 h-6 text-primary" />
                </div>
                Tax Breakdown by Type • कर प्रकार के अनुसार विवरण
              </h3>
              <div className="space-y-4">
                {Object.entries(reportData.taxesByType).map(([type, data], index) => (
                  <div key={type} className="p-4 bg-muted/20 rounded-xl border border-border/50 hover:shadow-md transition-all animate-fade-in" style={{ animationDelay: `${index * 100}ms` }}>
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-bold text-foreground">{type}</h4>
                      <span className="badge-info">{data.count} records</span>
                    </div>
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div>
                        <p className="text-muted-foreground text-xs mb-1">Total</p>
                        <p className="font-bold text-foreground">₹{data.total.toLocaleString('en-IN')}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground text-xs mb-1">Collected</p>
                        <p className="font-bold text-success">₹{data.paid.toLocaleString('en-IN')}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground text-xs mb-1">Pending</p>
                        <p className="font-bold text-warning">₹{data.pending.toLocaleString('en-IN')}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Property Type Distribution */}
            <div className="bg-card rounded-2xl p-8 border-2 border-border shadow-lg">
              <h3 className="text-xl font-headline font-bold text-foreground mb-6 flex items-center gap-3">
                <div className="p-2 bg-accent/10 rounded-lg">
                  <Home className="w-6 h-6 text-accent" />
                </div>
                Property Distribution • संपत्ति वितरण
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {Object.entries(reportData.propertyTypeBreakdown).map(([type, count], index) => (
                  <div key={type} className="text-center p-6 bg-gradient-to-br from-muted/30 to-muted/10 rounded-xl border-2 border-border/50 hover:shadow-md transition-all animate-scale-in" style={{ animationDelay: `${index * 100}ms` }}>
                    <div className="text-4xl mb-2">
                      {type === 'Residential' ? '🏠' : type === 'Commercial' ? '🏢' : '🌾'}
                    </div>
                    <p className="text-3xl font-headline font-bold text-primary mb-1">{count}</p>
                    <p className="text-sm font-semibold text-foreground">{type}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {((count / reportData.totalProperties) * 100).toFixed(1)}% of total
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : showReport && !reportData ? (
          <NoReportsState />
        ) : null}
      </div>
    );
  };

  // Settings Page
  const SettingsPage = ({ settings, docRef }: { settings: PanchayatSettings | null, docRef: any }) => {
    const { toast } = useToast();
    const [loading, setLoading] = useState(false);
    const [localSettings, setLocalSettings] = useState<Partial<PanchayatSettings>>({
        panchayatName: 'Loni Gram Panchayat',
        district: '',
        state: '',
        pinCode: '',
        propertyTaxRate: 0,
        waterTaxRate: 0,
        lateFee: 0,
    });

    useEffect(() => {
        if (settings) {
            setLocalSettings(settings);
        }
    }, [settings]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value, type } = e.target;
        setLocalSettings(prev => ({
            ...prev,
            [name]: type === 'number' ? parseFloat(value) || 0 : value,
        }));
    };

    const handleSave = async () => {
        if (!docRef) {
            toast({ variant: 'destructive', title: 'Error', description: 'Firestore not configured correctly.' });
            return;
        }
        setLoading(true);
        try {
            await setDoc(docRef, localSettings, { merge: true });
            toast({ title: 'Success', description: 'Settings saved successfully.' });
        } catch (error: any) {
            toast({ variant: 'destructive', title: 'Error', description: error.message });
        } finally {
            setLoading(false);
        }
    };
    
    return (
        <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-xl shadow-md p-6 md:p-8 border border-border/50">
            <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-8">
            Settings • सेटिंग्स
            </h2>

            <div className="space-y-8">
            <div className="border-b pb-6">
                <h3 className="text-xl font-bold text-foreground mb-5">Panchayat Information • पंचायत जानकारी</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                    <label className="block text-sm font-semibold text-foreground mb-2">Panchayat Name</label>
                    <input
                    type="text"
                    name="panchayatName"
                    value={localSettings.panchayatName || ''}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border-2 border-input rounded-lg focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none transition-all"
                    />
                </div>
                <div>
                    <label className="block text-sm font-semibold text-foreground mb-2">District • जिला</label>
                    <input
                    type="text"
                    name="district"
                    value={localSettings.district || ''}
                    onChange={handleInputChange}
                    placeholder="Enter district name"
                    className="w-full px-4 py-3 border-2 border-input rounded-lg focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none transition-all"
                    />
                </div>
                <div>
                    <label className="block text-sm font-semibold text-foreground mb-2">State • राज्य</label>
                    <input
                    type="text"
                    name="state"
                    value={localSettings.state || ''}
                    onChange={handleInputChange}
                    placeholder="Enter state name"
                    className="w-full px-4 py-3 border-2 border-input rounded-lg focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none transition-all"
                    />
                </div>
                <div>
                    <label className="block text-sm font-semibold text-foreground mb-2">PIN Code • पिन कोड</label>
                    <input
                    type="text"
                    name="pinCode"
                    value={localSettings.pinCode || ''}
                    onChange={handleInputChange}
                    placeholder="Enter PIN code"
                    className="w-full px-4 py-3 border-2 border-input rounded-lg focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none transition-all"
                    />
                </div>
                </div>
            </div>

            <div className="border-b pb-6">
                <h3 className="text-xl font-bold text-foreground mb-5">Tax Configuration • कर विन्यास</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                <div>
                    <label className="block text-sm font-semibold text-foreground mb-2">Property Tax Rate (%)</label>
                    <input
                    type="number"
                    name="propertyTaxRate"
                    value={localSettings.propertyTaxRate || 0}
                    onChange={handleInputChange}
                    placeholder="0.00"
                    min="0"
                    step="0.01"
                    className="w-full px-4 py-3 border-2 border-input rounded-lg focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none transition-all"
                    />
                </div>
                <div>
                    <label className="block text-sm font-semibold text-foreground mb-2">Water Tax (Flat Rate ₹)</label>
                    <input
                    type="number"
                    name="waterTaxRate"
                    value={localSettings.waterTaxRate || 0}
                    onChange={handleInputChange}
                    placeholder="0.00"
                    min="0"
                    step="0.01"
                    className="w-full px-4 py-3 border-2 border-input rounded-lg focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none transition-all"
                    />
                </div>
                <div>
                    <label className="block text-sm font-semibold text-foreground mb-2">Late Fee (%)</label>
                    <input
                    type="number"
                    name="lateFee"
                    value={localSettings.lateFee || 0}
                    onChange={handleInputChange}
                    placeholder="0.00"
                    min="0"
                    step="0.01"
                    className="w-full px-4 py-3 border-2 border-input rounded-lg focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none transition-all"
                    />
                </div>
                </div>
            </div>

            <div className="border-b pb-6">
                <h3 className="text-xl font-bold text-gray-800 mb-4">User Management • उपयोगकर्ता प्रबंधन</h3>
                <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                    <p className="font-bold text-gray-800">Admin User</p>
                    <p className="text-sm text-gray-600">admin@lonipanchayat.in</p>
                    </div>
                    <button className="bg-primary text-primary-foreground px-4 py-2 rounded-lg font-bold hover:bg-primary/90 transition-all">
                    Change Password
                    </button>
                </div>
                </div>
            </div>
            
            <div className="flex gap-4">
                <button 
                    onClick={handleSave}
                    disabled={loading}
                    className="flex-1 bg-primary text-primary-foreground px-8 py-4 rounded-lg font-bold text-lg hover:shadow-lg transition-all flex items-center justify-center gap-2"
                >
                {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : <Save className="w-6 h-6" />}
                Save Settings • सेटिंग्स सहेजें
                </button>
                <button 
                    onClick={() => setLocalSettings(settings || {})}
                    disabled={loading}
                    className="px-8 py-4 bg-gray-200 text-gray-700 rounded-lg font-bold text-lg hover:bg-gray-300 transition-all"
                >
                Reset • रीसेट करें
                </button>
            </div>
            </div>
        </div>
        </div>
    );
  };

  if (collectionLoading || settingsLoading) {
    return (
      <div className="flex-1 flex flex-col overflow-hidden">
        <main className="flex-1 overflow-y-auto p-6">
            <DashboardSkeleton />
        </main>
      </div>
    )
  }

  const renderContent = () => {
    switch (activeMenu) {
      case 'dashboard':
        return <DashboardPage properties={properties || []} />;
      case 'register':
        return <RegisterPage />;
      case 'bill':
        return <BillPage properties={properties || []} settings={settings || null} />;
      case 'bills':
        return <BillsPage properties={properties || []} settings={settings || null} />;
      case 'reports':
        return <ReportsPage />;
      case 'settings':
        return <SettingsPage settings={settings || null} docRef={settingsDocRef} />;
      default:
        return <DashboardPage properties={properties || []} />;
    }
  };


  return (
    <div className="flex h-screen bg-background">
      {/* Premium Sidebar */}
      <aside 
        className={cn(
          "bg-card border-r border-border shadow-xl transition-all duration-300 overflow-hidden relative",
          sidebarOpen ? 'w-80' : 'w-0',
          "backdrop-blur-sm"
        )}
      >
        {/* Header */}
        <div className="p-6 border-b border-border bg-gradient-to-br from-primary/5 to-accent/5">
          <div className="flex items-center gap-4 animate-fade-in">
            <div className="w-14 h-14 bg-gradient-to-br from-primary via-primary/90 to-accent rounded-xl flex items-center justify-center text-white text-xl font-bold shadow-lg hover:scale-105 transition-transform">
              <Building className="w-7 h-7" />
            </div>
            <div>
              <h1 className="text-xl font-headline font-bold text-foreground">
                {settings?.panchayatName || 'Loni Panchayat'}
              </h1>
              <p className="text-sm text-muted-foreground font-hindi">लॉनी ग्राम पंचायत</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="p-4 scrollbar-thin overflow-y-auto" style={{ maxHeight: 'calc(100vh - 240px)' }}>
          <div className="space-y-1.5">
            {menuItems.map((item, index) => {
              const Icon = item.icon;
              const isActive = activeMenu === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleMenuClick(item.id)}
                  className={cn(
                    "w-full flex items-center gap-4 px-4 py-4 rounded-xl text-left transition-all duration-200 font-medium group",
                    "animate-slide-up",
                    isActive
                      ? 'bg-gradient-to-r from-primary to-primary/90 text-primary-foreground shadow-lg shadow-primary/30 scale-[1.02]'
                      : 'text-muted-foreground hover:bg-muted/50 hover:text-foreground hover:scale-[1.01]'
                  )}
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <Icon className={cn(
                    "w-5 h-5 transition-transform",
                    isActive ? "scale-110" : "group-hover:scale-110"
                  )} />
                  <div className="flex-1">
                    <div className="text-sm font-semibold">{item.label}</div>
                    <div className="text-xs opacity-80 font-hindi">{item.labelHi}</div>
                  </div>
                </button>
              );
            })}
          </div>
        </nav>

        {/* Logout Button */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-border bg-card/80 backdrop-blur-sm">
          <button
            onClick={handleLogout}
            className={cn(
              "w-full flex items-center gap-4 px-4 py-4 rounded-xl text-left transition-all duration-200 font-medium group",
              "text-destructive hover:bg-destructive/10 hover:shadow-md"
            )}
          >
            <LogOut className="w-5 h-5 group-hover:scale-110 transition-transform" />
            <div>
              <div className="text-sm font-semibold">Logout</div>
              <div className="text-xs opacity-80 font-hindi">लॉगआउट</div>
            </div>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Premium Top Navbar */}
        <header className="bg-card/80 backdrop-blur-md shadow-sm border-b border-border px-6 py-4 sticky top-0 z-10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4 animate-slide-down">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="p-2.5 rounded-xl hover:bg-muted transition-all duration-200 hover:scale-105 active:scale-95"
                aria-label={sidebarOpen ? "Close sidebar" : "Open sidebar"}
              >
                {sidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
              <div>
                <h2 className="text-2xl font-headline font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                  Admin Dashboard
                </h2>
                <p className="text-sm text-muted-foreground">
                  Welcome back! <span className="text-muted-foreground/60">•</span> <span className="font-hindi">स्वागत है</span>
                </p>
              </div>
            </div>
            <div className="flex items-center gap-4 animate-slide-down" style={{ animationDelay: '100ms' }}>
              <div className="text-right hidden sm:block">
                <p className="font-semibold text-foreground">{user?.displayName || 'Admin User'}</p>
                <p className="text-sm text-muted-foreground">{user?.email || 'admin@lonipanchayat.in'}</p>
              </div>
              <div className="relative group">
                <div className="w-12 h-12 bg-gradient-to-br from-primary to-accent rounded-full flex items-center justify-center text-white font-bold text-xl uppercase shadow-lg group-hover:scale-110 transition-transform cursor-pointer">
                  {user?.displayName?.charAt(0) || 'A'}
                </div>
                <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-success rounded-full border-2 border-card"></div>
              </div>
            </div>
          </div>
        </header>

        {/* Dashboard Content with Premium Styling */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8 bg-gradient-to-br from-background via-background to-muted/20 scrollbar-thin">
          <div className="max-w-[1600px] mx-auto">
            {renderContent()}
          </div>
        </main>
      </div>
    </div>
  );
};

export default Dashboard;

    
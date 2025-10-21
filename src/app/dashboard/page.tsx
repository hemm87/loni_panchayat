
'use client';
import React, { useState, useMemo } from 'react';
import { Home, UserPlus, Users, FileText, BarChart3, Settings, LogOut, Menu, X, Search, Download, Plus, Save, Building } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { getAuth, signOut } from 'firebase/auth';
import { useRouter } from 'next/navigation';
import { useUser, useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection } from 'firebase/firestore';
import type { Property } from '@/lib/types';
import { PropertiesTable } from '@/components/properties/properties-table';
import { RegisterPropertyForm } from '@/components/properties/register-property-form';
import { GenerateBillForm } from '@/components/billing/generate-bill-form';
import { StatsCard } from '@/components/ui/stats-card';
import { DashboardSkeleton } from '@/components/ui/loading-skeletons';
import { NoPropertiesState, NoReportsState } from '@/components/ui/empty-state';
import { PageHeader } from '@/components/ui/page-header';

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
    { id: 'users', icon: Users, label: 'All Users / Properties', labelHi: 'सभी उपयोगकर्ता / संपत्ति' },
    { id: 'bill', icon: FileText, label: 'Generate Bill / Receipt', labelHi: 'रसीद बनाएँ' },
    { id: 'reports', icon: BarChart3, label: 'Reports', labelHi: 'रिपोर्ट्स' },
    { id: 'settings', icon: Settings, label: 'Settings', labelHi: 'सेटिंग्स' },
  ];
  
  const propertiesQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return collection(firestore, 'properties');
  }, [firestore]);

  const { data: properties, isLoading: collectionLoading } = useCollection<Property>(propertiesQuery);

  const handleMenuClick = (id: string) => {
    if (id === 'users') {
        router.push('/dashboard/properties');
    } else {
        setActiveMenu(id);
    }
  }

  // Dashboard Page
  const DashboardPage = ({ properties }: { properties: Property[] }) => {
    const { totalUsers, paidTaxes, pendingTaxes, totalRevenue, monthlyRevenueData } = useMemo(() => {
        if (!properties) {
          return { totalUsers: 0, paidTaxes: 0, pendingTaxes: 0, totalRevenue: 0, monthlyRevenueData: [] };
        }
    
        const totalUsers = properties.length;
        let paidTaxes = 0;
        let pendingTaxes = 0;
        let totalRevenue = 0;
        const monthlyRevenue: { [key: string]: number } = {};
    
        properties.forEach(prop => {
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
    
        return { totalUsers, paidTaxes, pendingTaxes, totalRevenue, monthlyRevenueData };
      }, [properties]);
    
    const stats = [
      { title: 'Total Users', titleHi: 'कुल उपयोगकर्ता', value: totalUsers.toLocaleString('en-IN'), color: 'bg-blue-500', icon: '👥' },
      { title: 'Paid Taxes', titleHi: 'भरे हुए कर', value: paidTaxes.toLocaleString('en-IN'), color: 'bg-green-500', icon: '✅' },
      { title: 'Pending Taxes', titleHi: 'लंबित कर', value: pendingTaxes.toLocaleString('en-IN'), color: 'bg-orange-500', icon: '⏳' },
      { title: 'Total Revenue', titleHi: 'कुल राजस्व', value: `₹${totalRevenue.toLocaleString('en-IN')}`, color: 'bg-purple-500', icon: '💰' },
    ];

    return (
      <>
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
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
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-lg p-6 border border-border">
            <h3 className="text-xl font-bold text-gray-800 mb-4">
              Monthly Revenue • मासिक राजस्व
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

          <div className="bg-white rounded-xl shadow-lg p-6 border border-border">
            <h3 className="text-xl font-bold text-gray-800 mb-4">
              Tax Distribution • कर वितरण
            </h3>
            <div className="h-64 flex items-center justify-center text-gray-400">
              <p>Connect Firebase to display tax distribution</p>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-xl shadow-lg p-6 border border-border">
          <h3 className="text-xl font-bold text-gray-800 mb-4">
            Quick Actions • त्वरित कार्य
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <button
              onClick={() => setActiveMenu('register')}
              className="group bg-background border-2 border-dashed border-gray-300 hover:border-primary hover:bg-primary/5 transition-all p-6 rounded-xl text-center"
            >
              <UserPlus className="w-12 h-12 mx-auto text-primary mb-2 transition-transform group-hover:scale-110" />
              <p className="font-bold text-lg text-foreground">Register New User</p>
              <p className="text-sm text-muted-foreground">नया उपयोगकर्ता</p>
            </button>
            <button
              onClick={() => setActiveMenu('bill')}
              className="group bg-background border-2 border-dashed border-gray-300 hover:border-green-500 hover:bg-green-500/5 transition-all p-6 rounded-xl text-center"
            >
              <FileText className="w-12 h-12 mx-auto text-green-500 mb-2 transition-transform group-hover:scale-110" />
              <p className="font-bold text-lg text-foreground">Generate Bill</p>
              <p className="text-sm text-muted-foreground">रसीद बनाएँ</p>
            </button>
            <button
              onClick={() => setActiveMenu('reports')}
              className="group bg-background border-2 border-dashed border-gray-300 hover:border-purple-500 hover:bg-purple-500/5 transition-all p-6 rounded-xl text-center"
            >
              <BarChart3 className="w-12 h-12 mx-auto text-purple-500 mb-2 transition-transform group-hover:scale-110" />
              <p className="font-bold text-lg text-foreground">View Reports</p>
              <p className="text-sm text-muted-foreground">रिपोर्ट देखें</p>
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
  const BillPage = ({ properties }: { properties: Property[] }) => (
    <GenerateBillForm 
      properties={properties}
      onFormSubmit={() => {
        router.push('/dashboard/properties');
      }} 
      onCancel={() => setActiveMenu('dashboard')}
    />
  );

  // Reports Page
  const ReportsPage = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-lg p-6 border border-border">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">
          Reports & Analytics • रिपोर्ट्स और विश्लेषण
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">
              From Date • से तारीख
            </label>
            <input
              type="date"
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-primary focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">
              To Date • तक तारीख
            </label>
            <input
              type="date"
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-primary focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">
              Report Type • रिपोर्ट प्रकार
            </label>
            <select className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-primary focus:outline-none">
              <option>All Reports</option>
              <option>Revenue Report</option>
              <option>Tax Collection</option>
              <option>Pending Taxes</option>
            </select>
          </div>
        </div>

        <div className="flex gap-4">
          <button className="bg-primary text-primary-foreground px-6 py-3 rounded-lg font-bold hover:bg-primary/90 transition-all flex items-center gap-2">
            <Search className="w-5 h-5" />
            Generate Report • रिपोर्ट बनाएँ
          </button>
          <button className="bg-green-600 text-white px-6 py-3 rounded-lg font-bold hover:bg-green-700 transition-all flex items-center gap-2">
            <Download className="w-5 h-5" />
            Export PDF
          </button>
        </div>
      </div>
      <NoReportsState />
    </div>
  );

  // Settings Page
  const SettingsPage = () => (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-xl shadow-lg p-8 border border-border">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">
          Settings • सेटिंग्स
        </h2>

        <div className="space-y-6">
          <div className="border-b pb-6">
            <h3 className="text-xl font-bold text-gray-800 mb-4">Panchayat Information • पंचायत जानकारी</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Panchayat Name</label>
                <input
                  type="text"
                  defaultValue="Loni Gram Panchayat"
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-primary focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">District • जिला</label>
                <input
                  type="text"
                  placeholder="Enter district name"
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-primary focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">State • राज्य</label>
                <input
                  type="text"
                  placeholder="Enter state name"
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-primary focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">PIN Code • पिन कोड</label>
                <input
                  type="text"
                  placeholder="Enter PIN code"
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-primary focus:outline-none"
                />
              </div>
            </div>
          </div>

          <div className="border-b pb-6">
            <h3 className="text-xl font-bold text-gray-800 mb-4">Tax Configuration • कर विन्यास</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Property Tax Rate (%)</label>
                <input
                  type="number"
                  placeholder="0.00"
                  min="0"
                  step="0.01"
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-primary focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Water Tax Rate (%)</label>
                <input
                  type="number"
                  placeholder="0.00"
                  min="0"
                  step="0.01"
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-primary focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Late Fee (%)</label>
                <input
                  type="number"
                  placeholder="0.00"
                  min="0"
                  step="0.01"
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-primary focus:outline-none"
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
            <button className="flex-1 bg-primary text-primary-foreground px-8 py-4 rounded-lg font-bold text-lg hover:shadow-lg transition-all flex items-center justify-center gap-2">
              <Save className="w-6 h-6" />
              Save Settings • सेटिंग्स सहेजें
            </button>
            <button className="px-8 py-4 bg-gray-200 text-gray-700 rounded-lg font-bold text-lg hover:bg-gray-300 transition-all">
              Reset • रीसेट करें
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  if (collectionLoading) {
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
        return <BillPage properties={properties || []} />;
      case 'reports':
        return <ReportsPage />;
      case 'settings':
        return <SettingsPage />;
      default:
        return <DashboardPage properties={properties || []} />;
    }
  };


  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className={`${sidebarOpen ? 'w-72' : 'w-0'} bg-white shadow-lg transition-all duration-300 overflow-hidden relative`}>
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-primary to-accent rounded-lg flex items-center justify-center text-white text-xl font-bold">
              <Building />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-800">Loni Panchayat</h1>
              <p className="text-sm text-gray-600">लॉनी ग्राम पंचायत</p>
            </div>
          </div>
        </div>

        <nav className="p-4">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => handleMenuClick(item.id)}
                className={`w-full flex items-center gap-4 px-4 py-4 mb-2 rounded-lg text-left transition-all font-semibold ${
                  activeMenu === item.id
                    ? 'bg-primary/90 text-primary-foreground shadow-lg'
                    : 'text-gray-700 hover:bg-gray-100 hover:text-primary'
                }`}
              >
                <Icon className="w-6 h-6" />
                <div className="flex-1">
                  <div className="text-base">{item.label}</div>
                  <div className="text-sm opacity-80">{item.labelHi}</div>
                </div>
              </button>
            );
          })}
        </nav>

        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200 bg-white">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-4 px-4 py-4 rounded-lg text-red-600 hover:bg-red-50 transition-all font-semibold"
          >
            <LogOut className="w-6 h-6" />
            <div>
              <div className="text-base">Logout</div>
              <div className="text-sm">लॉगआउट</div>
            </div>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Navbar */}
        <header className="bg-white shadow-sm border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
              >
                {sidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
              <div>
                <h2 className="text-2xl font-bold text-gray-800">Admin Dashboard</h2>
                <p className="text-sm text-gray-600">Welcome back! • स्वागत है</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="font-semibold text-gray-800">{user?.displayName || 'Admin User'}</p>
                <p className="text-sm text-gray-600">{user?.email || 'admin@lonipanchayat.in'}</p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-br from-primary to-accent rounded-full flex items-center justify-center text-white font-bold text-xl uppercase">
                {user?.displayName?.charAt(0) || 'A'}
              </div>
            </div>
          </div>
        </header>

        {/* Dashboard Content */}
        <main className="flex-1 overflow-y-auto p-6">
          {renderContent()}
        </main>
      </div>
    </div>
  );
};

export default Dashboard;

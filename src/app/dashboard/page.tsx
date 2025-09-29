'use client';
import React, { useState, useMemo } from 'react';
import { Home, UserPlus, Users, FileText, BarChart3, Settings, LogOut, Menu, X } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { getAuth, signOut } from 'firebase/auth';
import { useRouter } from 'next/navigation';
import { useUser, useCollection, useFirestore } from '@/firebase';
import { collection } from 'firebase/firestore';
import type { Property } from '@/lib/types';
import { getMonth } from 'date-fns';
import { RegisterPropertyForm } from '@/components/properties/register-property-form';
import PropertiesPage from './properties/page';


const Dashboard = () => {
  const [activeMenu, setActiveMenu] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const router = useRouter();
  const { user } = useUser();
  const firestore = useFirestore();

  const propertiesQuery = useMemo(() => {
    if (!firestore) return null;
    return collection(firestore, 'properties');
  }, [firestore]);

  const { data: properties, loading: propertiesLoading } = useCollection<Property>(propertiesQuery);

  const handleLogout = async () => {
    const auth = getAuth();
    try {
      await signOut(auth);
      router.push('/');
    } catch (error) {
      console.error('Error signing out: ', error);
    }
  };

  const { stats, revenueData } = useMemo(() => {
    if (!properties) {
      return { stats: [], revenueData: [] };
    }

    let totalUsers = properties.length;
    let paidTaxesCount = 0;
    let pendingTaxesCount = 0;
    let totalRevenue = 0;
    const monthlyRevenue: { [key: number]: number } = {};

    properties.forEach(p => {
      let allPaid = true;
      let hasPending = false;
      if (p.taxes && p.taxes.length > 0) {
        p.taxes.forEach(t => {
          if (t.paymentStatus === 'Unpaid' || t.paymentStatus === 'Partial') {
            allPaid = false;
            hasPending = true;
          }
          if (t.amountPaid > 0) {
            totalRevenue += t.amountPaid;
          }
          if (t.paymentDate) {
            try {
              // Assuming paymentDate is 'YYYY-MM-DD'
              const month = getMonth(new Date(t.paymentDate));
              monthlyRevenue[month] = (monthlyRevenue[month] || 0) + t.amountPaid;
            } catch (e) {
              console.error(`Invalid date format for paymentDate: ${t.paymentDate}`);
            }
          }
        });
      } else {
        allPaid = false; 
      }
      
      const hasTaxes = p.taxes && p.taxes.length > 0;
      if (hasTaxes && allPaid) {
        paidTaxesCount++;
      } else {
        // Properties with no taxes or any unpaid/partial tax are pending.
        pendingTaxesCount++;
      }
    });

    const calculatedStats = [
      { title: 'Total Users Registered', titleHi: 'कुल उपयोगकर्ता', value: totalUsers.toLocaleString(), color: 'bg-blue-500', icon: '👤' },
      { title: 'Paid Taxes', titleHi: 'भरे हुए कर', value: paidTaxesCount.toLocaleString(), color: 'bg-green-500', icon: '✅' },
      { title: 'Pending Taxes', titleHi: 'लंबित कर', value: pendingTaxesCount.toLocaleString(), color: 'bg-orange-500', icon: '⏳' },
      { title: 'Total Revenue', titleHi: 'कुल राजस्व', value: `₹${totalRevenue.toLocaleString()}`, color: 'bg-purple-500', icon: '💰' },
    ];

    const monthNames = ['जन', 'फर', 'मार्च', 'अप्रैल', 'मई', 'जून', 'जुलाई', 'अग', 'सित', 'अक्ट', 'नव', 'दिस'];
    const calculatedRevenueData = monthNames.map((monthName, index) => ({
        month: monthName,
        revenue: monthlyRevenue[index] || 0,
    })).slice(0, 6);

    return { stats: calculatedStats, revenueData: calculatedRevenueData };

  }, [properties]);


  const menuItems = [
    { id: 'dashboard', icon: Home, label: 'Dashboard', labelHi: 'होम' },
    { id: 'register', icon: UserPlus, label: 'Register New User', labelHi: 'नया उपयोगकर्ता पंजीकरण' },
    { id: 'users', icon: Users, label: 'All Users / Properties', labelHi: 'सभी उपयोगकर्ता / संपत्ति' },
    { id: 'bill', icon: FileText, label: 'Generate Bill / Receipt', labelHi: 'रसीद बनाएँ' },
    { id: 'reports', icon: BarChart3, label: 'Reports', labelHi: 'रिपोर्ट्स' },
    { id: 'settings', icon: Settings, label: 'Settings', labelHi: 'सेटिंग्स' },
  ];

  const renderContent = () => {
    switch (activeMenu) {
      case 'dashboard':
        return (
          <>
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {stats.map((stat, index) => (
                <div
                  key={index}
                  className="bg-white rounded-xl shadow-md p-6 border-l-4 hover:shadow-lg transition-shadow"
                  style={{ borderColor: stat.color.replace('bg-', '') }}
                >
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-4xl">{stat.icon}</span>
                    <div className={`${stat.color} text-white px-3 py-1 rounded-full text-sm font-bold`}>
                      {stat.value}
                    </div>
                  </div>
                  <h3 className="text-lg font-bold text-gray-800 mb-1">{stat.title}</h3>
                  <p className="text-gray-600">{stat.titleHi}</p>
                </div>
              ))}
            </div>

            {/* Revenue Chart */}
            <div className="bg-white rounded-xl shadow-md p-6 mb-8">
              <h3 className="text-xl font-bold text-gray-800 mb-4">
                Monthly Revenue Collection • मासिक राजस्व संग्रह
              </h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={revenueData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="revenue" fill="#f97316" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-xl shadow-md p-6">
              <h3 className="text-xl font-bold text-gray-800 mb-4">
                Quick Actions • त्वरित कार्य
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <button
                  onClick={() => setActiveMenu('register')}
                  className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-8 py-6 rounded-xl font-bold text-lg hover:shadow-lg transition-all transform hover:scale-105"
                >
                  <div className="text-3xl mb-2">➕</div>
                  <div>Register New User</div>
                  <div className="text-sm opacity-90">नया उपयोगकर्ता पंजीकरण</div>
                </button>
                <button
                  onClick={() => setActiveMenu('bill')}
                  className="bg-gradient-to-r from-green-500 to-green-600 text-white px-8 py-6 rounded-xl font-bold text-lg hover:shadow-lg transition-all transform hover:scale-105"
                >
                  <div className="text-3xl mb-2">📑</div>
                  <div>Generate Bill</div>
                  <div className="text-sm opacity-90">रसीद बनाएँ</div>
                </button>
                <button
                  onClick={() => setActiveMenu('reports')}
                  className="bg-gradient-to-r from-purple-500 to-purple-600 text-white px-8 py-6 rounded-xl font-bold text-lg hover:shadow-lg transition-all transform hover:scale-105"
                >
                  <div className="text-3xl mb-2">📊</div>
                  <div>View Reports</div>
                  <div className="text-sm opacity-90">रिपोर्ट देखें</div>
                </button>
              </div>
            </div>
          </>
        );
      case 'register':
        return <RegisterPropertyForm onFormSubmit={() => setActiveMenu('users')} />;
      case 'users':
        return <PropertiesPage />;
      default:
        return (
            <div className="bg-white rounded-xl shadow-md p-12 text-center">
              <div className="text-6xl mb-4">🚧</div>
              <h3 className="text-2xl font-bold text-gray-800 mb-2">
                {menuItems.find(item => item.id === activeMenu)?.label}
              </h3>
              <p className="text-xl text-gray-600 mb-2">
                {menuItems.find(item => item.id === activeMenu)?.labelHi}
              </p>
              <p className="text-gray-500">This section is under development</p>
            </div>
        );
    }
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className={`${sidebarOpen ? 'w-72' : 'w-0'} bg-white shadow-lg transition-all duration-300 overflow-hidden relative`}>
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-orange-400 to-orange-600 rounded-lg flex items-center justify-center text-white text-xl font-bold">
              🏛️
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
                onClick={() => setActiveMenu(item.id)}
                className={`w-full flex items-center gap-4 px-4 py-4 mb-2 rounded-lg text-left transition-all ${
                  activeMenu === item.id
                    ? 'bg-orange-500 text-white shadow-md'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <Icon className="w-6 h-6" />
                <div className="flex-1">
                  <div className="font-semibold text-base">{item.label}</div>
                  <div className="text-sm opacity-90">{item.labelHi}</div>
                </div>
              </button>
            );
          })}
        </nav>

        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200 bg-white">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-4 px-4 py-4 rounded-lg text-red-600 hover:bg-red-50 transition-all"
          >
            <LogOut className="w-6 h-6" />
            <div>
              <div className="font-semibold text-base">Logout</div>
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
            <div className="flex items-center gap-3">
              <div className="text-right">
                <p className="font-semibold text-gray-800">{user?.displayName || 'Admin User'}</p>
                <p className="text-sm text-gray-600">{user?.email || 'admin@lonipanchayat.in'}</p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
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

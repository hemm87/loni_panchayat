/**
 * Main Dashboard Page - Refactored Version
 * 
 * Streamlined dashboard using feature-based components:
 * - Dashboard: Stats + Charts + Quick Actions
 * - Bills: BillsListPage
 * - Reports: ReportsPage
 * - Settings: SettingsPage
 * - Register & Bill Generation: Existing form components
 */

'use client';

import React, { useState } from 'react';
import { Home, UserPlus, Users, FileText, BarChart3, Settings, LogOut, Menu, X, Building, Wrench } from 'lucide-react';
import { getAuth, signOut } from 'firebase/auth';
import { useRouter } from 'next/navigation';
import { useUser, useFirestore, useCollection, useMemoFirebase, useDoc } from '@/firebase';
import { collection, doc } from 'firebase/firestore';
import type { Property, PanchayatSettings } from '@/lib/types';

// Feature Components
import { DashboardPage } from '@/features/dashboard/components/DashboardPage';
import { BillsListPage } from '@/features/bills/components/BillsListPage';
import { ReportsPage } from '@/features/reports/components/ReportsPage';
import { SettingsPage } from '@/features/settings/components/SettingsPage';
import { ToolsPage } from '@/features/tools/components/ToolsPage';

// Existing Components
import { RegisterPropertyForm } from '@/components/properties/register-property-form';
import { GenerateBillForm } from '@/components/billing/generate-bill-form';
import { DashboardSkeleton } from '@/components/ui/loading-skeletons';
import { cn } from '@/lib/utils';

const Dashboard = () => {
  const [activeMenu, setActiveMenu] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const router = useRouter();
  const { user } = useUser();
  const firestore = useFirestore();

  // Firestore queries
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

  const handleLogout = async () => {
    const auth = getAuth();
    try {
      await signOut(auth);
      router.push('/');
    } catch (error) {
      console.error('Error signing out: ', error);
    }
  };

  const handleMenuClick = (id: string) => {
    if (id === 'users') {
      router.push('/dashboard/properties');
    } else {
      setActiveMenu(id);
    }
  };

  // Menu Items
  const menuItems = [
    { id: 'dashboard', icon: Home, label: 'Dashboard', labelHi: 'होम' },
    { id: 'register', icon: UserPlus, label: 'Register New User', labelHi: 'नया उपयोगकर्ता पंजीकरण' },
    { id: 'users', icon: Users, label: 'Property Records', labelHi: 'संपत्ति रिकॉर्ड' },
    { id: 'bill', icon: FileText, label: 'Generate Bill / Receipt', labelHi: 'रसीद बनाएँ' },
    { id: 'bills', icon: FileText, label: 'Download Bills', labelHi: 'बिल डाउनलोड करें' },
    { id: 'reports', icon: BarChart3, label: 'Reports', labelHi: 'रिपोर्ट्स' },
    { id: 'tools', icon: Wrench, label: 'Utility Tools', labelHi: 'उपयोगी उपकरण' },
    { id: 'settings', icon: Settings, label: 'Settings', labelHi: 'सेटिंग्स' },
  ];

  // Render content based on active menu
  const renderContent = () => {
    const props = properties || [];
    
    switch (activeMenu) {
      case 'dashboard':
        return (
          <DashboardPage
            properties={props}
            onRegisterClick={() => setActiveMenu('register')}
            onBillClick={() => setActiveMenu('bill')}
            onReportsClick={() => setActiveMenu('reports')}
          />
        );
      
      case 'register':
        return (
          <RegisterPropertyForm 
            onFormSubmit={() => router.push('/dashboard/properties')} 
            onCancel={() => setActiveMenu('dashboard')}
          />
        );
      
      case 'bill':
        return (
          <GenerateBillForm 
            properties={props}
            settings={settings || null}
            onFormSubmit={() => router.push('/dashboard/properties')} 
            onCancel={() => setActiveMenu('dashboard')}
          />
        );
      
      case 'bills':
        return <BillsListPage properties={props} settings={settings || null} />;
      
      case 'reports':
        return <ReportsPage properties={props} />;
      
      case 'tools':
        return <ToolsPage properties={props} settings={settings || null} />;
      
      case 'settings':
        return <SettingsPage settings={settings || null} docRef={settingsDocRef} />;
      
      default:
        return (
          <DashboardPage
            properties={props}
            onRegisterClick={() => setActiveMenu('register')}
            onBillClick={() => setActiveMenu('bill')}
            onReportsClick={() => setActiveMenu('reports')}
          />
        );
    }
  };

  if (collectionLoading || settingsLoading) {
    return (
      <div className="flex-1 flex flex-col overflow-hidden">
        <main className="flex-1 overflow-y-auto p-6">
          <DashboardSkeleton />
        </main>
      </div>
    );
  }

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
                  Welcome back! <span className="text-muted-foreground/60">•</span>{' '}
                  <span className="font-hindi">स्वागत है</span>
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

        {/* Dashboard Content */}
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

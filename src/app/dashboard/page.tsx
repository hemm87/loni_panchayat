'use client';
import React, { useState, useMemo } from 'react';
import { Home, UserPlus, Users, FileText, BarChart3, Settings, LogOut, Menu, X, Search, Filter, Download, Printer, Edit, Trash2, Eye, Save, Calendar, IndianRupee } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
import { getAuth, signOut } from 'firebase/auth';
import { useRouter } from 'next/navigation';
import { useUser, useFirestore, useCollection } from '@/firebase';
import { doc, setDoc, collection } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import type { Property } from '@/lib/types';
import { PropertiesTable } from '@/components/properties/properties-table';

const Dashboard = () => {
  const [activeMenu, setActiveMenu] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const router = useRouter();
  const { user } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();
  
  // Form states for Register Page
  const [formData, setFormData] = useState({
    fullName: '',
    fatherHusbandName: '',
    mobile: '',
    aadhar: '',
    address: '',
    ward: '',
    propertyNumber: '',
    propertyType: '',
    annualTax: ''
  });

  // Form states for Bill Page
  const [billData, setBillData] = useState({
    userId: '',
    billType: '',
    amount: '',
    paymentMode: '',
    date: '',
    remarks: ''
  });

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

  // Handle form input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>, form = 'register') => {
    const { name, value } = e.target;
    if (form === 'register') {
      setFormData(prev => ({ ...prev, [name]: value }));
    } else if (form === 'bill') {
      setBillData(prev => ({ ...prev, [name]: value }));
    }
  };

  // Handle form submissions (Firebase integration point)
  const handleRegisterSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!firestore) {
      toast({ variant: 'destructive', title: 'Error', description: 'Firestore is not initialized.' });
      return;
    }

    const propertyId = `PROP${Date.now()}`;
    const newProperty: Omit<Property, 'id'> = {
        ownerName: formData.fullName,
        fatherName: formData.fatherHusbandName,
        mobileNumber: formData.mobile,
        houseNo: formData.propertyNumber,
        address: `${formData.address}, Ward ${formData.ward}`,
        aadhaarHash: formData.aadhar, // Note: In a real app, this should be hashed.
        propertyType: formData.propertyType as "Residential" | "Commercial" | "Agricultural",
        area: 0, // The form doesn't have an area field, defaulting to 0
        photoUrl: `https://picsum.photos/seed/${propertyId}/600/400`,
        photoHint: 'new property',
        taxes: formData.annualTax ? [{
            id: `TAX${Date.now()}`,
            taxType: 'Property Tax',
            hindiName: 'घर कर',
            assessedAmount: Number(formData.annualTax),
            paymentStatus: 'Unpaid',
            amountPaid: 0,
            assessmentYear: new Date().getFullYear(),
        }] : [],
    };

    try {
        await setDoc(doc(firestore, 'properties', propertyId), newProperty);
        toast({
            title: 'Success!',
            description: `Property ${propertyId} has been registered.`,
        });
        setFormData({ // Reset form
            fullName: '', fatherHusbandName: '', mobile: '', aadhar: '',
            address: '', ward: '', propertyNumber: '', propertyType: '', annualTax: ''
        });
        setActiveMenu('users'); // Switch to users page
    } catch (error: any) {
        console.error("Error adding document: ", error);
        toast({
            variant: 'destructive',
            title: 'Registration Failed',
            description: error.message,
        });
    }
  };


  const handleBillSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    console.log('Bill Data:', billData);
    // TODO: Add Firebase Firestore integration here
    alert('Bill generation will be implemented with Firebase');
  };

  // Dashboard Page
  const DashboardPage = () => {
    // TODO: Fetch these stats from Firebase
    const stats = [
      { title: 'Total Users', titleHi: 'कुल उपयोगकर्ता', value: '0', color: 'bg-blue-500', icon: '👤' },
      { title: 'Paid Taxes', titleHi: 'भरे हुए कर', value: '0', color: 'bg-green-500', icon: '✅' },
      { title: 'Pending Taxes', titleHi: 'लंबित कर', value: '0', color: 'bg-orange-500', icon: '⏳' },
      { title: 'Total Revenue', titleHi: 'कुल राजस्व', value: '₹0', color: 'bg-purple-500', icon: '💰' },
    ];

    return (
      <>
        {/* Stats Cards */}
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

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-md p-6">
            <h3 className="text-xl font-bold text-gray-800 mb-4">
              Monthly Revenue • मासिक राजस्व
            </h3>
            <div className="h-64 flex items-center justify-center text-gray-400">
              <p>Connect Firebase to display revenue charts</p>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6">
            <h3 className="text-xl font-bold text-gray-800 mb-4">
              Tax Distribution • कर वितरण
            </h3>
            <div className="h-64 flex items-center justify-center text-gray-400">
              <p>Connect Firebase to display tax distribution</p>
            </div>
          </div>
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
              <div className="text-sm opacity-90">नया उपयोगकर्ता</div>
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
  };

  // Register New User Page
  const RegisterPage = () => (
    <div className="bg-white rounded-xl shadow-md p-8">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">
        Register New User • नया उपयोगकर्ता पंजीकरण
      </h2>
      
      <form onSubmit={handleRegisterSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">
              Full Name • पूरा नाम *
            </label>
            <input
              type="text"
              name="fullName"
              value={formData.fullName}
              onChange={handleInputChange}
              placeholder="Enter full name"
              required
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-orange-500 focus:outline-none text-lg"
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">
              Father's/Husband's Name • पिता/पति का नाम *
            </label>
            <input
              type="text"
              name="fatherHusbandName"
              value={formData.fatherHusbandName}
              onChange={handleInputChange}
              placeholder="Enter father's/husband's name"
              required
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-orange-500 focus:outline-none text-lg"
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">
              Mobile Number • मोबाइल नंबर *
            </label>
            <input
              type="tel"
              name="mobile"
              value={formData.mobile}
              onChange={handleInputChange}
              placeholder="10-digit mobile number"
              pattern="[0-9]{10}"
              required
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-orange-500 focus:outline-none text-lg"
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">
              Aadhar Number • आधार नंबर
            </label>
            <input
              type="text"
              name="aadhar"
              value={formData.aadhar}
              onChange={handleInputChange}
              placeholder="12-digit Aadhar number"
              pattern="[0-9]{12}"
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-orange-500 focus:outline-none text-lg"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-bold text-gray-700 mb-2">
              Address • पता *
            </label>
            <textarea
              name="address"
              value={formData.address}
              onChange={(e) => handleInputChange(e)}
              placeholder="Complete address"
              rows={3}
              required
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-orange-500 focus:outline-none text-lg"
            ></textarea>
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">
              Ward Number • वार्ड नंबर *
            </label>
            <select
              name="ward"
              value={formData.ward}
              onChange={(e) => handleInputChange(e)}
              required
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-orange-500 focus:outline-none text-lg"
            >
              <option value="">Select Ward</option>
              <option value="1">Ward 1</option>
              <option value="2">Ward 2</option>
              <option value="3">Ward 3</option>
              <option value="4">Ward 4</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">
              Property Number • संपत्ति नंबर *
            </label>
            <input
              type="text"
              name="propertyNumber"
              value={formData.propertyNumber}
              onChange={handleInputChange}
              placeholder="e.g., Plot-101"
              required
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-orange-500 focus:outline-none text-lg"
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">
              Property Type • संपत्ति का प्रकार *
            </label>
            <select
              name="propertyType"
              value={formData.propertyType}
              onChange={(e) => handleInputChange(e)}
              required
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-orange-500 focus:outline-none text-lg"
            >
              <option value="">Select Type</option>
              <option value="Residential">Residential - आवासीय</option>
              <option value="Commercial">Commercial - व्यावसायिक</option>
              <option value="Agricultural">Agricultural - कृषि</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">
              Annual Tax Amount • वार्षिक कर राशि *
            </label>
            <input
              type="number"
              name="annualTax"
              value={formData.annualTax}
              onChange={handleInputChange}
              placeholder="Enter amount in ₹"
              required
              min="0"
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-orange-500 focus:outline-none text-lg"
            />
          </div>
        </div>

        <div className="flex gap-4 pt-4">
          <button
            type="submit"
            className="flex-1 bg-gradient-to-r from-green-500 to-green-600 text-white px-8 py-4 rounded-lg font-bold text-lg hover:shadow-lg transition-all flex items-center justify-center gap-2"
          >
            <Save className="w-6 h-6" />
            Save & Register • सहेजें और पंजीकृत करें
          </button>
          <button
            type="button"
            onClick={() => setActiveMenu('dashboard')}
            className="px-8 py-4 bg-gray-200 text-gray-700 rounded-lg font-bold text-lg hover:bg-gray-300 transition-all"
          >
            Cancel • रद्द करें
          </button>
        </div>
      </form>
    </div>
  );

  const propertiesQuery = useMemo(() => {
    if (!firestore) return null;
    return collection(firestore, 'properties');
  }, [firestore]);

  const { data: properties, loading: collectionLoading } = useCollection<Property>(propertiesQuery);

  // All Users Page
  const UsersPage = () => (
    <div className="bg-white rounded-xl shadow-md p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-800">
          All Users / Properties • सभी उपयोगकर्ता / संपत्ति
        </h2>
        <button className="bg-orange-500 text-white px-6 py-3 rounded-lg font-bold hover:bg-orange-600 transition-all flex items-center gap-2">
          <Download className="w-5 h-5" />
          Export • निर्यात करें
        </button>
      </div>

       <PropertiesTable data={properties || []} />
    </div>
  );

  // Generate Bill Page
  const BillPage = () => (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-xl shadow-md p-8 mb-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">
          Generate Bill / Receipt • रसीद बनाएँ
        </h2>

        <form onSubmit={handleBillSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">
              Select User • उपयोगकर्ता चुनें *
            </label>
            <select
              name="userId"
              value={billData.userId}
              onChange={(e) => handleInputChange(e, 'bill')}
              required
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-orange-500 focus:outline-none text-lg"
            >
              <option value="">-- Select User from Database --</option>
              {/* TODO: Populate from Firebase */}
            </select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                Bill Type • बिल का प्रकार *
              </label>
              <select
                name="billType"
                value={billData.billType}
                onChange={(e) => handleInputChange(e, 'bill')}
                required
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-orange-500 focus:outline-none text-lg"
              >
                <option value="">Select Type</option>
                <option value="property">Property Tax</option>
                <option value="water">Water Tax</option>
                <option value="other">Other Tax</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                Amount • राशि *
              </label>
              <input
                type="number"
                name="amount"
                value={billData.amount}
                onChange={(e) => handleInputChange(e, 'bill')}
                placeholder="Enter amount"
                required
                min="0"
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-orange-500 focus:outline-none text-lg"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                Payment Mode • भुगतान मोड *
              </label>
              <select
                name="paymentMode"
                value={billData.paymentMode}
                onChange={(e) => handleInputChange(e, 'bill')}
                required
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-orange-500 focus:outline-none text-lg"
              >
                <option value="">Select Mode</option>
                <option value="cash">Cash - नकद</option>
                <option value="online">Online - ऑनलाइन</option>
                <option value="cheque">Cheque - चेक</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                Date • तारीख *
              </label>
              <input
                type="date"
                name="date"
                value={billData.date}
                onChange={(e) => handleInputChange(e, 'bill')}
                required
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-orange-500 focus:outline-none text-lg"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">
              Remarks • टिप्पणी
            </label>
            <textarea
              name="remarks"
              value={billData.remarks}
              onChange={(e) => handleInputChange(e, 'bill')}
              placeholder="Additional remarks (optional)"
              rows={3}
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-orange-500 focus:outline-none text-lg"
            ></textarea>
          </div>

          <div className="flex gap-4">
            <button
              type="submit"
              className="flex-1 bg-gradient-to-r from-blue-500 to-blue-600 text-white px-8 py-4 rounded-lg font-bold text-lg hover:shadow-lg transition-all flex items-center justify-center gap-2"
            >
              <FileText className="w-6 h-6" />
              Generate Receipt • रसीद बनाएँ
            </button>
            <button
              type="button"
              className="flex-1 bg-gradient-to-r from-green-500 to-green-600 text-white px-8 py-4 rounded-lg font-bold text-lg hover:shadow-lg transition-all flex items-center justify-center gap-2"
            >
              <Printer className="w-6 h-6" />
              Print Receipt • रसीद प्रिंट करें
            </button>
          </div>
        </form>
      </div>

      <div className="bg-white rounded-xl shadow-md p-8 border-4 border-dashed border-gray-300">
        <div className="text-center mb-6">
          <h3 className="text-2xl font-bold text-gray-800">लॉनी ग्राम पंचायत</h3>
          <p className="text-lg text-gray-600">Loni Gram Panchayat</p>
          <p className="text-gray-600">Tax Receipt Preview • कर रसीद पूर्वावलोकन</p>
        </div>
        <div className="text-center text-gray-500 py-12">
          <FileText className="w-16 h-16 mx-auto mb-4 opacity-50" />
          <p className="text-lg">Receipt will appear here after generation</p>
          <p>रसीद बनाने के बाद यहां दिखाई देगी</p>
        </div>
      </div>
    </div>
  );

  // Reports Page
  const ReportsPage = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-md p-6">
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
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-orange-500 focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">
              To Date • तक तारीख
            </label>
            <input
              type="date"
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-orange-500 focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">
              Report Type • रिपोर्ट प्रकार
            </label>
            <select className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-orange-500 focus:outline-none">
              <option>All Reports</option>
              <option>Revenue Report</option>
              <option>Tax Collection</option>
              <option>Pending Taxes</option>
            </select>
          </div>
        </div>

        <div className="flex gap-4">
          <button className="bg-blue-500 text-white px-6 py-3 rounded-lg font-bold hover:bg-blue-600 transition-all flex items-center gap-2">
            <Search className="w-5 h-5" />
            Generate Report • रिपोर्ट बनाएँ
          </button>
          <button className="bg-green-500 text-white px-6 py-3 rounded-lg font-bold hover:bg-green-600 transition-all flex items-center gap-2">
            <Download className="w-5 h-5" />
            Export PDF
          </button>
          <button className="bg-purple-500 text-white px-6 py-3 rounded-lg font-bold hover:bg-purple-600 transition-all flex items-center gap-2">
            <Download className="w-5 h-5" />
            Export Excel
          </button>
        </div>
      </div>

      <div className="text-center py-12 bg-white rounded-xl shadow-md text-gray-400">
        <BarChart3 className="w-16 h-16 mx-auto mb-4 opacity-50" />
        <p className="text-lg">No reports available yet</p>
        <p>अभी तक कोई रिपोर्ट उपलब्ध नहीं है</p>
        <p className="mt-4 text-sm">Connect Firebase to generate reports from database</p>
      </div>
    </div>
  );

  // Settings Page
  const SettingsPage = () => (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-xl shadow-md p-8">
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
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-orange-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">District • जिला</label>
                <input
                  type="text"
                  placeholder="Enter district name"
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-orange-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">State • राज्य</label>
                <input
                  type="text"
                  placeholder="Enter state name"
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-orange-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">PIN Code • पिन कोड</label>
                <input
                  type="text"
                  placeholder="Enter PIN code"
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-orange-500 focus:outline-none"
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
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-orange-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Water Tax Rate (%)</label>
                <input
                  type="number"
                  placeholder="0.00"
                  min="0"
                  step="0.01"
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-orange-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Late Fee (%)</label>
                <input
                  type="number"
                  placeholder="0.00"
                  min="0"
                  step="0.01"
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-orange-500 focus:outline-none"
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
                <button className="bg-blue-500 text-white px-4 py-2 rounded-lg font-bold hover:bg-blue-600 transition-all">
                  Change Password
                </button>
              </div>
            </div>
          </div>

          <div className="border-b pb-6">
            <h3 className="text-xl font-bold text-gray-800 mb-4">Receipt Settings • रसीद सेटिंग्स</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Receipt Prefix</label>
                <input
                  type="text"
                  placeholder="e.g., LGP/2025/"
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-orange-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Starting Number</label>
                <input
                  type="number"
                  placeholder="1"
                  min="1"
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-orange-500 focus:outline-none"
                />
              </div>
            </div>
          </div>

          <div className="border-b pb-6">
            <h3 className="text-xl font-bold text-gray-800 mb-4">Notifications • सूचनाएं</h3>
            <div className="space-y-3">
              <label className="flex items-center gap-3 cursor-pointer">
                <input type="checkbox" className="w-5 h-5 text-orange-500" defaultChecked />
                <span className="text-gray-700">SMS notifications for tax reminders</span>
              </label>
              <label className="flex items-center gap-3 cursor-pointer">
                <input type="checkbox" className="w-5 h-5 text-orange-500" defaultChecked />
                <span className="text-gray-700">Email notifications for payments</span>
              </label>
              <label className="flex items-center gap-3 cursor-pointer">
                <input type="checkbox" className="w-5 h-5 text-orange-500" />
                <span className="text-gray-700">WhatsApp notifications</span>
              </label>
            </div>
          </div>

          <div className="border-b pb-6">
            <h3 className="text-xl font-bold text-gray-800 mb-4">Backup & Data • बैकअप और डेटा</h3>
            <div className="space-y-4">
              <button className="w-full bg-blue-500 text-white px-6 py-3 rounded-lg font-bold hover:bg-blue-600 transition-all flex items-center justify-center gap-2">
                <Download className="w-5 h-5" />
                Download Database Backup • डेटाबेस बैकअप डाउनलोड करें
              </button>
              <button className="w-full bg-green-500 text-white px-6 py-3 rounded-lg font-bold hover:bg-green-600 transition-all flex items-center justify-center gap-2">
                <Download className="w-5 h-5" />
                Export All Data to Excel • सभी डेटा एक्सेल में निर्यात करें
              </button>
            </div>
          </div>

          <div className="flex gap-4">
            <button className="flex-1 bg-gradient-to-r from-green-500 to-green-600 text-white px-8 py-4 rounded-lg font-bold text-lg hover:shadow-lg transition-all flex items-center justify-center gap-2">
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
          {activeMenu === 'dashboard' && <DashboardPage />}
          {activeMenu === 'register' && <RegisterPage />}
          {activeMenu === 'users' && <UsersPage />}
          {activeMenu === 'bill' && <BillPage />}
          {activeMenu === 'reports' && <ReportsPage />}
          {activeMenu === 'settings' && <SettingsPage />}
        </main>
      </div>
    </div>
  );
};

export default Dashboard;

import React, { useState, useEffect } from 'react';
import { Routes, Route, Link, useLocation, useNavigate } from 'react-router-dom';
import { useFirebase } from '../contexts/FirebaseContext';
import { motion, AnimatePresence } from 'motion/react';
import { 
  LayoutDashboard, Users, ShoppingCart, Settings, 
  Plus, Upload, Link as LinkIcon, Search, MoreHorizontal,
  Mail, Phone, Briefcase, Trash2, CheckCircle, XCircle,
  Download, FileSpreadsheet, ChevronRight, Copy, Check,
  Camera, Palette, Building2
} from 'lucide-react';
import { db, storage, auth } from '../lib/firebase';
import { collection, query, where, getDocs, addDoc, doc, updateDoc, deleteDoc, setDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { cn } from '../lib/utils';
import LoadingAnimation from '../components/LoadingAnimation';
import { Logo } from '../components/Logo';

export default function CompanyDashboardPage() {
  const { company, profile, user, loading, isCompanyAdmin } = useFirebase();
  const location = useLocation();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    if (!loading && (!user || !isCompanyAdmin)) {
      navigate('/dashboard');
    }
  }, [user, isCompanyAdmin, loading, navigate]);

  if (loading || !company) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <LoadingAnimation />
      </div>
    );
  }

  const menuItems = [
    { icon: <LayoutDashboard size={20} />, label: 'Хяналт', path: '/company' },
    { icon: <Users size={20} />, label: 'Ажилчид', path: '/company/employees' },
    { icon: <ShoppingCart size={20} />, label: 'Захиалга', path: '/company/orders' },
    { icon: <Settings size={20} />, label: 'Тохиргоо', path: '/company/settings' },
  ];

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex font-sans">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex flex-col w-72 bg-white border-r border-slate-200 sticky top-0 h-screen">
        <div className="p-8">
          <Link to="/">
            <Logo size="md" />
          </Link>
        </div>

        <nav className="flex-1 px-4 space-y-1">
          {menuItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all",
                location.pathname === item.path 
                  ? "bg-aurora-blue text-white shadow-lg shadow-aurora-blue/20" 
                  : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
              )}
            >
              {item.icon}
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="p-6 border-t border-slate-100">
          <div className="flex items-center gap-3 p-3 rounded-2xl bg-slate-50">
            <div className="w-10 h-10 rounded-xl bg-aurora-blue flex items-center justify-center text-white font-bold">
              {company.name[0]}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-slate-900 truncate">{company.name}</p>
              <p className="text-[10px] text-slate-400 font-medium">Байгууллага</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-20 lg:h-24 bg-white/80 backdrop-blur-md border-b border-slate-200 sticky top-0 z-30 px-6 sm:px-10 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setIsMobileMenuOpen(true)}
              className="lg:hidden p-2 text-slate-500 hover:bg-slate-100 rounded-xl transition-colors"
            >
              <MoreHorizontal />
            </button>
            <h1 className="text-xl font-black text-slate-900">
              {menuItems.find(i => i.path === location.pathname)?.label || 'Dashboard'}
            </h1>
          </div>

          <div className="flex items-center gap-4">
            <Link to="/dashboard" className="text-xs font-bold text-slate-500 hover:text-aurora-blue transition-colors px-4 py-2 bg-slate-50 rounded-xl">
              Хувийн самбар →
            </Link>
          </div>
        </header>

        <main className="p-6 sm:p-10 max-w-7xl w-full mx-auto">
          <Routes>
            <Route path="/" element={<Overview company={company} />} />
            <Route path="/employees" element={<EmployeeList company={company} />} />
            <Route path="/orders" element={<OrdersList company={company} />} />
            <Route path="/settings" element={<SettingsView company={company} />} />
          </Routes>
        </main>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm lg:hidden"
            onClick={() => setIsMobileMenuOpen(false)}
          >
            <motion.div 
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              className="w-72 h-full bg-white p-6 flex flex-col"
              onClick={e => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-10">
                <Logo size="sm" />
                <button onClick={() => setIsMobileMenuOpen(false)} className="p-2 bg-slate-50 rounded-xl">
                  <XCircle className="w-5 h-5 text-slate-400" />
                </button>
              </div>

              <nav className="flex-1 space-y-1">
                {menuItems.map((item) => (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={cn(
                      "flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all",
                      location.pathname === item.path 
                        ? "bg-aurora-blue text-white shadow-lg shadow-aurora-blue/20" 
                        : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
                    )}
                  >
                    {item.icon}
                    {item.label}
                  </Link>
                ))}
              </nav>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function Overview({ company }: { company: any }) {
  const [stats, setStats] = useState({ employees: 0, orders: 0 });
  const [localError, setLocalError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      if (!company?.id) {
        console.log("No company ID available for stats fetch.");
        return;
      }
      
      try {
        setLocalError(null);
        // Force refresh token or ensure auth is solid
        if (!auth.currentUser) {
          console.warn("Auth not ready during fetchStats");
          return;
        }

        console.log("Fetching Dashboard Stats for:", company.id);
        
        // 1. Members
        const membersRef = collection(db, `companies/${company.id}/members`);
        const empSnap = await getDocs(membersRef).catch(e => {
          console.error("Members Permission Denied:", e.code, e.message);
          throw new Error(`Members Access Denied. Check B2B Admin status for ID: ${company.id}`);
        });
        
        // 2. Orders
        const ordersQuery = query(collection(db, 'orders'), where('company_id', '==', company.id));
        const ordSnap = await getDocs(ordersQuery).catch(e => {
          console.error("Orders Permission Denied:", e.code, e.message);
          throw new Error(`Orders Access Denied. Check B2B Admin status for ID: ${company.id}`);
        });

        setStats({
          employees: empSnap.size,
          orders: ordSnap.size
        });
      } catch (err: any) {
        console.error('Stats Sync Error:', err);
        setLocalError(err.message);
      }
    };
    fetchStats();
  }, [company?.id]);

  return (
    <div className="space-y-8">
      {localError && (
        <div className="bg-red-50 border border-red-200 text-red-600 p-4 rounded-2xl flex items-center gap-3">
          <XCircle className="w-5 h-5 shrink-0" />
          <div className="text-sm">
            <p className="font-bold">Мэдээлэл авахад алдаа гарлаа:</p>
            <p className="opacity-80">{localError}</p>
            <p className="mt-1 text-[10px] italic">Энэ нь Firestore-ийн эрхийн тохиргоотой холбоотой байж магадгүй (Rules propagation delay).</p>
          </div>
        </div>
      )}
      {/* Welcome Card */}
      <div className="p-10 rounded-[40px] bg-white border border-slate-200 relative overflow-hidden shadow-sm">
        <div 
          className="absolute top-0 right-0 w-64 h-64 blur-[100px] opacity-20 pointer-events-none"
          style={{ backgroundColor: company.brand_color }}
        />
        <div className="relative z-10">
          <p className="text-aurora-blue font-black uppercase tracking-widest text-[11px] mb-4">Байгууллагын самбар</p>
          <h2 className="text-3xl font-serif font-black text-slate-900 mb-2">Сайн байна уу, {company.name}!</h2>
          <p className="text-slate-500 max-w-lg">Өнөөдрийн байдлаар танай байгууллагад {stats.employees} ажилтан бүртгэлтэй байна.</p>
          
          <div className="mt-10 flex flex-wrap gap-4">
            <Link to="/company/employees" className="btn-aurora text-white px-8 py-4 rounded-2xl font-bold flex items-center gap-2 shadow-lg shadow-aurora-blue/20">
              <Users className="w-5 h-5" /> Ажилтан нэмэх
            </Link>
            <Link to="/company/orders" className="bg-slate-900 text-white px-8 py-4 rounded-2xl font-bold flex items-center gap-2 hover:bg-slate-800 transition-colors shadow-lg shadow-black/10">
              <ShoppingCart className="w-5 h-5" /> Картын захиалга
            </Link>
          </div>
        </div>
      </div>

      {/* Mini Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-8 bg-white border border-slate-200 rounded-3xl">
          <div className="w-12 h-12 bg-blue-50 text-blue-500 rounded-2xl flex items-center justify-center mb-6">
            <Users size={24} />
          </div>
          <p className="text-3xl font-black text-slate-900 mb-1">{stats.employees}</p>
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Нийт ажилчид</p>
        </div>
        <div className="p-8 bg-white border border-slate-200 rounded-3xl">
          <div className="w-12 h-12 bg-magenta-50 text-magenta-500 rounded-2xl flex items-center justify-center mb-6">
            <ShoppingCart size={24} />
          </div>
          <p className="text-3xl font-black text-slate-900 mb-1">{stats.orders}</p>
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Захиалга</p>
        </div>
        <div className="p-8 bg-white border border-slate-200 rounded-3xl shadow-xl shadow-aurora-blue/5 border-aurora-blue/20">
          <div className="w-12 h-12 bg-indigo-50 text-indigo-500 rounded-2xl flex items-center justify-center mb-6">
            <CheckCircle size={24} />
          </div>
          <p className="text-3xl font-black text-aurora-blue mb-1">Идэвхтэй</p>
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Төлөв</p>
        </div>
      </div>
    </div>
  );
}

function EmployeeList({ company }: { company: any }) {
  const [employees, setEmployees] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchEmployees = async () => {
    setLoading(true);
    try {
      console.log("Fetching employee profiles for company:", company.id);
      const q = query(collection(db, 'profiles'), where('company_id', '==', company.id));
      const snap = await getDocs(q).catch(e => {
        console.error("Permission denied on employee profiles query:", e);
        throw e;
      });
      setEmployees(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    } catch (error: any) {
      console.error("Final fetchEmployees Error:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, [company.id]);

  const filtered = (employees || []).filter(e => {
    const searchStr = `${e.firstname || ''} ${e.lastname || ''} ${e.email || ''} ${e.job_title || ''}`.toLowerCase();
    return searchStr.includes(searchTerm.toLowerCase());
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-2xl font-serif font-black text-slate-900">Ажилчдын жагсаалт</h2>
          <p className="text-sm text-slate-500 mt-1">Танай байгууллагад бүртгэлтэй нийт ажилчид.</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <button onClick={() => setIsImportModalOpen(true)} className="px-5 py-3 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-50 transition-all flex items-center gap-2">
            <FileSpreadsheet className="w-4 h-4" /> Excel ачаалах
          </button>
          <button onClick={() => setIsInviteModalOpen(true)} className="px-5 py-3 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-50 transition-all flex items-center gap-2">
            <LinkIcon className="w-4 h-4" /> Урилга илгээх
          </button>
          <button onClick={() => setIsAddModalOpen(true)} className="px-5 py-3 btn-aurora text-white rounded-xl text-xs font-bold transition-all flex items-center gap-2 shadow-lg shadow-aurora-blue/10">
            <Plus className="w-4 h-4" /> Ажилтан нэмэх
          </button>
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-[32px] overflow-hidden shadow-sm">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="relative w-full max-w-md">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 w-4 h-4" />
            <input 
              type="text" 
              placeholder="Ажилтан хайх..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-white border border-slate-200 rounded-xl py-2.5 pl-11 pr-4 outline-none focus:border-aurora-blue transition-all text-sm"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50/50 text-[10px] uppercase font-bold text-slate-400 tracking-widest border-b border-slate-100">
              <tr>
                <th className="px-8 py-5">Ажилтан</th>
                <th className="px-8 py-5">Албан тушаал</th>
                <th className="px-8 py-5">Хамтын ажиллагаа</th>
                <th className="px-8 py-5">Төлөв</th>
                <th className="px-8 py-5 text-right"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {loading ? (
                <tr>
                  <td colSpan={5} className="py-20 text-center"><LoadingAnimation /></td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-20 text-center text-slate-400 italic">Ажилтан олдсонгүй.</td>
                </tr>
              ) : filtered.map((emp) => (
                <tr key={emp.id} className="hover:bg-slate-50/50 transition-colors group">
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-slate-100 overflow-hidden flex items-center justify-center shrink-0 border border-slate-100">
                        {emp.avatar_url ? <img src={emp.avatar_url} className="w-full h-full object-cover" /> : <div className="font-bold text-slate-400 italic">{emp.firstname[0]}</div>}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-bold text-slate-900 truncate">{emp.lastname} {emp.firstname}</p>
                        <p className="text-[10px] text-slate-400 truncate">{emp.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-5">
                    <p className="text-xs font-medium text-slate-700">{emp.job_title || 'Мэргэжилтэн'}</p>
                  </td>
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                      <a href={`mailto:${emp.email}`} className="p-2 bg-white border border-slate-200 rounded-lg text-slate-400 hover:text-aurora-blue hover:border-aurora-blue transition-all"><Mail size={14} /></a>
                      <a href={`tel:${emp.phone}`} className="p-2 bg-white border border-slate-200 rounded-lg text-slate-400 hover:text-aurora-blue hover:border-aurora-blue transition-all"><Phone size={14} /></a>
                    </div>
                  </td>
                  <td className="px-8 py-5">
                    <span className="px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-600 text-[9px] font-black uppercase tracking-tighter">Active</span>
                  </td>
                  <td className="px-8 py-5 text-right">
                    <button className="p-2 text-slate-300 hover:text-danger transition-colors">
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modals */}
      <AddEmployeeModal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} company={company} onSuccess={fetchEmployees} />
      <InviteLinkModal isOpen={isInviteModalOpen} onClose={() => setIsInviteModalOpen(false)} companyId={company.id} />
      <ImportExcelModal isOpen={isImportModalOpen} onClose={() => setIsImportModalOpen(false)} company={company} onSuccess={fetchEmployees} />
    </div>
  );
}

function AddEmployeeModal({ isOpen, onClose, company, onSuccess }: any) {
  const [formData, setFormData] = useState({ firstname: '', lastname: '', email: '', phone: '', job_title: '' });
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      // For MVP, we auto-generate password as company name + random
      const tempPass = company.name.toLowerCase().replace(/\s/g, '') + '123';
      
      const res = await fetch('/api/create-employee', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          ...formData, 
          companyId: company.id, 
          companyName: company.name,
          brandColor: company.brand_color,
          password: tempPass 
        })
      });

      if (!res.ok) throw new Error('Failed to create employee profile');

      onSuccess();
      onClose();
    } catch (error) {
      console.error(error);
      alert('Алдаа гарлаа. Дахин оролдоно уу.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-sm">
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-white rounded-[32px] w-full max-w-lg p-10 shadow-2xl overflow-hidden relative">
        <div 
          className="absolute top-0 right-0 w-32 h-32 blur-3xl opacity-20 pointer-events-none"
          style={{ backgroundColor: company.brand_color }}
        />
        <h3 className="text-2xl font-serif font-black text-slate-900 mb-2">Ажилтан нэмэх</h3>
        <p className="text-slate-500 text-sm mb-8">Ажилтны үндсэн мэдээллийг оруулан карт үүсгэнэ үү.</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-[10px] uppercase tracking-widest text-slate-400 font-bold">Овог</label>
              <input 
                type="text" 
                required
                value={formData.lastname}
                onChange={e => setFormData(p => ({ ...p, lastname: e.target.value }))}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 focus:border-aurora-blue outline-none transition-all text-sm" 
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] uppercase tracking-widest text-slate-400 font-bold">Нэр</label>
              <input 
                type="text" 
                required
                value={formData.firstname}
                onChange={e => setFormData(p => ({ ...p, firstname: e.target.value }))}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 focus:border-aurora-blue outline-none transition-all text-sm" 
              />
            </div>
          </div>
          <div className="space-y-1.5">
            <label className="text-[10px] uppercase tracking-widest text-slate-400 font-bold">Мэргэжил / Албан тушаал</label>
            <input 
              type="text" 
              required
              value={formData.job_title}
              onChange={e => setFormData(p => ({ ...p, job_title: e.target.value }))}
              placeholder="Жишээ: Ахлах менежер"
              className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 focus:border-aurora-blue outline-none transition-all text-sm" 
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-[10px] uppercase tracking-widest text-slate-400 font-bold">Имэйл хаяг</label>
            <input 
              type="email" 
              required
              value={formData.email}
              onChange={e => setFormData(p => ({ ...p, email: e.target.value }))}
              placeholder="name@company.mn"
              className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 focus:border-aurora-blue outline-none transition-all text-sm" 
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-[10px] uppercase tracking-widest text-slate-400 font-bold">Утасны дугаар</label>
            <input 
              type="tel" 
              required
              value={formData.phone}
              onChange={e => setFormData(p => ({ ...p, phone: e.target.value }))}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 focus:border-aurora-blue outline-none transition-all text-sm" 
            />
          </div>

          <div className="flex gap-4 pt-4">
            <button type="button" onClick={onClose} className="flex-1 py-4 bg-slate-100 rounded-2xl font-bold text-slate-600 hover:bg-slate-200 transition-all">Цуцлах</button>
            <button type="submit" disabled={loading} className="flex-1 btn-aurora text-white py-4 rounded-2xl font-bold transition-all shadow-lg shadow-aurora-blue/20">
              {loading ? "Түр хүлээнэ үү..." : "Хадгалах"}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}

function InviteLinkModal({ isOpen, onClose, companyId }: any) {
  const [copied, setCopied] = useState(false);
  const inviteLink = `${window.location.origin}/join/${companyId}`;

  if (!isOpen) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(inviteLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-sm">
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-white rounded-[32px] w-full max-w-lg p-10 shadow-2xl">
        <h3 className="text-2xl font-serif font-black text-slate-900 mb-2">Урилга илгээх</h3>
        <p className="text-slate-500 text-sm mb-8">Энэхүү холбоосыг ажилчиддаа илгээж өөрөө картаа үүсгэх боломжийг олгоорой.</p>

        <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100 flex items-center justify-between gap-4">
          <p className="text-xs font-mono text-slate-500 truncate">{inviteLink}</p>
          <button 
            onClick={handleCopy}
            className={cn(
              "p-3 rounded-xl transition-all shrink-0 shadow-sm",
              copied ? "bg-emerald-500 text-white" : "bg-white text-slate-400 hover:text-aurora-blue"
            )}
          >
            {copied ? <Check size={18} /> : <Copy size={18} />}
          </button>
        </div>

        <button onClick={onClose} className="w-full py-4 mt-8 bg-slate-900 text-white rounded-2xl font-bold">Хаах</button>
      </motion.div>
    </div>
  );
}

function ImportExcelModal({ isOpen, onClose, company, onSuccess }: any) {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleImport = async () => {
    if (!file) return;
    setLoading(true);
    try {
      // In real scenario, parse file logic here
      // For MVP we assume CSV and send to a cloud function or similar handler
      // Simulated delay
      await new Promise(r => setTimeout(r, 2000));
      onSuccess();
      onClose();
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-sm">
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-white rounded-[32px] w-full max-w-lg p-10 shadow-2xl">
        <h3 className="text-2xl font-serif font-black text-slate-900 mb-2">Excel/CSV ачаалах</h3>
        <p className="text-slate-500 text-sm mb-8">Олон ажилтныг нэг доор бүртгэж, карт үүсгээрэй.</p>

        <div className="border-2 border-dashed border-slate-200 rounded-2xl p-10 text-center space-y-4 hover:border-aurora-blue transition-colors cursor-pointer relative group">
          <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto text-slate-400 group-hover:text-aurora-blue group-hover:bg-aurora-blue/5 transition-all">
            <Upload size={32} />
          </div>
          <p className="text-xs font-bold text-slate-400">Файлаа сонгох эсвэл энд чирч авчирна уу</p>
          {file && <p className="text-xs font-mono text-aurora-blue">{file.name}</p>}
          <input type="file" accept=".csv,.xlsx,.xls" onChange={handleFileChange} className="absolute inset-0 opacity-0 cursor-pointer" />
        </div>

        <div className="mt-8 flex gap-4">
          <button onClick={onClose} className="flex-1 py-4 bg-slate-100 rounded-2xl font-bold text-slate-600">Цуцлах</button>
          <button 
            onClick={handleImport}
            disabled={!file || loading}
            className="flex-1 btn-aurora text-white rounded-2xl font-bold disabled:opacity-50"
          >
            {loading ? "Уншиж байна..." : "Импортлох"}
          </button>
        </div>
      </motion.div>
    </div>
  );
}

function OrdersList({ company }: { company: any }) {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);
  const [employeeCount, setEmployeeCount] = useState(0);

  useEffect(() => {
    const fetchOrders = async () => {
      const q = query(collection(db, 'orders'), where('company_id', '==', company.id));
      const snap = await getDocs(q);
      setOrders(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      
      const empSnap = await getDocs(query(collection(db, 'profiles'), where('company_id', '==', company.id)));
      setEmployeeCount(empSnap.size);
      setLoading(false);
    };
    fetchOrders();
  }, [company.id]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-2xl font-serif font-black text-slate-900">Захиалгын түүх</h2>
          <p className="text-sm text-slate-500 mt-1">Байгууллагын NFC картын захиалгууд.</p>
        </div>
        <button onClick={() => setIsOrderModalOpen(true)} className="px-8 py-4 bg-slate-900 text-white rounded-2xl font-bold flex items-center gap-2 hover:bg-slate-800 transition-all shadow-xl shadow-black/10">
          <ShoppingCart className="w-5 h-5" /> Шинэ захиалга
        </button>
      </div>

      <div className="bg-white border border-slate-200 rounded-[32px] overflow-hidden shadow-sm">
        <table className="w-full text-left">
          <thead className="bg-slate-50/50 text-[10px] uppercase font-bold text-slate-400 tracking-widest border-b border-slate-100">
            <tr>
              <th className="px-8 py-5">Захиалга №</th>
              <th className="px-8 py-5">Тоо ширхэг</th>
              <th className="px-8 py-5">Хаяг</th>
              <th className="px-8 py-5">Төлөв</th>
              <th className="px-8 py-5">Огноо</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {loading ? (
              <tr><td colSpan={5} className="py-20 text-center"><LoadingAnimation /></td></tr>
            ) : orders.length === 0 ? (
              <tr><td colSpan={5} className="py-20 text-center text-slate-400 italic">Захиалга байхгүй байна.</td></tr>
            ) : orders.map(ord => (
              <tr key={ord.id} className="hover:bg-slate-50/50 transition-colors">
                <td className="px-8 py-5 font-mono text-xs text-slate-400">{ord.id.slice(0, 8)}</td>
                <td className="px-8 py-5 font-bold text-slate-900">{ord.quantity} ширхэг</td>
                <td className="px-8 py-5 text-xs text-slate-500">{ord.address}</td>
                <td className="px-8 py-5">
                  <span className="px-2.5 py-1 rounded-full bg-blue-50 text-blue-600 text-[9px] font-black uppercase tracking-tighter">{ord.status}</span>
                </td>
                <td className="px-8 py-5 text-xs text-slate-400">
                  {ord.created_at ? new Date(ord.created_at).toLocaleDateString() : '---'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <B2BOrderModal 
        isOpen={isOrderModalOpen} 
        onClose={() => setIsOrderModalOpen(false)} 
        company={company} 
        employeeCount={employeeCount}
        onSuccess={() => {}} 
      />
    </div>
  );
}

function B2BOrderModal({ isOpen, onClose, company, employeeCount, onSuccess }: any) {
  const [formData, setFormData] = useState({ quantity: employeeCount || 1, address: '', phone: '' });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (employeeCount) setFormData(p => ({ ...p, quantity: employeeCount }));
  }, [employeeCount]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await addDoc(collection(db, 'orders'), {
        company_id: company.id,
        user_id: company.admin_uid,
        type: 'B2B',
        quantity: parseInt(formData.quantity),
        address: formData.address,
        contact_phone: formData.phone,
        status: 'pending',
        created_at: new Date().toISOString()
      });
      onSuccess?.();
      onClose();
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-sm">
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-white rounded-[32px] w-full max-w-lg p-10 shadow-2xl">
        <h3 className="text-2xl font-serif font-black text-slate-900 mb-2">B2B Захиалга</h3>
        <p className="text-slate-500 text-sm mb-8">Байгууллагын ажилчиддаа зориулан NFC карт захиалах.</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-[10px] uppercase tracking-widest text-slate-400 font-bold">Тоо ширхэг</label>
            <input 
              type="number" 
              value={formData.quantity}
              onChange={e => setFormData(p => ({ ...p, quantity: parseInt(e.target.value) }))}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 outline-none transition-all text-sm" 
            />
            <p className="text-[10px] text-slate-400">Нийт {employeeCount} ажилтан бүртгэлтэй байна.</p>
          </div>
          <div className="space-y-1.5">
            <label className="text-[10px] uppercase tracking-widest text-slate-400 font-bold">Хүргэлтийн хаяг</label>
            <input 
              type="text" 
              required
              value={formData.address}
              onChange={e => setFormData(p => ({ ...p, address: e.target.value }))}
              placeholder="Жишээ: СБД, 1-р хороо..."
              className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 outline-none transition-all text-sm" 
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-[10px] uppercase tracking-widest text-slate-400 font-bold">Холбоо барих утас</label>
            <input 
              type="tel" 
              required
              value={formData.phone}
              onChange={e => setFormData(p => ({ ...p, phone: e.target.value }))}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 outline-none transition-all text-sm" 
            />
          </div>

          <div className="flex gap-4 pt-6">
            <button onClick={onClose} type="button" className="flex-1 py-4 bg-slate-100 rounded-2xl font-bold text-slate-600">Цуцлах</button>
            <button type="submit" disabled={loading} className="flex-1 bg-slate-900 text-white rounded-2xl font-bold shadow-lg shadow-black/10">
              {loading ? "Илгээж байна..." : "Захиалах"}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}

function SettingsView({ company }: { company: any }) {
  const [formData, setFormData] = useState({ name: company.name, brand_color: company.brand_color });
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(company.logo_url);
  const [loading, setLoading] = useState(false);

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setLogoFile(file);
      setLogoPreview(URL.createObjectURL(file));
    }
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      let logoUrl = company.logo_url;
      if (logoFile) {
        const logoRef = ref(storage, `companies/${company.id}/logo_${Date.now()}`);
        await uploadBytes(logoRef, logoFile);
        logoUrl = await getDownloadURL(logoRef);
      }

      await updateDoc(doc(db, 'companies', company.id), {
        name: formData.name,
        brand_color: formData.brand_color,
        logo_url: logoUrl
      });
      alert('Амжилттай шинэчлэгдлээ.');
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl space-y-8">
      <div>
        <h2 className="text-2xl font-serif font-black text-slate-900">Байгууллагын тохиргоо</h2>
        <p className="text-sm text-slate-500 mt-1">Профайл мэдээлэл болон брэндинг тохируулах.</p>
      </div>

      <div className="bg-white border border-slate-200 rounded-[32px] p-10 space-y-8 shadow-sm">
        <div className="flex items-center gap-8">
          <div className="relative group">
            <div className="w-24 h-24 rounded-[32px] bg-slate-50 border-2 border-dashed border-slate-200 flex items-center justify-center overflow-hidden group-hover:border-aurora-blue transition-all">
              {logoPreview ? (
                <img src={logoPreview} className="w-full h-full object-cover" />
              ) : (
                <Building2 className="w-8 h-8 text-slate-300" />
              )}
            </div>
            <input type="file" accept="image/*" onChange={handleLogoChange} className="absolute inset-0 opacity-0 cursor-pointer" />
            <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-white border border-slate-200 rounded-lg flex items-center justify-center shadow-sm text-slate-400 group-hover:text-aurora-blue transition-colors">
              <Camera size={14} />
            </div>
          </div>
          <div className="space-y-1">
            <p className="text-sm font-bold text-slate-900">Байгууллагын лого</p>
            <p className="text-xs text-slate-400">Лого соливол бүх ажилчдын картанд шинэчлэгдэнэ.</p>
          </div>
        </div>

        <div className="space-y-6">
          <div className="space-y-1.5">
            <label className="text-[10px] uppercase tracking-widest text-slate-400 font-bold">Нэр</label>
            <input 
              type="text" 
              value={formData.name}
              onChange={e => setFormData(p => ({ ...p, name: e.target.value }))}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 outline-none focus:border-aurora-blue transition-all text-sm" 
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-[10px] uppercase tracking-widest text-slate-400 font-bold">Брэнд өнгө</label>
            <div className="flex items-center gap-4">
              <input 
                type="color" 
                value={formData.brand_color}
                onChange={e => setFormData(p => ({ ...p, brand_color: e.target.value }))}
                className="w-12 h-12 rounded-xl border-none cursor-pointer p-0"
              />
              <span className="text-xs font-mono text-slate-500 uppercase">{formData.brand_color}</span>
            </div>
          </div>
        </div>

        <div className="pt-4">
          <button 
            onClick={handleSave} 
            disabled={loading}
            className="btn-aurora text-white px-10 py-4 rounded-2xl font-bold shadow-lg shadow-aurora-blue/10 disabled:opacity-50"
          >
            {loading ? "Хадгалж байна..." : "Өөрчлөлтийг хадгалах"}
          </button>
        </div>
      </div>
    </div>
  );
}

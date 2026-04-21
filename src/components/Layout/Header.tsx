import React, { useState } from 'react';
import { Bell, LogOut, User, Settings, ChevronDown } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { getImageUrl } from '../../services/api';

export const Header: React.FC = () => {
  const { profile, signOut } = useAuth();
  const [showDropdown, setShowDropdown] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  const notifications = [
    { id: 1, text: 'New purchase order waiting approval', time: '5m ago', unread: true },
    { id: 2, text: 'Construction progress updated', time: '1h ago', unread: true },
    { id: 3, text: 'Payroll processed for March', time: '2h ago', unread: false },
  ];

  const unreadCount = notifications.filter(n => n.unread).length;

  return (
    <header className="h-20 bg-white/70 border-b border-white/20 flex items-center justify-between px-4 sticky top-0 z-[60] backdrop-blur-xl">
      <div className="flex items-center gap-4">
        <div className="bg-white p-2 rounded-xl shadow-sm border border-gray-100">
           <img src="/logo-wahdah.png" alt="Logo" className="w-8 h-8 object-contain" />
        </div>
        <div>
          <h2 className="text-lg font-black text-[#1A4D43] tracking-tight">
            Selamat Datang, {profile?.full_name?.split(' ')[0]}
          </h2>
          <p className="text-[10px] uppercase font-black text-[#2BBF9D] tracking-[0.2em]">{profile?.role}</p>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative p-2.5 hover:bg-gray-50 rounded-lg transition-all active:scale-95 group"
          >
            <Bell className="w-5 h-5 text-gray-400 group-hover:text-[#2BBF9D] transition-colors" />
            {unreadCount > 0 && (
              <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-[#2BBF9D] rounded-full ring-2 ring-white"></span>
            )}
          </button>

          {showNotifications && (
            <>
              <div
                className="fixed inset-0 z-[70]"
                onClick={() => setShowNotifications(false)}
              ></div>
              <div className="absolute right-0 mt-4 w-80 bg-white rounded-xl shadow-2xl border border-gray-50 z-[80] overflow-hidden animate-in fade-in zoom-in duration-200">
                <div className="p-5 border-b border-gray-50 bg-[#F8FAF9]">
                  <h3 className="font-bold text-[#1A4D43]">Notifikasi</h3>
                </div>
                <div className="max-h-[400px] overflow-y-auto">
                  {notifications.map((notif) => (
                    <div
                      key={notif.id}
                      className={`p-5 border-b border-gray-50 hover:bg-gray-50 cursor-pointer transition-colors ${
                        notif.unread ? 'bg-[#E2F8F3]/30' : ''
                      }`}
                    >
                      <p className="text-sm text-gray-700 font-medium leading-relaxed">{notif.text}</p>
                      <p className="text-[10px] text-gray-400 font-bold mt-2 uppercase tracking-tighter">{notif.time}</p>
                    </div>
                  ))}
                </div>
                <div className="p-4 text-center bg-[#F8FAF9]">
                  <button className="text-xs text-[#2BBF9D] hover:text-[#1A4D43] font-black uppercase tracking-widest">
                    Lihat Semua
                  </button>
                </div>
              </div>
            </>
          )}
        </div>

        <div className="relative">
          <button
            onClick={() => setShowDropdown(!showDropdown)}
            className="flex items-center gap-3 p-1.5 hover:bg-gray-50 rounded-xl transition-all active:scale-95 group"
          >
            <div className="w-9 h-9 bg-gradient-to-br from-[#1A4D43] to-[#2BBF9D] rounded-lg flex items-center justify-center shadow-lg shadow-[#2BBF9D]/20 overflow-hidden">
              {profile?.avatar_url ? (
                <img src={getImageUrl(profile.avatar_url)} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                <User className="w-5 h-5 text-white" />
              )}
            </div>
            <ChevronDown className="w-4 h-4 text-gray-400 group-hover:text-[#1A4D43] transition-colors" />
          </button>

          {showDropdown && (
            <>
              <div
                className="fixed inset-0 z-[70]"
                onClick={() => setShowDropdown(false)}
              ></div>
              <div className="absolute right-0 mt-4 w-72 bg-white rounded-xl shadow-2xl border border-gray-50 z-[80] overflow-hidden animate-in fade-in zoom-in duration-200">
                <div className="p-4 border-b border-gray-50 bg-[#F8FAF9]">
                  <p className="font-bold text-[#1A4D43] text-base leading-tight">{profile?.full_name}</p>
                  <p className="text-xs text-gray-400 font-medium mb-3">{profile?.email}</p>
                  <span className="px-3 py-1 bg-[#E2F8F3] text-[#2BBF9D] text-[10px] font-black uppercase tracking-widest rounded-full shadow-sm">
                    {profile?.role}
                  </span>
                </div>
                <div className="p-3">
                  <button className="w-full flex items-center gap-3 px-4 py-3 text-gray-600 hover:bg-gray-50 hover:text-[#1A4D43] rounded-lg transition-all group">
                    <div className="p-2 bg-gray-50 rounded-lg group-hover:bg-white transition-colors">
                      <User className="w-4 h-4" />
                    </div>
                    <span className="text-sm font-bold">Profil Saya</span>
                  </button>
                  <button className="w-full flex items-center gap-3 px-4 py-3 text-gray-600 hover:bg-gray-50 hover:text-[#1A4D43] rounded-lg transition-all group">
                    <div className="p-2 bg-gray-50 rounded-lg group-hover:bg-white transition-colors">
                      <Settings className="w-4 h-4" />
                    </div>
                    <span className="text-sm font-bold">Pengaturan</span>
                  </button>
                </div>
                <div className="p-3 border-t border-gray-50 bg-[#F8FAF9]">
                  <button
                    onClick={() => signOut()}
                    className="w-full flex items-center gap-3 px-4 py-3 text-red-500 hover:bg-red-50 rounded-lg transition-all group"
                  >
                    <div className="p-2 bg-red-50 rounded-lg group-hover:bg-white transition-colors">
                      <LogOut className="w-4 h-4" />
                    </div>
                    <span className="text-sm font-black uppercase tracking-widest">Keluar</span>
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
};

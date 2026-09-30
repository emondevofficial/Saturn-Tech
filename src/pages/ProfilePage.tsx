import React, { useState } from 'react';
import {
  User as UserIcon,
  MapPin,
  Phone,
  Mail,
  Plus,
  Trash2,
  CheckCircle2,
  Package,
  Heart,
  Save,
  ShieldCheck,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { Address } from '../types';

interface ProfilePageProps {
  onNavigate: (path: string) => void;
}

export const ProfilePage: React.FC<ProfilePageProps> = ({ onNavigate }) => {
  const { user, token, updateUser, logout } = useAuth();
  const { success, error } = useToast();

  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [isSavingProfile, setIsSavingProfile] = useState(false);

  // Add Address Modal/Form State
  const [showAddAddress, setShowAddAddress] = useState(false);
  const [addrTitle, setAddrTitle] = useState('Home');
  const [addrFullName, setAddrFullName] = useState(user?.name || '');
  const [addrPhone, setAddrPhone] = useState(user?.phone || '');
  const [addrDivision, setAddrDivision] = useState('Chattogram');
  const [addrDistrict, setAddrDistrict] = useState('Chattogram');
  const [addrArea, setAddrArea] = useState('GEC Circle');
  const [addrStreet, setAddrStreet] = useState('');
  const [addrPostal, setAddrPostal] = useState('4000');

  if (!user) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center space-y-4">
        <h2 className="text-xl font-bold text-slate-900">Sign In Required</h2>
        <p className="text-xs text-slate-500">
          Please log in to manage your customer account, delivery addresses, and orders.
        </p>
        <button
          onClick={() => onNavigate('/login')}
          className="px-5 py-2.5 bg-blue-600 text-white text-xs font-semibold rounded-xl"
        >
          Sign In
        </button>
      </div>
    );
  }

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingProfile(true);

    try {
      const res = await fetch('/api/auth/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ name, phone }),
      });
      const data = await res.json();
      if (data.success && data.data) {
        updateUser(data.data);
        success('Profile updated successfully.');
      } else {
        error(data.message || 'Failed to update profile');
      }
    } catch {
      error('Network error updating profile');
    } finally {
      setIsSavingProfile(false);
    }
  };

  const handleAddAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!addrStreet.trim()) {
      error('Please provide a street address');
      return;
    }

    const newAddress: Address = {
      id: `addr-${Date.now()}`,
      title: addrTitle,
      fullName: addrFullName,
      phone: addrPhone,
      division: addrDivision,
      district: addrDistrict,
      area: addrArea,
      address: addrStreet.trim(),
      postalCode: addrPostal,
      isDefault: (user.addresses || []).length === 0,
    };

    const updatedAddresses = [...(user.addresses || []), newAddress];

    try {
      const res = await fetch('/api/auth/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ addresses: updatedAddresses }),
      });
      const data = await res.json();
      if (data.success && data.data) {
        updateUser(data.data);
        success('Delivery address added.');
        setShowAddAddress(false);
        setAddrStreet('');
      }
    } catch {
      error('Failed to add address');
    }
  };

  const handleRemoveAddress = async (addressId: string) => {
    const updated = (user.addresses || []).filter((a) => a.id !== addressId);
    try {
      const res = await fetch('/api/auth/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ addresses: updated }),
      });
      const data = await res.json();
      if (data.success && data.data) {
        updateUser(data.data);
        success('Address removed.');
      }
    } catch {
      error('Failed to remove address');
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-8">
      {/* Top Header Card */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-600 to-slate-900 text-white flex items-center justify-center text-xl font-bold uppercase shadow-sm">
            {user.name.charAt(0)}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900">{user.name}</h1>
              <span className="text-[10px] font-bold uppercase bg-blue-50 text-blue-700 px-2 py-0.5 rounded">
                {user.role}
              </span>
            </div>
            <div className="text-xs text-slate-500 mt-1 flex flex-wrap items-center gap-3">
              <span>{user.email}</span>
              <span>·</span>
              <span>{user.phone}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => onNavigate('/orders')}
            className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold flex items-center gap-1.5 transition-colors"
          >
            <Package className="w-4 h-4" /> My Orders
          </button>
          <button
            onClick={() => onNavigate('/wishlist')}
            className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold flex items-center gap-1.5 transition-colors"
          >
            <Heart className="w-4 h-4" /> Wishlist
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left: Edit Basic Profile (5 cols) */}
        <div className="lg:col-span-5 bg-white border border-slate-200 rounded-3xl p-6 shadow-xs space-y-4">
          <h2 className="text-sm font-bold text-slate-900 pb-2 border-b border-slate-100">
            Account Information
          </h2>

          <form onSubmit={handleUpdateProfile} className="space-y-3.5 text-xs">
            <div className="space-y-1">
              <label className="font-semibold text-slate-700">Full Name</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-xl"
              />
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-slate-700">Primary Contact Phone</label>
              <input
                type="tel"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-xl tabular-nums"
              />
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-slate-700">Registered Email Address</label>
              <input
                type="email"
                disabled
                value={user.email}
                className="w-full px-3 py-2 border border-slate-200 bg-slate-50 text-slate-500 rounded-xl cursor-not-allowed"
              />
            </div>

            <button
              type="submit"
              disabled={isSavingProfile}
              className="w-full py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs flex items-center justify-center gap-1.5 transition-colors"
            >
              <Save className="w-4 h-4" />
              {isSavingProfile ? 'Saving...' : 'Save Profile Changes'}
            </button>
          </form>
        </div>

        {/* Right: Saved Delivery Addresses (7 cols) */}
        <div className="lg:col-span-7 bg-white border border-slate-200 rounded-3xl p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <div>
              <h2 className="text-sm font-bold text-slate-900">Saved Delivery Addresses</h2>
              <p className="text-[11px] text-slate-500">
                Manage multiple shipment addresses for faster checkout
              </p>
            </div>
            <button
              onClick={() => setShowAddAddress(!showAddAddress)}
              className="px-3 py-1.5 text-xs font-semibold text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-xl flex items-center gap-1 transition-colors"
            >
              <Plus className="w-3.5 h-3.5" /> Add Address
            </button>
          </div>

          {/* Add Address Form Toggle */}
          {showAddAddress && (
            <form
              onSubmit={handleAddAddress}
              className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3 text-xs animate-in fade-in"
            >
              <div className="font-bold text-slate-900">New Address Information</div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <input
                  type="text"
                  placeholder="Address Title (e.g. Home, Office, Lab)"
                  value={addrTitle}
                  onChange={(e) => setAddrTitle(e.target.value)}
                  className="px-3 py-2 border border-slate-300 rounded-xl bg-white"
                />
                <input
                  type="text"
                  placeholder="Contact Person Full Name"
                  required
                  value={addrFullName}
                  onChange={(e) => setAddrFullName(e.target.value)}
                  className="px-3 py-2 border border-slate-300 rounded-xl bg-white"
                />
                <input
                  type="tel"
                  placeholder="Delivery Phone Number"
                  required
                  value={addrPhone}
                  onChange={(e) => setAddrPhone(e.target.value)}
                  className="px-3 py-2 border border-slate-300 rounded-xl bg-white tabular-nums"
                />
                <select
                  value={addrDivision}
                  onChange={(e) => setAddrDivision(e.target.value)}
                  className="px-3 py-2 border border-slate-300 rounded-xl bg-white"
                >
                  <option value="Chattogram">Chattogram</option>
                  <option value="Dhaka">Dhaka</option>
                  <option value="Rajshahi">Rajshahi</option>
                  <option value="Khulna">Khulna</option>
                  <option value="Sylhet">Sylhet</option>
                  <option value="Barishal">Barishal</option>
                </select>
                <input
                  type="text"
                  placeholder="District / City"
                  required
                  value={addrDistrict}
                  onChange={(e) => setAddrDistrict(e.target.value)}
                  className="px-3 py-2 border border-slate-300 rounded-xl bg-white"
                />
                <input
                  type="text"
                  placeholder="Area / Thana"
                  required
                  value={addrArea}
                  onChange={(e) => setAddrArea(e.target.value)}
                  className="px-3 py-2 border border-slate-300 rounded-xl bg-white"
                />
                <div className="sm:col-span-2">
                  <textarea
                    rows={2}
                    placeholder="Full Street Address (House, Road, Floor)"
                    required
                    value={addrStreet}
                    onChange={(e) => setAddrStreet(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl bg-white"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setShowAddAddress(false)}
                  className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-200 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg"
                >
                  Save Address
                </button>
              </div>
            </form>
          )}

          {/* List of saved addresses */}
          {(!user.addresses || user.addresses.length === 0) ? (
            <div className="p-8 text-center text-xs text-slate-500 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
              No addresses saved yet. Click "Add Address" to register your home or office location.
            </div>
          ) : (
            <div className="space-y-3">
              {user.addresses.map((addr) => (
                <div
                  key={addr.id}
                  className="p-4 rounded-2xl border border-slate-200 bg-white flex items-start justify-between gap-3 text-xs"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900">{addr.title || 'Address'}</span>
                      {addr.isDefault && (
                        <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                          Default Address
                        </span>
                      )}
                    </div>
                    <div className="text-slate-800 font-semibold">{addr.fullName} · {addr.phone}</div>
                    <p className="text-slate-600">{addr.address}</p>
                    <p className="text-slate-500 text-[11px]">
                      {addr.area}, {addr.district}, {addr.division} - {addr.postalCode}
                    </p>
                  </div>

                  <button
                    onClick={() => handleRemoveAddress(addr.id)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-50 transition-colors"
                    title="Delete address"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

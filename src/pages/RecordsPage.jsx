import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  User,
  Users,
  Home,
  ShieldCheck,
  Calendar,
  MapPin,
  FileText,
  Scale,
  Building,
  CheckCircle2,
  Edit3,
  UserPlus,
  Plus
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { mockDataService } from '../services/mockDataService';
import { CitizenHeader } from '../components/layout/CitizenHeader';
import { TopGovBar } from '../components/layout/TopGovBar';
import { Footer } from '../components/layout/Footer';
import { PageHeader } from '../components/common/PageHeader';
import { Modal } from '../components/common/Modal';

export const RecordsPage = () => {
  const { user, updateProfile } = useAuth();
  const [household, setHousehold] = useState(mockDataService.getHouseholdData());
  const [selectedMemberModal, setSelectedMemberModal] = useState(null);
  const [isAddMemberOpen, setIsAddMemberOpen] = useState(false);
  const [isAddDwellingOpen, setIsAddDwellingOpen] = useState(false);
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileFeedback, setProfileFeedback] = useState({ type: '', message: '' });

  // Profile Form State
  const [profileForm, setProfileForm] = useState({
    fullName: user?.fullName || '',
    fatherName: user?.fatherName || user?.address?.fatherName || '',
    motherName: user?.motherName || user?.address?.motherName || '',
    caste: user?.caste || user?.address?.caste || '',
    casteOther: user?.casteOther || user?.address?.casteOther || '',
    fullAddress: user?.fullAddress || user?.address?.fullAddress || user?.address?.addressLine1 || '',
    gender: user?.gender || 'Not Specified',
    occupation: user?.occupation || 'Citizen'
  });

  useEffect(() => {
    if (user) {
      setProfileForm({
        fullName: user.fullName || '',
        fatherName: user.fatherName || user.address?.fatherName || '',
        motherName: user.motherName || user.address?.motherName || '',
        caste: user.caste || user.address?.caste || '',
        casteOther: user.casteOther || user.address?.casteOther || '',
        fullAddress: user.fullAddress || user.address?.fullAddress || user.address?.addressLine1 || '',
        gender: user.gender || 'Not Specified',
        occupation: user.occupation || 'Citizen'
      });
    }
    setHousehold(mockDataService.getHouseholdData());
  }, [user]);

  const handleUpdateProfileSubmit = async (e) => {
    e.preventDefault();
    setProfileFeedback({ type: '', message: '' });
    setProfileSaving(true);
    try {
      const res = await updateProfile(profileForm);
      if (res.success) {
        setProfileFeedback({ type: 'success', message: 'Profile and family details updated successfully in Supabase!' });
        setTimeout(() => {
          setIsEditProfileOpen(false);
          setProfileFeedback({ type: '', message: '' });
        }, 1200);
      } else {
        setProfileFeedback({ type: 'error', message: res.error || 'Failed to update profile.' });
      }
    } catch (err) {
      setProfileFeedback({ type: 'error', message: 'An unexpected error occurred while saving.' });
    } finally {
      setProfileSaving(false);
    }
  };

  const handleAddMemberSubmit = (e) => {
    e.preventDefault();
    if (!newMember.fullName.trim()) return;
    const updated = mockDataService.addHouseholdMember(newMember);
    setHousehold(updated);
    setIsAddMemberOpen(false);
    setNewMember({
      fullName: '',
      relation: 'Spouse',
      age: '30',
      gender: 'Female',
      occupation: 'Homemaker'
    });
  };

  const handleAddDwellingSubmit = (e) => {
    e.preventDefault();
    if (!newDwelling.address.trim()) return;
    const updated = mockDataService.addHouseholdDwelling(newDwelling);
    setHousehold(updated);
    setIsAddDwellingOpen(false);
    setNewDwelling({
      type: 'Primary Domestic Residence',
      address: '',
      electricityMeterNo: '',
      waterConnectionNo: ''
    });
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#F4F6F9]">
      <TopGovBar />
      <CitizenHeader />

      <PageHeader
        title="My Profile & Family Records"
        subtitle="View consolidated demographic, household composition and dwelling linkages synchronized with civil registries."
        breadcrumbs={[{ label: 'My Records' }]}
        actions={
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsAddMemberOpen(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold transition-colors shadow-xs"
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>+ Add Family Member</span>
            </button>
            <Link
              to="/corrections"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-white border border-gov-border hover:bg-slate-50 text-xs font-semibold text-gov-blue transition-colors shadow-xs"
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>Request Correction</span>
            </Link>
          </div>
        }
      />

      <main id="main-content" className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 pb-12 space-y-8">

        {/* Top 2 Columns: Individual Profile & Primary Household Metadata */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          {/* Individual Citizen Card (5 cols) */}
          <div className="lg:col-span-5 bg-white rounded-xl border border-gov-border shadow-xs overflow-hidden h-full flex flex-col justify-between">
            <div className="bg-slate-100/80 px-6 py-4 border-b border-gov-border flex items-center justify-between min-h-[72px]">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-gov-blue text-white flex items-center justify-center font-bold text-xs">
                  <User className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-primary-navy">Individual Citizen Record</h3>
                  <span className="text-[11px] font-mono text-gov-muted">Citizen ID: {user?.citizenId || 'CIT-NEW'}</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsEditProfileOpen(true)}
                  className="px-2.5 py-1 rounded-md bg-white border border-gov-border hover:bg-slate-50 text-[11px] font-bold text-gov-blue flex items-center gap-1 shadow-2xs cursor-pointer"
                  title="Update personal and family records"
                >
                  <Edit3 className="w-3 h-3" />
                  <span>Edit Details</span>
                </button>
                <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  Verified
                </span>
              </div>
            </div>

            <div className="p-6 text-xs flex-1 flex flex-col justify-between space-y-4">
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-3 pb-3 border-b border-slate-100">
                  <div>
                    <span className="text-gov-muted block text-[11px]">Full Legal Name</span>
                    <span className="font-bold text-gov-text text-sm">{user?.fullName || 'Citizen User'}</span>
                  </div>
                  <div>
                    <span className="text-gov-muted block text-[11px]">Role in Household</span>
                    <span className="font-semibold text-gov-text">Head of Household</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 pb-3 border-b border-slate-100">
                  <div>
                    <span className="text-gov-muted block text-[11px]">Father's Name</span>
                    <span className="font-medium text-gov-text">{user?.fatherName || user?.address?.fatherName || 'Not Declared'}</span>
                  </div>
                  <div>
                    <span className="text-gov-muted block text-[11px]">Mother's Name</span>
                    <span className="font-medium text-gov-text">{user?.motherName || user?.address?.motherName || 'Not Declared'}</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 pb-3 border-b border-slate-100">
                  <div>
                    <span className="text-gov-muted block text-[11px]">Caste / Social Category</span>
                    <span className="font-medium text-gov-text">
                      {(user?.caste || user?.address?.caste)
                        ? `${user?.caste || user?.address?.caste}${user?.casteOther ? ` (${user.casteOther})` : ''}`
                        : 'Not Specified'}
                    </span>
                  </div>
                  <div>
                    <span className="text-gov-muted block text-[11px]">Gender</span>
                    <span className="font-medium text-gov-text">{user?.gender || 'Not Specified'}</span>
                  </div>
                </div>

                <div className="pb-3 border-b border-slate-100">
                  <span className="text-gov-muted block text-[11px]">Full Residential Address</span>
                  <span className="font-medium text-gov-text block mt-0.5 leading-relaxed">
                    {user?.fullAddress || user?.address?.fullAddress || user?.address?.addressLine1 || 'Not Specified'}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3 pb-3 border-b border-slate-100">
                  <div>
                    <span className="text-gov-muted block text-[11px]">Registered Mobile</span>
                    <span className="font-mono text-gov-text font-medium">{user?.mobile || 'N/A'}</span>
                  </div>
                  <div>
                    <span className="text-gov-muted block text-[11px]">Registered Email</span>
                    <span className="font-mono text-gov-text font-medium truncate block">{user?.email || 'N/A'}</span>
                  </div>
                </div>
              </div>

              <div className="pt-1 bg-slate-50 p-3 rounded-lg border border-slate-200 text-[11px] text-gov-muted space-y-1">
                <div>
                  <strong>Registry Origin:</strong> Citizen Self-Registration
                </div>
                <div>
                  <strong>Digital Synchronization Date:</strong> {new Date().toLocaleDateString('en-GB')}
                </div>
              </div>
            </div>
          </div>

          {/* Household-Level Registry Card (7 cols) */}
          <div className="lg:col-span-7 bg-white rounded-xl border border-gov-border shadow-xs overflow-hidden h-full flex flex-col justify-between">
            <div className="bg-[#123B66] text-white px-6 py-4 flex items-center justify-between min-h-[72px]">
              <div>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-amber-400 text-slate-900">
                  Household Unit Record
                </span>
                <h3 className="text-base font-bold text-white mt-1">
                  Household ID: {household?.householdId || user?.householdId}
                </h3>
              </div>
              <div className="text-right text-xs">
                <span className="text-emerald-300 font-semibold">{household?.currentStatus || 'Active'}</span>
                <p className="text-[11px] text-slate-300">Registered: {household?.registrationDate}</p>
              </div>
            </div>

            <div className="p-6 text-xs flex-1 flex flex-col justify-between space-y-4">
              <div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pb-4 border-b border-slate-100">
                  <div>
                    <span className="text-gov-muted block text-[11px]">Household Head</span>
                    <span className="font-bold text-gov-text">{household?.headOfHousehold || user?.fullName}</span>
                  </div>
                  <div>
                    <span className="text-gov-muted block text-[11px]">Income Category</span>
                    <span className="font-semibold text-gov-text">{household?.incomeCategory || 'Standard'}</span>
                  </div>
                  <div>
                    <span className="text-gov-muted block text-[11px]">Annual Family Income</span>
                    <span className="font-bold text-emerald-800">{household?.annualHouseholdIncome || 'Self-Declared'}</span>
                  </div>
                </div>

                {/* Physical Dwellings Linked */}
                <div className="mt-4">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-gov-muted flex items-center gap-1.5">
                      <Home className="w-3.5 h-3.5 text-gov-blue" />
                      <span>Physical Dwelling & Property Linkages</span>
                    </h4>
                    <button
                      onClick={() => setIsAddDwellingOpen(true)}
                      className="text-[11px] text-gov-blue hover:underline font-bold"
                    >
                      + Add Dwelling Address
                    </button>
                  </div>

                  <div className="space-y-2.5">
                    {household?.dwellings && household.dwellings.length > 0 ? (
                      household.dwellings.map((dwl) => (
                        <div key={dwl.dwellingId} className="bg-slate-50 p-3.5 rounded-lg border border-gov-border">
                          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 mb-1">
                            <span className="font-bold text-primary-navy text-xs">
                              {dwl.type}
                            </span>
                            <span className="font-mono text-[11px] text-gov-muted bg-white px-2 py-0.5 rounded border border-slate-200">
                              Ref: {dwl.dwellingId}
                            </span>
                          </div>
                          <p className="text-gov-text text-xs leading-relaxed mb-2">
                            {dwl.address}
                          </p>
                          <div className="flex flex-wrap gap-x-4 gap-y-1 text-[11px] text-gov-muted font-mono">
                            <span>Electricity Meter: <strong className="text-slate-800">{dwl.electricityMeterNo}</strong></span>
                            <span>Water Meter: <strong className="text-slate-800">{dwl.waterConnectionNo}</strong></span>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="p-3 bg-slate-50 rounded-lg border border-dashed border-gov-border text-center text-gov-muted">
                        No additional dwellings linked. Click "+ Add Dwelling Address" to link a residential property.
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Section: Linked Family Relationships & Dependents */}
        <div className="bg-white rounded-xl border border-gov-border shadow-xs overflow-hidden">
          <div className="px-6 py-4 bg-slate-50 border-b border-gov-border flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <div>
              <h3 className="text-base font-bold text-primary-navy flex items-center gap-2">
                <Users className="w-5 h-5 text-gov-blue" />
                <span>Linked Family Members & Dependents</span>
              </h3>
              <p className="text-xs text-gov-muted">
                Official composition of co-habiting family members under {household?.householdId || user?.householdId}.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-xs font-bold text-gov-blue bg-blue-50 px-3 py-1 rounded-full border border-blue-200">
                {household?.members?.length || 1} Member{(household?.members?.length || 1) !== 1 ? 's' : ''}
              </span>
              <button
                onClick={() => setIsAddMemberOpen(true)}
                className="px-3 py-1 rounded-md bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold transition-colors shadow-xs"
              >
                + Add Member
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50/50 border-b border-gov-border text-gov-muted uppercase text-[11px] font-bold tracking-wider">
                  <th className="py-3 px-4">Member Name</th>
                  <th className="py-3 px-4">Relationship</th>
                  <th className="py-3 px-4">Citizen ID</th>
                  <th className="py-3 px-4">Age / Gender</th>
                  <th className="py-3 px-4">Member Since</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {household?.members?.map((member) => (
                  <tr key={member.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3.5 px-4 font-bold text-primary-navy">
                      <div className="flex items-center gap-2">
                        <span>{member.fullName}</span>
                        {member.isHead && (
                          <span className="text-[10px] bg-blue-100 text-gov-blue px-1.5 py-0.2 rounded font-bold">
                            Head
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-gov-text">
                      {member.relation}
                    </td>
                    <td className="py-3.5 px-4 font-mono text-gov-muted">
                      {member.citizenId}
                    </td>
                    <td className="py-3.5 px-4 text-gov-text">
                      {member.age} yrs • {member.gender}
                    </td>
                    <td className="py-3.5 px-4 text-gov-muted">
                      {member.memberSince}
                    </td>
                    <td className="py-3.5 px-4 text-gov-text font-medium">
                      {member.status}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => setSelectedMemberModal(member)}
                        className="px-2.5 py-1 rounded bg-slate-100 hover:bg-slate-200 text-gov-blue font-semibold text-xs transition-colors"
                      >
                        Inspect
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </main>

      {/* Member Details Modal */}
      <Modal
        isOpen={!!selectedMemberModal}
        onClose={() => setSelectedMemberModal(null)}
        title={`Member Profile: ${selectedMemberModal?.fullName}`}
        subtitle={`${selectedMemberModal?.relation} • Citizen ID: ${selectedMemberModal?.citizenId}`}
      >
        {selectedMemberModal && (
          <div className="space-y-4 text-xs">
            <div className="grid grid-cols-2 gap-4 bg-slate-50 p-4 rounded-lg border border-gov-border">
              <div>
                <span className="text-gov-muted block text-[11px]">Age & Gender</span>
                <span className="font-semibold text-gov-text">{selectedMemberModal.age} Years • {selectedMemberModal.gender}</span>
              </div>
              <div>
                <span className="text-gov-muted block text-[11px]">Education / Occupation</span>
                <span className="font-semibold text-gov-text">{selectedMemberModal.occupation} ({selectedMemberModal.education || 'Standard'})</span>
              </div>
              <div>
                <span className="text-gov-muted block text-[11px]">Member In Household Since</span>
                <span className="font-semibold text-gov-text">{selectedMemberModal.memberSince}</span>
              </div>
              <div>
                <span className="text-gov-muted block text-[11px]">Independent Welfare Allowed</span>
                <span className="font-bold text-emerald-700">Yes (Individual Schemes)</span>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setSelectedMemberModal(null)}
                className="px-4 py-2 rounded bg-slate-200 hover:bg-slate-300 text-gov-text font-semibold text-xs"
              >
                Close Record
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* Add Member Modal */}
      <Modal
        isOpen={isAddMemberOpen}
        onClose={() => setIsAddMemberOpen(false)}
        title="Add Family Member to Household"
        subtitle={`Enrolling under household ${household?.householdId || user?.householdId}`}
      >
        <form onSubmit={handleAddMemberSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block font-bold text-gov-text mb-1">Full Name *</label>
            <input
              type="text"
              required
              value={newMember.fullName}
              onChange={(e) => setNewMember({ ...newMember, fullName: e.target.value })}
              placeholder="e.g. Sunita Sharma"
              className="w-full p-2.5 bg-white border border-gov-border rounded-lg text-gov-text"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-gov-text mb-1">Relationship to Head *</label>
              <select
                value={newMember.relation}
                onChange={(e) => setNewMember({ ...newMember, relation: e.target.value })}
                className="w-full p-2.5 bg-white border border-gov-border rounded-lg text-gov-text"
              >
                <option value="Spouse">Spouse</option>
                <option value="Son">Son</option>
                <option value="Daughter">Daughter</option>
                <option value="Mother">Mother</option>
                <option value="Father">Father</option>
                <option value="Brother">Brother</option>
                <option value="Sister">Sister</option>
                <option value="Dependent Relative">Dependent Relative</option>
              </select>
            </div>

            <div>
              <label className="block font-bold text-gov-text mb-1">Age (Years) *</label>
              <input
                type="number"
                min="0"
                max="120"
                required
                value={newMember.age}
                onChange={(e) => setNewMember({ ...newMember, age: e.target.value })}
                className="w-full p-2.5 bg-white border border-gov-border rounded-lg text-gov-text"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-gov-text mb-1">Gender *</label>
              <select
                value={newMember.gender}
                onChange={(e) => setNewMember({ ...newMember, gender: e.target.value })}
                className="w-full p-2.5 bg-white border border-gov-border rounded-lg text-gov-text"
              >
                <option value="Female">Female</option>
                <option value="Male">Male</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div>
              <label className="block font-bold text-gov-text mb-1">Occupation</label>
              <input
                type="text"
                value={newMember.occupation}
                onChange={(e) => setNewMember({ ...newMember, occupation: e.target.value })}
                placeholder="e.g. Student, Homemaker"
                className="w-full p-2.5 bg-white border border-gov-border rounded-lg text-gov-text"
              />
            </div>
          </div>

          <div className="pt-2 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={() => setIsAddMemberOpen(false)}
              className="px-4 py-2 rounded bg-slate-100 hover:bg-slate-200 text-gov-text font-semibold text-xs"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs"
            >
              Save Member
            </button>
          </div>
        </form>
      </Modal>

      {/* Add Dwelling Modal */}
      <Modal
        isOpen={isAddDwellingOpen}
        onClose={() => setIsAddDwellingOpen(false)}
        title="Add Physical Dwelling / Residence"
        subtitle="Link residential meter or property reference"
      >
        <form onSubmit={handleAddDwellingSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block font-bold text-gov-text mb-1">Dwelling Classification *</label>
            <select
              value={newDwelling.type}
              onChange={(e) => setNewDwelling({ ...newDwelling, type: e.target.value })}
              className="w-full p-2.5 bg-white border border-gov-border rounded-lg text-gov-text"
            >
              <option value="Primary Domestic Residence">Primary Domestic Residence</option>
              <option value="Secondary Urban Flat">Secondary Urban Flat</option>
              <option value="Ancestral Village Homestead">Ancestral Village Homestead</option>
              <option value="Agricultural Farm Parcel">Agricultural Farm Parcel</option>
            </select>
          </div>

          <div>
            <label className="block font-bold text-gov-text mb-1">Complete Physical Address *</label>
            <textarea
              rows={2}
              required
              value={newDwelling.address}
              onChange={(e) => setNewDwelling({ ...newDwelling, address: e.target.value })}
              placeholder="e.g. Plot 14, Sector 12, Dwarka, New Delhi - 110075"
              className="w-full p-2.5 bg-white border border-gov-border rounded-lg text-gov-text"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-gov-text mb-1">Electricity Meter / Consumer No</label>
              <input
                type="text"
                value={newDwelling.electricityMeterNo}
                onChange={(e) => setNewDwelling({ ...newDwelling, electricityMeterNo: e.target.value })}
                placeholder="e.g. CA-9921048"
                className="w-full p-2.5 bg-white border border-gov-border rounded-lg text-gov-text"
              />
            </div>

            <div>
              <label className="block font-bold text-gov-text mb-1">Water Consumer Connection No</label>
              <input
                type="text"
                value={newDwelling.waterConnectionNo}
                onChange={(e) => setNewDwelling({ ...newDwelling, waterConnectionNo: e.target.value })}
                placeholder="e.g. WTR-00412"
                className="w-full p-2.5 bg-white border border-gov-border rounded-lg text-gov-text"
              />
            </div>
          </div>

          <div className="pt-2 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={() => setIsAddDwellingOpen(false)}
              className="px-4 py-2 rounded bg-slate-100 hover:bg-slate-200 text-gov-text font-semibold text-xs"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded bg-primary-navy hover:bg-gov-blue text-white font-bold text-xs"
            >
              Link Dwelling
            </button>
          </div>
        </form>
      </Modal>

      {/* Modal: Edit Citizen Profile & Family Details */}
      <Modal
        isOpen={isEditProfileOpen}
        onClose={() => {
          setIsEditProfileOpen(false);
          setProfileFeedback({ type: '', message: '' });
        }}
        title="Update Profile & Family Details"
      >
        <form onSubmit={handleUpdateProfileSubmit} className="space-y-4 text-xs">
          {profileFeedback.message && (
            <div
              className={`p-3 rounded-lg flex items-center gap-2 ${
                profileFeedback.type === 'success'
                  ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                  : 'bg-red-50 text-red-800 border border-red-200'
              }`}
            >
              {profileFeedback.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              ) : (
                <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
              )}
              <span>{profileFeedback.message}</span>
            </div>
          )}

          <div>
            <label className="block font-bold text-gov-text mb-1">Full Legal Name *</label>
            <input
              type="text"
              required
              value={profileForm.fullName}
              onChange={(e) => setProfileForm({ ...profileForm, fullName: e.target.value })}
              className="w-full p-2.5 bg-white border border-gov-border rounded-lg text-gov-text focus:outline-none focus:ring-2 focus:ring-gov-blue"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-gov-text mb-1">Father's Name</label>
              <input
                type="text"
                value={profileForm.fatherName}
                onChange={(e) => setProfileForm({ ...profileForm, fatherName: e.target.value })}
                placeholder="e.g. Shri Mohan Lal"
                className="w-full p-2.5 bg-white border border-gov-border rounded-lg text-gov-text focus:outline-none focus:ring-2 focus:ring-gov-blue"
              />
            </div>

            <div>
              <label className="block font-bold text-gov-text mb-1">Mother's Name</label>
              <input
                type="text"
                value={profileForm.motherName}
                onChange={(e) => setProfileForm({ ...profileForm, motherName: e.target.value })}
                placeholder="e.g. Smt. Shanti Devi"
                className="w-full p-2.5 bg-white border border-gov-border rounded-lg text-gov-text focus:outline-none focus:ring-2 focus:ring-gov-blue"
              />
            </div>
          </div>

          <div>
            <label className="block font-bold text-gov-text mb-1">Caste / Social Category</label>
            <select
              value={profileForm.caste}
              onChange={(e) => setProfileForm({ ...profileForm, caste: e.target.value })}
              className="w-full p-2.5 bg-white border border-gov-border rounded-lg text-gov-text focus:outline-none focus:ring-2 focus:ring-gov-blue"
            >
              <option value="">-- Select Caste Category (Do not assume) --</option>
              <option value="General">General / Unreserved (UR)</option>
              <option value="OBC">OBC (Other Backward Classes)</option>
              <option value="SC">SC (Scheduled Castes)</option>
              <option value="ST">ST (Scheduled Tribes)</option>
              <option value="EWS">EWS (Economically Weaker Section)</option>
              <option value="Other">Other (Please specify below)</option>
            </select>

            {profileForm.caste === 'Other' && (
              <div className="mt-2.5">
                <label className="block font-bold text-gov-text mb-1">Specify Caste / Community Name *</label>
                <input
                  type="text"
                  required={profileForm.caste === 'Other'}
                  value={profileForm.casteOther}
                  onChange={(e) => setProfileForm({ ...profileForm, casteOther: e.target.value })}
                  placeholder="Enter specific community / caste name"
                  className="w-full p-2.5 bg-white border border-gov-border rounded-lg text-gov-text focus:outline-none focus:ring-2 focus:ring-gov-blue"
                />
              </div>
            )}
          </div>

          <div>
            <label className="block font-bold text-gov-text mb-1">Full Residential Address *</label>
            <textarea
              rows={2}
              required
              value={profileForm.fullAddress}
              onChange={(e) => setProfileForm({ ...profileForm, fullAddress: e.target.value })}
              placeholder="e.g. House No. 42, Ward 3, Village Rampur, Tehsil Shamli, District Shamli, Uttar Pradesh - 247776"
              className="w-full p-2.5 bg-white border border-gov-border rounded-lg text-gov-text focus:outline-none focus:ring-2 focus:ring-gov-blue"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-gov-text mb-1">Gender</label>
              <select
                value={profileForm.gender}
                onChange={(e) => setProfileForm({ ...profileForm, gender: e.target.value })}
                className="w-full p-2.5 bg-white border border-gov-border rounded-lg text-gov-text focus:outline-none focus:ring-2 focus:ring-gov-blue"
              >
                <option value="Not Specified">Not Specified</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Transgender">Transgender</option>
              </select>
            </div>

            <div>
              <label className="block font-bold text-gov-text mb-1">Occupation / Trade</label>
              <input
                type="text"
                value={profileForm.occupation}
                onChange={(e) => setProfileForm({ ...profileForm, occupation: e.target.value })}
                placeholder="e.g. Farmer / Self-Employed"
                className="w-full p-2.5 bg-white border border-gov-border rounded-lg text-gov-text focus:outline-none focus:ring-2 focus:ring-gov-blue"
              />
            </div>
          </div>

          <div className="pt-2 flex items-center justify-end gap-2 border-t border-gov-border">
            <button
              type="button"
              disabled={profileSaving}
              onClick={() => {
                setIsEditProfileOpen(false);
                setProfileFeedback({ type: '', message: '' });
              }}
              className="px-4 py-2 rounded bg-slate-100 hover:bg-slate-200 text-gov-text font-semibold text-xs cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={profileSaving}
              className="px-5 py-2 rounded bg-primary-navy hover:bg-gov-blue text-white font-bold text-xs cursor-pointer disabled:opacity-50"
            >
              {profileSaving ? 'Saving to Supabase...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </Modal>

      <Footer />
    </div>
  );
};

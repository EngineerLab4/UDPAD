import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Bell,
  CheckCircle2,
  AlertTriangle,
  Info,
  Clock,
  ArrowRight,
  ShieldAlert,
  FileText,
  Scale,
  CheckCheck
} from 'lucide-react';
import { mockDataService } from '../services/mockDataService';
import { useAuth } from '../context/AuthContext';
import { CitizenHeader } from '../components/layout/CitizenHeader';
import { TopGovBar } from '../components/layout/TopGovBar';
import { Footer } from '../components/layout/Footer';
import { PageHeader } from '../components/common/PageHeader';
import { EmptyState } from '../components/common/EmptyState';

export const NotificationsPage = () => {
  const { refreshUnread } = useAuth();
  const [notifications, setNotifications] = useState(mockDataService.getNotifications());
  const [filterType, setFilterType] = useState('All');

  const handleMarkRead = (id) => {
    const updated = mockDataService.markNotificationRead(id);
    setNotifications(updated);
    refreshUnread();
  };

  const handleMarkAllRead = () => {
    const updated = mockDataService.markAllNotificationsRead();
    setNotifications(updated);
    refreshUnread();
  };

  const filtered = notifications.filter((n) => {
    if (filterType === 'Unread') return !n.read;
    if (filterType === 'Alerts') return n.category.includes('Alert') || n.category.includes('Verification');
    return true;
  });

  const getNotifIcon = (category) => {
    if (category.includes('Alert')) return AlertTriangle;
    if (category.includes('Approved')) return CheckCircle2;
    if (category.includes('Correction') || category.includes('Appeal')) return Scale;
    return Info;
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#F4F6F9]">
      <TopGovBar />
      <CitizenHeader />

      <PageHeader
        title="Citizen Notices & Updates"
        subtitle="Chronological feed of administrative notifications, inspection alerts and verification status changes."
        breadcrumbs={[{ label: 'Notifications' }]}
        actions={
          notifications.length > 0 ? (
            <button
              onClick={handleMarkAllRead}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-white border border-gov-border hover:bg-slate-50 text-xs font-semibold text-gov-blue transition-colors shadow-xs"
            >
              <CheckCheck className="w-4 h-4" />
              <span>Mark All as Read</span>
            </button>
          ) : null
        }
      />

      <main id="main-content" className="flex-1 max-w-4xl mx-auto w-full px-4 sm:px-6 lg:px-8 pb-16 space-y-6">
        {/* Filter bar */}
        <div className="flex items-center justify-between gap-3 bg-white p-3 rounded-xl border border-gov-border shadow-xs text-xs">
          <div className="flex items-center gap-2">
            {['All', 'Unread', 'Alerts'].map((tab) => (
              <button
                key={tab}
                onClick={() => setFilterType(tab)}
                className={`px-3 py-1.5 rounded-lg font-semibold transition-colors ${
                  filterType === tab ? 'bg-[#123B66] text-white shadow-xs' : 'bg-slate-100 text-gov-text hover:bg-slate-200'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          <span className="text-gov-muted">
            {notifications.filter((n) => !n.read).length} Unread Notice{notifications.filter((n) => !n.read).length !== 1 ? 's' : ''}
          </span>
        </div>

        {/* Notifications List or Empty State */}
        {filtered.length > 0 ? (
          <div className="space-y-3">
            {filtered.map((item) => {
              const Icon = getNotifIcon(item.category);
              return (
                <div
                  key={item.id}
                  className={`p-4 sm:p-5 rounded-xl border transition-all text-xs flex flex-col sm:flex-row sm:items-start justify-between gap-4 ${
                    !item.read
                      ? 'bg-white border-blue-200 shadow-sm ring-1 ring-blue-100'
                      : 'bg-white/80 border-gov-border text-slate-700'
                  }`}
                >
                  <div className="flex items-start gap-3.5">
                    <div
                      className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${
                        !item.read
                          ? 'bg-blue-100 text-gov-blue'
                          : 'bg-slate-100 text-slate-500'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                    </div>

                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-[11px] font-bold uppercase tracking-wider text-gov-blue">
                          {item.category}
                        </span>
                        {!item.read && (
                          <span className="w-2 h-2 rounded-full bg-blue-600 inline-block" />
                        )}
                        <span className="text-[11px] font-mono text-slate-400">
                          {item.timestamp}
                        </span>
                      </div>

                      <h4 className="text-sm font-bold text-primary-navy">
                        {item.title}
                      </h4>

                      <p className="text-gov-text leading-relaxed">
                        {item.message}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0 self-end sm:self-center">
                    {!item.read && (
                      <button
                        onClick={() => handleMarkRead(item.id)}
                        className="text-xs text-slate-500 hover:text-slate-800 font-medium"
                      >
                        Mark read
                      </button>
                    )}
                    {item.link && (
                      <Link
                        to={item.link}
                        onClick={() => handleMarkRead(item.id)}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded bg-slate-100 hover:bg-[#123B66] hover:text-white text-gov-blue text-xs font-semibold transition-colors"
                      >
                        <span>View</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <EmptyState
            title="No notifications found"
            description="You do not have any notifications matching this filter. New updates will be logged here in real time."
            actionLabel="Return to Dashboard"
            actionLink="/dashboard"
          />
        )}
      </main>

      <Footer />
    </div>
  );
};

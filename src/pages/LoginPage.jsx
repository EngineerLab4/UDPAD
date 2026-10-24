import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation, useSearchParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import {
  Eye,
  EyeOff,
  LogIn,
  AlertCircle,
  CheckCircle2,
  Lock,
  UserPlus,
  Building2,
  Shield,
  User,
  KeyRound
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { TopGovBar } from '../components/layout/TopGovBar';
import { Footer } from '../components/layout/Footer';

export const LoginPage = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const initialOfficial = searchParams.get('mode') === 'official' || searchParams.get('role') === 'officer';

  const [showPassword, setShowPassword] = useState(false);
  const [authError, setAuthError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [authMode, setAuthMode] = useState(initialOfficial ? 'official' : 'citizen'); // 'citizen' | 'official'

  const from = location.state?.from?.pathname || '/dashboard';

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors }
  } = useForm({
    defaultValues: {
      mobileOrEmail: initialOfficial ? 'officer@gov.in' : '',
      password: initialOfficial ? 'Password@123' : '',
      rememberMe: true
    }
  });

  useEffect(() => {
    if (authMode === 'official') {
      setValue('mobileOrEmail', 'officer@gov.in');
      setValue('password', 'Password@123');
    }
  }, [authMode, setValue]);

  const handleFillDemoOfficer = () => {
    setValue('mobileOrEmail', 'officer@gov.in');
    setValue('password', 'Password@123');
    setAuthMode('official');
    setAuthError('');
  };

  const onSubmit = async (data) => {
    setAuthError('');
    setIsLoading(true);

    try {
      const emailOrMobile = authMode === 'official'
        ? (data.mobileOrEmail?.trim() || 'officer@gov.in')
        : data.mobileOrEmail;
      const pass = authMode === 'official'
        ? (data.password?.trim() || 'Password@123')
        : data.password;

      const result = await login(emailOrMobile, pass);
      if (result.success) {
        const isOfficer = authMode === 'official' || result.user?.role === 'OFFICER' || (result.user?.email && result.user.email.toLowerCase().endsWith('@gov.in'));
        if (isOfficer) {
          navigate('/officer', { replace: true });
        } else {
          const target = from === '/officer' ? '/dashboard' : from;
          navigate(target, { replace: true });
        }
      } else {
        setAuthError(result.error || 'Invalid credentials.');
      }
    } catch (err) {
      setAuthError('An unexpected authentication error occurred.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#F4F6F9]">
      <TopGovBar />

      {/* Header */}
      <div className="bg-white border-b border-gov-border py-3 px-4 sm:px-8 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-3 group outline-none focus:outline-none focus:ring-0 active:outline-none active:ring-0 select-none">
          <img
            src="/udpad-logo.png"
            alt="UDPAD Emblem Logo"
            className="w-10 h-10 sm:w-11 sm:h-11 object-contain shrink-0 group-hover:scale-105 transition-transform"
          />
          <div>
            <span className="font-extrabold text-xl tracking-tight text-primary-navy">
              UDPAD
            </span>
            <span className="text-[11px] text-gov-muted block">
              Government Citizen Service Portal
            </span>
          </div>
        </Link>
        <Link
          to="/"
          className="text-xs font-semibold text-gov-blue hover:underline"
        >
          ← Back to Public Portal
        </Link>
      </div>

      <main id="main-content" className="flex-1 max-w-6xl mx-auto w-full px-4 sm:px-6 py-8 sm:py-12 flex items-center justify-center">
        <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch bg-white rounded-2xl border border-gov-border shadow-sm overflow-hidden">
          {/* Left Panel: Government Service Identity (5 cols) */}
          <div className="lg:col-span-5 bg-gradient-to-br from-[#0e2c4d] to-[#174A7E] text-white p-8 sm:p-10 flex flex-col justify-between">
            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-amber-400 text-xs font-semibold border border-white/10">
                <Shield className="w-3.5 h-3.5" />
                <span>Central Government Service Portal</span>
              </div>

              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-white leading-snug">
                Unified Digital Platform for Accessible Public Documentation
              </h2>

              <p className="text-sm text-slate-200 leading-relaxed">
                Centralized digital infrastructure for citizens and authorized officials to manage household welfare records, verify entitlement eligibility and access transparent verification workflows.
              </p>

              <div className="pt-2 flex flex-wrap items-center gap-4 text-xs text-slate-300 font-medium">
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block"></span>
                  <span>End-to-End Encryption</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-amber-400 inline-block"></span>
                  <span>Zero Automatic Disqualification</span>
                </div>
              </div>
            </div>

            {/* Bottom Security Note */}
            <div className="mt-8 pt-6 border-t border-white/15 text-[11px] text-slate-300 flex items-start gap-2">
              <Lock className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
              <span>
                Authorized access only. Please ensure you keep your credentials confidential.
              </span>
            </div>
          </div>

          {/* Right Panel: Login Card (7 cols) */}
          <div className="lg:col-span-7 p-6 sm:p-10 flex flex-col justify-between">
            <div>
              {/* Role Toggle Tabs */}
              <div className="flex border-b border-gov-border mb-6">
                <button
                  type="button"
                  onClick={() => { setAuthMode('citizen'); setAuthError(''); }}
                  className={`flex-1 py-3 px-4 text-xs font-bold transition-colors flex items-center justify-center gap-2 border-b-2 cursor-pointer ${
                    authMode === 'citizen'
                      ? 'border-primary-navy text-primary-navy bg-slate-50'
                      : 'border-transparent text-gov-muted hover:text-gov-text'
                  }`}
                >
                  <User className="w-4 h-4" />
                  <span>Citizen Portal</span>
                </button>
                <button
                  type="button"
                  onClick={() => { setAuthMode('official'); setAuthError(''); }}
                  className={`flex-1 py-3 px-4 text-xs font-bold transition-colors flex items-center justify-center gap-2 border-b-2 cursor-pointer ${
                    authMode === 'official'
                      ? 'border-amber-600 text-amber-900 bg-amber-50/60'
                      : 'border-transparent text-gov-muted hover:text-gov-text'
                  }`}
                >
                  <Building2 className="w-4 h-4 text-amber-600" />
                  <span>Government Official</span>
                </button>
              </div>

              {/* Form Header */}
              <div className="mb-6">
                <span className={`text-[11px] font-bold uppercase tracking-wider ${
                  authMode === 'official' ? 'text-amber-700' : 'text-gov-blue'
                }`}>
                  {authMode === 'official' ? 'Official Government Portal' : 'Citizen Authentication'}
                </span>
                <h3 className="text-2xl font-extrabold text-primary-navy tracking-tight mt-1">
                  {authMode === 'official' ? 'Government Official Sign In' : 'Citizen Portal Sign In'}
                </h3>
                <p className="text-xs text-gov-muted mt-1 leading-relaxed">
                  {authMode === 'official'
                    ? 'Enter your official government email address ending with @gov.in and secure credential.'
                    : 'Enter your registered mobile number or email address and password to access your citizen records.'}
                </p>
              </div>

              {/* Official Portal Quick-Fill Banner */}
              {authMode === 'official' && (
                <div className="mb-5 p-3.5 bg-amber-50/80 border border-amber-300 rounded-xl text-xs text-amber-900 flex items-center justify-between shadow-xs">
                  <div>
                    <span className="font-bold flex items-center gap-1.5 text-amber-950">
                      <Shield className="w-3.5 h-3.5 text-amber-600" />
                      <span>Authorized Officer Demo Credentials</span>
                    </span>
                    <span className="text-[11px] font-mono text-amber-800 block mt-0.5">
                      officer@gov.in • Password@123
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={handleFillDemoOfficer}
                    className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-lg font-bold text-[11px] cursor-pointer transition-colors shrink-0 shadow-xs"
                  >
                    Auto-Fill
                  </button>
                </div>
              )}

              {/* Error Alert */}
              {authError && (
                <div className="mb-6 p-3.5 rounded-lg bg-red-50 border border-red-200 text-xs text-red-800 flex items-start gap-2.5">
                  <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                  <div>
                    <span>{authError}</span>
                    {authMode === 'citizen' && (
                      <div className="mt-1.5">
                        <Link to="/register" className="font-bold underline text-red-900">
                          Click here to register as a citizen →
                        </Link>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Form */}
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                {/* Mobile / Email */}
                <div>
                  <label className="block text-xs font-bold text-gov-text uppercase tracking-wider mb-1.5">
                    {authMode === 'official' ? 'Official Government Email' : 'Registered Mobile Number or Email'} <span className="text-red-600">*</span>
                  </label>
                  <input
                    type="text"
                    {...register('mobileOrEmail', {
                      required: authMode === 'official'
                        ? 'Please enter your official government email address ending with @gov.in'
                        : 'Please enter your registered mobile number or email address',
                      validate: (value) => {
                        const clean = value.trim().toLowerCase();
                        if (authMode === 'official') {
                          return clean.endsWith('@gov.in') || 'Official portal sign in strictly requires an email ending with @gov.in';
                        }
                        const isMobile = /^[0-9]{10}$/.test(value.trim());
                        const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
                        return isMobile || isEmail || 'Please enter a valid 10-digit mobile number or valid email.';
                      }
                    })}
                    placeholder={authMode === 'official' ? 'e.g. officer@gov.in or nodal.officer@gov.in' : 'e.g. 9876543210 or citizen@example.com'}
                    className={`w-full px-3.5 py-2.5 rounded-lg border text-sm text-gov-text bg-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-gov-blue ${
                      errors.mobileOrEmail ? 'border-red-500 bg-red-50/20' : 'border-gov-border'
                    }`}
                  />
                  {errors.mobileOrEmail && (
                    <p className="mt-1 text-xs text-red-600 font-medium">
                      {errors.mobileOrEmail.message}
                    </p>
                  )}
                </div>

                {/* Password */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-xs font-bold text-gov-text uppercase tracking-wider">
                      {authMode === 'official' ? 'Official Security Password' : 'Account Password'} <span className="text-red-600">*</span>
                    </label>
                    <Link
                      to="/forgot-password"
                      className="text-xs font-semibold text-gov-blue hover:underline"
                    >
                      Forgot Password?
                    </Link>
                  </div>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      {...register('password', {
                        required: 'Please enter your password'
                      })}
                      placeholder="Enter your account password"
                      className={`w-full px-3.5 py-2.5 pr-10 rounded-lg border text-sm text-gov-text bg-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-gov-blue ${
                        errors.password ? 'border-red-500 bg-red-50/20' : 'border-gov-border'
                      }`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {errors.password && (
                    <p className="mt-1 text-xs text-red-600 font-medium">
                      {errors.password.message}
                    </p>
                  )}
                </div>

                {/* Remember Me */}
                <div className="flex items-center justify-between pt-1">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      {...register('rememberMe')}
                      className="w-4 h-4 rounded border-gov-border text-gov-blue focus:ring-gov-blue"
                    />
                    <span className="text-xs text-gov-text select-none">
                      Remember me on this device
                    </span>
                  </label>
                </div>

                {/* Submit Button */}
                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={isLoading}
                    className={`w-full py-3 px-4 rounded-lg font-bold text-sm transition-colors shadow-xs flex items-center justify-center gap-2 disabled:opacity-70 cursor-pointer ${
                      authMode === 'official'
                        ? 'bg-amber-700 hover:bg-amber-800 text-white'
                        : 'bg-primary-navy hover:bg-gov-blue text-white'
                    }`}
                  >
                    {isLoading ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        <span>Verifying Credentials...</span>
                      </>
                    ) : (
                      <>
                        <LogIn className="w-4 h-4" />
                        <span>
                          {authMode === 'official' ? 'Sign In as Govt. Official' : 'Sign In to Citizen Portal'}
                        </span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>

            {/* Registration CTA & Security Disclaimer */}
            <div className="mt-8 pt-6 border-t border-gov-border text-center">
              <div className="p-4 bg-blue-50/60 rounded-xl border border-blue-200/80">
                <span className="text-xs font-bold text-primary-navy block mb-1">
                  First time visiting UDPAD?
                </span>
                <p className="text-xs text-gov-muted mb-3">
                  Register your citizen profile to establish your household record and explore welfare entitlements.
                </p>
                <Link
                  to="/register"
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-gov-blue hover:bg-gov-blue-dark text-white font-bold text-xs transition-colors shadow-xs"
                >
                  <UserPlus className="w-4 h-4" />
                  <span>Register as a Citizen</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

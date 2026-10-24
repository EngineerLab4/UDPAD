import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import {
  ShieldCheck,
  UserPlus,
  AlertCircle,
  CheckCircle2,
  Lock,
  ArrowRight
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { TopGovBar } from '../components/layout/TopGovBar';
import { Footer } from '../components/layout/Footer';

export const RegisterPage = () => {
  const { register: registerAuth } = useAuth();
  const navigate = useNavigate();
  const [authError, setAuthError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors }
  } = useForm({
    defaultValues: {
      fullName: '',
      mobile: '',
      email: '',
      password: '',
      confirmPassword: '',
      privacyConsent: false
    }
  });

  const passwordVal = watch('password');

  const onSubmit = async (data) => {
    setAuthError('');
    setIsLoading(true);

    try {
      const result = await registerAuth({
        fullName: data.fullName,
        mobile: data.mobile,
        email: data.email,
        password: data.password
      });

      if (result.success) {
        setSuccessMessage('Registration successful! Local demo citizen session established.');
        setTimeout(() => {
          navigate('/dashboard');
        }, 1200);
      } else {
        setAuthError(result.error || 'Registration failed.');
      }
    } catch (err) {
      setAuthError('An unexpected error occurred during demo registration.');
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
              Citizen Registration Portal
            </span>
          </div>
        </Link>
        <Link to="/login" className="text-xs font-semibold text-gov-blue hover:underline">
          Already have an account? Sign In →
        </Link>
      </div>

      <main id="main-content" className="flex-1 max-w-2xl mx-auto w-full px-4 sm:px-6 py-8 sm:py-12">
        <div className="bg-white rounded-2xl border border-gov-border shadow-sm p-6 sm:p-10">
          <div className="mb-6">
            <h1 className="text-2xl font-extrabold text-primary-navy tracking-tight">
              Create a Citizen Account
            </h1>
            <p className="text-xs text-gov-muted mt-1 leading-relaxed">
              Register to access your household records, explore welfare benefits and track applications.
            </p>
          </div>

          {authError && (
            <div className="mb-6 p-3.5 rounded-lg bg-red-50 border border-red-200 text-xs text-red-800 flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
              <span>{authError}</span>
            </div>
          )}

          {successMessage && (
            <div className="mb-6 p-3.5 rounded-lg bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span>{successMessage}</span>
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* Full Name */}
            <div>
              <label className="block text-xs font-bold text-gov-text uppercase tracking-wider mb-1.5">
                Full Name <span className="text-red-600">*</span>
              </label>
              <input
                type="text"
                {...register('fullName', {
                  required: 'Please enter your full name',
                  minLength: { value: 3, message: 'Name must be at least 3 characters' }
                })}
                placeholder="e.g. Ramesh Chandra Verma"
                className={`w-full px-3.5 py-2.5 rounded-lg border text-sm text-gov-text bg-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-gov-blue ${
                  errors.fullName ? 'border-red-500 bg-red-50/20' : 'border-gov-border'
                }`}
              />
              {errors.fullName && (
                <p className="mt-1 text-xs text-red-600 font-medium">{errors.fullName.message}</p>
              )}
            </div>

            {/* Mobile Number */}
            <div>
              <label className="block text-xs font-bold text-gov-text uppercase tracking-wider mb-1.5">
                Mobile Number <span className="text-red-600">*</span>
              </label>
              <input
                type="tel"
                maxLength={10}
                {...register('mobile', {
                  required: 'Please enter your 10-digit mobile number',
                  pattern: {
                    value: /^[0-9]{10}$/,
                    message: 'Please enter a valid 10-digit Indian mobile number'
                  }
                })}
                placeholder="e.g. 9876543210"
                className={`w-full px-3.5 py-2.5 rounded-lg border text-sm text-gov-text bg-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-gov-blue ${
                  errors.mobile ? 'border-red-500 bg-red-50/20' : 'border-gov-border'
                }`}
              />
              {errors.mobile && (
                <p className="mt-1 text-xs text-red-600 font-medium">{errors.mobile.message}</p>
              )}
            </div>

            {/* Email (Optional) */}
            <div>
              <label className="block text-xs font-bold text-gov-text uppercase tracking-wider mb-1.5">
                Email Address <span className="text-gov-muted font-normal">(Optional)</span>
              </label>
              <input
                type="email"
                {...register('email', {
                  pattern: {
                    value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                    message: 'Please enter a valid email address'
                  }
                })}
                placeholder="e.g. citizen@example.com"
                className={`w-full px-3.5 py-2.5 rounded-lg border text-sm text-gov-text bg-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-gov-blue ${
                  errors.email ? 'border-red-500 bg-red-50/20' : 'border-gov-border'
                }`}
              />
              {errors.email && (
                <p className="mt-1 text-xs text-red-600 font-medium">{errors.email.message}</p>
              )}
            </div>

            {/* Password */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-gov-text uppercase tracking-wider mb-1.5">
                  Password <span className="text-red-600">*</span>
                </label>
                <input
                  type="password"
                  {...register('password', {
                    required: 'Please enter a password',
                    minLength: { value: 6, message: 'Password must be at least 6 characters' }
                  })}
                  placeholder="Create demo password"
                  className={`w-full px-3.5 py-2.5 rounded-lg border text-sm text-gov-text bg-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-gov-blue ${
                    errors.password ? 'border-red-500 bg-red-50/20' : 'border-gov-border'
                  }`}
                />
                {errors.password && (
                  <p className="mt-1 text-xs text-red-600 font-medium">{errors.password.message}</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold text-gov-text uppercase tracking-wider mb-1.5">
                  Confirm Password <span className="text-red-600">*</span>
                </label>
                <input
                  type="password"
                  {...register('confirmPassword', {
                    required: 'Please confirm your password',
                    validate: (val) => val === passwordVal || 'Passwords do not match'
                  })}
                  placeholder="Re-enter password"
                  className={`w-full px-3.5 py-2.5 rounded-lg border text-sm text-gov-text bg-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-gov-blue ${
                    errors.confirmPassword ? 'border-red-500 bg-red-50/20' : 'border-gov-border'
                  }`}
                />
                {errors.confirmPassword && (
                  <p className="mt-1 text-xs text-red-600 font-medium">{errors.confirmPassword.message}</p>
                )}
              </div>
            </div>

            {/* Data Consent */}
            <div className="pt-2">
              <label className="flex items-start gap-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  {...register('privacyConsent', {
                    required: 'You must agree to the data consent to proceed'
                  })}
                  className="w-4 h-4 rounded border-gov-border text-gov-blue focus:ring-gov-blue mt-0.5"
                />
                <span className="text-xs text-gov-text leading-snug">
                  I understand the data consent and ok with sharing my data for official use.
                </span>
              </label>
              {errors.privacyConsent && (
                <p className="mt-1 text-xs text-red-600 font-medium">{errors.privacyConsent.message}</p>
              )}
            </div>

            {/* Submit */}
            <div className="pt-4">
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 px-4 rounded-lg bg-primary-navy hover:bg-gov-blue text-white font-bold text-sm transition-colors shadow-xs flex items-center justify-center gap-2 cursor-pointer disabled:opacity-70"
              >
                {isLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Creating Demo Account...</span>
                  </>
                ) : (
                  <>
                    <UserPlus className="w-4 h-4" />
                    <span>Register Demo Citizen Profile</span>
                  </>
                )}
              </button>
            </div>
          </form>

          <div className="mt-6 pt-4 border-t border-gov-border text-center text-xs text-gov-muted">
            Already have a citizen account?{' '}
            <Link to="/login" className="font-bold text-gov-blue hover:underline">
              Sign In to Citizen Portal
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import {
  KeyRound,
  CheckCircle2,
  AlertCircle,
  ArrowLeft,
  Info,
  ShieldCheck
} from 'lucide-react';
import { authService } from '../services/authService';
import { TopGovBar } from '../components/layout/TopGovBar';
import { Footer } from '../components/layout/Footer';

export const ForgotPasswordPage = () => {
  const [successInfo, setSuccessInfo] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm({
    defaultValues: {
      identifier: ''
    }
  });

  const onSubmit = async (data) => {
    setIsLoading(true);
    setSuccessInfo('');

    try {
      const res = await authService.recoverAccount(data.identifier);
      setSuccessInfo(res.message);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#F4F6F9]">
      <TopGovBar />

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
              Citizen Account Recovery
            </span>
          </div>
        </Link>
        <Link to="/login" className="text-xs font-semibold text-gov-blue hover:underline">
          Return to Sign In →
        </Link>
      </div>

      <main id="main-content" className="flex-1 max-w-lg mx-auto w-full px-4 sm:px-6 py-12">
        <div className="bg-white rounded-2xl border border-gov-border shadow-sm p-6 sm:p-8">
          <div className="w-12 h-12 rounded-xl bg-blue-50 text-gov-blue flex items-center justify-center mb-4 border border-blue-200">
            <KeyRound className="w-6 h-6 stroke-[2]" />
          </div>

          <h1 className="text-2xl font-extrabold text-primary-navy tracking-tight">
            Account Recovery & Password Reset
          </h1>
          <p className="text-xs text-gov-muted mt-1 leading-relaxed">
            Enter your registered mobile number or email address associated with your citizen profile to receive demonstration recovery guidance.
          </p>

          {successInfo ? (
            <div className="mt-6 p-4 rounded-xl bg-emerald-50 border border-emerald-300 text-xs text-emerald-900 space-y-3">
              <div className="flex items-start gap-2.5">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                <p className="leading-relaxed font-medium">{successInfo}</p>
              </div>

              <Link
                to="/login"
                className="w-full inline-flex items-center justify-center gap-1.5 py-2.5 px-4 rounded-lg bg-primary-navy text-white font-bold text-xs hover:bg-gov-blue transition-colors shadow-xs"
              >
                <span>Return to Sign In</span>
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-gov-text uppercase tracking-wider mb-1.5">
                  Registered Mobile or Email <span className="text-red-600">*</span>
                </label>
                <input
                  type="text"
                  {...register('identifier', {
                    required: 'Please provide your registered mobile number or email'
                  })}
                  placeholder="e.g. 9876543210 or citizen@example.com"
                  className={`w-full px-3.5 py-2.5 rounded-lg border text-sm text-gov-text bg-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-gov-blue ${
                    errors.identifier ? 'border-red-500 bg-red-50/20' : 'border-gov-border'
                  }`}
                />
                {errors.identifier && (
                  <p className="mt-1 text-xs text-red-600 font-medium">
                    {errors.identifier.message}
                  </p>
                )}
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 px-4 rounded-lg bg-primary-navy hover:bg-gov-blue text-white font-bold text-sm transition-colors shadow-xs flex items-center justify-center gap-2 cursor-pointer disabled:opacity-70"
              >
                {isLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Processing Demo Recovery...</span>
                  </>
                ) : (
                  <span>Send Recovery Instructions</span>
                )}
              </button>

              <div className="pt-2 text-center">
                <Link
                  to="/login"
                  className="inline-flex items-center gap-1 text-xs font-semibold text-gov-muted hover:text-gov-text"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Back to Login</span>
                </Link>
              </div>
            </form>
          )}

          <div className="mt-8 pt-4 border-t border-gov-border text-[11px] text-gov-muted">
            <strong>Demonstration Prototype Note:</strong> No actual cellular SMS or automated email dispatcher is connected in this frontend environment.
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { PublicHeader } from '../components/layout/PublicHeader';
import { Footer } from '../components/layout/Footer';
import { TopGovBar } from '../components/layout/TopGovBar';
import { schemesData } from '../data/schemes';

export const LandingPage = () => {
  const sampleSchemes = schemesData.slice(0, 6);

  const partnerLogos = [
    {
      name: 'DigiLocker',
      logo: '/partners/digilocker.png',
      href: 'https://www.digilocker.gov.in/'
    },
    {
      name: 'Meri Pehchaan',
      logo: '/partners/meripehchaan.png',
      href: 'https://meripehchaan.gov.in/'
    },
    {
      name: 'UMANG',
      logo: '/partners/umang.png',
      href: 'https://web.umang.gov.in/'
    },
    {
      name: 'myScheme',
      logo: '/partners/myscheme.png',
      href: 'https://www.myscheme.gov.in/'
    },
    {
      name: 'DigiLocker NAD',
      logo: '/partners/nad.png',
      href: 'https://nad.digilocker.gov.in/'
    }
  ];

  return (
    <div className="min-h-screen flex flex-col bg-[#F4F6F9]">
      <TopGovBar />
      <PublicHeader />

      <main id="main-content" className="flex-1">
        {/* Full-Page Hero Section with Centered Ashoka Emblem and Sovereign Styling */}
        <section className="bg-gradient-to-br from-slate-50 via-white to-slate-100/70 min-h-[calc(100vh-112px)] relative overflow-hidden border-b border-gov-border flex items-center py-16 lg:py-24">
          {/* Subtle sovereign geometric pattern */}
          <div className="absolute inset-0 opacity-[0.035] pointer-events-none bg-[radial-gradient(#123B66_1.2px,transparent_1.2px)] [background-size:28px_28px]"></div>

          {/* Background Ashoka Emblem Watermark in the Centre with Proper Transparency */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none overflow-hidden">
            <img
              src="/ashoka-emblem.png"
              alt="State Emblem of India Watermark"
              className="w-[420px] sm:w-[560px] lg:w-[700px] xl:w-[820px] h-auto object-contain opacity-[0.05] sm:opacity-[0.06] transition-opacity"
            />
          </div>

          <div className="max-w-7xl xl:max-w-[1400px] 2xl:max-w-[1536px] mx-auto w-full px-4 sm:px-6 lg:px-8 xl:px-10 relative z-10">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 xl:gap-12 items-center">
              {/* Left Column: Heading, Supporting Content, Action Button */}
              <div className="lg:col-span-6 space-y-6 sm:space-y-7">
                {/* Main Heading */}
                <h1 className="text-3xl sm:text-4xl lg:text-[42px] xl:text-[50px] font-extrabold tracking-tight leading-[1.16] text-[#000000]">
                  Government Benefits. <br />
                  <span className="text-[#000000] block mt-1 sm:mt-2">Clear Information. Easier Access.</span>
                </h1>

                {/* Supporting Text */}
                <p className="text-base sm:text-lg lg:text-xl text-slate-700 leading-relaxed max-w-xl font-normal">
                  Find relevant government schemes, review eligibility requirements and stay informed about your benefit applications — all through one citizen-focused digital platform.
                </p>

                {/* Action Button */}
                <div className="pt-4 sm:pt-6">
                  <Link
                    to="/schemes"
                    className="inline-flex items-center gap-2.5 px-7 py-3.5 rounded-xl bg-primary-navy hover:bg-gov-blue text-white font-semibold text-sm transition-colors shadow-sm group"
                  >
                    <span>View Available Schemes</span>
                    <ArrowRight className="w-4 h-4 text-amber-300 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </div>
              </div>

              {/* Right Column: Beneficiary Family Image */}
              <div className="flex lg:col-span-6 items-center justify-center lg:justify-end mt-6 lg:mt-0 lg:translate-x-4 xl:translate-x-8">
                <img
                  src="/indian-family.png"
                  alt="Indian Citizen Family Beneficiaries"
                  className="w-full max-w-sm sm:max-w-md lg:max-w-lg xl:max-w-xl 2xl:max-w-[620px] max-h-[460px] lg:max-h-[500px] xl:max-h-[540px] h-auto object-contain drop-shadow-xl transition-transform hover:scale-[1.02] duration-300 pointer-events-none select-none lg:ml-auto"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Why UDPAD? - Digital Public Infrastructure Partner Ecosystem (apisetu style) */}
        <section id="about" className="py-16 sm:py-20 bg-white border-b border-gov-border relative overflow-hidden">
          <div className="max-w-7xl xl:max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-10 text-center mb-10">
            <h2 className="text-base font-bold text-[#FF8000] tracking-wide mb-2">
              Why UDPAD?
            </h2>
            <h3 className="text-2xl sm:text-3xl lg:text-4xl text-[#374151] font-extrabold max-w-4xl mx-auto mb-4 tracking-tight leading-snug">
              UDPAD provides a connected, transparent architecture for verified public records and welfare entitlements — securely and equitably.
            </h3>
            <p className="text-sm sm:text-base text-slate-600 max-w-3xl mx-auto leading-relaxed">
              Designed for interoperability with foundational Digital India platforms, connecting citizen records, identity frameworks, and welfare delivery in a collaborative public ecosystem.
            </p>
          </div>

          {/* Continuous scrolling carousel exactly like apisetu.gov.in */}
          <div className="relative py-4 overflow-hidden">
            {/* Subtle fade masks at left and right */}
            <div className="pointer-events-none absolute left-0 top-0 bottom-0 w-16 sm:w-28 bg-gradient-to-r from-white to-transparent z-10" />
            <div className="pointer-events-none absolute right-0 top-0 bottom-0 w-16 sm:w-28 bg-gradient-to-l from-white to-transparent z-10" />

            {/* Marquee track */}
            <div className="animate-marquee-infinite flex items-center gap-6">
              {[...partnerLogos, ...partnerLogos, ...partnerLogos].map((partner, index) => (
                <a
                  key={`${partner.name}-${index}`}
                  href={partner.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-56 sm:w-64 h-24 rounded-xl border border-slate-200 bg-white shadow-2xs hover:shadow-md hover:border-slate-300 transition-all flex items-center justify-center p-4 group shrink-0"
                  title={partner.name}
                >
                  <img
                    src={partner.logo}
                    alt={`${partner.name} logo`}
                    className="max-h-11 max-w-[80%] object-contain filter group-hover:scale-105 transition-transform duration-300"
                    loading="lazy"
                  />
                </a>
              ))}
            </div>
          </div>
        </section>

        {/* Welfare Directory Spotlight Section */}
        <section id="schemes-directory" className="py-20 lg:py-28 bg-white border-b border-gov-border">
          <div className="max-w-7xl xl:max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-10">
            <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-10">
              <div>
                <span className="text-xs font-extrabold uppercase tracking-widest text-gov-blue">
                  Welfare Directory
                </span>
                <h2 className="text-2xl sm:text-4xl font-extrabold text-primary-navy mt-1 tracking-tight">
                  Explore Available Welfare Schemes
                </h2>
                <p className="text-sm sm:text-base text-gov-muted mt-1.5 max-w-2xl">
                  Transparent eligibility criteria and benefits categorized across Individual, Household and Dwelling units.
                </p>
              </div>
              <Link
                to="/schemes"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-gov-blue font-bold text-xs transition-colors shrink-0 border border-blue-200"
              >
                <span>View All Schemes</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            {/* Schemes Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {sampleSchemes.map((scheme) => (
                <div
                  key={scheme.id}
                  className="bg-slate-50/90 rounded-2xl border border-gov-border p-6 shadow-2xs hover:shadow-md transition-shadow flex flex-col justify-between"
                >
                  <div className="flex flex-col flex-1">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-slate-950">
                        Unit: {scheme.benefitUnit}
                      </span>
                      <span className="text-[11px] font-mono text-gov-muted font-medium">{scheme.code}</span>
                    </div>

                    <h3 className="text-base font-bold text-primary-navy line-clamp-2 mb-2 min-h-[3rem] flex items-center">
                      {scheme.name}
                    </h3>
                    <p className="text-xs text-gov-text line-clamp-3 mb-4 leading-relaxed min-h-[3.25rem]">
                      {scheme.shortDescription}
                    </p>

                    <div className="pt-3 border-t border-slate-200/70 mb-5 mt-auto">
                      <p className="text-xs sm:text-sm font-semibold text-slate-600 leading-snug line-clamp-2">
                        {scheme.benefitAmount}
                      </p>
                    </div>
                  </div>

                  <Link
                    to={`/schemes/${scheme.id}`}
                    className="w-full py-1 text-xs font-bold text-primary-navy hover:text-amber-600 transition-colors flex items-center justify-center gap-1.5 group/btn"
                  >
                    <span>View Scheme Details</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover/btn:translate-x-1 transition-transform" />
                  </Link>
                </div>
              ))}
            </div>

            {/* Bottom Directory CTA */}
            <div className="mt-12 text-center">
              <Link
                to="/schemes"
                className="inline-flex items-center gap-2.5 px-8 py-3.5 rounded-xl bg-primary-navy hover:bg-gov-blue text-white font-bold text-sm transition-colors shadow-sm"
              >
                <span>Browse All Central & State Schemes</span>
                <ArrowRight className="w-4 h-4 text-amber-300" />
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

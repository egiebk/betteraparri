import React, { useState } from 'react';
import { mainNavigation } from '../../data/navigation';
import type { LanguageType } from '../../types/index';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { LANGUAGES } from '../../i18n/languages';

const emergencyHotlines = [
  { label: 'MDRRMO:', number: '09566542894', icon: 'ri-alarm-warning-line' },
  { label: 'PCG:', number: '09568301802', icon: 'ri-ship-2-line' },
  { label: 'PNP:', number: '911', icon: 'ri-police-badge-line' },
  { label: 'BFP:', number: '09164910946', icon: 'ri-fire-line' },
  { label: 'Hospital:', number: '09363748430', icon: 'ri-hospital-line' },
  {
    label: 'RHU-East:',
    number: '09531908364',
    icon: 'ri-first-aid-kit-line',
  },
  {
    label: 'RHU-West:',
    number: '09359519786',
    icon: 'ri-first-aid-kit-line',
  },
];

const Navbar: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const { t, i18n } = useTranslation('common');

  const toggleMenu = () => {
    setIsOpen(!isOpen);
    if (isOpen) {
      setActiveMenu(null);
    }
  };

  const closeMenu = () => {
    setIsOpen(false);
    setActiveMenu(null);
  };

  const toggleSubmenu = (label: string) => {
    setActiveMenu(activeMenu === label ? null : label);
  };

  const changeLanguage = (newLanguage: LanguageType) => {
    i18n.changeLanguage(newLanguage);
  };

  return (
    <nav className="bg-white shadow-sm sticky top-0 z-50">
      {/* Top bar with emergency contacts and language switcher */}
      <div className="border-b border-gray-200 bg-red-800 text-white">
        <div className="container mx-auto px-4 py-1.5">
          <div className="flex flex-col gap-1.5 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex flex-col gap-1.5 sm:flex-row sm:items-center sm:gap-2.5">
              <div className="flex items-center gap-1.5 text-[9px] font-semibold uppercase tracking-[0.18em] text-amber-400">
                <i className="ri-phone-line text-sm" />
                <span>Emergency Hotlines</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {emergencyHotlines.map(item => (
                  <a
                    key={item.label}
                    href={`tel:${item.number}`}
                    className="inline-flex items-center rounded-full border border-white/15 bg-white/10 px-2.5 py-0.5 text-[11px] leading-5 text-white/90 transition-colors hover:bg-white/15 gap-1.5"
                  >
                    <i className={`${item.icon} text-xs`} />
                    <span className="font-medium text-white">{item.label}</span>
                    <span className="ml-0.5 text-white/75">{item.number}</span>
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main navigation */}
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center py-4">
          <div className="flex items-center">
            <Link to="/" className="flex items-center">
              <i className="ri-shield-line text-3xl mr-3 text-primary-600" />
              {/* <img
                src="/ph-logo.webp"
                alt="Philippines Coat of Arms"
                className="h-12 w-12 mr-3"
              /> */}
              <div>
                <div className="text-gray-800 font-extrabold">
                  {t('site_name')}
                </div>
                <div className="text-xs text-gray-700">
                  {t('site_description')}
                </div>
              </div>
            </Link>
          </div>

          {/* Desktop navigation */}
          <div className="hidden lg:flex items-center space-x-8 pr-24">
            {mainNavigation.map(item => (
              <div key={item.label} className="relative group">
                <Link
                  to={item.href}
                  className="flex h-10 items-center text-gray-700 hover:text-primary-600 font-medium transition-colors"
                >
                  {item.label}
                  {item.children && (
                    <i className="ri-arrow-down-s-line ml-1 inline-flex h-4 w-4 items-center justify-center text-gray-800 leading-none transition-colors group-hover:text-primary-600" />
                  )}
                </Link>
                {item.children && (
                  <div className="absolute left-0 mt-2 w-56 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                    <div
                      className="py-1"
                      role="menu"
                      aria-orientation="vertical"
                    >
                      {item.children.map(child => (
                        <Link
                          key={child.label}
                          to={child.href}
                          className="text-left block px-4 py-2 text-sm text-gray-700 hover:bg-primary-50 hover:text-primary-600"
                          role="menuitem"
                        >
                          {child.label}
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
          {/* <div className="hidden lg:flex items-center space-x-6">
            <Link
              to="/about"
              className="flex items-center text-gray-700 hover:text-primary-600 font-medium transition-colors"
            >
              About
            </Link> 
            <Link
              to="/search"
              className="flex items-center text-gray-700 hover:text-primary-600 font-medium transition-colors"
            >
              <i className="ri-search-line h-4 w-4 mr-1" />
              Search
            </Link>
            <Link
              to="/sitemap"
              className="flex items-center text-gray-700 hover:text-primary-600 font-medium transition-colors"
            >
              Sitemap
            </Link>
          </div> */}

          {/* Mobile menu button */}
          <div className="lg:hidden flex items-center">
            <button
              onClick={toggleMenu}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-700 hover:text-primary-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary-500"
            >
              <span className="sr-only">Open main menu</span>
              {isOpen ? (
                <i className="ri-close-line block h-6 w-6" aria-hidden="true" />
              ) : (
                <i className="ri-menu-line block h-6 w-6" aria-hidden="true" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <div className={`lg:hidden ${isOpen ? 'block' : 'hidden'}`}>
        <div className="container mx-auto px-2 pt-2 pb-4 space-y-1 border-t border-gray-200 bg-white">
          <div className="mx-2 mb-3 rounded-2xl bg-slate-950 px-4 py-3 text-white">
            <div className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.18em] text-amber-300">
              <i className="ri-phone-line text-xs" />
              <span>Emergency Hotlines</span>
            </div>
            <div className="mt-2.5 flex flex-wrap gap-1.5">
              {emergencyHotlines.map(item => (
                <a
                  key={item.label}
                  href={`tel:${item.number}`}
                  className="inline-flex items-center rounded-full border border-white/15 bg-white/10 px-2.5 py-0.5 text-[11px] leading-5 text-white/90 gap-1.5"
                >
                  <i className={`${item.icon} text-xs`} />
                  <span className="font-medium text-white">{item.label}</span>
                  <span className="ml-0.5 text-white/75">{item.number}</span>
                </a>
              ))}
            </div>
          </div>
          {mainNavigation.map(item => (
            <div key={item.label}>
              {item.children ? (
                <>
                  <button
                    onClick={() => toggleSubmenu(item.label)}
                    className="w-full flex justify-between items-center px-4 py-2 text-base font-medium text-gray-700 hover:bg-gray-50 hover:text-primary-500"
                  >
                    {item.label}
                    <i
                      className={`ri-arrow-down-s-line h-5 w-5 transition-transform ${
                        activeMenu === item.label ? 'transform rotate-180' : ''
                      }`}
                    />
                  </button>
                  {activeMenu === item.label && (
                    <div className="pl-6 py-2 space-y-1 bg-gray-50">
                      {item.children.map(child => (
                        <Link
                          key={child.label}
                          to={child.href}
                          onClick={closeMenu}
                          className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-primary-500"
                        >
                          {child.label}
                        </Link>
                      ))}
                    </div>
                  )}
                </>
              ) : (
                <Link
                  to={item.href}
                  onClick={closeMenu}
                  className="block px-4 py-2 text-base font-medium text-gray-700 hover:bg-gray-50 hover:text-primary-500"
                >
                  {item.label}
                </Link>
              )}
            </div>
          ))}
          <Link
            to="/about"
            onClick={closeMenu}
            className="block px-4 py-2 text-base font-medium text-gray-700 hover:bg-gray-50 hover:text-primary-500"
          >
            About
          </Link>
          <Link
            to="/search"
            onClick={closeMenu}
            className="block px-4 py-2 text-base font-medium text-gray-700 hover:bg-gray-50 hover:text-primary-500"
          >
            Search
          </Link>
          <div className="px-4 py-3 border-t border-gray-200">
            <div className="flex items-center">
              <i className="ri-global-line h-5 w-5 text-gray-800 mr-2" />
              <select
                value={i18n.language}
                onChange={e => changeLanguage(e.target.value as LanguageType)}
                className="text-sm border border-gray-300 rounded px-2 py-1 bg-white text-gray-700 hover:border-primary-600 focus:outline-none focus:ring-1 focus:ring-primary-600 focus:border-primary-600"
              >
                {Object.entries(LANGUAGES).map(([code, lang]) => (
                  <option key={code} value={code}>
                    {lang.nativeName}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;

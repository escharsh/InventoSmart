import React, { createContext, useContext, useState, useEffect } from 'react';

export const CURRENCIES = {
  USD: { code: 'USD', symbol: '$', rate: 1.0, name: 'US Dollar', flag: '🇺🇸', decimals: 2 },
  EUR: { code: 'EUR', symbol: '€', rate: 0.92, name: 'Euro', flag: '🇪🇺', decimals: 2 },
  GBP: { code: 'GBP', symbol: '£', rate: 0.79, name: 'British Pound', flag: '🇬🇧', decimals: 2 },
  INR: { code: 'INR', symbol: '₹', rate: 83.50, name: 'Indian Rupee', flag: '🇮🇳', decimals: 2 },
  CAD: { code: 'CAD', symbol: 'CA$', rate: 1.36, name: 'Canadian Dollar', flag: '🇨🇦', decimals: 2 },
  AUD: { code: 'AUD', symbol: 'A$', rate: 1.52, name: 'Australian Dollar', flag: '🇦🇺', decimals: 2 },
  JPY: { code: 'JPY', symbol: '¥', rate: 155.0, name: 'Japanese Yen', flag: '🇯🇵', decimals: 0 },
  AED: { code: 'AED', symbol: 'AED ', rate: 3.67, name: 'UAE Dirham', flag: '🇦🇪', decimals: 2 },
  SGD: { code: 'SGD', symbol: 'S$', rate: 1.35, name: 'Singapore Dollar', flag: '🇸🇬', decimals: 2 }
};

const AppContext = createContext(null);

export function AppProvider({ children }) {
  // Theme state: 'light' or 'dark'
  const [theme, setTheme] = useState(() => {
    const saved = localStorage.getItem('inventosmart_theme');
    if (saved) return saved;
    return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  });

  // Currency state
  const [currencyCode, setCurrencyCode] = useState(() => {
    return localStorage.getItem('inventosmart_currency') || 'USD';
  });

  // Apply dark class to document root
  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
      root.setAttribute('data-theme', 'dark');
    } else {
      root.classList.remove('dark');
      root.setAttribute('data-theme', 'light');
    }
    localStorage.setItem('inventosmart_theme', theme);
  }, [theme]);

  // Save currency
  useEffect(() => {
    localStorage.setItem('inventosmart_currency', currencyCode);
  }, [currencyCode]);

  const toggleTheme = () => {
    setTheme(prev => (prev === 'dark' ? 'light' : 'dark'));
  };

  const currentCurrency = CURRENCIES[currencyCode] || CURRENCIES.USD;

  // Format currency helper
  const formatCurrency = (amountInUsd, withDecimals = null) => {
    if (amountInUsd === null || amountInUsd === undefined || isNaN(amountInUsd)) {
      return `${currentCurrency.symbol}0.00`;
    }
    const converted = Number(amountInUsd) * currentCurrency.rate;
    const dec = withDecimals !== null ? withDecimals : currentCurrency.decimals;
    return `${currentCurrency.symbol}${converted.toLocaleString(undefined, {
      minimumFractionDigits: dec,
      maximumFractionDigits: dec
    })}`;
  };

  return (
    <AppContext.Provider
      value={{
        theme,
        toggleTheme,
        isDark: theme === 'dark',
        currencyCode,
        setCurrencyCode,
        currentCurrency,
        formatCurrency,
        CURRENCIES
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}

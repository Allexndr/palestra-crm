import React from 'react';
import { render } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { AdminProvider } from '../context/AdminContext';
import { LanguageProvider } from '../context/LanguageContext';
import { ShopProvider } from '../context/ShopContext';

// Custom render that includes all providers
const AllTheProviders = ({ children }) => {
  return (
    <LanguageProvider>
      <AdminProvider>
        <ShopProvider>
          <BrowserRouter>
            {children}
          </BrowserRouter>
        </ShopProvider>
      </AdminProvider>
    </LanguageProvider>
  );
};

const customRender = (ui, options) =>
  render(ui, { wrapper: AllTheProviders, ...options });

// re-export everything
export * from '@testing-library/react';

// override render method
export { customRender as render };

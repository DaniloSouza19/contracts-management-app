import React from 'react';
import { AuthProvider } from './auth';
import { MessageProvider } from './Message';

export const AppProvider: React.FC = ({ children }) => {
  return (
    <AuthProvider>
      <MessageProvider>{children}</MessageProvider>
    </AuthProvider>
  );
};

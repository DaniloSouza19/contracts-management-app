import React, { createContext, useCallback, useContext, useState } from 'react';
import { FeedbackMessage } from '../components/FeedbackMessage';

interface MessageData {
  message: string;
  isOpen: boolean;
  severity: 'success' | 'info' | 'error';
}

interface MessageContextData {
  addMessage(data: Omit<MessageData, 'isOpen'>): void;
}

const MessageContext = createContext<MessageContextData>(
  {} as MessageContextData
);

export const MessageProvider: React.FC = ({ children }) => {
  const [messageData, setMessageData] = useState<MessageData>({
    isOpen: false,
    message: '',
    severity: 'info',
  });

  const AUTO_HIDE_DURATION = 3500;

  const addMessage = useCallback(
    ({ message, severity }: Omit<MessageData, 'isOpen'>): void => {
      setMessageData({
        isOpen: true,
        message,
        severity,
      });
    },
    []
  );

  const handleClose = (
    event?: React.SyntheticEvent | Event,
    reason?: string
  ) => {
    if (reason === 'clickaway') {
      return;
    }

    setMessageData({
      ...messageData,
      isOpen: false,
    });
  };

  return (
    <MessageContext.Provider
      value={{
        addMessage,
      }}
    >
      {children}
      <FeedbackMessage
        isOpen={messageData.isOpen}
        message={messageData.message}
        severity={messageData.severity}
        handleClose={handleClose}
        autoHideDuration={AUTO_HIDE_DURATION}
      />
    </MessageContext.Provider>
  );
};

export function useMessage(): MessageContextData {
  const context = useContext(MessageContext);

  if (!context) {
    throw new Error('useMessage must be used within a MessageProvider');
  }

  return context;
}

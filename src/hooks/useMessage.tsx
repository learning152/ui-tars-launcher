import { App } from 'antd';
import { useContext, createContext } from 'react';

const MessageContext = createContext<ReturnType<typeof App.useApp> | null>(null);

export function MessageProvider({ children }: { children: React.ReactNode }) {
  const { message, modal, notification } = App.useApp();
  return (
    <MessageContext.Provider value={{ message, modal, notification }}>
      {children}
    </MessageContext.Provider>
  );
}

export function useMessage() {
  const context = useContext(MessageContext);
  if (!context) {
    throw new Error('useMessage must be used within MessageProvider');
  }
  return context;
}

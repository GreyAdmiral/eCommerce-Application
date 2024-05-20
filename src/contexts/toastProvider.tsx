import { createContext, ReactNode, useContext } from 'react';
import { toast, ToastContainer, ToastContainerProps } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

interface ToastContextValue {
  customToast: ({ position, autoClose }: ToastContainerProps) => JSX.Element;
  promiseNotify: <T>(userData: T, action: string, callback: (userData: T) => Promise<unknown>) => void;
  successNotify: () => void;
}

const ToastContext = createContext<ToastContextValue>({} as ToastContextValue);

interface ToastProviderProps {
  children: ReactNode;
}

export const ToastProvider = ({ children }: ToastProviderProps) => {
  const customToast = function CustomToast({ position, autoClose }: ToastContainerProps) {
    return <ToastContainer position={position} autoClose={autoClose} />;
  };

  const promiseNotify = <T,>(userData: T, action: string, callback: (userData: T) => Promise<unknown>) => {
    toast.promise(() => callback(userData), {
      pending: `${action} in progress, wait, please`,
      error: {
        render({ data }) {
          return `${(data as Error).message}`;
        },
      },
    });
  };

  const successNotify = () => toast.success('Congratulations, you have successfully logged in!');

  return (
    <ToastContext.Provider value={{ customToast, promiseNotify, successNotify }}>{children}</ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);

  if (context === undefined) {
    throw new Error('useToast hook must be used within a ToastProvider');
  }

  return context;
};
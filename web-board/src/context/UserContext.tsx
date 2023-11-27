import { createContext, useContext, ReactNode, useState } from 'react';

interface UserContextProps {
  username: string | null;
  isLoggedIn: boolean;
  setUserName: (name: string | null) => void;
  setLoggedIn: (loggedIn: boolean) => void;
}

const UserContext = createContext<UserContextProps | undefined>(undefined);

export const UserContextProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [username, setUserName] = useState<string | null>(
    () => window.sessionStorage.getItem('username')
  );
  const [isLoggedIn, setLoggedIn] = useState<boolean>(!!username);
  
  return (
    <UserContext.Provider value={{ username, isLoggedIn,setUserName, setLoggedIn }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};

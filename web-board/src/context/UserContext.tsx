import { createContext, useContext, ReactNode, useState } from 'react';

interface UserContextProps {
  usernameId: string | null;
  isLoggedIn: boolean;
  setUserNameId: (name: string | null) => void;
  setLoggedIn: (loggedIn: boolean) => void;
}

const UserContext = createContext<UserContextProps | undefined>(undefined);

export const UserContextProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [usernameId, setUserNameId] = useState<string | null>(
    () => window.sessionStorage.getItem('usernameId')
  );
  const [isLoggedIn, setLoggedIn] = useState<boolean>(!!usernameId);
  
  return (
    <UserContext.Provider value={{ usernameId, isLoggedIn,setUserNameId, setLoggedIn }}>
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

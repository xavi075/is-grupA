import React, { useEffect } from 'react';
import Header from './components/Header';
import Footer from './components/Footer';
import { BrowserRouter as Router, Route, Routes, Navigate } from "react-router-dom";
import './App.css';
import { DataPage } from './pages/data/DataPage';
import { ParametersPage } from './pages/parameters/ParametersPage';
import { HomePage } from './pages/home/HomePage';
import { library } from '@fortawesome/fontawesome-svg-core'
import { fas } from '@fortawesome/free-solid-svg-icons'
import { LoginPage } from './pages/login/LoginPage';
import { ProfilePage } from './pages/profile/ProfilePage';
import { useUser } from './context/UserContext';

library.add(fas)

function App() {

  useEffect(() => {
    localStorage.clear()
  }, [])

  const { isLoggedIn } = useUser();

  return (
      <Router>
        <div className="App">
          <Header/>
          {isLoggedIn && (
          <Routes>
              <Route path="/data" element={<DataPage />} />
              <Route path="/parameters" element={<ParametersPage />} />
              <Route path="/home" element={<HomePage />} />
              <Route path="/" element={<Navigate to="/home"/>} />
              {/* <Route path="/" redirect="/home" /> */}
              <Route path="/profile" element={<ProfilePage />} />
          </Routes>
          )}
          {!isLoggedIn && (
          <Routes>           
              <Route path="/data" element={<Navigate to="/"/>} />
              <Route path="/parameters" element={<Navigate to="/"/>} />
              <Route path="/home" element={<Navigate to="/"/>} />
              <Route path="/" element={<LoginPage />} />
              <Route path="/profile" element={<Navigate to="/"/>} />
          </Routes>
          )}
          <Footer />
        </div>
      </Router>
  );
}

export default App;

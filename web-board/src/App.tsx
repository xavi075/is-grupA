import React, { useEffect } from 'react';
import Header from './components/Header';
import Footer from './components/Footer';
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import './App.css';
import { DataPage } from './pages/data/DataPage';
import { ParametersPage } from './pages/parameters/ParametersPage';
import { HomePage } from './pages/home/HomePage';
import { library } from '@fortawesome/fontawesome-svg-core'
import { fas } from '@fortawesome/free-solid-svg-icons'
library.add(fas)

function App() {

  useEffect(() => {
    localStorage.clear()
  }, [])

  return (
    <Router>
      <div className="App">
        <Header />
        <Routes>
          <Route path="/data" element={<DataPage />} />
          <Route path="/parameters" element={<ParametersPage />} />
          <Route path="/" element={<HomePage />} />
        </Routes>
        <Footer />
      </div>
    </Router>
  );
}

export default App;

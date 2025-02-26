import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Sign_in from "./components/Sign_in";
import User from "./components/User";

const App = ({ theme, toggleTheme }) => {
  return (
    <Router>
      <Routes>
        <Route 
          path="/Sign_in" 
          element={<Auth />} />
        
        <Route
          path="/User"
          element={<User theme={theme} toggleTheme={toggleTheme} />} />
        
        <Route path="*" element={<Navigate to="/Sign_in" />} />
      </Routes>
    </Router>
  );
};

const Auth = () => {
  return (
    <div>
      <Sign_in />
    </div>
  );
};

export default App;

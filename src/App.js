// src/App.js
import React from 'react';
import Login from './components/Login/Login';
import Header from './components/Header/Header';
import Footer from './components/Footer/Footer';
import 'bootstrap/dist/css/bootstrap.min.css';


function App() {
  return (
    <div className="App">
       <Header />
        <Login />
        <Footer />
    </div>
  );
}

export default App;

import { useState, useEffect } from 'react';
import Login from './Login';
import StudentCabinet from './cabinets/StudentCabinet';
import ProctorCabinet from './cabinets/ProctorCabinet';
import AdminCabinet from './cabinets/AdminCabinet';
import ExaminatorCabinet from './cabinets/ExaminatorCabinet';
import SupervisorCabinet from './cabinets/SupervisorCabinet';
import './App.css'
import TestCreate from './cabinets/AdminFunctions/Tests/TestCreate';
import Tests from './cabinets/StudentFunctions/Tests';
function App() {
  
  return (
    <>
    <TestCreate/>
    <Tests/>
    </>
  );
}

export default App;
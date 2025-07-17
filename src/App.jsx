import React from 'react';
import './App.css';
import {Route, Routes} from 'react-router-dom'
import Layout from './components/Layout';
import PostNewProperty from './pages/PostNewProperty';
import {ToastContainer} from 'react-toastify'
import Dashboard from './pages/Dashboard';
import AllProperties from './pages/AllProperties';
import { Navigate } from 'react-router-dom';
import PropertyDetails from './pages/PropertyDetails';
import EditProperty from './pages/EditProperty';

function App() {
   

  return (
    <>
    <div>
      <ToastContainer/>
      <Routes>
            <Route path='/' element={<Layout/>}>
            <Route index element={<Navigate to="dashboard" replace />} />
           <Route path='/post-new-property' element={<PostNewProperty/>}/>
           <Route path='/dashboard' element={<Dashboard/>}/>
           <Route path='/all-properties' element={<AllProperties/>}/>
           <Route path='/property-detail/:id' element={<PropertyDetails/>} />
           <Route path='/edit-property/:id' element={<EditProperty/>} />
            
           </Route>
      </Routes>

      </div>
    </>
  )
}

export default App

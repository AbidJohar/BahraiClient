import React from 'react';
import { 
    FaTachometerAlt, 
    FaUsers, 
    FaDollarSign, 
    FaChartBar, 
    FaAngleLeft, 
    FaHome,
    FaCity,
    FaUser
  } from 'react-icons/fa';
  import { NavLink } from 'react-router-dom';
  
  export default function Sidebar({ isOpen, toggleSidebar }) {
    const navbar = [
      { path: '/dashboard', name: 'Dashboard', Icon: FaTachometerAlt },
      { path: '/post-new-property', name: 'Post New Property', Icon: FaUser },
      { path: '/all-properties', name: 'All Properties', Icon: FaCity },
      // { path: '/user-management', name: 'User Management', Icon: FaUsers },
      // { path: '/setting', name: 'Setting', Icon: FaDollarSign },
      // { path: '/reports', name: 'Reports', Icon: FaChartBar },
    ];
  
    return (
      <div
        className={`bg-gradient-to-r from-[#000000] via-[#203a43] to-[#619eb9] relative text-white h-full shadow-xl transition-all duration-500 ease-in-out ${
          isOpen ? 'w-48' : 'w-0'
        }`}
       
      >
        <div
          className={`p-3 transition-opacity duration-300 ${
            isOpen ? 'opacity-100' : 'opacity-0'
          }`}
        >
          {/* Logo & Title */}
          <div className="flex items-end justify-center mb-8">
            <FaHome className="w-10 h-10 mr-2 text-indigo-300" />
            {isOpen && <h2 className="text-xl font-bold">Real Estate</h2>}
          </div>
  
          {/* Navigation Links */}
          <nav className="space-y-2">
            {navbar.map((item, index) => (
              <NavLink
                key={index}
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center px-2 py-2  rounded-sm transition-colors ${
                    isActive ? 'bg-indigo-600  text-white pl-3' : 'hover:bg-gray-600'
                  }`
                }
              >
                <item.Icon className="w-4 h-4 mr-2" />
                {isOpen && <span className="whitespace-nowrap text-sm">{item.name}</span>}
              </NavLink>
            ))}
          </nav>
        </div>
  
        {/* Toggle Button */}
        <button
          onClick={toggleSidebar}
          className="absolute -right-5 top-1/2 transform -translate-y-1/2 bg-black/90 text-white w-5 h-10 rounded-r-full flex items-center justify-center shadow-md"
        >
          <FaAngleLeft
            className={`w-5 h-5 transform transition-transform ${
              isOpen ? 'rotate-180' : ''
            }`}
          />
        </button>
      </div>
    );
  }
  
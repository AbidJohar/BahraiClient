import React from "react";
// src/components/Header.jsx
export default function Header() {
    return (
      <main>
      <header className=" relative w-full  bg-[#0a0f1c]/80 backdrop-blur-md text-white shadow-black/20 ">
        <div className="max-w-7xl mx-auto py-4 px-4 flex justify-between items-center">
          <div className="flex items-center">
            <h1 className="text-lg font-semibold">Real State Dashboard</h1>
          </div>
          <div className="flex items-center">
            <input
              type="search"
              placeholder="Search here..."
              className="px-3 py-1 border text-white placeholder-white rounded-md mr-4"
            />
            <div className="h-8 w-8 rounded-full bg-indigo-600 flex items-center justify-center">
              <span className="text-white">AH</span>
            </div>
          </div>
        </div>
      </header>
      </main>
    )
  }
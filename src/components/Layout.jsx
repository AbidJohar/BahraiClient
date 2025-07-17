import React, { useRef } from "react";
import { useState } from "react";
import Header from "./Header";
import Sidebar from "./Sidebar"; // Assuming typo is fixed
import { Outlet } from "react-router-dom";
import ScrollToTop from "./ScrollToTop";

export default function Layout() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const mainRef = useRef();

  const toggleSidebar = () => {
    setIsSidebarOpen((prev) => !prev);
  };

  return (
    <>
    <ScrollToTop scrollRef = {mainRef}/>
    <div className="flex h-screen">
      {/* Sidebar container */}
      <Sidebar isOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />

      {/* Main content container */}
      <div className="flex-1 flex flex-col">
        <Header />
        <main ref={mainRef} className="flex-1 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
    </>
  );
}
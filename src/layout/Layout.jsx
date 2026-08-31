// Components/layout/Layout.js
import { Outlet } from "react-router-dom";
import Header from "../components/Header";
import Sidebar from "../components/Sidebar";

const Layout = () => {
  return (
    <div className="flex flex-col h-screen">
      {/* Top Header */}
      <Header />

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <Sidebar />

        {/* Main Content */}
        <main className="flex-1 p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Layout;

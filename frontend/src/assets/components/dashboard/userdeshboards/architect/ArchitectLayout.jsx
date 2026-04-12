import React, { useState } from "react";
import { Outlet } from "react-router-dom";
import ArchitectSidebar from "./ArchitectSidebar";
import ArchitectHeader from "./ArchitectHeader";
import "./technical_studio.css";

const ArchitectLayout = () => {
    const [collapsed, setCollapsed] = useState(false);

    return (
        <div className="architect-studio-root flex min-h-screen font-sans selection:bg-[#ff5c00]/30 selection:text-white">
            <ArchitectSidebar collapsed={collapsed} setCollapsed={setCollapsed} />
            <div className="flex-1 flex flex-col overflow-hidden architect-grid-bg relative">
                {/* Background Glows */}
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-[#ff5c00]/5 rounded-full blur-[120px] pointer-events-none"></div>
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-500/5 rounded-full blur-[120px] pointer-events-none"></div>

                <ArchitectHeader />
                <main className="flex-1 overflow-x-hidden overflow-y-auto relative z-10">
                    <div className="max-w-[1600px] mx-auto">
                        <Outlet />
                    </div>
                </main>
            </div>
        </div>
    );
};

export default ArchitectLayout;

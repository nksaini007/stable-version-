import React, { useState } from "react";
import { Outlet } from "react-router-dom";
import ArchitectSidebar from "./ArchitectSidebar";

const ArchitectLayout = () => {
    const [collapsed, setCollapsed] = useState(false);

    return (
        <div className="flex bg-[#0f172a] min-h-screen font-sans">
            <ArchitectSidebar collapsed={collapsed} setCollapsed={setCollapsed} />
            <div className="flex-1 flex flex-col overflow-hidden">
                <main className="flex-1 overflow-x-hidden overflow-y-auto bg-[#0f172a]">
                    <Outlet />
                </main>
            </div>
        </div>
    );
};

export default ArchitectLayout;

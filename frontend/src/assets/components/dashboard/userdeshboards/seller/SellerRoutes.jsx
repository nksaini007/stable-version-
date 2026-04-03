import React from "react";
import { Routes, Route } from "react-router-dom";
import SellerLayout from "./SellerLayout";
import SellerHome from "./pages/SellerHome";
import SellerProducts from "./pages/SellerProducts";
import SellerOrdersPage from "./pages/SellerOrdersPage";
import SellerPayments from "./pages/SellerPayments";
import SellerAds from "./pages/SellerAds";
import SellerSettings from "./pages/SellerSettings";
import SellerReturns from "./pages/SellerReturns";

const SellerRoutes = () => {
    return (
        <Routes>
            <Route path="/seller" element={<SellerLayout />}>
                <Route index element={<SellerHome />} />
                <Route path="products" element={<SellerProducts />} />
                <Route path="orders" element={<SellerOrdersPage />} />
                <Route path="payments" element={<SellerPayments />} />
                <Route path="ads" element={<SellerAds />} />
                <Route path="returns" element={<SellerReturns />} />
                <Route path="settings" element={<SellerSettings />} />
            </Route>
        </Routes>
    );
};

export default SellerRoutes;

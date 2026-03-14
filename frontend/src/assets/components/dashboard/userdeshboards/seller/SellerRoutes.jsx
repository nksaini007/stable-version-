import React from "react";
import { Routes, Route } from "react-router-dom";
import SellerLayout from "./SellerLayout";
import SellerHome from "./pages/SellerHome";
import SellerProducts from "./pages/SellerProducts";
import SellerOrdersPage from "./pages/SellerOrdersPage";
import SellerPayments from "./pages/SellerPayments";
import SellerAds from "./pages/SellerAds";

const SellerRoutes = () => {
    return (
        <Routes>
            <Route path="/seller" element={<SellerLayout />}>
                <Route index element={<SellerHome />} />
                <Route path="products" element={<SellerProducts />} />
                <Route path="orders" element={<SellerOrdersPage />} />
                <Route path="payments" element={<SellerPayments />} />
            </Route>
        </Routes>
    );
};

export default SellerRoutes;

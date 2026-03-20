import React from "react";
import { Routes, Route } from "react-router-dom";

import AdminLayout from "../layout/AdminLayout";

import AdminHome from "../pages/AdminHome";
import UserManagement from "../pages/UserManagement";
import ProductManagement from "../pages/ProductManagement";
import OrderManagement from "../pages/OrderManagement";
import PaymentManagement from "../pages/PaymentManagement";
import DeliveryManagement from "../pages/DeliveryManagement";
import CommunityPosts from "../pages/CommunityPosts";
import ServiceManagement from "../pages/ServiceManagement";
import BookingManagement from "../pages/BookingManagement";
import ConstructionProjects from "../pages/ConstructionProjects";
import ManageProject from "../pages/ManageProject";
import ManagePlans from "../pages/ManagePlans";
import AdminPlanCategoryDashboard from "../pages/AdminPlanCategoryDashboard";
import AdminMessages from "../pages/AdminMessages";
import AdminUserMap from "../pages/AdminUserMap";
import AdminAnalytics from "../pages/AdminAnalytics";
import AdminSiteConfig from "../pages/AdminSiteConfig";
import AdminMaterials from "../pages/AdminMaterials";
import AdminSupport from "../pages/AdminSupport";
import AdminAdCampaigns from "../pages/AdminAdCampaigns";
import AdminDeliveryPricing from "../pages/AdminDeliveryPricing";
import AdminPricingControl from "../pages/AdminPricingControl";
import AdminQuotations from "../pages/AdminQuotations";

/**
 * Admin sub-router — rendered inside <Route path="/admin/*"> in App.jsx.
 * React Router v6 nested <Routes> receives the REMAINING path after "/admin/"
 * so all paths here must be RELATIVE (no leading /admin prefix).
 * Use a pathless Route as a layout wrapper.
 */
const AdminRoutes = () => {
  return (
    <Routes>
      {/* Pathless Route = layout wrapper — renders AdminLayout + Outlet for all children */}
      <Route element={<AdminLayout />}>
        <Route index element={<AdminHome />} />
        <Route path="users" element={<UserManagement />} />
        <Route path="products" element={<ProductManagement />} />
        <Route path="orders" element={<OrderManagement />} />
        <Route path="services" element={<ServiceManagement />} />
        <Route path="bookings" element={<BookingManagement />} />
        <Route path="delivery" element={<DeliveryManagement />} />
        <Route path="delivery-pricing" element={<AdminDeliveryPricing />} />
        <Route path="posts" element={<CommunityPosts />} />
        <Route path="payments" element={<PaymentManagement />} />
        <Route path="construction" element={<ConstructionProjects />} />
        <Route path="construction/:projectId" element={<ManageProject />} />
        <Route path="plan-categories" element={<AdminPlanCategoryDashboard />} />
        <Route path="plans" element={<ManagePlans />} />
        <Route path="messages" element={<AdminMessages />} />
        <Route path="user-map" element={<AdminUserMap />} />
        <Route path="analytics" element={<AdminAnalytics />} />
        <Route path="site-config" element={<AdminSiteConfig />} />
        <Route path="materials" element={<AdminMaterials />} />
        <Route path="support" element={<AdminSupport />} />
        <Route path="ad-campaigns" element={<AdminAdCampaigns />} />
        <Route path="pricing-control" element={<AdminPricingControl />} />
        <Route path="quotations" element={<AdminQuotations />} />
      </Route>
    </Routes>
  );
};

export default AdminRoutes;

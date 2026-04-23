
import React from "react";
import { Routes, Route } from "react-router-dom";
import { CartProvider } from "./assets/context/CartContext";
import { AuthProvider } from "./assets/context/AuthContext";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// Components
import ScrollToTop from "./assets/components/ScrollToTop";
import HomePage from "./assets/components/Home";
import CommunityFeed from "./assets/components/CommunityFeed";
import SinglePost from "./assets/components/SinglePost";
import SellerShop from "./assets/components/SellerShop";
import Login from "./assets/components/Login";
import Signup from "./assets/components/Signup";
import PartnerSignup from "./assets/components/PartnerSignup";
import ForgotPassword from "./assets/components/ForgotPassword";
import Profile from "./assets/components/Profile";
import Contact from "./assets/components/contact/Contact";
import Cart from "./assets/components/Cart";
import NotFound404 from "./assets/components/NotFound404";
import CustomerLanding from "./assets/components/CustomerLanding";
import CustomerConstruction from "./assets/components/CustomerConstruction";
import PlanCategoriesList from "./assets/components/PlanCategoriesList";
import PlanTypesList from "./assets/components/PlanTypesList";
import ProjectPlansCatalog from "./assets/components/ProjectPlansCatalog";
import ProjectPlanDetails from "./assets/components/ProjectPlanDetails";
import CustomerInquiries from "./assets/components/dashboard/CustomerInquiries";
import CustomerSupport from "./assets/components/dashboard/CustomerSupport";
import PublicProjectPage from "./assets/components/PublicProjectPage";

// Product & Category
import CategoryPage from "./assets/components/CategoryPage";
import ItemPage from "./assets/components/ItemPage";
import ItemList from "./assets/components/ItemList";
import ProductPage from "./assets/components/ProductPage";
// Product Page import already handled or not needed here
// Dashboards
import Dashboardloader from "./assets/components/dashboard/Dashboardloader";
import SellerOrders from "./assets/components/dashboard/order/SellerOrders";

// Admin
import AdminProtectedRoute from "./assets/components/dashboard/userdeshboards/admin/routes/AdminProtectedRoute";
import AdminRoutes from "./assets/components/dashboard/userdeshboards/admin/routes/AdminRoutes";

// Seller
import SellerRoutes from "./assets/components/dashboard/userdeshboards/seller/SellerRoutes";
import AdminGate from "./assets/components/AdminGate";
import ProtectedRoute from "./assets/components/dashboard/userdeshboards/ProtectedRoute";

// Delivery
import DeliveryLayout from "./assets/components/dashboard/userdeshboards/delivery/DeliveryLayout";
import DeliveryDashboard from "./assets/components/dashboard/DeliveryDashboard";

// Provider
import ProviderLayout from "./assets/components/dashboard/userdeshboards/provider/ProviderLayout";
import ProviderHome from "./assets/components/dashboard/userdeshboards/provider/pages/ProviderHome";
import ProviderServices from "./assets/components/dashboard/userdeshboards/provider/pages/ProviderServices";
import ProviderBookings from "./assets/components/dashboard/userdeshboards/provider/pages/ProviderBookings";
import ProviderEarnings from "./assets/components/dashboard/userdeshboards/provider/pages/ProviderEarnings";

// Architect
import ArchitectLayout from "./assets/components/dashboard/userdeshboards/architect/ArchitectLayout";
import ArchitectDashboard from "./assets/components/dashboard/userdeshboards/architect/pages/ArchitectDashboard";
import ArchitectWork from "./assets/components/dashboard/userdeshboards/architect/pages/ArchitectWork";
import ArchitectLabor from "./assets/components/dashboard/userdeshboards/architect/pages/ArchitectLabor";
import ArchitectMaterials from "./assets/components/dashboard/userdeshboards/architect/pages/ArchitectMaterials";
import ArchitectSupport from "./assets/components/dashboard/userdeshboards/architect/pages/ArchitectSupport";
import ArchitectActiveProjectDetails from "./assets/components/dashboard/userdeshboards/architect/pages/ArchitectActiveProjectDetails";
import ArchitectWorkforce from "./assets/components/dashboard/userdeshboards/architect/pages/ArchitectWorkforce"; // ✅ Add Architect Workforce
import ArchitectOffice from "./assets/components/dashboard/userdeshboards/architect/pages/ArchitectOffice";
import ArchitectCustomRequests from "./assets/components/dashboard/userdeshboards/architect/pages/ArchitectCustomRequests";
import ArchitectOrders from "./assets/components/dashboard/userdeshboards/architect/pages/ArchitectOrders";
import ArchitectQuotations from "./assets/components/dashboard/userdeshboards/architect/pages/ArchitectQuotations";
import ArchitectPartnerLayout from "./assets/components/dashboard/userdeshboards/architectPartner/ArchitectPartnerLayout";
import PartnerDashboard from "./assets/components/dashboard/userdeshboards/architectPartner/PartnerDashboard";
import CustomerLayout from "./assets/components/dashboard/userdeshboards/customer/CustomerLayout";
import CustomerOverview from "./assets/components/dashboard/userdeshboards/customer/pages/CustomerOverview";
import CustomerOrders from "./assets/components/dashboard/userdeshboards/customer/pages/CustomerOrders";
import CustomerProfile from "./assets/components/dashboard/userdeshboards/customer/pages/CustomerProfile";
import CustomerWishlist from "./assets/components/dashboard/userdeshboards/customer/pages/CustomerWishlist";
import CustomerSupportPage from "./assets/components/dashboard/userdeshboards/customer/pages/CustomerSupport";
import MyQuotations from "./assets/components/dashboard/userdeshboards/customer/pages/MyQuotations";
const CustomerServices = React.lazy(() => import("./assets/components/dashboard/userdeshboards/customer/pages/CustomerServices"));

import PublicArchitectProfile from "./assets/components/PublicArchitectProfile";
import PublicServiceProfile from "./assets/components/PublicServiceProfile";

const ServiceCategories = React.lazy(() => import("./assets/components/ServiceCategories"));
const ServiceSubCategories = React.lazy(() => import("./assets/components/ServiceSubCategories"));
const ServiceSearch = React.lazy(() => import("./assets/components/ServiceSearch"));
const ServiceDetails = React.lazy(() => import("./assets/components/ServiceDetails"));

import ComingSoon from "./assets/components/ComingSoon";

function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <ScrollToTop />

        <React.Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-slate-50"><div className="w-8 h-8 border-4 border-slate-200 border-t-slate-900 rounded-full animate-spin"></div></div>}>
          <Routes>
          {/* Public Routes */}
          <Route path="/" element={<HomePage />} />
          <Route path="/architect/:id" element={<PublicArchitectProfile />} />
          <Route path="/service-profile/:id" element={<PublicServiceProfile />} />
          <Route path="/home" element={<HomePage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/partner-signup" element={<PartnerSignup />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/cart" element={<Cart />} />
          {/* <Route path="/customer-landing" element={<CustomerLanding />} /> */}
          <Route path="/customer-landing" element={<ComingSoon />} />
          {/* <Route path="/my-construction" element={<CustomerConstruction />} /> */}
          <Route path="/my-construction" element={<ComingSoon />} />
          <Route path="/my-inquiries" element={<CustomerInquiries />} />
          <Route path="/support" element={<CustomerSupport />} />

          {/* Construction Plans 3-Step Funnel */}
          {/* <Route path="/project-categories" element={<PlanCategoriesList />} />
          <Route path="/project-categories/:categoryName" element={<PlanTypesList />} />
          <Route path="/project-categories/:categoryName/:planTypeName" element={<ProjectPlansCatalog />} />
          <Route path="/project-plans/:id" element={<ProjectPlanDetails />} /> */}
          <Route path="/project-categories" element={<ComingSoon />} />
          <Route path="/project-categories/:categoryName" element={<ComingSoon />} />
          <Route path="/project-categories/:categoryName/:planTypeName" element={<ComingSoon />} />
          <Route path="/project-plans/:id" element={<ComingSoon />} />

          {/* Default old route mapped to the start of funnel just in case */}
          {/* <Route path="/project-plans" element={<PlanCategoriesList />} /> */}
          <Route path="/project-plans" element={<ComingSoon />} />

          <Route path="/community" element={<CommunityFeed />} />
          <Route path="/community/post/:slug" element={<SinglePost />} />
          {/* <Route path="/services" element={<ServiceCategories />} />
          <Route path="/services/:categoryId" element={<ServiceSubCategories />} />
          <Route path="/services/:categoryId/:subCategoryId" element={<ServiceSearch />} />
          <Route path="/service/:id" element={<ServiceDetails />} /> */}
          <Route path="/services" element={<ComingSoon />} />
          <Route path="/services/:categoryId" element={<ComingSoon />} />
          <Route path="/services/:categoryId/:subCategoryId" element={<ComingSoon />} />
          <Route path="/service/:id" element={<ComingSoon />} />
          <Route path="/project-showcase/:id" element={<PublicProjectPage />} />

          {/* Product / Category */}
          {/* <Route path="/category/:categoryName" element={<CategoryPage />} />
          <Route path="/category/:categoryName/:itemName" element={<ItemPage />} />
          <Route
            path="/category/:categoryName/:itemName/:itemList"
            element={<ItemList />}
          />
          <Route
            path="/category/:categoryName/:itemName/:itemList/:productId"
            element={<ProductPage />}
          />
          <Route path="/product/:productId" element={<ProductPage />} /> */}
          <Route path="/category/:categoryName" element={<ComingSoon />} />
          <Route path="/category/:categoryName/:itemName" element={<ComingSoon />} />
          <Route
            path="/category/:categoryName/:itemName/:itemList"
            element={<ComingSoon />}
          />
          <Route
            path="/category/:categoryName/:itemName/:itemList/:productId"
            element={<ComingSoon />}
          />
          <Route path="/product/:productId" element={<ComingSoon />} />

          {/* Product Shop Routes */}
          <Route path="/shop/:id" element={<SellerShop />} />

          {/* User / Seller Dashboard Dropback */}
          <Route path="/dashboard" element={<Dashboardloader />} />
          <Route path="/orders" element={<SellerOrders />} />

          {/* Customer Dashboard Routes */}
          <Route path="/dashboard/customer" element={<CustomerLayout />}>
            <Route index element={<CustomerOverview />} />
            <Route path="orders" element={<CustomerOrders />} />
            <Route path="profile" element={<CustomerProfile />} />
            <Route path="wishlist" element={<CustomerWishlist />} />
            <Route path="support" element={<CustomerSupportPage />} />
            <Route path="quotations" element={<MyQuotations />} />
            <Route path="services" element={<CustomerServices />} />
          </Route>

          {/* Seller Dashboard Routes */}
          <Route path="/seller/*" element={<SellerRoutes />} />

          {/* Delivery Dashboard Routes */}
          <Route path="/delivery" element={<DeliveryLayout />}>
            <Route index element={<DeliveryDashboard />} />
            <Route path="*" element={<DeliveryDashboard />} />
          </Route>

          {/* Provider Dashboard Routes */}
          <Route path="/provider" element={<ProviderLayout />}>
            <Route index element={<ProviderHome />} />
            <Route path="services" element={<ProviderServices />} />
            <Route path="bookings" element={<ProviderBookings />} />
            <Route path="earnings" element={<ProviderEarnings />} />
          </Route>

          {/* Architect Panel Routes */}
          <Route path="/architect/*" element={
            <ProtectedRoute allowedRoles={["architect"]}>
              <ArchitectLayout />
            </ProtectedRoute>
          }>
            <Route index element={<ArchitectDashboard />} />
            <Route path="project/:projectId" element={<ArchitectActiveProjectDetails />} />
            <Route path="work" element={<ArchitectWork />} />
            <Route path="labor" element={<ArchitectLabor />} />
            <Route path="workforce" element={<ArchitectWorkforce />} />
            <Route path="materials" element={<ArchitectMaterials />} />
            <Route path="support" element={<ArchitectSupport />} />
            <Route path="office" element={<ArchitectOffice />} />
            <Route path="custom-requests" element={<ArchitectCustomRequests />} />
            <Route path="orders" element={<ArchitectOrders />} />
            <Route path="quotations" element={<ArchitectQuotations />} />
          </Route>

          {/* =======================
              ARCHITECT PARTNER DASHBOARD 
          ======================== */}
          <Route path="/architect-partner" element={<ArchitectPartnerLayout />}>
            <Route index element={<PartnerDashboard />} />
          </Route>

          {/* Admin Routes Protected */}
          <Route element={<AdminProtectedRoute />}>
            <Route path="/admin/*" element={<AdminRoutes />} />
          </Route>

          {/* 🔐 Hidden Admin Gate — Secret URL, not linked anywhere */}
          <Route path="/portal-x9k2" element={<AdminGate />} />

          {/* 404 */}
          <Route path="*" element={<NotFound404 />} />
        </Routes>
        </React.Suspense>

        <ToastContainer
          position="top-right"
          autoClose={3000}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="colored"
        />
      </CartProvider>
    </AuthProvider>
  );
}

export default App;

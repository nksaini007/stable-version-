import React, { useContext } from 'react'
import { Navigate } from 'react-router-dom'
import AdminDashboard from './userdeshboards/admin/layout/AdminDashboard'
import ConsumerDashboard from './ConsumerDashboard'
import DeliveryDashboard from './DeliveryDashboard'
import SellerDashboard from './SellerDashboard'
import { AuthContext } from '../../context/AuthContext'





const Dashboardloader = () => {
  const { user } = useContext(AuthContext);

  if (!user) return <Navigate to="/login" replace />;

  switch (user.role) {
    case "admin":
      return <Navigate to="/admin" replace />;
    case "seller":
    case "teacher":
      return <Navigate to="/seller" replace />;
    case "delivery":
      return <Navigate to="/delivery" replace />;
    case "provider":
      return <Navigate to="/provider" replace />;
    default:
      return <Navigate to="/customer" replace />;
  }

}





export default Dashboardloader

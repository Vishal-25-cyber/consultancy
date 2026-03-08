import { useState } from 'react';
import AdminLayout from '../components/AdminLayout';
import DashboardView from '../components/admin/DashboardView';
import OrdersView from '../components/admin/OrdersView';
import AnalyticsView from '../components/admin/AnalyticsView';
import InventoryView from '../components/admin/InventoryView';
import ReportsView from '../components/admin/ReportsView';
import CustomersView from '../components/admin/CustomersView';

export default function SuperstoreAdmin() {
  const [activeTab, setActiveTab] = useState('dashboard');

  const renderView = () => {
    switch (activeTab) {
      case 'dashboard':
        return <DashboardView />;
      case 'orders':
        return <OrdersView />;
      case 'analytics':
        return <AnalyticsView />;
      case 'inventory':
        return <InventoryView />;
      case 'reports':
        return <ReportsView />;
      case 'customers':
        return <CustomersView />;
      default:
        return <DashboardView />;
    }
  };

  return (
    <AdminLayout activeTab={activeTab} setActiveTab={setActiveTab}>
      {renderView()}
    </AdminLayout>
  );
}

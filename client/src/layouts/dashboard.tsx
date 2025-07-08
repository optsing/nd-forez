import { Outlet } from 'react-router';
import { DashboardLayout } from '@toolpad/core/DashboardLayout';
import ToolbarActions from '../components/toolbar-actions';


export default function Layout() {
  return (
    <DashboardLayout
      defaultSidebarCollapsed
      slots={{
        toolbarActions: ToolbarActions,
      }}
    >
      <Outlet />
    </DashboardLayout>
  );
}

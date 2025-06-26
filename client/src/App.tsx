import { Api, AreaChart } from '@mui/icons-material';
import { Outlet } from 'react-router';
import { ReactRouterAppProvider } from '@toolpad/core/react-router';
import type { Navigation, Branding } from '@toolpad/core/AppProvider';
import Logo from './components/logo';

const NAVIGATION: Navigation = [
  {
    title: 'Анализ',
    icon: <AreaChart />,
  },
  {
    title: 'API',
    icon: <Api />,
    segment: 'api-doc',
  }
];

const BRANDING: Branding = {
  title: '',
  logo: <Logo />,
};

export default function App() {
  return (
    <ReactRouterAppProvider navigation={NAVIGATION} branding={BRANDING} >
      <Outlet />
    </ReactRouterAppProvider>
  );
}

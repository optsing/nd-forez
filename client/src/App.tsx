import { Api, AreaChart, History } from '@mui/icons-material';
import { Outlet } from 'react-router';
import { ReactRouterAppProvider } from '@toolpad/core/react-router';
import type { Navigation, Branding } from '@toolpad/core/AppProvider';
import Logo from './components/logo';
import { AlertProvider } from './context/alert-context';

const NAVIGATION: Navigation = [
  {
    title: 'Анализ',
    icon: <AreaChart />,
  },
  {
    title: 'Недавние',
    icon: <History />,
    segment: 'recent',
  },
  {
    title: 'API',
    icon: <Api />,
    segment: 'api-doc',
  }
];

const BRANDING: Branding = {
  title: 'НД Форез',
  logo: <Logo />,
};

export default function App() {
  return (
    <ReactRouterAppProvider navigation={NAVIGATION} branding={BRANDING} >
      <AlertProvider>
        <Outlet />
      </AlertProvider>
    </ReactRouterAppProvider>
  );
}

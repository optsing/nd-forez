import { ApiTwoTone, AreaChartTwoTone, HistoryTwoTone } from '@mui/icons-material';
import { Outlet } from 'react-router';
import { ReactRouterAppProvider } from '@toolpad/core/react-router';
import type { Navigation, Branding, AppTheme } from '@toolpad/core/AppProvider';
import Logo from './components/logo';
import { AlertProvider } from './context/alert-context';
import { createTheme } from '@mui/material/styles';

const NAVIGATION: Navigation = [
  {
    title: 'Анализ',
    icon: <AreaChartTwoTone />,
  },
  {
    title: 'Недавние',
    icon: <HistoryTwoTone />,
    segment: 'recent',
  },
  {
    title: 'API',
    icon: <ApiTwoTone />,
    segment: 'api-doc',
  }
];

const BRANDING: Branding = {
  title: 'НД Форез',
  logo: <Logo />,
};

const theme: AppTheme = createTheme({
  cssVariables: {
    colorSchemeSelector: 'data-toolpad-color-scheme',
  },
  defaultColorScheme: 'light',
  colorSchemes: { light: {
    palette: {
      background: {
        default: '#f5f5f5',
      },
    },
  }, dark: true },
});

export default function App() {
  return (
    <ReactRouterAppProvider navigation={NAVIGATION} branding={BRANDING} theme={theme}>
      <AlertProvider>
        <Outlet />
      </AlertProvider>
    </ReactRouterAppProvider>
  );
}

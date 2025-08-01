import { ApiTwoTone, AreaChartTwoTone, HistoryTwoTone } from '@mui/icons-material';
import { Outlet } from 'react-router';
import { ReactRouterAppProvider } from '@toolpad/core/react-router';
import type { Navigation, Branding, AppTheme } from '@toolpad/core/AppProvider';
import { createTheme } from '@mui/material/styles';

import Logo from './components/logo';
import { AlertProvider } from './context/alert-context';
import { AppSettingsProvider } from './context/app-settings-context';

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
  },
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
  colorSchemes: {
    light: {
      palette: {
        background: {
          default: '#f5f5f5',
        },
      },
    }, dark: {
      palette: {
        background: {
          default: '#0a0a0a',
        }
      }
    }
  },
});

export default function App() {
  return (
    <ReactRouterAppProvider navigation={NAVIGATION} branding={BRANDING} theme={theme}>
      <AppSettingsProvider>
        <AlertProvider>
          <Outlet />
        </AlertProvider>
      </AppSettingsProvider>
    </ReactRouterAppProvider>
  );
}

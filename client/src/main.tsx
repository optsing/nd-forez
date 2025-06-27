import "@fontsource/roboto";

import * as React from 'react';
import * as ReactDOM from 'react-dom/client';
import { createBrowserRouter, RouterProvider } from 'react-router';
import App from './App';
import Layout from './layouts/dashboard';
import OpenAPIPage from './pages/openapi';
import RecentPage from "./pages/recent";


const router = createBrowserRouter([
  {
    Component: App,
    children: [
      {
        path: '/',
        Component: Layout,
        children: [
          {
            path: '/',
            Component: React.lazy(() => import('./pages/ndfarez')),
          },
          {
            path: '/recent',
            Component: RecentPage,
          },
          {
            path: '/api-doc',
            Component: OpenAPIPage,
          },
        ],
      },
    ],
  },
]);

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>,
);

import "@fontsource/roboto";

import * as React from 'react';
import * as ReactDOM from 'react-dom/client';
import { createBrowserRouter, createHashRouter, RouteObject, RouterProvider } from 'react-router';

import App from './App';
import Layout from './layouts/dashboard';

import OpenAPIPage from './pages/openapi';
import RecentPage from "./pages/recent-views";
const NDForezPage = React.lazy(() => import('./pages/nd-forez'));

const routes: RouteObject[] = [
  {
    Component: App,
    children: [
      {
        path: '/',
        Component: Layout,
        children: [
          {
            path: '/',
            Component: NDForezPage,
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
];

const router = import.meta.env.VITE_ROUTER_MODE === 'hash' ? createHashRouter(routes) : createBrowserRouter(routes);

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>,
);

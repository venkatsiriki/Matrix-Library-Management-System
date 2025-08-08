import React from 'react';
import LandingPage from './views/landing';
import { MdHome } from 'react-icons/md';

const landingRoutes = [
  {
    name: 'Landing',
    layout: '/',
    path: '',
    icon: <MdHome className="h-6 w-6" />,
    component: <LandingPage />,
  },
];

export default landingRoutes;
import React from 'react';
 import { IncomingOrders } from './IncomingOrders';
import { TypesOrders } from './TypesOrders';
import { Products } from './Products';
import { Users } from './Users';
import { Settings } from './Settings';

interface NavigationMenuProps {
  activeTab: string;
}

export const NavigationMenu: React.FC<NavigationMenuProps> = ({ activeTab }) => {
  const renderContent = () => {
    switch (activeTab) {
      case 'incoming':
        return <IncomingOrders />;
      case 'groups':
        return <TypesOrders />;
      case 'products':
        return <Products />;
      case 'users':
        return <Users />;
      case 'settings':
        return <Settings />;
    }
  };

  return renderContent();
};
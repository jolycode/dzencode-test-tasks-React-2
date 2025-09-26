import React from 'react';
import { X, Settings } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ 
  isOpen, 
  onClose, 
  activeTab, 
  onTabChange 
}) => {
  const { t } = useTranslation();

  const menuItems = [
    { id: 'incoming', label: t('navigation.incoming') },
    { id: 'groups', label: t('navigation.groups') },
    { id: 'products', label: t('navigation.products') },
    { id: 'users', label: t('navigation.users') },
    { id: 'settings', label: t('navigation.settings') }
  ];

  return (
    <>
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}
      <aside className={`
        fixed lg:sticky top-0 left-0 z-50 w-56 h-screen bg-white border-r border-gray-200
        transform transition-transform duration-300 ease-in-out lg:translate-x-0
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="flex flex-col h-full">
          <div className="lg:hidden flex justify-end p-4">
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="h-5 w-5 text-gray-600" />
            </button>
          </div>

        <div className="flex flex-col px-4 pt-16">
            <div className="flex justify-center mb-12 relative">
              <div className="relative">
                <img
                  src="https://i.pinimg.com/1200x/bf/d6/b5/bfd6b5ead3e81c7d0ff530a2a6c98de3.jpg"
                  alt="Avatar"
                  className="w-[120px] h-[120px] rounded-full object-cover"
                />
                <div className="absolute bottom-1 right-1 w-8 h-8 bg-white text-gray-800 rounded-full flex items-center justify-center shadow-lg border border-gray-200">
                  <Settings className="w-4 h-4" />
                </div>
              </div>
            </div>
            <nav className="w-full flex justify-center">
              <ul className="space-y-2 w-full max-w-[200px]">
                {menuItems.map((item) => (
                  <li key={item.id}>
                    <button
                      onClick={() => onTabChange(item.id)}
                      className={`
                        w-full flex items-center justify-center px-4 py-3 rounded-lg
                        transition-all duration-200 group relative
                        ${activeTab === item.id 
                          ? 'text-gray-900' 
                          : 'text-gray-700 hover:bg-gray-100'
                        }
                      `}
                    >
                      <span className={`
                        font-medium relative text-center
                        ${activeTab === item.id ? 'border-b-2 border-green-500 pb-1' : ''}
                      `}>
                        {item.label}
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            </nav>
          </div>
        </div>
      </aside>
    </>
  );
};
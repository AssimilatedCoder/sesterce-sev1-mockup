import React from 'react';
import { Link } from 'react-router-dom';

interface Tab {
  id: string;
  label: string;
  icon?: React.ReactNode;
  path: string;
}

interface TabNavigationProps {
  tabs: Tab[];
  activeTab: string;
}

export const TabNavigation: React.FC<TabNavigationProps> = ({
  tabs,
  activeTab,
}) => {
  return (
    <div className="py-3">
      <nav className="flex space-x-4" aria-label="Tabs">
        {tabs.map((tab) => (
          <Link
            key={tab.id}
            to={tab.path}
            className={`
              ${
                activeTab === tab.id
                  ? 'bg-green-500 dark:bg-green-600 text-white shadow-md'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
              }
              px-6 py-3 rounded-xl font-semibold text-sm
              flex items-center space-x-2 transition-all duration-200
              no-underline
            `}
          >
            {tab.icon && <span className="w-5 h-5">{tab.icon}</span>}
            <span>{tab.label}</span>
          </Link>
        ))}
      </nav>
    </div>
  );
};

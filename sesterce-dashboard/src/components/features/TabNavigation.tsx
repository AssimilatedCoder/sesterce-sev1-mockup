import React from 'react';

interface Tab {
  id: string;
  label: string;
  icon?: React.ReactNode;
}

interface TabNavigationProps {
  tabs: Tab[];
  activeTab: string;
  onTabChange: (tabId: string) => void;
}

export const TabNavigation: React.FC<TabNavigationProps> = ({
  tabs,
  activeTab,
  onTabChange,
}) => {
  return (
    <div className="py-1">
      <nav className="flex space-x-4" aria-label="Tabs">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`
              ${
                activeTab === tab.id
                  ? 'bg-gradient-to-r from-brand-600 to-gpu-purple text-white shadow-lg transform scale-105'
                  : 'bg-white dark:bg-dark-surface text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-dark-border hover:shadow-md'
              }
              px-6 py-3 rounded-xl font-medium text-sm
              flex items-center space-x-2 transition-all duration-300
              border border-gray-200 dark:border-dark-border
            `}
          >
            {tab.icon && <span className={`w-5 h-5 ${activeTab === tab.id ? 'animate-pulse' : ''}`}>{tab.icon}</span>}
            <span>{tab.label}</span>
          </button>
        ))}
      </nav>
    </div>
  );
};

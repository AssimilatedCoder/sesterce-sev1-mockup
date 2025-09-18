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
    <div className="py-4">
      <nav className="flex space-x-4" aria-label="Tabs">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`
              ${
                activeTab === tab.id
                  ? 'bg-gradient-to-r from-green-500 to-green-600 text-white shadow-lg transform scale-105'
                  : 'bg-gray-800/50 text-gray-400 hover:bg-gray-800 hover:text-gray-200 hover:shadow-md'
              }
              px-8 py-4 rounded-2xl font-semibold text-sm
              flex items-center space-x-3 transition-all duration-300
              border border-gray-700/50
            `}
          >
            {tab.icon && <span className={`w-5 h-5 ${activeTab === tab.id ? '' : ''}`}>{tab.icon}</span>}
            <span>{tab.label}</span>
            {activeTab === tab.id && (
              <span className="ml-2 w-2 h-2 bg-white rounded-full animate-pulse"></span>
            )}
          </button>
        ))}
      </nav>
    </div>
  );
};

import React, { useState } from 'react';
import { Header } from './components/layout/Header';
import { Container } from './components/layout/Container';
import { TabNavigation } from './components/features/TabNavigation';
import { GrafanaDashboard } from './components/features/GrafanaDashboard';
import { GrafanaDashboardOriginal } from './components/features/GrafanaDashboardOriginal';
import { GPUSuperclusterCalculator } from './components/features/GPUSuperclusterCalculator';
import { Activity, Calculator } from 'lucide-react';

function App() {
  const [activeTab, setActiveTab] = useState('dashboard');

  const tabs = [
    {
      id: 'dashboard',
      label: 'SEV-1 War Room',
      icon: <Activity className="w-5 h-5" />
    },
    {
      id: 'calculator',
      label: 'GPU Supercluster Calculator',
      icon: <Calculator className="w-5 h-5" />
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-dark-bg">
      <Header />
      
      <main className="pt-16">
        {/* Tab Navigation */}
        <div className="bg-white dark:bg-dark-surface border-b border-gray-200 dark:border-dark-border">
          <Container>
            <TabNavigation
              tabs={tabs}
              activeTab={activeTab}
              onTabChange={setActiveTab}
            />
          </Container>
        </div>

        {/* Tab Content */}
        <div className="min-h-screen">
          {activeTab === 'dashboard' && <GrafanaDashboardOriginal />}
          {activeTab === 'calculator' && <GPUSuperclusterCalculator />}
        </div>
      </main>
    </div>
  );
}

export default App;
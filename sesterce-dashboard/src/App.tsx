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
    <div className="min-h-screen bg-gray-50 dark:bg-dark-bg relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-20 right-10 w-96 h-96 bg-gradient-to-br from-brand-100 to-gpu-purple/20 rounded-full blur-3xl opacity-20"></div>
        <div className="absolute bottom-20 left-10 w-96 h-96 bg-gradient-to-tr from-gpu-purple/20 to-brand-100 rounded-full blur-3xl opacity-20"></div>
      </div>
      
      <Header />
      
      <main className="pt-16 relative z-10">
        {/* Tab Navigation */}
        <div className="bg-white/90 dark:bg-dark-surface/90 backdrop-blur-md border-b border-gray-200 dark:border-dark-border sticky top-16 z-40 shadow-sm">
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
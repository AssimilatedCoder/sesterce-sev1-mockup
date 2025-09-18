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
    <div className="min-h-screen bg-gray-900 relative overflow-hidden">
      {/* Background decorative elements - subtle gradients */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-green-500/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-1/4 w-[600px] h-[600px] bg-purple-600/10 rounded-full blur-3xl"></div>
      </div>
      
      <Header />
      
      <main className="pt-20 relative z-10">
        {/* Tab Navigation with dark theme */}
        <div className="bg-gray-900/80 backdrop-blur-md border-b border-gray-800 sticky top-20 z-40">
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
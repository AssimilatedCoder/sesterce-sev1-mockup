import React, { useState } from 'react';
import { Header } from './components/layout/Header';
import { Container } from './components/layout/Container';
import { TabNavigation } from './components/features/TabNavigation';
import { GrafanaDashboard } from './components/features/GrafanaDashboard';
import { GrafanaDashboardOriginal } from './components/features/GrafanaDashboardOriginal';
import GPUSuperclusterCalculatorV5Enhanced from './components/GPUSuperclusterCalculatorV5Enhanced';
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
      label: 'GPU SuperCluster Calculator',
      icon: <Calculator className="w-5 h-5" />
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 relative overflow-hidden">
      {/* Background decorative elements - very subtle */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 right-0 w-96 h-96 bg-green-100/30 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-100/30 rounded-full blur-3xl"></div>
      </div>
      
      <Header />
      
      <main className="pt-16 relative z-10">
        {/* Tab Navigation */}
        <div className="bg-white/90 backdrop-blur-sm border-b border-gray-200 sticky top-16 z-40 shadow-sm">
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
          {activeTab === 'calculator' && <GPUSuperclusterCalculatorV5Enhanced />}
        </div>
      </main>
    </div>
  );
}

export default App;
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Landing from './pages/Landing';
import DocsLayout from './layouts/DocsLayout';
import Introduction from './pages/docs/Introduction';
import ClientsGuide from './pages/docs/ClientsGuide';
import DevelopersGuide from './pages/docs/DevelopersGuide';
import Rules from './pages/docs/Rules';
import FAQ from './pages/docs/FAQ';

import PlatformOverview from './pages/docs/PlatformOverview';
import Contact from './pages/docs/Contact';

import DualDepositEscrow from './pages/docs/architecture/DualDepositEscrow';
import EkycIdentity from './pages/docs/architecture/EkycIdentity';
import SandboxExecution from './pages/docs/architecture/SandboxExecution';
import AiDisputeAssistant from './pages/docs/architecture/AiDisputeAssistant';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-bg-primary text-text-primary selection:bg-purple-500/30">
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/docs" element={<DocsLayout />}>
            <Route index element={<Introduction />} />
            <Route path="overview" element={<PlatformOverview />} />
            <Route path="architecture/escrow" element={<DualDepositEscrow />} />
            <Route path="architecture/ekyc" element={<EkycIdentity />} />
            <Route path="architecture/sandbox" element={<SandboxExecution />} />
            <Route path="architecture/ai-dispute" element={<AiDisputeAssistant />} />
            <Route path="clients-guide" element={<ClientsGuide />} />
            <Route path="developers-guide" element={<DevelopersGuide />} />
            <Route path="rules" element={<Rules />} />
            <Route path="faq" element={<FAQ />} />
            <Route path="contact" element={<Contact />} />
          </Route>
        </Routes>
      </div>
    </Router>
  );
}

export default App;

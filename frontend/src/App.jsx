import { Routes, Route, Navigate } from 'react-router-dom'
import { ThemeProvider } from './contexts/ThemeContext'
import Dashboard from './pages/Dashboard'
import CampaignDetail from './pages/CampaignDetail'
import ContentEditor from './pages/ContentEditor'
import Onboarding from './pages/Onboarding'
import Forensics from './pages/Forensics'
import Analytics from './pages/Analytics'
import CreateContent from './pages/CreateContent'
import PlanCampaign from './pages/PlanCampaign'

function App() {
  return (
    <ThemeProvider>
        <Routes>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/onboarding" element={<Onboarding />} />
          <Route path="/campaigns/new" element={<CampaignDetail />} />
          <Route path="/campaigns/plan" element={<PlanCampaign />} />
          <Route path="/campaigns/:id" element={<CampaignDetail />} />
          <Route path="/content/new" element={<CreateContent />} />
          <Route path="/editor/new" element={<ContentEditor />} />
          <Route path="/editor/:id" element={<ContentEditor />} />
          <Route path="/forensics" element={<Forensics />} />
          <Route path="/analytics" element={<Analytics />} />
        </Routes>
    </ThemeProvider>
  )
}

export default App

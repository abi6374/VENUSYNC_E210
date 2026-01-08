import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { GoogleOAuthProvider } from '@react-oauth/google';
import Welcome from './pages/Welcome';
import ProjectSelection from './pages/ProjectSelection';
import Dashboard from './pages/Dashboard';
import './index.css';

const GOOGLE_CLIENT_ID = "165865923470-8ln09pochdfpco4ge0rced8m0jd9oe4u.apps.googleusercontent.com"; // This should ideally come from env

function App() {
  return (
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <Router>
        <div className="app-container">
          <Routes>
            <Route path="/" element={<Welcome />} />
            <Route path="/projects" element={<ProjectSelection />} />
            <Route path="/dashboard/:projectId" element={<Dashboard />} />
          </Routes>
        </div>
      </Router>
    </GoogleOAuthProvider>
  );
}

export default App;

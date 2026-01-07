import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Welcome from './pages/Welcome';
import ProjectSelection from './pages/ProjectSelection';
import Dashboard from './pages/Dashboard';
import './index.css';

function App() {
  return (
    <Router>
      <div className="app-container">
        <Routes>
          <Route path="/" element={<Welcome />} />
          <Route path="/projects" element={<ProjectSelection />} />
          <Route path="/dashboard/:projectId" element={<Dashboard />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;

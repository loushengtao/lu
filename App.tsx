import React from 'react';
import { HashRouter, Routes, Route } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import CreateTournament from './pages/CreateTournament';
import Registration from './pages/Registration';
import TournamentManager from './pages/TournamentManager';

const App: React.FC = () => {
  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/create" element={<CreateTournament />} />
        <Route path="/register/:id" element={<Registration />} />
        <Route path="/manage/:id" element={<TournamentManager />} />
      </Routes>
    </HashRouter>
  );
};

export default App;

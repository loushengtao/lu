import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAllTournaments } from '../services/storageService';
import { Tournament } from '../types';
import { Button } from '../components/Button';
import { Trophy, Plus, Users, Calendar } from 'lucide-react';

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const [tournaments, setTournaments] = useState<Tournament[]>([]);

  useEffect(() => {
    setTournaments(getAllTournaments());
  }, []);

  return (
    <div className="min-h-screen bg-gray-900 p-6">
      <div className="max-w-6xl mx-auto">
        <header className="flex justify-between items-center mb-10">
          <div>
             <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-pink-400 to-purple-500">
              Tournament Manager
            </h1>
            <p className="text-gray-400 mt-2">Create and manage your Battlegrounds tournaments.</p>
          </div>
          <Button onClick={() => navigate('/create')}>
            <div className="flex items-center gap-2">
              <Plus size={18} /> Create Tournament
            </div>
          </Button>
        </header>

        {tournaments.length === 0 ? (
          <div className="text-center py-20 bg-gray-800/30 rounded-xl border border-gray-700 border-dashed">
            <Trophy className="mx-auto text-gray-600 mb-4" size={48} />
            <h3 className="text-xl font-medium text-gray-300">No tournaments yet</h3>
            <p className="text-gray-500 mt-2 mb-6">Start by creating your first tournament</p>
            <Button variant="secondary" onClick={() => navigate('/create')}>Create Now</Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {tournaments.map((t) => (
              <div key={t.id} className="bg-gray-800 rounded-xl border border-gray-700 hover:border-pink-500/50 transition-colors p-6 shadow-xl relative group">
                <div className="flex justify-between items-start mb-4">
                  <div className={`px-2 py-1 text-xs font-bold uppercase tracking-wide rounded ${
                    t.status === 'active' ? 'bg-green-500/20 text-green-400' : 
                    t.status === 'completed' ? 'bg-blue-500/20 text-blue-400' :
                    'bg-yellow-500/20 text-yellow-400'
                  }`}>
                    {t.status}
                  </div>
                  <span className="text-xs text-gray-500">{new Date(t.createdAt).toLocaleDateString()}</span>
                </div>
                <h3 className="text-xl font-bold text-white mb-2 truncate">{t.name}</h3>
                <p className="text-gray-400 text-sm mb-6 line-clamp-2 h-10">{t.description}</p>
                
                <div className="flex items-center gap-4 text-sm text-gray-500 mb-6">
                  <div className="flex items-center gap-1">
                    <Users size={14} />
                    <span>{t.players.length} Players</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Calendar size={14} />
                    <span>{t.totalRounds} Rounds</span>
                  </div>
                </div>

                <div className="flex gap-2">
                   {t.status === 'registration' && (
                       <Button variant="secondary" className="flex-1 text-sm" onClick={() => navigate(`/register/${t.id}`)}>
                           Link
                       </Button>
                   )}
                   <Button className="flex-1 text-sm" onClick={() => navigate(`/manage/${t.id}`)}>
                    Manage
                   </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;

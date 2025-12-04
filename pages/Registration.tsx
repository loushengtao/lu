import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getTournament, registerPlayer } from '../services/storageService';
import { Tournament } from '../types';
import { Button } from '../components/Button';
import { AlertCircle, CheckCircle, Info } from 'lucide-react';

const Registration: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [tournament, setTournament] = useState<Tournament | undefined>(undefined);
  const [nickname, setNickname] = useState('');
  const [gameId, setGameId] = useState('');
  const [loading, setLoading] = useState(true);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    if (id) {
      const t = getTournament(id);
      setTournament(t);
      setLoading(false);
    }
  }, [id]);

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    if (!tournament || !id) return;
    setError('');

    if (!nickname.trim() || !gameId.trim()) {
        setError('Please fill in all required fields.');
        return;
    }

    const result = registerPlayer(id, nickname, gameId);
    if (result) {
        setSuccess(true);
        const updated = getTournament(id);
        setTournament(updated);
        setNickname('');
        setGameId('');
    } else {
        setError('Registration failed. Name or Game ID might already be taken.');
    }
  };

  if (loading) return <div className="min-h-screen bg-gray-900 flex items-center justify-center text-white">Loading...</div>;
  if (!tournament) return <div className="min-h-screen bg-gray-900 flex items-center justify-center text-white">Tournament not found.</div>;

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4 bg-[url('https://picsum.photos/1920/1080?grayscale&blur=2')] bg-cover bg-center">
       {/* Dark Overlay */}
       <div className="absolute inset-0 bg-black/70 backdrop-blur-sm z-0"></div>

       <div className="relative z-10 w-full max-w-lg bg-gray-900/95 border border-gray-700 rounded-lg shadow-2xl overflow-hidden">
           
           {/* Top Warning Banner (Mocking the 'Full' banner from screenshot if needed, here used for Closed status) */}
           {tournament.status !== 'registration' && (
                <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-0 flex items-center">
                    <AlertCircle className="mr-2" size={20} />
                    <p className="font-bold">Registration is currently closed.</p>
                </div>
           )}

           <div className="p-8">
               {success ? (
                   <div className="text-center py-8 animate-fade-in">
                       <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-green-100 text-green-500 mb-6">
                           <CheckCircle size={40} />
                       </div>
                       <h2 className="text-2xl font-bold text-white mb-2">Registration Successful!</h2>
                       <p className="text-gray-400 mb-8">You have been added to the tournament roster.</p>
                       <div className="flex gap-4 justify-center">
                           <Button onClick={() => setSuccess(false)} variant="secondary">Register Another</Button>
                       </div>
                   </div>
               ) : (
                   <form onSubmit={handleRegister} className="space-y-5">
                       
                        {/* Error Message */}
                       {error && (
                           <div className="bg-red-500/20 border border-red-500 text-red-200 px-4 py-3 rounded text-sm flex items-center">
                               <AlertCircle size={16} className="mr-2" /> {error}
                           </div>
                       )}

                       {/* Tournament Name */}
                       <div>
                           <label className="block text-sm font-bold text-gray-300 mb-1">Tournament Name:</label>
                           <input 
                               disabled 
                               value={tournament.name}
                               className="w-full px-4 py-2 bg-gray-100 text-gray-900 rounded font-medium border-none opacity-80 cursor-not-allowed"
                           />
                       </div>

                       {/* Details Toggle */}
                       <div>
                           <label className="block text-sm font-bold text-gray-300 mb-1">Details:</label>
                           <button 
                               type="button"
                               onClick={() => setShowDetails(!showDetails)}
                               className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded text-sm font-bold transition-colors flex items-center"
                           >
                               <Info size={16} className="mr-2"/> 
                               {showDetails ? 'Hide Details' : 'Click to View Rules'}
                           </button>
                           {showDetails && (
                               <div className="mt-3 p-4 bg-gray-800 rounded border border-gray-600 text-gray-300 text-sm leading-relaxed">
                                   {tournament.description || "No specific rules provided for this tournament."}
                                   <div className="mt-2 text-xs text-gray-500 pt-2 border-t border-gray-700">
                                       Format: {tournament.totalRounds} Rounds • Group Size: 8
                                   </div>
                               </div>
                           )}
                       </div>

                       {/* Stats Row */}
                       <div className="grid grid-cols-2 gap-4">
                           <div>
                               <label className="block text-sm font-bold text-gray-300 mb-1">Max Players:</label>
                               <input 
                                   disabled 
                                   value="Unlimited"
                                   className="w-full px-4 py-2 bg-gray-100 text-gray-900 rounded font-medium border-none opacity-80 cursor-not-allowed"
                               />
                           </div>
                           <div>
                               <label className="block text-sm font-bold text-gray-300 mb-1">Registered:</label>
                               <input 
                                   disabled 
                                   value={tournament.players.length}
                                   className="w-full px-4 py-2 bg-gray-100 text-gray-900 rounded font-medium border-none opacity-80 cursor-not-allowed"
                               />
                           </div>
                       </div>

                       <div className="border-t border-gray-700 pt-2"></div>

                       {/* User Inputs - Styled to match screenshot (White/Light inputs on dark bg) */}
                       <div>
                           <label className="block text-sm font-bold text-gray-300 mb-1 flex items-center">
                               <span className="text-red-500 mr-1">*</span> Nickname:
                           </label>
                           <input 
                               type="text"
                               value={nickname}
                               onChange={(e) => setNickname(e.target.value)}
                               placeholder="e.g. Rainbow"
                               className="w-full px-4 py-3 bg-white text-gray-900 rounded border border-gray-300 focus:outline-none focus:ring-4 focus:ring-pink-500/30 font-medium placeholder-gray-400"
                               disabled={tournament.status !== 'registration'}
                           />
                       </div>

                       <div>
                           <label className="block text-sm font-bold text-gray-300 mb-1 flex items-center">
                               <span className="text-red-500 mr-1">*</span> BattleTag / ID:
                           </label>
                           <input 
                               type="text"
                               value={gameId}
                               onChange={(e) => setGameId(e.target.value)}
                               placeholder="e.g. Player#1234"
                               className="w-full px-4 py-3 bg-white text-gray-900 rounded border border-gray-300 focus:outline-none focus:ring-4 focus:ring-pink-500/30 font-medium placeholder-gray-400"
                               disabled={tournament.status !== 'registration'}
                           />
                       </div>

                       <Button 
                           type="submit" 
                           fullWidth 
                           className="h-12 text-lg font-bold bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 shadow-lg shadow-pink-500/40 mt-6"
                           disabled={tournament.status !== 'registration'}
                       >
                           Submit Registration
                       </Button>
                   </form>
               )}
           </div>
       </div>
    </div>
  );
};

export default Registration;
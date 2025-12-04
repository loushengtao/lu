import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createTournament } from '../services/storageService';
import { Button } from '../components/Button';
import { Input, Select } from '../components/Input';
import { ArrowLeft, Swords } from 'lucide-react';
import { DEFAULT_SCORING } from '../types';

const CreateTournament: React.FC = () => {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [rounds, setRounds] = useState(3);
  const [scoringType, setScoringType] = useState('default'); // Can expand later

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name) return;
    
    // Default scoring: 9, 7, 6, 5, 4, 3, 2, 1
    createTournament(name, description, rounds, DEFAULT_SCORING);
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-gray-900 p-6 flex items-center justify-center">
      <div className="max-w-md w-full bg-gray-800 rounded-2xl shadow-2xl border border-gray-700 p-8">
        <button 
          onClick={() => navigate('/')} 
          className="flex items-center text-gray-400 hover:text-white mb-6 text-sm transition-colors"
        >
          <ArrowLeft size={16} className="mr-1" /> Back to Dashboard
        </button>

        <div className="flex items-center gap-3 mb-6">
            <div className="p-3 bg-pink-500/20 rounded-lg">
                <Swords className="text-pink-500" size={28} />
            </div>
            <h1 className="text-2xl font-bold text-white">New Tournament</h1>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <Input 
            label="Tournament Name" 
            placeholder="e.g. Sunday Cup #45"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
          
          <Input 
            label="Description (Optional)" 
            placeholder="Brief details about the event..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />

          <div className="grid grid-cols-2 gap-4">
             <Select 
                label="Format"
                value={rounds}
                onChange={(e) => setRounds(Number(e.target.value))}
                options={[
                    { value: 1, label: 'BO1 (1 Round)' },
                    { value: 2, label: 'BO2 (2 Rounds)' },
                    { value: 3, label: 'BO3 (3 Rounds)' },
                    { value: 4, label: 'BO4 (4 Rounds)' },
                    { value: 5, label: 'BO5 (5 Rounds)' },
                    { value: 6, label: 'BO6 (6 Rounds)' },
                ]}
             />
             <div className="opacity-70 cursor-not-allowed">
                 <Select 
                    label="Scoring System"
                    value={scoringType}
                    disabled
                    onChange={() => {}}
                    options={[
                        { value: 'default', label: 'Standard (9,7,6...)' },
                    ]}
                 />
             </div>
          </div>

           <div className="p-4 bg-gray-900/50 rounded-lg text-xs text-gray-400">
             <p className="font-semibold text-gray-300 mb-1">Standard Scoring:</p>
             <div className="flex justify-between">
                 {DEFAULT_SCORING.map((s, i) => (
                     <span key={i}><span className="text-pink-400">#{i+1}</span>: {s}</span>
                 ))}
             </div>
           </div>

          <div className="pt-2">
            <Button type="submit" fullWidth>Create Tournament</Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateTournament;

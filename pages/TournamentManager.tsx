import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getTournament, startTournament, updateScore, registerPlayer } from '../services/storageService';
import { Tournament, Player, Group, DEFAULT_SCORING } from '../types';
import { Button } from '../components/Button';
import { Users, AlertTriangle, Play, ChevronLeft, Link as LinkIcon, Trophy, Plus } from 'lucide-react';

// Sub-component for Score Entry Table
const GroupTable: React.FC<{ 
    group: Group; 
    players: Player[]; 
    roundIndex: number; 
    scores: any[]; 
    onUpdate: (playerId: string, rank: number) => void 
}> = ({ group, players, roundIndex, scores, onUpdate }) => {
    
    // Get players in this group
    const groupPlayers = players.filter(p => group.playerIds.includes(p.id));

    return (
        <div className="bg-gray-800 rounded-lg overflow-hidden border border-gray-700 mb-6">
            <div className="bg-gray-700/50 px-4 py-3 border-b border-gray-700 flex justify-between items-center">
                <h3 className="font-bold text-pink-400">{group.name}</h3>
                <span className="text-xs text-gray-400 uppercase tracking-wider">Round {roundIndex}</span>
            </div>
            <table className="w-full text-sm text-left">
                <thead className="bg-gray-900/50 text-gray-400 uppercase text-xs">
                    <tr>
                        <th className="px-4 py-3">Nickname</th>
                        <th className="px-4 py-3 hidden sm:table-cell">BattleTag</th>
                        <th className="px-4 py-3 text-center w-24">Rank (1-8)</th>
                        <th className="px-4 py-3 text-center w-24">Score</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-700">
                    {groupPlayers.map(player => {
                        const pScore = scores.find(s => s.playerId === player.id);
                        const rank = pScore?.roundResults[roundIndex] || '';
                        const score = rank && rank >= 1 && rank <= 8 ? DEFAULT_SCORING[rank - 1] : '-';

                        return (
                            <tr key={player.id} className="hover:bg-gray-700/30 transition-colors">
                                <td className="px-4 py-3 font-medium text-white">{player.nickname}</td>
                                <td className="px-4 py-3 text-gray-500 hidden sm:table-cell">{player.gameId}</td>
                                <td className="px-4 py-2 text-center">
                                    <input
                                        type="number"
                                        min="1"
                                        max="8"
                                        className="w-16 bg-gray-900 border border-gray-600 rounded text-center py-1 text-white focus:border-pink-500 focus:ring-1 focus:ring-pink-500 outline-none"
                                        value={rank}
                                        onChange={(e) => {
                                            const val = parseInt(e.target.value);
                                            if (!isNaN(val)) onUpdate(player.id, val);
                                        }}
                                    />
                                </td>
                                <td className="px-4 py-3 text-center font-mono font-bold text-pink-400">
                                    {score}
                                </td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        </div>
    );
};

// Sub-component for Leaderboard
const Leaderboard: React.FC<{ tournament: Tournament }> = ({ tournament }) => {
    // Calculate totals and sort
    const calculatedPlayers = tournament.players.map(p => {
        const pScore = tournament.scores.find(s => s.playerId === p.id);
        // Fix: Explicitly cast or filter to ensure number array
        const ranks = pScore ? (Object.values(pScore.roundResults) as number[]) : [];
        const totalScore = ranks.reduce((acc, rank) => acc + (DEFAULT_SCORING[rank - 1] || 0), 0);
        
        return {
            ...p,
            totalScore,
            ranks
        };
    }).sort((a, b) => {
        // 1. Total Score
        if (b.totalScore !== a.totalScore) return b.totalScore - a.totalScore;
        
        // 2. Tie-Breaker: Count of 1sts, then 2nds, etc.
        for (let i = 1; i <= 8; i++) {
            const aCount = a.ranks.filter(r => r === i).length;
            const bCount = b.ranks.filter(r => r === i).length;
            if (bCount !== aCount) return bCount - aCount;
        }
        return 0;
    });

    return (
        <div className="bg-gray-800 rounded-lg overflow-hidden border border-gray-700 shadow-xl">
             <div className="bg-gradient-to-r from-yellow-600/20 to-orange-600/20 px-6 py-4 border-b border-yellow-600/30 flex items-center gap-3">
                <Trophy className="text-yellow-500" />
                <h3 className="font-bold text-xl text-yellow-100">Final Leaderboard</h3>
            </div>
            <div className="overflow-x-auto">
                <table className="w-full text-left">
                    <thead className="bg-gray-900 text-gray-400 uppercase text-xs font-bold">
                        <tr>
                            <th className="px-6 py-4">#</th>
                            <th className="px-6 py-4">Player</th>
                            <th className="px-6 py-4 text-center">Total Score</th>
                            {Array.from({length: tournament.totalRounds}).map((_, i) => (
                                <th key={i} className="px-4 py-4 text-center text-gray-600">R{i+1}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-700">
                        {calculatedPlayers.map((p, idx) => (
                            <tr key={p.id} className={`
                                hover:bg-white/5 transition-colors
                                ${idx === 0 ? 'bg-yellow-500/10' : ''}
                                ${idx === 1 ? 'bg-gray-400/10' : ''}
                                ${idx === 2 ? 'bg-orange-700/10' : ''}
                            `}>
                                <td className="px-6 py-4 font-mono text-gray-400">
                                    {idx + 1}
                                </td>
                                <td className="px-6 py-4">
                                    <div className="font-bold text-white">{p.nickname}</div>
                                    <div className="text-xs text-gray-500">{p.gameId}</div>
                                </td>
                                <td className="px-6 py-4 text-center font-bold text-2xl text-white">
                                    {p.totalScore}
                                </td>
                                {Array.from({length: tournament.totalRounds}).map((_, i) => {
                                    const rank = p.ranks[i];
                                    return (
                                        <td key={i} className="px-4 py-4 text-center">
                                            {rank ? (
                                                <span className={`
                                                    inline-block w-6 h-6 rounded text-xs leading-6 font-bold
                                                    ${rank === 1 ? 'bg-yellow-500 text-black' : 'bg-gray-700 text-gray-400'}
                                                `}>{DEFAULT_SCORING[rank-1]}</span>
                                            ) : '-'}
                                        </td>
                                    );
                                })}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

const TournamentManager: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [tournament, setTournament] = useState<Tournament | undefined>(undefined);
    const [activeTab, setActiveTab] = useState('overview'); // overview, round-1, round-2..., leaderboard
    const [errorMsg, setErrorMsg] = useState('');
    
    // Manual Add State
    const [manualName, setManualName] = useState('');
    const [manualId, setManualId] = useState('');

    const refreshData = () => {
        if (id) {
            const t = getTournament(id);
            setTournament(t);
        }
    };

    useEffect(() => {
        refreshData();
    }, [id]);

    const handleStart = () => {
        if (!id) return;
        const result = startTournament(id);
        if (result.success) {
            refreshData();
            setActiveTab('round-1');
        } else {
            setErrorMsg(result.message || 'Error starting tournament');
        }
    };

    const handleScoreUpdate = (playerId: string, rank: number) => {
        if (!id || !tournament) return;
        const roundNum = parseInt(activeTab.split('-')[1]);
        updateScore(id, playerId, roundNum, rank);
        refreshData(); 
    };

    const handleManualAdd = (e: React.FormEvent) => {
        e.preventDefault();
        if (!id || !manualName || !manualId) return;
        const success = registerPlayer(id, manualName, manualId);
        if (success) {
            setManualName('');
            setManualId('');
            refreshData();
        } else {
            alert("Failed to add player. Name/ID might be duplicate.");
        }
    };

    const copyLink = () => {
        const url = `${window.location.origin}/#/register/${id}`;
        navigator.clipboard.writeText(url);
        alert('Registration link copied to clipboard!');
    };

    if (!tournament) return <div>Loading...</div>;

    const tabs = [
        { id: 'overview', label: 'Overview' },
        ...Array.from({ length: tournament.totalRounds }).map((_, i) => ({ id: `round-${i + 1}`, label: `Round ${i + 1}` })),
        { id: 'leaderboard', label: 'Leaderboard' }
    ];

    return (
        <div className="min-h-screen bg-gray-900 p-6">
            <div className="max-w-6xl mx-auto">
                
                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                    <div>
                        <button onClick={() => navigate('/')} className="text-gray-400 hover:text-white flex items-center mb-2 text-sm">
                            <ChevronLeft size={16} /> Dashboard
                        </button>
                        <h1 className="text-3xl font-bold text-white flex items-center gap-3">
                            {tournament.name}
                            <span className={`text-sm px-2 py-1 rounded border ${
                                tournament.status === 'active' ? 'border-green-500 text-green-400' : 'border-gray-500 text-gray-400'
                            }`}>
                                {tournament.status.toUpperCase()}
                            </span>
                        </h1>
                    </div>
                    <div className="flex gap-3">
                        {tournament.status === 'registration' && (
                            <Button variant="secondary" onClick={copyLink}>
                                <LinkIcon size={16} className="mr-2 inline" /> Share Link
                            </Button>
                        )}
                        {tournament.status === 'registration' && (
                            <Button onClick={handleStart} disabled={tournament.players.length < 8}>
                                <Play size={16} className="mr-2 inline" /> Start Tournament
                            </Button>
                        )}
                    </div>
                </div>

                {/* Status Alerts */}
                {errorMsg && (
                    <div className="bg-red-900/50 border border-red-500 text-red-200 px-4 py-3 rounded mb-6 flex items-center">
                        <AlertTriangle className="mr-2" size={20}/> {errorMsg}
                    </div>
                )}

                {/* Player Count Warning for Groups */}
                {tournament.status === 'registration' && (
                     <div className={`px-4 py-3 rounded border mb-6 flex items-center ${
                         tournament.players.length % 8 === 0 && tournament.players.length > 0
                         ? 'bg-green-900/20 border-green-600/50 text-green-400' 
                         : 'bg-yellow-900/20 border-yellow-600/50 text-yellow-400'
                     }`}>
                         <Users className="mr-2" size={20}/>
                         <span>
                             Current Players: <strong>{tournament.players.length}</strong>. 
                             {tournament.players.length % 8 === 0 && tournament.players.length > 0 
                                ? " Perfect! Ready for grouping." 
                                : " Must be a multiple of 8 to start."}
                         </span>
                     </div>
                )}

                {/* Tabs */}
                {tournament.status !== 'registration' && (
                    <div className="flex border-b border-gray-700 mb-6 overflow-x-auto">
                        {tabs.map(tab => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`px-6 py-3 font-medium text-sm whitespace-nowrap border-b-2 transition-colors ${
                                    activeTab === tab.id 
                                    ? 'border-pink-500 text-pink-400' 
                                    : 'border-transparent text-gray-400 hover:text-gray-300'
                                }`}
                            >
                                {tab.label}
                            </button>
                        ))}
                    </div>
                )}

                {/* Content */}
                <div className="animate-fade-in">
                    {activeTab === 'overview' && (
                        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
                             <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4 border-b border-gray-700 pb-4">
                                <h2 className="text-xl font-bold text-white">Registered Players</h2>
                                
                                {/* Manual Add Form */}
                                {tournament.status === 'registration' && (
                                    <form onSubmit={handleManualAdd} className="flex gap-2 w-full md:w-auto">
                                        <input 
                                            placeholder="Nickname" 
                                            className="bg-gray-900 border border-gray-600 rounded px-3 py-2 text-sm text-white focus:ring-1 focus:ring-pink-500 outline-none"
                                            value={manualName}
                                            onChange={e => setManualName(e.target.value)}
                                            required
                                        />
                                        <input 
                                            placeholder="Game ID" 
                                            className="bg-gray-900 border border-gray-600 rounded px-3 py-2 text-sm text-white focus:ring-1 focus:ring-pink-500 outline-none"
                                            value={manualId}
                                            onChange={e => setManualId(e.target.value)}
                                            required
                                        />
                                        <Button size="sm" type="submit" className="whitespace-nowrap">
                                            <Plus size={16} className="mr-1 inline"/> Add
                                        </Button>
                                    </form>
                                )}
                            </div>

                            <div className="overflow-x-auto">
                                <table className="w-full text-left text-sm text-gray-300">
                                    <thead className="bg-gray-900/50 text-gray-500">
                                        <tr>
                                            <th className="p-3">#</th>
                                            <th className="p-3">Nickname</th>
                                            <th className="p-3">Game ID</th>
                                            <th className="p-3">Registered At</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-700">
                                        {tournament.players.length === 0 ? (
                                            <tr>
                                                <td colSpan={4} className="p-8 text-center text-gray-500">No players registered yet.</td>
                                            </tr>
                                        ) : (
                                            tournament.players.map((p, i) => (
                                                <tr key={p.id} className="hover:bg-white/5">
                                                    <td className="p-3 text-gray-500">{i + 1}</td>
                                                    <td className="p-3 text-white font-medium">{p.nickname}</td>
                                                    <td className="p-3">{p.gameId}</td>
                                                    <td className="p-3">{new Date(p.registeredAt).toLocaleString()}</td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {activeTab.startsWith('round') && (
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {tournament.generatedGroups.map(group => (
                                <GroupTable 
                                    key={group.id} 
                                    group={group} 
                                    players={tournament.players} 
                                    roundIndex={parseInt(activeTab.split('-')[1])}
                                    scores={tournament.scores}
                                    onUpdate={handleScoreUpdate}
                                />
                            ))}
                        </div>
                    )}

                    {activeTab === 'leaderboard' && (
                        <Leaderboard tournament={tournament} />
                    )}
                </div>

            </div>
        </div>
    );
};

export default TournamentManager;
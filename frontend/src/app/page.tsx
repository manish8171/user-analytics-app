"use client";

import { useEffect, useState } from 'react';

const getBackendUrl = () => {
  if (typeof window !== 'undefined') {
    return `http://${window.location.hostname}:5000/api`;
  }
  return 'http://localhost:5000/api';
};
const BACKEND_URL = getBackendUrl();

type Session = {
  _id: string;
  event_count: number;
  first_event: string;
  last_event: string;
  status?: string;
};

type Event = {
  _id: string;
  event_type: string;
  page_url: string;
  timestamp: string;
  click_x?: number;
  click_y?: number;
};

export default function SessionsView() {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [selectedSession, setSelectedSession] = useState<Session | null>(null);
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${BACKEND_URL}/sessions`)
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setSessions(data);
        } else {
          console.warn("Backend error:", data);
          setSessions([]);
        }
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setSessions([]);
        setLoading(false);
      });
  }, []);

  const handleSessionClick = (session: Session) => {
    setSelectedSession(session);
    setEvents([]);
    fetch(`${BACKEND_URL}/sessions/${session._id}/events`)
      .then(res => res.json())
      .then(data => setEvents(data))
      .catch(err => console.error(err));
  };

  const handleSessionAction = async (e: React.MouseEvent, sessionId: string, action: 'delete' | 'block' | 'end') => {
    e.stopPropagation(); // prevent row click
    try {
      const method = action === 'delete' ? 'DELETE' : 'POST';
      const endpoint = action === 'delete' ? `/sessions/${sessionId}` : `/sessions/${sessionId}/${action}`;
      
      const res = await fetch(`${BACKEND_URL}${endpoint}`, { method });
      if (res.ok) {
        if (action === 'delete') {
          setSessions(prev => prev.filter(s => s._id !== sessionId));
          if (selectedSession?._id === sessionId) setSelectedSession(null);
        } else {
          setSessions(prev => prev.map(s => s._id === sessionId ? { ...s, status: action === 'block' ? 'blocked' : 'ended' } : s));
          if (selectedSession?._id === sessionId) {
            setSelectedSession(prev => prev ? { ...prev, status: action === 'block' ? 'blocked' : 'ended' } : null);
          }
        }
      }
    } catch (err) {
      console.error('Action failed', err);
    }
  };

  if (loading) return <div className="text-center py-10">Loading sessions...</div>;

  return (
    <div className="flex flex-col md:flex-row gap-8">
      {/* Sessions List */}
      <div className="w-full md:w-1/3 bg-white/5 p-6 rounded-2xl shadow-xl shadow-black/20 border border-white/10 backdrop-blur-md">
        <h2 className="text-xl font-bold mb-4 text-white">Live Sessions</h2>
        {sessions.length === 0 ? (
          <div className="p-8 text-center rounded-xl border border-dashed border-white/10 bg-white/[0.02]">
            <p className="text-gray-400 text-sm">No sessions captured yet.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {sessions.map(s => (
              <div 
                key={s._id} 
                onClick={() => handleSessionClick(s)}
                className={`p-4 rounded-xl cursor-pointer transition-all border ${selectedSession?._id === s._id ? 'border-blue-500/50 bg-blue-500/10 shadow-[0_0_15px_rgba(59,130,246,0.1)]' : 'border-white/5 hover:border-white/20 hover:bg-white/5 bg-black/20'}`}
              >
                <div className="flex justify-between items-center mb-2">
                  <div className="flex flex-col">
                    <span className="font-semibold text-gray-200 text-sm truncate" title={s._id}>{s._id.substring(0, 12)}...</span>
                    {s.status && s.status !== 'active' && (
                      <span className={`text-[10px] font-bold uppercase mt-1 ${s.status === 'blocked' ? 'text-red-400' : 'text-amber-400'}`}>{s.status}</span>
                    )}
                  </div>
                  <span className="bg-blue-500/20 text-blue-300 border border-blue-500/20 text-xs px-2.5 py-1 rounded-full font-medium">{s.event_count} events</span>
                </div>
                <div className="text-xs text-gray-500 mb-4">
                  Last active: {new Date(s.last_event).toLocaleTimeString()}
                </div>
                <div className="flex gap-2">
                  <button onClick={(e) => handleSessionAction(e, s._id, 'end')} disabled={s.status !== 'active'} className="flex-1 px-2 py-1.5 text-[11px] font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20 rounded-md hover:bg-amber-500/20 disabled:opacity-30 disabled:hover:bg-amber-500/10 transition-colors">END</button>
                  <button onClick={(e) => handleSessionAction(e, s._id, 'block')} disabled={s.status === 'blocked'} className="flex-1 px-2 py-1.5 text-[11px] font-semibold bg-red-500/10 text-red-400 border border-red-500/20 rounded-md hover:bg-red-500/20 disabled:opacity-30 disabled:hover:bg-red-500/10 transition-colors">BLOCK</button>
                  <button onClick={(e) => handleSessionAction(e, s._id, 'delete')} className="flex-1 px-2 py-1.5 text-[11px] font-semibold bg-white/5 text-gray-300 border border-white/10 rounded-md hover:bg-red-500/20 hover:text-red-400 hover:border-red-500/30 transition-colors">DELETE</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Events List (User Journey) */}
      <div className="w-full md:w-2/3 bg-white/5 p-6 rounded-2xl shadow-xl shadow-black/20 border border-white/10 backdrop-blur-md min-h-[500px]">
        {selectedSession ? (
          <>
            <div className="flex items-center justify-between mb-8 border-b border-white/10 pb-4">
              <h2 className="text-xl font-bold text-white">Journey: <span className="text-gray-400 font-normal">{selectedSession._id}</span></h2>
            </div>
            
            {events.length === 0 ? (
              <p className="text-gray-500">Loading events...</p>
            ) : (
              <div className="relative border-l-2 border-white/10 ml-4 space-y-6">
                {events.map((e, index) => (
                  <div key={e._id} className="relative pl-8">
                    {/* Timeline dot */}
                    <div className={`absolute -left-[11px] top-3 h-5 w-5 rounded-full border-4 border-[#0a0a0a] ${e.event_type === 'page_view' ? 'bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.5)]' : 'bg-purple-400 shadow-[0_0_10px_rgba(192,132,252,0.5)]'}`}></div>
                    
                    <div className="bg-white/5 p-4 rounded-xl border border-white/5 hover:border-white/10 transition-colors">
                      <div className="flex justify-between items-start mb-2">
                        <span className={`font-semibold text-sm px-2.5 py-0.5 rounded-full bg-black/30 border ${e.event_type === 'page_view' ? 'text-emerald-400 border-emerald-400/20' : 'text-purple-400 border-purple-400/20'}`}>
                          {e.event_type === 'page_view' ? 'Page View' : 'Interaction'}
                        </span>
                        <span className="text-xs text-gray-500 font-mono">{new Date(e.timestamp).toLocaleTimeString()}</span>
                      </div>
                      <div className="text-sm text-gray-300 mb-2 break-all font-mono bg-black/40 p-2 rounded-md border border-white/5">
                        {e.page_url}
                      </div>
                      {e.event_type === 'click' && (
                        <div className="flex gap-2">
                          <div className="text-xs font-mono text-purple-300 bg-purple-500/10 border border-purple-500/20 inline-flex items-center px-2.5 py-1 rounded-md">
                            <span className="opacity-70 mr-1">Target:</span> {e.element_text || 'Unknown Area'}
                          </div>
                          {e.click_x !== undefined && e.click_y !== undefined && (
                            <div className="text-xs font-mono text-gray-400 bg-white/5 border border-white/5 inline-flex items-center px-2.5 py-1 rounded-md">
                              <span className="opacity-50 mr-1">Pos:</span> {Math.round(e.click_x)}, {Math.round(e.click_y)}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        ) : (
          <div className="flex items-center justify-center h-full text-gray-500 flex-col py-20">
            <div className="w-20 h-20 mb-6 rounded-full bg-white/5 border border-white/10 flex items-center justify-center">
              <svg className="w-10 h-10 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122"></path></svg>
            </div>
            <p className="text-lg font-medium text-gray-300">Select a session to analyze</p>
            <p className="text-sm text-gray-500 mt-2">Click on any session from the list to view its complete interaction journey.</p>
          </div>
        )}
      </div>
    </div>
  );
}

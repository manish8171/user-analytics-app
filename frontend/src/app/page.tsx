"use client";

import { useEffect, useState } from 'react';

const BACKEND_URL = 'http://localhost:5000/api';

type Session = {
  _id: string;
  event_count: number;
  first_event: string;
  last_event: string;
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
        setSessions(data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
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

  if (loading) return <div className="text-center py-10">Loading sessions...</div>;

  return (
    <div className="flex flex-col md:flex-row gap-8">
      {/* Sessions List */}
      <div className="w-full md:w-1/3 bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <h2 className="text-xl font-bold mb-4 text-gray-800">Sessions</h2>
        {sessions.length === 0 ? (
          <p className="text-gray-500 text-sm">No sessions found.</p>
        ) : (
          <div className="space-y-3">
            {sessions.map(s => (
              <div 
                key={s._id} 
                onClick={() => handleSessionClick(s)}
                className={`p-4 rounded-lg cursor-pointer transition-all border ${selectedSession?._id === s._id ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-blue-300 hover:bg-gray-50'}`}
              >
                <div className="flex justify-between items-center mb-2">
                  <span className="font-semibold text-gray-700 text-sm truncate" title={s._id}>{s._id.substring(0, 12)}...</span>
                  <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full font-medium">{s.event_count} events</span>
                </div>
                <div className="text-xs text-gray-500">
                  Last active: {new Date(s.last_event).toLocaleTimeString()}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Events List (User Journey) */}
      <div className="w-full md:w-2/3 bg-white p-6 rounded-xl shadow-sm border border-gray-100 min-h-[500px]">
        {selectedSession ? (
          <>
            <h2 className="text-xl font-bold mb-4 text-gray-800">User Journey: {selectedSession._id}</h2>
            {events.length === 0 ? (
              <p className="text-gray-500">Loading events...</p>
            ) : (
              <div className="relative border-l-2 border-gray-200 ml-3 space-y-6">
                {events.map((e, index) => (
                  <div key={e._id} className="relative pl-6">
                    {/* Timeline dot */}
                    <div className={`absolute -left-[9px] top-1 h-4 w-4 rounded-full border-2 border-white ${e.event_type === 'page_view' ? 'bg-green-500' : 'bg-purple-500'}`}></div>
                    
                    <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
                      <div className="flex justify-between items-start mb-1">
                        <span className={`font-semibold text-sm ${e.event_type === 'page_view' ? 'text-green-700' : 'text-purple-700'}`}>
                          {e.event_type === 'page_view' ? 'Page View' : 'Click'}
                        </span>
                        <span className="text-xs text-gray-500 font-mono">{new Date(e.timestamp).toLocaleTimeString()}</span>
                      </div>
                      <div className="text-sm text-gray-600 mb-1 break-all">
                        {e.page_url}
                      </div>
                      {e.event_type === 'click' && e.click_x !== undefined && e.click_y !== undefined && (
                        <div className="text-xs font-mono text-gray-500 bg-gray-200 inline-block px-2 py-1 rounded mt-2">
                          X: {Math.round(e.click_x)}, Y: {Math.round(e.click_y)}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        ) : (
          <div className="flex items-center justify-center h-full text-gray-400 flex-col">
            <svg className="w-16 h-16 mb-4 text-gray-200" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122"></path></svg>
            <p>Select a session to view the user journey</p>
          </div>
        )}
      </div>
    </div>
  );
}

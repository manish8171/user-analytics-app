"use client";

import { useEffect, useState } from 'react';

const getBackendUrl = () => {
  if (typeof window !== 'undefined') {
    return `http://${window.location.hostname}:5000/api`;
  }
  return 'http://localhost:5000/api';
};
const BACKEND_URL = getBackendUrl();

type ClickEvent = {
  _id: string;
  click_x: number;
  click_y: number;
  element_text?: string;
  timestamp: string;
};

export default function AnalyticsView() {
  const [pages, setPages] = useState<string[]>([]);
  const [selectedPage, setSelectedPage] = useState<string>('');
  const [clicks, setClicks] = useState<ClickEvent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${BACKEND_URL}/pages`)
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setPages(data);
          if (data.length > 0) {
            setSelectedPage(data[0]);
          }
        } else {
          console.warn("Backend error:", data);
          setPages([]);
        }
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setPages([]);
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    if (selectedPage) {
      fetch(`${BACKEND_URL}/heatmap?url=${encodeURIComponent(selectedPage)}`)
        .then(res => res.json())
        .then(data => {
          if (Array.isArray(data)) {
            setClicks(data);
          } else {
            console.warn("Backend error:", data);
            setClicks([]);
          }
        })
        .catch(err => {
          console.error(err);
          setClicks([]);
        });
    }
  }, [selectedPage]);

  if (loading) return <div className="text-center py-10">Loading pages...</div>;

  // Aggregate clicks by element
  const elementCounts = clicks.reduce((acc, click) => {
    const name = click.element_text && click.element_text !== 'Unknown' ? click.element_text : 'Background Area / Unknown';
    acc[name] = (acc[name] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const sortedElements = Object.entries(elementCounts)
    .sort((a, b) => b[1] - a[1])
    .map(([name, count]) => ({ name, count }));

  const maxClicks = sortedElements.length > 0 ? sortedElements[0].count : 1;

  return (
    <div className="flex flex-col gap-6">
      <div className="bg-white/5 p-6 rounded-2xl shadow-xl shadow-black/20 border border-white/10 backdrop-blur-md flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold text-white">Heatmap Analysis</h2>
          <p className="text-sm text-gray-400">Discover which buttons and elements users click the most.</p>
        </div>
        
        <div className="w-full md:w-auto">
          <label htmlFor="page-select" className="block text-sm font-medium text-gray-400 mb-1">Select Page</label>
          <select
            id="page-select"
            value={selectedPage}
            onChange={(e) => setSelectedPage(e.target.value)}
            className="block w-full md:w-80 pl-3 pr-10 py-2 text-base bg-black/40 border-white/10 text-white focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-lg border appearance-none"
          >
            {pages.length === 0 && <option disabled>No pages tracked yet</option>}
            {pages.map(page => (
              <option key={page} value={page} className="bg-gray-900">{page}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="bg-white/5 p-6 rounded-2xl shadow-xl shadow-black/20 border border-white/10 backdrop-blur-md">
        <div className="mb-8 flex justify-between items-center border-b border-white/10 pb-4">
          <h3 className="font-semibold text-white">Most Clicked Elements</h3>
          <span className="text-sm px-3 py-1 bg-blue-500/20 text-blue-400 border border-blue-500/20 rounded-full font-medium">Total: {clicks.length} clicks</span>
        </div>
        
        {pages.length === 0 ? (
          <div className="py-20 flex flex-col items-center justify-center text-gray-500">
            <div className="w-20 h-20 mb-6 rounded-full bg-white/5 border border-white/10 flex items-center justify-center">
              <svg className="w-10 h-10 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122"></path></svg>
            </div>
            <p className="text-lg font-medium text-gray-300">No tracking data available</p>
            <p className="text-sm mt-2">Open the demo page to generate events.</p>
          </div>
        ) : clicks.length === 0 ? (
          <div className="py-20 flex items-center justify-center text-gray-500">
            No click data available for this page.
          </div>
        ) : (
          <div className="space-y-5">
            {sortedElements.map((item, index) => (
              <div key={index} className="flex flex-col gap-2">
                <div className="flex justify-between text-sm font-medium text-gray-300">
                  <span className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded bg-white/10 text-gray-400 flex items-center justify-center text-xs">{index + 1}</span> 
                    {item.name}
                  </span>
                  <span className="text-blue-400 font-mono bg-blue-500/10 px-2 py-0.5 rounded">{item.count} clicks</span>
                </div>
                <div className="w-full bg-black/40 rounded-full h-2 border border-white/5 overflow-hidden">
                  <div 
                    className="bg-gradient-to-r from-blue-600 to-purple-500 h-full transition-all duration-1000 ease-out" 
                    style={{ width: `${(item.count / maxClicks) * 100}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="bg-white/5 p-6 rounded-2xl shadow-xl shadow-black/20 border border-white/10 backdrop-blur-md">
        <div className="mb-6 flex justify-between items-center border-b border-white/10 pb-4">
          <h3 className="font-semibold text-white">Visual Click Map</h3>
          <div className="flex items-center gap-2 text-sm text-gray-400">
            <span className="w-3 h-3 rounded-full bg-blue-500 opacity-60 inline-block shadow-[0_0_8px_rgba(59,130,246,0.8)]"></span>
            Click Position
          </div>
        </div>
        
        {/* Heatmap Container */}
        <div className="relative w-full h-[600px] border border-white/10 bg-black/20 rounded-xl overflow-auto custom-scrollbar">
          {pages.length === 0 ? (
            <div className="absolute inset-0 flex items-center justify-center text-gray-500">
              No tracking data available. Open the demo page to generate events.
            </div>
          ) : clicks.length === 0 ? (
            <div className="absolute inset-0 flex items-center justify-center text-gray-500">
              No click data available for this page.
            </div>
          ) : (
            <div className="relative" style={{ width: '100%', minHeight: '100%' }}>
              {clicks.map((click, i) => (
                <div
                  key={click._id || i}
                  className="absolute w-5 h-5 bg-blue-500 rounded-full opacity-60 transform -translate-x-1/2 -translate-y-1/2 shadow-[0_0_12px_rgba(59,130,246,0.9)] animate-pulse"
                  style={{
                    left: `${click.click_x}px`,
                    top: `${click.click_y}px`,
                  }}
                  title={`Time: ${new Date(click.timestamp).toLocaleTimeString()} | Element: ${click.element_text || 'Unknown'}`}
                />
              ))}
            </div>
          )}
        </div>
        <p className="mt-4 text-xs text-gray-500 text-center">
          Note: Click coordinates are absolute to the page origin (0,0). Dots represent exact recorded click locations.
        </p>
      </div>
    </div>
  );
}

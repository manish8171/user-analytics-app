"use client";

import { useEffect, useState } from 'react';

const BACKEND_URL = 'http://localhost:5000/api';

type ClickEvent = {
  _id: string;
  click_x: number;
  click_y: number;
  timestamp: string;
};

export default function HeatmapView() {
  const [pages, setPages] = useState<string[]>([]);
  const [selectedPage, setSelectedPage] = useState<string>('');
  const [clicks, setClicks] = useState<ClickEvent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${BACKEND_URL}/pages`)
      .then(res => res.json())
      .then(data => {
        setPages(data);
        if (data.length > 0) {
          setSelectedPage(data[0]);
        }
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    if (selectedPage) {
      fetch(`${BACKEND_URL}/heatmap?url=${encodeURIComponent(selectedPage)}`)
        .then(res => res.json())
        .then(data => setClicks(data))
        .catch(err => console.error(err));
    }
  }, [selectedPage]);

  if (loading) return <div className="text-center py-10">Loading pages...</div>;

  return (
    <div className="flex flex-col gap-6">
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold text-gray-800">Heatmap Analysis</h2>
          <p className="text-sm text-gray-500">Visualize where users are clicking on your pages.</p>
        </div>
        
        <div className="w-full md:w-auto">
          <label htmlFor="page-select" className="block text-sm font-medium text-gray-700 mb-1">Select Page</label>
          <select
            id="page-select"
            value={selectedPage}
            onChange={(e) => setSelectedPage(e.target.value)}
            className="block w-full md:w-80 pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md border"
          >
            {pages.length === 0 && <option disabled>No pages tracked yet</option>}
            {pages.map(page => (
              <option key={page} value={page}>{page}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <div className="mb-4 flex justify-between items-center">
          <h3 className="font-semibold text-gray-700">Click Map ({clicks.length} clicks)</h3>
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <span className="w-3 h-3 rounded-full bg-red-500 opacity-60 inline-block"></span>
            Click Position
          </div>
        </div>
        
        {/* Heatmap Container */}
        <div className="relative w-full h-[600px] border-2 border-dashed border-gray-200 bg-gray-50 rounded-lg overflow-auto">
          {pages.length === 0 ? (
            <div className="absolute inset-0 flex items-center justify-center text-gray-400">
              No tracking data available. Open the demo page to generate events.
            </div>
          ) : clicks.length === 0 ? (
            <div className="absolute inset-0 flex items-center justify-center text-gray-400">
              No click data available for this page.
            </div>
          ) : (
            <div className="relative" style={{ width: '100%', minHeight: '100%' }}>
              {/* This mimics the original page dimensions roughly. In a real app, you'd overlay an iframe or screenshot */}
              {clicks.map((click, i) => (
                <div
                  key={click._id || i}
                  className="absolute w-4 h-4 bg-red-500 rounded-full opacity-60 transform -translate-x-1/2 -translate-y-1/2 shadow-sm"
                  style={{
                    left: `${click.click_x}px`,
                    top: `${click.click_y}px`,
                  }}
                  title={`Time: ${new Date(click.timestamp).toLocaleTimeString()}`}
                />
              ))}
            </div>
          )}
        </div>
        <p className="mt-4 text-xs text-gray-500 text-center">
          Note: Click coordinates are absolute to the page origin (0,0). For accurate representation, the viewport should match the tracked user's screen.
        </p>
      </div>
    </div>
  );
}

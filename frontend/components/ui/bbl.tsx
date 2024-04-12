import React, { useState, useEffect } from 'react';
import './customCss/bbl.css'
import Earth from './svg files/Earth';

export function Bbl() {
  const items = [
    "Writing a description of the map",
    "Looking for Countries",
    "Looking for States",
    "Looking for Cities",
    "Looking for Places",
    "Geocoding",
    "Waiting for Bing to Bing",
  ];

  const [currentItem, setCurrentItem] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentItem((prevItem) => (prevItem + 1) % items.length);
    }, 2500);

    return () => clearInterval(interval);
  }, [items.length]);

  return (
    <div className="fixed inset-0 flex flex-col items-center justify-center min-h-screen gap-4 text-center bg-opacity-85 z-50 bg-gray-200 dark:bg-slate-900 dark:bg-opacity-95">
      <div className="space-y-2">
        <div className="inline-flex items-center gap-2 text-3xl">
          <span>Creating your</span>
          <div className="inline-block font-bold">map</div>
        </div>
        {/* Display the current item from the list with a fade-in and fade-out effect */}
        <div className="text-sm font-medium fade-text">{items[currentItem]}</div>
        <div className="globe">
          <Earth />
        </div>
      </div>
    </div>
  );
}
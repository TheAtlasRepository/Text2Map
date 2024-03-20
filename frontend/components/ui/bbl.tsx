import React, { useState, useEffect } from 'react';
import './customCss/bbl.css'
import Earth from './svg files/Earth';

export function Bbl() {
  const items = [
    "Looking for Countries",
    "Looking for States",
    "Looking for Cities",
    "Looking for Places",
    "Geocoding",
    "Waiting for Bing to Bing",

  ];

  const [currentItem, setCurrentItem] = useState(0);
  const [logMessage, setLogMessage] = useState('');

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentItem((prevItem) => (prevItem + 1) % items.length);
    }, 2500);

    return () => clearInterval(interval);
  }, [items.length]);

  useEffect(() => {
    const source = new EventSource('/logs');

    source.onmessage = function(event) {
      setLogMessage(event.data);
    };

    return () => {
      source.close();
    };
 }, []);

  return (
    <div className="fixed inset-0 flex flex-col items-center justify-center min-h-screen gap-4 text-center bg-opacity-75" style={{ zIndex: 9999, backgroundColor: "#0e101b" }}>
      <div className="space-y-2">
        <div className="inline-flex items-center space-x-2 text-3xl">
          <span>Creating your</span>
          <div className="inline-block font-bold">map</div>
        </div>
        {/* Display the current item from the list with a fade-in and fade-out effect */}
        <div className="text-sm font-medium fade-text">{items[currentItem]}</div>
        <div>{logMessage}</div>
        <div className="globe">
          <Earth />
        </div>
      </div>
    </div>
  );
}
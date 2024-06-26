import React, { useState, useEffect } from 'react';

function Logo() {
    const [text, setText] = useState('Text  ');
    const [opacity, setOpacity] = useState('opacity-100');

    useEffect(() => {
        const interval = setInterval(() => {
            setOpacity('opacity-0');
            setTimeout(() => {
                setText(prevText => prevText === 'Text  ' ? 'CSV  ' : 'Text  ');
                setOpacity('opacity-100');
            }, 500);
        }, 5000);
        return () => clearInterval(interval);
    }, []);

    return (
<div className={`flex justify-center items-center text-l text-white`}>
  <div className={`transition-all duration-500 ease-in-out ${opacity}`} style={{minWidth: '2.5em'}}>
    <span className="font-bold">{text}</span>
  </div>
  <div>
    <span>2 MAP</span>
  </div>
</div>
    );
}

export default Logo;
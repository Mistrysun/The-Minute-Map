import React, { useState } from 'react';
import { Play } from 'lucide-react';

const GameSpinner = ({ onSpinComplete }) => {
  const [rotation, setRotation] = useState(0);
  const [isSpinning, setIsSpinning] = useState(false);

  const games = [
    { id: 'written', label: 'Word Mission', color: '#FFB347' },
    { id: 'digital', label: 'Digital Mission', color: '#66D2CE' },
    { id: 'creator', label: 'Digital Creator', color: '#9F7AEA' },
    { id: 'multiple-choice', label: 'Multiple Choice', color: '#F6AD55' }
  ];

  const spin = () => {
    if (isSpinning) return;
    
    setIsSpinning(true);
    // Spin between 5 and 10 full rotations + random quadrant
    const extraDegrees = Math.floor(Math.random() * 360);
    const newRotation = rotation + (360 * 5) + extraDegrees;
    
    setRotation(newRotation);

    setTimeout(() => {
      setIsSpinning(false);
      // Calculate which quadrant it landed on
      // Normalizing rotation to 0-360 (inverted because needle is static or circle rotates?)
      // Let's rotate the needle.
      const normalizedDegrees = newRotation % 360;
      // quadrants: 0-90 (Word), 90-180 (Digital), 180-270 (Creator), 270-360 (MC)
      // Actually, since we start at -90 offset usually...
      let index = Math.floor(normalizedDegrees / 90);
      onSpinComplete(games[index].id);
    }, 3000);
  };

  return (
    <div className="spinner-container">
      <div className="spinner-board">
        <svg viewBox="0 0 400 400" className="spinner-svg">
          {/* Quadrants */}
          {games.map((game, i) => {
            // Path definitions for quadrants
            const paths = [
              "M 200 200 L 200 20 A 180 180 0 0 1 380 200 Z",
              "M 200 200 L 380 200 A 180 180 0 0 1 200 380 Z",
              "M 200 200 L 200 380 A 180 180 0 0 1 20 200 Z",
              "M 200 200 L 20 200 A 180 180 0 0 1 200 20 Z"
            ];
            return (
              <path 
                key={game.id}
                d={paths[i]} 
                fill={game.color} 
                className="spinner-quadrant"
                onClick={() => !isSpinning && onSpinComplete(game.id)}
              />
            );
          })}
          
          {/* Labels (Clickable too) */}
          <g className="spinner-labels" style={{ pointerEvents: 'none' }}>
            <text x="300" y="110" className="spinner-text" transform="rotate(45, 300, 110)">Word</text>
            <text x="300" y="290" className="spinner-text" transform="rotate(135, 300, 290)">Digital</text>
            <text x="100" y="290" className="spinner-text" transform="rotate(225, 100, 290)">Creator</text>
            <text x="100" y="110" className="spinner-text" transform="rotate(315, 100, 110)">Quiz</text>
          </g>

          <circle cx="200" cy="200" r="180" fill="none" stroke="white" strokeWidth="8" style={{ pointerEvents: 'none' }} />
          
          {/* The Needle */}
          <g style={{ 
            transform: `rotate(${rotation}deg)`, 
            transformOrigin: '200px 200px',
            transition: 'transform 3s cubic-bezier(0.15, 0, 0.15, 1)',
            pointerEvents: 'none'
          }}>
            <path d="M 200 200 L 190 200 L 200 40 L 210 200 Z" fill="#2D3748" />
            <circle cx="200" cy="200" r="15" fill="#2D3748" />
            <circle cx="200" cy="200" r="6" fill="white" />
          </g>
        </svg>
        
        <button className={`spin-button ${isSpinning ? 'disabled' : ''}`} onClick={spin}>
          {isSpinning ? '...' : 'SPIN!'}
        </button>
      </div>
      <p className="spinner-hint">Spin or click a color!</p>
    </div>
  );
};

export default GameSpinner;

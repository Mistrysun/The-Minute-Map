import React from 'react';
import { Sun, Moon, Cloud, Star } from 'lucide-react';
import './DynamicBackground.css';

const DynamicBackground = ({ theme }) => {
  const isDark = theme === 'dark';

  return (
    <div className={`dynamic-bg ${theme}`}>
      {/* Sky Elements */}
      <div className="sky-elements">
        {isDark ? (
          <div className="night-sky">
            <Moon className="moon floating" size={80} color="#F7FAFC" fill="#F7FAFC" />
            {[...Array(20)].map((_, i) => (
              <Star 
                key={i} 
                className="star pulsing" 
                size={Math.random() * 10 + 5} 
                style={{
                  top: `${Math.random() * 40}%`,
                  left: `${Math.random() * 100}%`,
                  animationDelay: `${Math.random() * 3}s`
                }}
                color="#F7FAFC"
                fill="#F7FAFC"
              />
            ))}
          </div>
        ) : (
          <div className="day-sky">
            <Sun className="sun floating" size={120} color="#F6AD55" fill="#F6AD55" />
            <Cloud className="cloud cloud-1" size={100} color="white" fill="white" />
            <Cloud className="cloud cloud-2" size={80} color="white" fill="white" />
          </div>
        )}
      </div>

      {/* Landscape Elements */}
      <div className="landscape">
        {/* Stream */}
        <div className="water-stream">
          <svg viewBox="0 0 1440 320" preserveAspectRatio="none">
            <path 
              fill={isDark ? "#2C5282" : "#63B3ED"} 
              d="M0,160L48,176C96,192,192,224,288,224C384,224,480,192,576,165.3C672,139,768,117,864,128C960,139,1056,181,1152,197.3C1248,213,1344,203,1392,197.3L1440,192L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"
            ></path>
          </svg>
        </div>

        {/* Houses and Trees */}
        <div className="horizon-elements">
          <div className="element-group left">
            <House color={isDark ? "#2D3748" : "#FC8181"} />
            <Tree color={isDark ? "#1A202C" : "#48BB78"} />
          </div>
          <div className="element-group right">
            <Tree color={isDark ? "#1A202C" : "#48BB78"} scale={1.2} />
            <House color={isDark ? "#2D3748" : "#63B3ED"} />
            <Pet type="cat" color={isDark ? "#A0AEC0" : "#4A5568"} />
          </div>
        </div>
      </div>
    </div>
  );
};

const House = ({ color }) => (
  <svg width="60" height="60" viewBox="0 0 60 60" className="house-svg">
    <path d="M10 60 V30 L30 10 L50 30 V60 Z" fill={color} />
    <rect x="25" y="45" width="10" height="15" fill="rgba(0,0,0,0.2)" />
    <rect x="15" y="35" width="10" height="10" fill="rgba(255,255,255,0.3)" />
  </svg>
);

const Tree = ({ color, scale = 1 }) => (
  <svg width={40 * scale} height={60 * scale} viewBox="0 0 40 60" className="tree-svg">
    <rect x="17" y="40" width="6" height="20" fill="#744210" />
    <circle cx="20" cy="25" r="20" fill={color} />
  </svg>
);

const Pet = ({ type, color }) => (
  <div className="pet-container floating-subtle">
    {type === 'cat' && (
      <svg width="30" height="30" viewBox="0 0 30 30">
        <circle cx="15" cy="20" r="8" fill={color} />
        <circle cx="15" cy="12" r="5" fill={color} />
        <path d="M12 8 L10 4 L14 8 Z" fill={color} />
        <path d="M18 8 L20 4 L16 8 Z" fill={color} />
        <path d="M23 20 Q28 20 28 10" stroke={color} strokeWidth="2" fill="none" />
      </svg>
    )}
  </div>
);

export default DynamicBackground;

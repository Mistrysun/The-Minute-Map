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

      {/* Landscape Elements - Clean stream only */}
      <div className="landscape">
        <div className="water-stream">
          <svg viewBox="0 0 1440 320" preserveAspectRatio="none">
            <path 
              fill={isDark ? "#2C5282" : "#63B3ED"} 
              d="M0,160L48,176C96,192,192,224,288,224C384,224,480,192,576,165.3C672,139,768,117,864,128C960,139,1056,181,1152,197.3C1248,213,1344,203,1392,197.3L1440,192L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"
            ></path>
          </svg>
        </div>
      </div>
    </div>
  );
};

export default DynamicBackground;

import React, { useState, useEffect } from 'react';
import './App.css';
import ClockFace from './components/ClockFace';
import FeedbackPanel from './components/FeedbackPanel';
import GameSpinner from './components/GameSpinner';
import DynamicBackground from './components/DynamicBackground';
import { CarFront, PersonStanding, Rocket, Sun, Moon, Gamepad2, Trophy, ChevronUp, ChevronDown, MousePointer2, ListChecks, X } from 'lucide-react';
import confetti from 'canvas-confetti';

function App() {
  const [minutes, setMinutes] = useState(0);
  const [hours, setHours] = useState(12);
  const [showHourHand, setShowHourHand] = useState(false);
  const [avatar, setAvatar] = useState('car');
  const [isAm, setIsAm] = useState(true);
  const [activeLandmark, setActiveLandmark] = useState(null);
  const [showGameHub, setShowGameHub] = useState(false);
  const [clockStyle, setClockStyle] = useState('default');

  // Game Mode States
  const [gameType, setGameType] = useState('none'); // 'none', 'written', 'digital', 'creator', 'multiple-choice'
  const [targetTime, setTargetTime] = useState(null);
  const [gameStatus, setGameStatus] = useState('idle');
  const [score, setScore] = useState({ correct: 0, wrong: 0 });
  const [creatorTime, setCreatorTime] = useState({ h: 12, m: 0 });
  const [options, setOptions] = useState([]);

  const handleMinutesChange = (newMinutes) => {
    let delta = newMinutes - minutes;
    if (delta < -30) {
      // Crossed 12 clockwise
      setHours(prev => {
        const next = (prev % 12) + 1;
        if (next === 12) setIsAm(!isAm); // Toggle AM/PM when passing 12
        return next;
      });
    } else if (delta > 30) {
      // Crossed 12 counter-clockwise
      setHours(prev => {
        const next = prev === 1 ? 12 : prev - 1;
        if (next === 11) setIsAm(!isAm);
        return next;
      });
    }
    setMinutes(newMinutes);
  };

  // Helper for written time
  const formatTimeText = (h, m) => {
    const nextH = (h % 12) + 1;
    if (m === 0) return `${h} o'clock`;
    if (m === 30) return `Half past ${h}`;
    if (m === 15) return `Quarter past ${h}`;
    if (m === 45) return `Quarter to ${nextH}`;
    if (m < 30) return `${m} past ${h}`;
    return `${60 - m} to ${nextH}`;
  };

  const getWrittenTime = () => formatTimeText(hours, Math.round(minutes));

  const startNewChallenge = (type = gameType) => {
    const validMinutes = [0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55];
    // For digital modes, use 24h range (0-23)
    const is24h = type === 'digital' || type === 'creator';
    const h = is24h ? Math.floor(Math.random() * 24) : (Math.floor(Math.random() * 12) + 1);
    const m = validMinutes[Math.floor(Math.random() * validMinutes.length)];

    // Map 24h to 12h text for the "Excellent!" message later
    const h12 = h % 12 || 12;
    const text = formatTimeText(h12, m);
    const digital = `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;

    setTargetTime({ h, m, text, digital });
    setGameStatus('playing');
    setCreatorTime({ h: 0, m: 0 }); // Start at 00:00 for 24h
    setShowHourHand(true);

    if (type === 'multiple-choice') {
      // Set the analog clock to the target time
      setHours(h12);
      setMinutes(m);

      // Generate options
      const choices = [text];
      while (choices.length < 4) {
        const randH = Math.floor(Math.random() * 12) + 1;
        const randM = validMinutes[Math.floor(Math.random() * validMinutes.length)];
        const randText = formatTimeText(randH, randM);
        if (!choices.includes(randText)) {
          choices.push(randText);
        }
      }
      setOptions(choices.sort(() => Math.random() - 0.5));
    }
  };

  const toggleGameMode = (type) => {
    if (gameType === type) {
      setGameType('none');
      setGameStatus('idle');
      setTargetTime(null);
    } else {
      setGameType(type);
      setScore({ correct: 0, wrong: 0 });
      startNewChallenge(type);
    }
  };

  const handleOptionSelect = (option) => {
    if (gameStatus !== 'playing') return;

    if (option === targetTime.text) {
      setScore(prev => ({ ...prev, correct: prev.correct + 1 }));
      setGameStatus('success');
      confetti({
        particleCount: 150,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#FFB347', '#66D2CE', '#FF6B6B']
      });

      setTimeout(() => {
        if (gameType !== 'none') {
          startNewChallenge();
        }
      }, 2000);
    } else {
      setScore(prev => ({ ...prev, wrong: prev.wrong + 1 }));
      setGameStatus('wrong');
    }
  };

  const checkAttempt = () => {
    let isCorrect = false;

    if (gameType === 'creator') {
      isCorrect = creatorTime.h === targetTime.h && creatorTime.m === targetTime.m;
    } else {
      const currentM = Math.round(minutes);
      // Map target 24h to 12h for analog comparison
      const targetH12 = targetTime.h % 12 || 12;
      isCorrect = hours === targetH12 && currentM === targetTime.m;
    }

    if (isCorrect) {
      setScore(prev => ({ ...prev, correct: prev.correct + 1 }));
      setGameStatus('success');
      confetti({
        particleCount: 150,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#FFB347', '#66D2CE', '#FF6B6B']
      });

      setTimeout(() => {
        if (gameType !== 'none') {
          startNewChallenge();
        }
      }, 2000);
    } else {
      setScore(prev => ({ ...prev, wrong: prev.wrong + 1 }));
      setGameStatus('wrong');
    }
  };

  const adjustCreatorTime = (field, delta) => {
    setCreatorTime(prev => {
      let newVal = prev[field] + delta;
      if (field === 'h') {
        if (newVal > 23) newVal = 0;
        if (newVal < 0) newVal = 23;
      } else {
        if (newVal >= 60) newVal = 0;
        if (newVal < 0) newVal = 55;
      }
      return { ...prev, [field]: newVal };
    });
  };

  const tryAgain = () => {
    setGameStatus('playing');
  };

  // Determine phase and instruction based on minutes
  let phase = 'start';
  let instruction = 'Drag the hand clockwise to start!';

  if (minutes > 0 && minutes < 30) {
    phase = 'past';
    instruction = 'We are moving past the hour.';
  } else if (minutes === 30) {
    phase = 'past';
    instruction = 'We made it halfway!';
  } else if (minutes > 30 && minutes < 60) {
    phase = 'to';
    instruction = 'Now we are moving to the next hour.';
  }

  // Handle Landmarks
  useEffect(() => {
    // Hide landmarks if showHourHand is active (as requested)
    if (showHourHand) {
      setActiveLandmark(null);
      return;
    }

    const threshold = 1.0;
    let newLandmark = null;

    if (Math.abs(minutes - 15) < threshold) {
      newLandmark = { type: 'past', text: 'A Quarter Past' };
    } else if (Math.abs(minutes - 30) < threshold) {
      newLandmark = { type: 'half', text: 'Half Past' };
    } else if (Math.abs(minutes - 45) < threshold) {
      newLandmark = { type: 'to', text: 'A Quarter To' };
    }

    if (newLandmark) {
      if (!activeLandmark || activeLandmark.text !== newLandmark.text) {
        setActiveLandmark(newLandmark);
      }
    } else {
      setActiveLandmark(null);
    }
  }, [minutes, showHourHand]);

  // Always synchronize theme with clock time
  const getEffectiveTheme = () => {
    const h24 = isAm ? (hours === 12 ? 0 : hours) : (hours === 12 ? 12 : hours + 12);
    return (h24 >= 19 || h24 < 7) ? 'dark' : 'light';
  };

  const theme = getEffectiveTheme();

  return (
    <div className={`app-container ${theme}`}>
      <DynamicBackground theme={theme} />
      <div className="controls-panel">
        <div className="settings-header">Map Settings</div>

        <div className="control-group">
          <label className="toggle-label">
            <span>Show Hour Hand</span>
            <div className="switch">
              <input
                type="checkbox"
                checked={showHourHand}
                onChange={(e) => setShowHourHand(e.target.checked)}
              />
              <span className="slider"></span>
            </div>
          </label>
        </div>

        <div className="control-group">
          <span className="group-label">AM / PM</span>
          <div className="avatar-options">
            <button
              className={`avatar-btn ${isAm ? 'active' : ''}`}
              onClick={() => setIsAm(true)}
              style={{ flex: 1, borderRadius: '0.75rem' }}
            >
              AM
            </button>
            <button
              className={`avatar-btn ${!isAm ? 'active' : ''}`}
              onClick={() => setIsAm(false)}
              style={{ flex: 1, borderRadius: '0.75rem' }}
            >
              PM
            </button>
          </div>
        </div>

        <div className="control-group">
          <span className="group-label">Choose Avatar</span>
          <div className="avatar-options">
            <button
              className={`avatar-btn ${avatar === 'car' ? 'active' : ''}`}
              onClick={() => setAvatar('car')}
              title="Car"
            >
              <CarFront size={20} />
            </button>
            <button
              className={`avatar-btn ${avatar === 'hiker' ? 'active' : ''}`}
              onClick={() => setAvatar('hiker')}
              title="Hiker"
            >
              <PersonStanding size={20} />
            </button>
            <button
              className={`avatar-btn ${avatar === 'rocket' ? 'active' : ''}`}
              onClick={() => setAvatar('rocket')}
              title="Rocket"
            >
              <Rocket size={20} />
            </button>
          </div>
        </div>

        <div className="control-group">
          <span className="group-label">Clock Style</span>
          <div className="avatar-options">
            <button
              className={`style-dot default ${clockStyle === 'default' ? 'active' : ''}`}
              onClick={() => setClockStyle('default')}
              title="Classic"
            />
            <button
              className={`style-dot midnight ${clockStyle === 'midnight' ? 'active' : ''}`}
              onClick={() => setClockStyle('midnight')}
              title="Midnight"
            />
            <button
              className={`style-dot candy ${clockStyle === 'candy' ? 'active' : ''}`}
              onClick={() => setClockStyle('candy')}
              title="Candy"
            />
            <button
              className={`style-dot nature ${clockStyle === 'nature' ? 'active' : ''}`}
              onClick={() => setClockStyle('nature')}
              title="Nature"
            />
          </div>
        </div>

        <div className="control-group" style={{ marginTop: '0.5rem' }}>
          <button
            className={`game-hub-btn ${showGameHub ? 'active' : ''}`}
            onClick={() => {
              if (gameType !== 'none') {
                setGameType('none');
                setGameStatus('idle');
              } else {
                setShowGameHub(!showGameHub);
              }
            }}
          >
            <Gamepad2 size={20} style={{ marginRight: '8px' }} />
            {gameType !== 'none' ? 'Exit Mission' : showGameHub ? 'Close Hub' : 'Play a Game!'}
          </button>
        </div>
      </div>

      {!showGameHub && (
        <div className="header">
          <h1>The Minute Map</h1>
          <p>Learn to read time with the Directional Flow</p>
        </div>
      )}

      <div className="main-content">
        {showGameHub && gameType === 'none' ? (
          <GameSpinner onSpinComplete={(type) => {
            setShowGameHub(false);
            toggleGameMode(type);
          }} />
        ) : gameType !== 'none' ? (
          <div className={`mission-panel ${gameStatus}`}>
            <div className="score-display">
              <span className="score-correct">Correct: {score.correct}</span>
              <span className="score-wrong">Wrong: {score.wrong}</span>
            </div>

            <div className="mission-header">
              {gameStatus === 'success' ? 'MISSION ACCOMPLISHED!' :
                gameStatus === 'wrong' ? 'NOT QUITE...' :
                  gameType === 'digital' ? 'TIME TRAVELLER MISSION:' :
                    gameType === 'creator' ? 'DIGITAL CREATOR:' :
                      gameType === 'multiple-choice' ? 'MULTIPLE CHOICE:' : 'WORD MISSION:'}
            </div>

            <div className="mission-text">
              {gameStatus === 'success' ? (
                <div className="success-content">
                  <Trophy size={32} color="#FFB347" style={{ marginBottom: '0.5rem' }} />
                  <div>Excellent! You found {targetTime.text}!</div>
                  <div className="auto-next-label">Next mission coming...</div>
                </div>
              ) : gameStatus === 'wrong' ? (
                <div className="wrong-content">
                  <div>Oops! That's not right.</div>
                  <button className="try-again-btn" onClick={tryAgain}>
                    Try Again
                  </button>
                </div>
              ) : (
                <>
                  <div className="target-display">
                    {gameType === 'digital' ? (
                      <div className="target-digital">{targetTime.digital}</div>
                    ) : gameType === 'multiple-choice' ? (
                      <div className="mission-prompt">What time is shown on the clock?</div>
                    ) : (
                      <div className="mission-prompt">Set the digital clock to: <strong>{targetTime.text}</strong></div>
                    )}
                  </div>

                  {gameType === 'creator' && gameStatus === 'playing' && (
                    <div className="digital-picker">
                      <div className="picker-column">
                        <button className="picker-btn" onClick={() => adjustCreatorTime('h', 1)}><ChevronUp /></button>
                        <div className="picker-value">{creatorTime.h}</div>
                        <button className="picker-btn" onClick={() => adjustCreatorTime('h', -1)}><ChevronDown /></button>
                      </div>
                      <div className="picker-separator">:</div>
                      <div className="picker-column">
                        <button className="picker-btn" onClick={() => adjustCreatorTime('m', 5)}><ChevronUp /></button>
                        <div className="picker-value">{creatorTime.m.toString().padStart(2, '0')}</div>
                        <button className="picker-btn" onClick={() => adjustCreatorTime('m', -5)}><ChevronDown /></button>
                      </div>
                    </div>
                  )}

                  {gameType === 'multiple-choice' && gameStatus === 'playing' && (
                    <div className="options-grid">
                      {options.map((opt, i) => (
                        <button key={i} className="option-btn" onClick={() => handleOptionSelect(opt)}>
                          {opt}
                        </button>
                      ))}
                    </div>
                  )}

                  {gameType !== 'multiple-choice' && (
                    <button className="check-time-btn" onClick={checkAttempt}>
                      Check My Time
                    </button>
                  )}
                </>
              )}
            </div>
          </div>
        ) : (
          <FeedbackPanel phase={phase} instruction={instruction} />
        )}

        {!showGameHub && gameType !== 'creator' && (
          <ClockFace
            minutes={minutes}
            setMinutes={handleMinutesChange}
            hours={hours}
            setHours={setHours}
            showHourHand={showHourHand}
            isGameMode={gameType !== 'none'}
            isDraggable={gameType !== 'multiple-choice'}
            avatar={avatar}
            activeLandmark={activeLandmark}
            clockStyle={clockStyle}
          />
        )}

        {!showGameHub && (showHourHand || gameType !== 'none') && gameType !== 'creator' && (
          <div className="time-outputs">
            {/* Hide digital clock if in any game mode (per user request) */}
            {gameType === 'none' && (
              <div className={`digital-clock ${theme}`}>
                <span className="digital-hours">{hours}</span>
                <span className="digital-colon">:</span>
                <span className="digital-minutes">
                  {Math.round(minutes).toString().padStart(2, '0')}
                </span>
                <span className="digital-am-pm" style={{ fontSize: '0.8rem', marginLeft: '4px', opacity: 0.7 }}>
                  {isAm ? 'AM' : 'PM'}
                </span>
              </div>
            )}

            {/* Hide written time if in word/digital mode to keep it challenging */}
            {gameType === 'none' && (
              <div className={`written-time-display ${phase}`}>
                {getWrittenTime()}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default App;

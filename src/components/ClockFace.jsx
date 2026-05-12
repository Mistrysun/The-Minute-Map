import React, { useRef, useEffect, useState } from 'react';
import { CarFront, PersonStanding, Rocket } from 'lucide-react';

const ClockFace = ({ minutes, setMinutes, hours, setHours, showHourHand, isGameMode, isDraggable = true, avatar, activeLandmark }) => {
  const svgRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);
  const [draggingHand, setDraggingHand] = useState(null); // 'minute' or 'hour'

  // Convert minutes to angle (-90 to 270)
  const getAngleForMinutes = (m) => (m * 6) - 90;

  // Convert hours and minutes to angle for hour hand
  const getAngleForHours = (h, m) => {
    const baseAngle = (h % 12) * 30; // 360 / 12 = 30 deg per hour
    const minuteOffset = (m / 60) * 30; // Proportional movement
    return baseAngle + minuteOffset - 90;
  };

  const handleDrag = (clientX, clientY) => {
    if (!svgRef.current || !draggingHand || !isDraggable) return;

    const rect = svgRef.current.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;

    const dx = clientX - cx;
    const dy = clientY - cy;

    let angleRad = Math.atan2(dy, dx);
    let deg = angleRad * (180 / Math.PI);

    let newDeg = (deg + 90) % 360;
    if (newDeg < 0) newDeg += 360;

    if (draggingHand === 'minute') {
      let newMinutes = newDeg / 6;
      let delta = newMinutes - minutes;
      if (delta < -30) delta += 60;
      if (delta > 30) delta -= 60;

      // In Game Mode, allow free movement. Otherwise, enforce clockwise (Phase 1 logic)
      if (isGameMode || delta > 0) {
        setMinutes(newMinutes);
      }
    } else if (draggingHand === 'hour') {
      // For hour hand, we calculate the nearest hour
      let newHour = Math.round(newDeg / 30);
      if (newHour === 0) newHour = 12;
      if (newHour !== hours) {
        setHours(newHour);
      }
    }
  };

  const onPointerDown = (e) => {
    if (!svgRef.current || !isDraggable) return;

    const rect = svgRef.current.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const dx = e.clientX - cx;
    const dy = e.clientY - cy;
    const dist = Math.sqrt(dx * dx + dy * dy);

    // Determine which hand was clicked based on distance and angle
    // In a simple version, we can check if they clicked further out (minute) or closer in (hour)
    // Radius is 160. Minute hand is ~140, Hour hand is ~90.
    if (dist > 100) {
      setDraggingHand('minute');
    } else if (showHourHand && dist > 10) {
      setDraggingHand('hour');
    } else {
      return; // Clicked near center
    }

    setIsDragging(true);
    e.target.setPointerCapture(e.pointerId);
    handleDrag(e.clientX, e.clientY);
  };

  const onPointerMove = (e) => {
    if (isDragging) {
      handleDrag(e.clientX, e.clientY);
    }
  };

  const onPointerUp = (e) => {
    setIsDragging(false);
    setDraggingHand(null);
    e.target.releasePointerCapture(e.pointerId);
  };

  const radius = 160;
  const cx = 200;
  const cy = 200;

  const currentAngle = getAngleForMinutes(minutes);
  const currentRad = currentAngle * (Math.PI / 180);

  const handX = cx + (radius - 20) * Math.cos(currentRad);
  const handY = cy + (radius - 20) * Math.sin(currentRad);

  const hourAngle = getAngleForHours(hours, minutes);
  const hourRad = hourAngle * (Math.PI / 180);
  const hourHandX = cx + (radius - 70) * Math.cos(hourRad);
  const hourHandY = cy + (radius - 70) * Math.sin(hourRad);

  const carX = cx + (radius + 20) * Math.cos(currentRad);
  const carY = cy + (radius + 20) * Math.sin(currentRad);

  const describeArc = (x, y, r, startAngle, endAngle) => {
    const startRad = startAngle * Math.PI / 180;
    const endRad = endAngle * Math.PI / 180;
    const startX = x + r * Math.cos(startRad);
    const startY = y + r * Math.sin(startRad);
    const endX = x + r * Math.cos(endRad);
    const endY = y + r * Math.sin(endRad);

    let largeArcFlag = endAngle - startAngle <= 180 ? "0" : "1";
    if (endAngle < startAngle) {
      largeArcFlag = (endAngle + 360) - startAngle <= 180 ? "0" : "1";
    }

    return [
      "M", startX, startY,
      "A", r, r, 0, largeArcFlag, 1, endX, endY
    ].join(" ");
  };

  const isPast = minutes > 0 && minutes <= 30;
  const isTo = minutes > 30 && minutes < 60;

  const renderAvatar = () => {
    const props = { color: "var(--color-text)", size: 32 };
    switch (avatar) {
      case 'hiker': return <PersonStanding {...props} />;
      case 'rocket': return <Rocket {...props} />;
      default: return <CarFront {...props} />;
    }
  };

  return (
    <div className="clock-container"
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}>

      {activeLandmark && (
        <div className="landmark-popup-container">
          <div className={`landmark-popup ${activeLandmark.type}`}>
            {activeLandmark.text}
          </div>
        </div>
      )}

      <svg className="clock-face" viewBox="0 0 400 400" ref={svgRef}>
        <path d={`M 200 40 A 160 160 0 0 1 200 360 Z`} className={`zone-past ${isPast ? 'active' : ''}`} />
        <path d={`M 200 360 A 160 160 0 0 1 200 40 Z`} className={`zone-to ${isTo ? 'active' : ''}`} />

        {[...Array(60)].map((_, i) => {
          const isMajor = i % 5 === 0;
          const a = (i * 6 - 90) * (Math.PI / 180);
          const r1 = isMajor ? radius - 15 : radius - 5;
          const r2 = radius;
          return (
            <line
              key={i}
              x1={cx + r1 * Math.cos(a)}
              y1={cy + r1 * Math.sin(a)}
              x2={cx + r2 * Math.cos(a)}
              y2={cy + r2 * Math.sin(a)}
              className={isMajor ? "clock-tick-major" : "clock-tick"}
            />
          );
        })}

        {[...Array(12)].map((_, i) => {
          const num = i === 0 ? 12 : i;
          const a = (i * 30 - 90) * (Math.PI / 180);
          const r = radius - 35;
          return (
            <text key={i} x={cx + r * Math.cos(a)} y={cy + r * Math.sin(a)} className="clock-number">
              {num}
            </text>
          );
        })}

        {isPast && minutes > 0.5 && (
          <path d={describeArc(cx, cy, radius - 60, -90, currentAngle)} className="gap-arc past" />
        )}

        {isTo && minutes < 59.5 && (
          <path d={describeArc(cx, cy, radius - 60, currentAngle, 270)} className="gap-arc to" />
        )}

        {/* Hour Hand */}
        {showHourHand && (
          <line
            x1={cx}
            y1={cy}
            x2={hourHandX}
            y2={hourHandY}
            className="hour-hand"
            stroke="var(--color-text)"
            strokeWidth="16"
            strokeLinecap="round"
            opacity="0.8"
          />
        )}

        {/* Minute Hand */}
        <line x1={cx} y1={cy} x2={handX} y2={handY} className="minute-hand" />

        <circle cx={cx} cy={cy} r="12" className="center-dot" />
        <circle cx={cx} cy={cy} r="6" fill="white" />

        <g transform={`translate(${carX - 16}, ${carY - 16}) rotate(${currentAngle + 90}, 16, 16)`}>
          {renderAvatar()}
        </g>
      </svg>
    </div>
  );
};

export default ClockFace;

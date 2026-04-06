import { useState, useRef, useEffect, useCallback } from 'react';

const ITEM_HEIGHT = 40;
const VISIBLE_COUNT = 4;
const ROLLER_HEIGHT = ITEM_HEIGHT * VISIBLE_COUNT;
const RADIUS = (ITEM_HEIGHT * VISIBLE_COUNT) / Math.PI;
const CENTER_Y = '58%';

// Proper modulo that always returns positive
function mod(n, m) {
  return ((n % m) + m) % m;
}

export default function DrumRoller({ items, selectedIndex, onChange, isLooping = true }) {
  const n = items.length;
  const [angle, setAngle] = useState(selectedIndex); // fractional index position
  const [isDragging, setIsDragging] = useState(false);
  const dragStart = useRef(0);
  const dragStartAngle = useRef(0);
  const velocity = useRef(0);
  const lastY = useRef(0);
  const lastTime = useRef(0);
  const animFrame = useRef(null);
  const containerRef = useRef(null);

  // Clamp angle if not looping
  const clampAngle = useCallback((a) => {
    if (!isLooping) {
      return Math.max(0, Math.min(n - 1, a));
    }
    return a;
  }, [isLooping, n]);

  // Sync when selectedIndex changes externally
  useEffect(() => {
    if (!isDragging) {
      if (isLooping) {
        const current = mod(angle, n);
        let diff = selectedIndex - current;
        if (diff > n / 2) diff -= n;
        if (diff < -n / 2) diff += n;
        setAngle(angle + diff);
      } else {
        setAngle(selectedIndex);
      }
    }
  }, [selectedIndex]);

  const snapTo = useCallback((currentAngle, vel = 0) => {
    let targetAngle = currentAngle - vel * 0.3 / ITEM_HEIGHT;
    let snappedIndex = Math.round(targetAngle);
    
    // Clamp if not looping
    if (!isLooping) {
      snappedIndex = Math.max(0, Math.min(n - 1, snappedIndex));
    }
    
    const startAngle = currentAngle;
    const distance = snappedIndex - startAngle;
    const duration = Math.min(400, Math.max(150, Math.abs(distance) * ITEM_HEIGHT * 2));
    const startTime = performance.now();

    const animate = (now) => {
      const elapsed = now - startTime;
      const progress = Math.min(1, elapsed / duration);
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = startAngle + distance * eased;
      setAngle(clampAngle(current));

      if (progress < 1) {
        animFrame.current = requestAnimationFrame(animate);
      } else {
        setAngle(snappedIndex);
        const originalIndex = isLooping ? mod(snappedIndex, n) : snappedIndex;
        if (originalIndex !== selectedIndex) {
          onChange(originalIndex);
        }
      }
    };
    cancelAnimationFrame(animFrame.current);
    animFrame.current = requestAnimationFrame(animate);
  }, [n, selectedIndex, onChange, isLooping, clampAngle]);

  const getY = (e) => {
    if (e.touches) return e.touches[0].clientY;
    return e.clientY;
  };

  const handleStart = useCallback((e) => {
    cancelAnimationFrame(animFrame.current);
    const y = getY(e);
    dragStart.current = y;
    dragStartAngle.current = angle;
    lastY.current = y;
    lastTime.current = performance.now();
    velocity.current = 0;
    setIsDragging(true);
  }, [angle]);

  const handleMove = useCallback((e) => {
    if (!isDragging) return;
    if (e.cancelable) {
      e.preventDefault();
    }
    const y = getY(e);
    const now = performance.now();
    const dt = now - lastTime.current;
    if (dt > 0) {
      velocity.current = (y - lastY.current) / dt * 1000;
    }
    lastY.current = y;
    lastTime.current = now;
    const delta = y - dragStart.current;
    const newAngle = dragStartAngle.current - delta / ITEM_HEIGHT;
    setAngle(clampAngle(newAngle));
  }, [isDragging, clampAngle]);

  const handleEnd = useCallback(() => {
    if (!isDragging) return;
    setIsDragging(false);
    snapTo(angle, velocity.current);
  }, [isDragging, angle, snapTo]);

  useEffect(() => {
    if (isDragging) {
      const onMove = (e) => handleMove(e);
      const onUp = () => handleEnd();
      document.addEventListener('mousemove', onMove);
      document.addEventListener('mouseup', onUp);
      return () => {
        document.removeEventListener('mousemove', onMove);
        document.removeEventListener('mouseup', onUp);
      };
    }
  }, [isDragging, handleMove, handleEnd]);

  useEffect(() => {
    return () => cancelAnimationFrame(animFrame.current);
  }, []);

  const handleWheel = useCallback((e) => {
    if (e.cancelable) {
      e.preventDefault();
    }
    cancelAnimationFrame(animFrame.current);
    const newAngle = clampAngle(angle + e.deltaY / ITEM_HEIGHT);
    setAngle(newAngle);
    clearTimeout(containerRef.current._wheelTimer);
    containerRef.current._wheelTimer = setTimeout(() => {
      snapTo(newAngle, 0);
    }, 100);
  }, [angle, snapTo, clampAngle]);

  const getItemStyle = (distFromCenter, y, z, scale) => {
    const rotateX = distFromCenter * 24;
    const scaleY = Math.max(0.45, scale);
    const scaleX = Math.max(0.82, 1 - Math.abs(distFromCenter) * 0.05);

    return {
      position: 'absolute',
      left: 0,
      right: 0,
      height: ITEM_HEIGHT,
      top: CENTER_Y,
      transform: `translateY(${y - ITEM_HEIGHT / 2}px) translateZ(${z}px) rotateX(${rotateX}deg) scaleX(${scaleX}) scaleY(${scaleY})`,
      transformOrigin: 'center center',
      opacity: Math.max(0, Math.pow(scale, 1.5)),
      fontSize: `${20 + 14 * Math.max(0, scale - 0.5) * 2}px`,
      fontWeight: Math.abs(distFromCenter) < 0.5 ? '600' : '400',
      color: Math.abs(distFromCenter) < 0.5 ? 'var(--brown)' : 'var(--brown-m)',
      pointerEvents: 'none',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: "'Work Sans', sans-serif",
      userSelect: 'none',
      willChange: 'transform, opacity',
    };
  };

  const renderItems = () => {
    const rendered = [];
    
    if (isLooping) {
      // Looping mode: render with modular wrapping
      for (let offset = -3; offset <= 3; offset++) {
        const itemIndex = mod(Math.round(angle) + offset, n);
        const distFromCenter = (Math.round(angle) + offset) - angle;
        const theta = (distFromCenter * ITEM_HEIGHT / RADIUS);
        
        const y = Math.sin(theta) * RADIUS;
        const z = Math.cos(theta) * RADIUS - RADIUS;
        const scale = Math.cos(theta);
        const opacity = Math.max(0, Math.pow(Math.cos(theta), 1.5));
        
        if (scale <= 0) continue;
        
        rendered.push(
          <div
            key={`${offset}`}
            className="drum-item"
            style={getItemStyle(distFromCenter, y, z, scale)}
          >
            {items[itemIndex]}
          </div>
        );
      }
    } else {
      // Non-looping mode: only render available items, clamped
      for (let offset = -3; offset <= 3; offset++) {
        const itemIndex = Math.round(angle) + offset;
        if (itemIndex < 0 || itemIndex >= n) continue;
        
        const distFromCenter = itemIndex - angle;
        const theta = (distFromCenter * ITEM_HEIGHT / RADIUS);
        
        const y = Math.sin(theta) * RADIUS;
        const z = Math.cos(theta) * RADIUS - RADIUS;
        const scale = Math.cos(theta);
        const opacity = Math.max(0, Math.pow(Math.cos(theta), 1.5));
        
        if (scale <= 0) continue;
        
        rendered.push(
          <div
            key={`${offset}`}
            className="drum-item"
            style={getItemStyle(distFromCenter, y, z, scale)}
          >
            {items[itemIndex]}
          </div>
        );
      }
    }
    return rendered;
  };

  return (
    <div
      ref={containerRef}
      className="drum-roller-column"
      style={{
        height: ROLLER_HEIGHT,
        position: 'relative',
        overflow: 'hidden',
        cursor: isDragging ? 'grabbing' : 'grab',
        perspective: '800px',
        touchAction: 'none',
        flex: 1,
      }}
      onMouseDown={handleStart}
      onTouchStart={handleStart}
      onTouchMove={handleMove}
      onTouchEnd={handleEnd}
      onWheel={handleWheel}
    >
      <div className="drum-selection-band" />
      <div className="drum-fade-top" />
      <div className="drum-fade-bottom" />
      <div style={{ position: 'absolute', inset: 0, perspective: '800px' }}>
        {renderItems()}
      </div>
    </div>
  );
}

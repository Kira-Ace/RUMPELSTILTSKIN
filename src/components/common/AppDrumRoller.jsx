import { useState, useRef, useEffect, useCallback, useLayoutEffect } from 'react';

// VISIBLE_COUNT controls how many items span the container width (ratio-based sizing)
const VISIBLE_COUNT = 3;

function mod(n, m) {
  return ((n % m) + m) % m;
}

export default function AppDrumRoller({ items, selectedIndex, onChange }) {
  const n = items.length;
  const [angle, setAngle] = useState(selectedIndex);
  const [isDragging, setIsDragging] = useState(false);
  // containerWidth drives itemWidth so the roller flexes with its parent
  const [containerWidth, setContainerWidth] = useState(240);
  const dragStart = useRef(0);
  const dragStartAngle = useRef(0);
  const velocity = useRef(0);
  const lastX = useRef(0);
  const lastTime = useRef(0);
  const animFrame = useRef(null);
  const containerRef = useRef(null);

  // itemWidth = 1/VISIBLE_COUNT of container → adapts to any flex/grid parent
  const itemWidth = containerWidth / VISIBLE_COUNT;
  const RADIUS = containerWidth / Math.PI;

  // Measure and watch container width
  useLayoutEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const ro = new ResizeObserver(([entry]) => {
      setContainerWidth(entry.contentRect.width || 240);
    });
    ro.observe(el);
    setContainerWidth(el.offsetWidth || 240);
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    if (!isDragging) {
      const current = mod(angle, n);
      let diff = selectedIndex - current;
      if (diff > n / 2) diff -= n;
      if (diff < -n / 2) diff += n;
      setAngle(angle + diff);
    }
  }, [selectedIndex]);

  const snapTo = useCallback((currentAngle, vel = 0) => {
    const iw = itemWidth;
    let targetAngle = currentAngle + vel * 0.3 / iw;
    let snappedIndex = Math.round(targetAngle);

    const startAngle = currentAngle;
    const distance = snappedIndex - startAngle;
    const duration = Math.min(400, Math.max(150, Math.abs(distance) * iw * 2));
    const startTime = performance.now();

    const animate = (now) => {
      const elapsed = now - startTime;
      const progress = Math.min(1, elapsed / duration);
      const eased = 1 - Math.pow(1 - progress, 3);
      setAngle(startAngle + distance * eased);
      if (progress < 1) {
        animFrame.current = requestAnimationFrame(animate);
      } else {
        setAngle(snappedIndex);
        const originalIndex = mod(snappedIndex, n);
        if (originalIndex !== selectedIndex) onChange(originalIndex);
      }
    };
    cancelAnimationFrame(animFrame.current);
    animFrame.current = requestAnimationFrame(animate);
  }, [itemWidth, n, selectedIndex, onChange]);

  const getX = (e) => (e.touches ? e.touches[0].clientX : e.clientX);

  const handleStart = useCallback((e) => {
    cancelAnimationFrame(animFrame.current);
    const x = getX(e);
    dragStart.current = x;
    dragStartAngle.current = angle;
    lastX.current = x;
    lastTime.current = performance.now();
    velocity.current = 0;
    setIsDragging(true);
  }, [angle]);

  const handleMove = useCallback((e) => {
    if (!isDragging) return;
    if (e.cancelable) e.preventDefault();
    const x = getX(e);
    const now = performance.now();
    const dt = now - lastTime.current;
    if (dt > 0) velocity.current = (x - lastX.current) / dt * 1000;
    lastX.current = x;
    lastTime.current = now;
    setAngle(dragStartAngle.current - (x - dragStart.current) / itemWidth);
  }, [isDragging, itemWidth]);

  const handleEnd = useCallback(() => {
    if (!isDragging) return;
    setIsDragging(false);
    snapTo(angle, velocity.current);
  }, [isDragging, angle, snapTo]);

  useEffect(() => {
    if (!isDragging) return;
    const onMove = (e) => handleMove(e);
    const onUp = () => handleEnd();
    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseup', onUp);
    document.addEventListener('touchmove', onMove, { passive: false });
    document.addEventListener('touchend', onUp);
    return () => {
      document.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseup', onUp);
      document.removeEventListener('touchmove', onMove);
      document.removeEventListener('touchend', onUp);
    };
  }, [isDragging, handleMove, handleEnd]);

  useEffect(() => () => cancelAnimationFrame(animFrame.current), []);

  const handleWheel = useCallback((e) => {
    if (e.cancelable) e.preventDefault();
    cancelAnimationFrame(animFrame.current);
    const newAngle = angle + e.deltaX / itemWidth;
    setAngle(newAngle);
    clearTimeout(containerRef.current._wheelTimer);
    containerRef.current._wheelTimer = setTimeout(() => snapTo(newAngle, 0), 100);
  }, [angle, itemWidth, snapTo]);

  const renderItems = () => {
    const rendered = [];
    for (let offset = -2; offset <= 2; offset++) {
      const itemIndex = mod(Math.round(angle) + offset, n);
      const distFromCenter = (Math.round(angle) + offset) - angle;
      const theta = (distFromCenter * itemWidth / RADIUS);
      const x = Math.sin(theta) * RADIUS;
      const z = Math.cos(theta) * RADIUS - RADIUS;
      const scale = Math.cos(theta);
      if (scale <= 0) continue;

      const isCenter = Math.abs(distFromCenter) < 0.5;
      const item = items[itemIndex];
      const imgSize = Math.round(itemWidth * (isCenter ? 1.1 : 0.8));

      rendered.push(
        <div
          key={String(offset)}
          className="app-drum-item"
          style={{
            position: 'absolute',
            top: 0,
            bottom: 0,
            left: '50%',
            width: itemWidth,
            transform: `translateX(${x - itemWidth / 2}px) translateZ(${z}px) scale(${Math.max(0.55, scale)})`,
            transformOrigin: 'center center',
            opacity: Math.max(0, Math.pow(scale, 1.5)),
            pointerEvents: 'none',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            userSelect: 'none',
            willChange: 'transform, opacity',
          }}
        >
          {item.logo
            ? <img src={item.logo} alt={item.label} style={{ width: imgSize, height: imgSize, objectFit: 'contain', borderRadius: imgSize * 0.18 }} draggable={false} />
            : <span style={{ fontSize: Math.round(itemWidth * 0.15), fontFamily: "'Work Sans', sans-serif", fontWeight: isCenter ? '600' : '400', color: isCenter ? 'var(--brown)' : 'var(--brown-m)', whiteSpace: 'nowrap' }}>{item.label}</span>
          }
        </div>
      );
    }
    return rendered;
  };

  return (
    <div
      ref={containerRef}
      className="app-drum-roller"
      style={{
        width: '100%',
        height: 52,
        position: 'relative',
        overflow: 'hidden',
        cursor: isDragging ? 'grabbing' : 'grab',
        perspective: '800px',
        touchAction: 'none',
      }}
      onMouseDown={handleStart}
      onTouchStart={handleStart}
      onTouchMove={handleMove}
      onTouchEnd={handleEnd}
      onWheel={handleWheel}
    >
      <div className="app-drum-fade-left" />
      <div className="app-drum-fade-right" />
      <div style={{ position: 'absolute', inset: 0, perspective: '800px' }}>
        {renderItems()}
      </div>
    </div>
  );
}

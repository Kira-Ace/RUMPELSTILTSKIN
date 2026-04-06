import { useEffect, useRef } from 'react';
import rumpelImg from '../assets/rumpel.png';

export default function RoomCenterpiece() {
  const imgRef = useRef(null);
  const mouse = useRef({ x: 0, y: 0 });
  const smooth = useRef({ x: 0, y: 0 });
  const raf = useRef(null);

  useEffect(() => {
    const onMouse = (e) => {
      mouse.current.x = (e.clientX / window.innerWidth - 0.5) * 2;
      mouse.current.y = (e.clientY / window.innerHeight - 0.5) * 2;
    };
    const onOrientation = (e) => {
      mouse.current.x = Math.max(-1, Math.min(1, (e.gamma || 0) / 35));
      mouse.current.y = Math.max(-1, Math.min(1, ((e.beta || 0) - 45) / 35));
    };
    window.addEventListener('mousemove', onMouse);
    window.addEventListener('deviceorientation', onOrientation);

    // Much smaller parallax factor than the room (20% of room parallax)
    const updateParallax = () => {
      smooth.current.x += (mouse.current.x - smooth.current.x) * 0.05;
      smooth.current.y += (mouse.current.y - smooth.current.y) * 0.05;

      // Invert direction (opposite of mouse) and reduce magnitude significantly
      const offsetX = -smooth.current.x * 30;  // reduced from room's ~120px max
      const offsetY = -smooth.current.y * 20;  // reduced from room's ~100px max

      if (imgRef.current) {
        imgRef.current.style.transform = `translate(${offsetX}px, ${offsetY}px) scale(1.0)`;
      }

      raf.current = requestAnimationFrame(updateParallax);
    };

    raf.current = requestAnimationFrame(updateParallax);

    return () => {
      window.removeEventListener('mousemove', onMouse);
      window.removeEventListener('deviceorientation', onOrientation);
      if (raf.current) cancelAnimationFrame(raf.current);
    };
  }, []);

  return (
    <div className="room-centerpiece">
      <img
        ref={imgRef}
        src={rumpelImg}
        alt="Rumpelstiltskin"
        className="centerpiece-img"
      />
    </div>
  );
}

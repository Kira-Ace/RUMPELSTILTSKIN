import { useEffect, useRef } from 'react';

/*
 * ROOM TEXTURE CONFIG — Change these to restyle the room quickly.
 * Each value is a CSS color string (hex, rgb, hsl, etc.)
 */
export const ROOM_THEME = {
  backWall:   '#474034',   // back wall — aged stone grey
  leftWall:   '#4a4438',   // left wall — darker stone
  rightWall:  '#4a4438',   // right wall — darker stone
  ceiling:    '#3a342a',   // ceiling — dark aged stone
  floor:      '#2a251f',   // floor — darkest ground level
  floorGrid:  'rgba(180,170,160,0.10)', // floor grid line color

  ambient:    0.13,         // corner shadow intensity (0–0.15)
};

function proj(x, y, z, fov, cx, cy) {
  const s = fov / (fov + z);
  return [cx + x * s, cy + y * s];
}

// Parse a CSS color to [r,g,b] 0-255
function parseColor(c) {
  const el = document.createElement('canvas');
  el.width = el.height = 1;
  const cx = el.getContext('2d');
  cx.fillStyle = c;
  cx.fillRect(0, 0, 1, 1);
  const d = cx.getImageData(0, 0, 1, 1).data;
  return [d[0], d[1], d[2]];
}

// Darken/lighten an [r,g,b] by factor (>1 = lighter, <1 = darker)
function shade([r, g, b], factor) {
  const f = (v) => Math.min(255, Math.max(0, Math.round(v * factor)));
  return `rgb(${f(r)},${f(g)},${f(b)})`;
}

export default function ParallaxRoom({ theme }) {
  const canvasRef = useRef(null);
  const raf = useRef(null);
  const mouse = useRef({ x: 0, y: 0 });
  const smooth = useRef({ x: 0, y: 0 });

  const t = { ...ROOM_THEME, ...theme };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    // Parse theme colors once
    const cBack = parseColor(t.backWall);
    const cLeft = parseColor(t.leftWall);
    const cRight = parseColor(t.rightWall);
    const cCeil = parseColor(t.ceiling);
    const cFloor = parseColor(t.floor);

    const resize = () => {
      const dpr = window.devicePixelRatio || 1;
      const rect = canvas.parentElement.getBoundingClientRect();
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      canvas.style.width = rect.width + 'px';
      canvas.style.height = rect.height + 'px';
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    window.addEventListener('resize', resize);

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

    function fillQuad(pts, style) {
      ctx.fillStyle = style;
      ctx.beginPath();
      ctx.moveTo(pts[0][0], pts[0][1]);
      for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i][0], pts[i][1]);
      ctx.closePath();
      ctx.fill();
    }

    function draw() {
      // Smooth mouse interpolation
      smooth.current.x += (mouse.current.x - smooth.current.x) * 0.08;
      smooth.current.y += (mouse.current.y - smooth.current.y) * 0.08;
      const mx = smooth.current.x;
      const my = smooth.current.y;

      const rect = canvas.parentElement.getBoundingClientRect();
      const W = rect.width;
      const H = rect.height;

      ctx.clearRect(0, 0, W, H);

      // Fill entire canvas with darkest stone as base (no gaps)
      ctx.fillStyle = `rgb(${cFloor[0]},${cFloor[1]},${cFloor[2]})`;
      ctx.fillRect(0, 0, W, H);

      // ── Single vanishing point driven by mouse ──
      // This is the "camera look" — shifting VP makes near geometry
      // move more than far geometry, creating real parallax.
      // INVERTED: move opposite of mouse direction for correct perspective
      const fov = 300;
      const vpx = W * 0.5 - mx * W * 0.12;
      const vpy = H * 0.44 - my * H * 0.10;

      // Room box: back wall dimensions (smaller and narrower now)
      const hw = 180, hh = 140, D = 220;
      const p = (x, y, z) => proj(x, y, z, fov, vpx, vpy);

      // Back wall corners (far plane)
      const bTL = p(-hw, -hh, D);
      const bTR = p(hw, -hh, D);
      const bBL = p(-hw, hh, D);
      const bBR = p(hw, hh, D);

      // Front opening — expand responsively to cover viewport without edge visibility
      // Place front plane very close to camera with massive coverage
      const frontCoverX = W * 3;
      const frontCoverY = H * 3;
      const nearZ = 0.01;
      const fTL = p(-frontCoverX, -frontCoverY, nearZ);
      const fTR = p(frontCoverX, -frontCoverY, nearZ);
      const fBL = p(-frontCoverX, frontCoverY, nearZ);
      const fBR = p(frontCoverX, frontCoverY, nearZ);

      // ── BACK WALL ──
      fillQuad([bTL, bTR, bBR, bBL], `rgb(${cBack[0]},${cBack[1]},${cBack[2]})`);

      // ── LEFT WALL ──
      fillQuad([fTL, bTL, bBL, fBL], `rgb(${cLeft[0]},${cLeft[1]},${cLeft[2]})`);

      // ── RIGHT WALL ──
      fillQuad([fTR, bTR, bBR, fBR], `rgb(${cRight[0]},${cRight[1]},${cRight[2]})`);

      // ── CEILING ──
      fillQuad([fTL, bTL, bTR, fTR], `rgb(${cCeil[0]},${cCeil[1]},${cCeil[2]})`);

      // ── FLOOR ──
      ctx.beginPath();
      ctx.moveTo(fBL[0], fBL[1]);
      ctx.lineTo(bBL[0], bBL[1]);
      ctx.lineTo(bBR[0], bBR[1]);
      ctx.lineTo(fBR[0], fBR[1]);
      ctx.closePath();
      ctx.fillStyle = `rgb(${cFloor[0]},${cFloor[1]},${cFloor[2]})`;
      ctx.fill();


      raf.current = requestAnimationFrame(draw);
    }

    raf.current = requestAnimationFrame(draw);

    return () => {
      window.removeEventListener('resize', resize);
      window.removeEventListener('mousemove', onMouse);
      window.removeEventListener('deviceorientation', onOrientation);
      if (raf.current) cancelAnimationFrame(raf.current);
    };
  }, [t.backWall, t.leftWall, t.rightWall, t.ceiling, t.floor, t.floorGrid, t.ambient]);

  return (
    <div className="parallax-room">
      <canvas ref={canvasRef} />
    </div>
  );
}

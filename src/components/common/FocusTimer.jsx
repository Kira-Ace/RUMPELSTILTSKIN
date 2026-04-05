import { useState, useEffect } from 'react';
import { X, Pause, Play } from 'lucide-react';

/**
 * Focus Timer modal component.
 * Pomodoro-style timer for focused study sessions.
 */
export default function FocusTimer({ isOpen, onClose }) {
  const [sessionLength, setSessionLength] = useState(25); // minutes
  const [breakLength, setBreakLength] = useState(5); // minutes
  const [timeLeft, setTimeLeft] = useState(25 * 60); // seconds
  const [isRunning, setIsRunning] = useState(false);
  const [isBreak, setIsBreak] = useState(false);

  // Timer logic
  useEffect(() => {
    let interval;
    if (isRunning && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft(t => t - 1);
      }, 1000);
    } else if (timeLeft === 0 && isRunning) {
      // Switch between session and break
      setIsBreak(!isBreak);
      setTimeLeft((isBreak ? sessionLength : breakLength) * 60);
      // Play notification sound (optional)
      playNotification();
    }
    return () => clearInterval(interval);
  }, [isRunning, timeLeft, isBreak, sessionLength, breakLength]);

  const playNotification = () => {
    // Simple beep using Web Audio API
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.frequency.value = 800;
    oscillator.type = 'sine';
    
    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
    
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.5);
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const toggleTimer = () => setIsRunning(!isRunning);
  const resetTimer = () => {
    setIsRunning(false);
    setIsBreak(false);
    setTimeLeft(sessionLength * 60);
  };

  if (!isOpen) return null;

  return (
    <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.5)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:1000}}>
      <div style={{background:"var(--bg)",borderRadius:20,padding:"40px 30px",textAlign:"center",maxWidth:320,boxShadow:"0 20px 60px rgba(0,0,0,0.3)"}}>
        {/* Header */}
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:24}}>
          <div style={{fontFamily:"'Newsreader',serif",fontSize:20,fontWeight:700,color:"var(--brown)"}}>
            {isBreak ? "Take a Break" : "Focus Session"}
          </div>
          <button onClick={onClose} style={{background:"none",border:"none",cursor:"pointer",padding:0}}>
            <X size={20} color="var(--outline)" />
          </button>
        </div>

        {/* Timer Display */}
        <div style={{background:isBreak?"rgba(253,207,73,0.1)":"rgba(244,123,32,0.1)",borderRadius:16,padding:40,marginBottom:24}}>
          <div style={{fontFamily:"'Newsreader',serif",fontSize:64,fontWeight:700,color:isBreak?"var(--yellow)":"var(--orange)",lineHeight:1,fontVariantNumeric:"tabular-nums"}}>
            {formatTime(timeLeft)}
          </div>
        </div>

        {/* Controls */}
        <div style={{display:"flex",gap:12,marginBottom:20}}>
          <button 
            onClick={toggleTimer}
            style={{flex:1,background:"var(--orange-m)",color:"white",border:"none",borderRadius:10,padding:"12px 16px",fontFamily:"'Work Sans',sans-serif",fontWeight:700,fontSize:14,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",gap:6}}
          >
            {isRunning ? <Pause size={16} /> : <Play size={16} />}
            {isRunning ? "Pause" : "Start"}
          </button>
          <button 
            onClick={resetTimer}
            style={{flex:1,background:"var(--bg-dim)",color:"var(--brown)",border:"none",borderRadius:10,padding:"12px 16px",fontFamily:"'Work Sans',sans-serif",fontWeight:700,fontSize:14,cursor:"pointer"}}
          >
            Reset
          </button>
        </div>

        {/* Settings */}
        <div style={{background:"var(--bg-low)",borderRadius:12,padding:16,marginBottom:16}}>
          <div style={{marginBottom:12}}>
            <label style={{fontFamily:"'Work Sans',sans-serif",fontSize:11,fontWeight:700,color:"var(--outline)",textTransform:"uppercase",display:"block",marginBottom:6}}>
              Session: {sessionLength}m
            </label>
            <input 
              type="range" 
              min="1" 
              max="60" 
              value={sessionLength}
              onChange={(e) => {
                const newVal = parseInt(e.target.value);
                setSessionLength(newVal);
                if (!isRunning && !isBreak) setTimeLeft(newVal * 60);
              }}
              disabled={isRunning}
              style={{width:"100%",cursor:isRunning?"not-allowed":"pointer"}}
            />
          </div>
          <div>
            <label style={{fontFamily:"'Work Sans',sans-serif",fontSize:11,fontWeight:700,color:"var(--outline)",textTransform:"uppercase",display:"block",marginBottom:6}}>
              Break: {breakLength}m
            </label>
            <input 
              type="range" 
              min="1" 
              max="30" 
              value={breakLength}
              onChange={(e) => {
                const newVal = parseInt(e.target.value);
                setBreakLength(newVal);
                if (!isRunning && isBreak) setTimeLeft(newVal * 60);
              }}
              disabled={isRunning}
              style={{width:"100%",cursor:isRunning?"not-allowed":"pointer"}}
            />
          </div>
        </div>

        <button 
          onClick={onClose}
          style={{width:"100%",background:"var(--orange)","color":"white",border:"none",borderRadius:10,padding:"12px 16px",fontFamily:"'Work Sans',sans-serif",fontWeight:700,fontSize:14,cursor:"pointer"}}
        >
          Close
        </button>
      </div>
    </div>
  );
}

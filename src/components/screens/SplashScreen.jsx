import { useEffect } from 'react';
import rumpelIcon from '../assets/rumpel.png';
import rumpelText from '../assets/rumpeltext.png';

export default function SplashScreen({ onDone }) {
  useEffect(()=>{ 
    const t=setTimeout(onDone,1800); 
    return()=>clearTimeout(t); 
  },[onDone]);

  return (
    <div className="screen splash">
      <div className="splash-inner">
        <div className="splash-logo"><img src={rumpelIcon} alt="Rumpel" style={{width: "180px", height: "180px"}} /></div>
        <div className="splash-name"><img src={rumpelText} alt="Rumpel" style={{height: "60px"}} /></div>
      </div>
    </div>
  );
}

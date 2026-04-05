import { CheckCircle2 } from 'lucide-react';

export default function Toggle({ on, toggle }) {
  return (
    <div className={`toggle ${on?"on":"off"}`} onClick={toggle}>
      <div className="toggle-knob">
        {on && <CheckCircle2 size={12} className="check-icon"/>}
      </div>
    </div>
  );
}

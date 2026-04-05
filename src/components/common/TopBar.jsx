import rumpeltextImage from '../assets/rumpeltext.png';

export default function TopBar({ extra }) {
  return (
    <div className="topbar">
      <div className="topbar-left">
        <img className="topbar-wordmark" src={rumpeltextImage} alt="Rumpel" />
      </div>
      <div className="topbar-right">
        {extra}
        <div className="topbar-avatar">
          <span style={{fontSize:16,color:"var(--brown-m)"}}>!</span>
        </div>
      </div>
    </div>
  );
}

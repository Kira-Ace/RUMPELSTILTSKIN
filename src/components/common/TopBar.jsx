import rumpeltextImage from '../assets/rumpeltext.png';

export default function TopBar({ extra }) {
  // TEMPLATE: Replace rumpeltextImage with your app's logo/wordmark
  return (
    <div className="topbar">
      <div className="topbar-left">
        <img className="topbar-wordmark" src={rumpeltextImage} alt="{{APP_NAME}}" />
      </div>
      <div className="topbar-right">
        {extra}
        <div className="topbar-avatar">
          {/* TEMPLATE: Replace with user avatar or initials */}
          <span style={{fontSize:16,color:"var(--brown-m)"}}>!</span>
        </div>
      </div>
    </div>
  );
}

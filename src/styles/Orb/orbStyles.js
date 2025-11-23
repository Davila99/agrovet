export const orbColors = {
  primary: '#1DD6C9',
  secondary: '#0FB7A1',
  highlight: '#6EF2E5',
};

export default orbColors;
// Styles and keyframes for the Orb page. Components import `orbCss` and
// inject it into the page (index.jsx does this by default).
const orbCss = `
:root{
  --orb-turquoise:#00e5ff;
  --orb-aqua:#12CBE6;
  --orb-deep:#064B6D;
}

/* Page container */
.orb-page{
  min-height:100vh;
  display:flex;
  align-items:center;
  justify-content:center;
  background: linear-gradient(180deg, #002a35, #000000);
  color: rgba(255,255,255,0.92);
  padding: 40px 20px;
  box-sizing:border-box;
}

.orb-shell{
  display:flex;
  flex-direction:column;
  align-items:center;
  gap:24px;
  width:100%;
  max-width:1200px;
}

.orb-header{
  text-align:center;
  opacity:0.95;
  margin-bottom:4px;
}

.orb-header h1{
  margin:0;
  font-family: 'Inter', system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', Arial;
  font-weight:600;
  font-size: clamp(18px, 2vw, 32px);
  color: rgba(255,255,255,0.95);
}

.orb-content{
  display:flex;
  align-items:center;
  justify-content:center;
  gap:28px;
  width:100%;
}

/* Responsive layout adjustments */
@media (max-width:800px){
  .orb-content{ flex-direction:column; gap:18px; }
}

/* Orb sphere base */
.orb-sphere{
  position:relative;
  border-radius:50%;
  overflow:visible;
  width: clamp(180px, 25vw, 340px);
  height: clamp(180px, 25vw, 340px);
  display:flex;
  align-items:center;
  justify-content:center;
  filter: drop-shadow(0 6px 18px rgba(0,0,0,0.6));
  transition: transform 300ms ease;
}

/* glow and soft blur */
.orb-sphere .orb-core{
  position:relative;
  width:100%;
  height:100%;
  border-radius:50%;
  background: radial-gradient(circle at 40% 35%, #41F0FF 0%, #12CBE6 20%, #0A8FB8 45%, #064B6D 70%, #012030 100%);
  box-shadow: 0 8px 30px rgba(0,0,0,0.6), inset 0 8px 24px rgba(255,255,255,0.02);
  filter: blur(2px);
  position:relative;
  overflow:hidden;
  transform-origin:center;
  animation: orbFloat 6s ease-in-out infinite;
}

/* Inner highlight: pseudo-element to simulate luminous core */
.orb-sphere .orb-core::before{
  content: '';
  position: absolute;
  left: 10%; top: 6%;
  width: 80%; height: 60%; border-radius:50%;
  background: radial-gradient(circle at 50% 30%, rgba(255,255,255,0.9) 0%, rgba(0,255,255,0.5) 25%, rgba(0,255,255,0) 60%);
  filter: blur(25px);
  opacity: 0.45;
  pointer-events:none;
  mix-blend-mode: screen;
}

/* Liquid swirl layer: conic gradient pseudo-element */
.orb-sphere .orb-core::after{
  content: '';
  position: absolute;
  left: -10%; top: -10%;
  width: 120%; height: 120%; border-radius:50%;
  background: conic-gradient(from 0deg, rgba(0,255,255,0.4), rgba(0,150,200,0.3), rgba(0,80,150,0.25), rgba(0,255,255,0.4));
  mix-blend-mode: screen;
  filter: blur(20px);
  opacity: 0.35;
  pointer-events:none;
  animation: liquidSwirl 9s ease-in-out infinite;
}

/* slow 3D rotation applied to the core container */
.orb-core{ transform-style: preserve-3d; }

.orb-sphere.listening{ animation: listeningPulse 1.2s ease-in-out infinite; box-shadow: 0 0 45px rgba(0,255,255,0.55), 0 0 90px rgba(0,255,255,0.32); }

/* small inner gloss (optional additional overlay) */
.orb-gloss{
  position:absolute; pointer-events:none;
  width:36%; height:36%; border-radius:50%;
  left:14%; top:10%;
  background: radial-gradient(circle at 30% 30%, rgba(255,255,255,0.22), rgba(255,255,255,0) 40%);
  mix-blend-mode: screen;
}

/* Keyframes */
@keyframes rotate3D {
  0%   { transform: rotateX(0deg) rotateY(0deg); }
  50%  { transform: rotateX(12deg) rotateY(8deg); }
  100% { transform: rotateX(0deg) rotateY(0deg); }
}

@keyframes swirl {
  0%   { transform: translate(-5%, -5%) scale(1.02); }
  50%  { transform: translate(5%, 5%) scale(1.05); }
  100% { transform: translate(-5%, -5%) scale(1.02); }
}

@keyframes pulse {
  0%   { transform: scale(1); filter: brightness(1); }
  50%  { transform: scale(1.08); filter: brightness(1.3); }
  100% { transform: scale(1); filter: brightness(1); }
}

@keyframes liquidSwirl {
  0%   { transform: rotate(0deg) scale(1); }
  50%  { transform: rotate(160deg) scale(1.03); }
  100% { transform: rotate(360deg) scale(1); }
}

@keyframes orbFloat {
  0%   { transform: translateY(0) scale(1); }
  50%  { transform: translateY(-12px) scale(1.02); }
  100% { transform: translateY(0) scale(1); }
}

@keyframes listeningPulse {
  0% { transform: scale(1); }
  50% { transform: scale(1.07); }
  100% { transform: scale(1); }
}

@keyframes micGlow {
  0%   { box-shadow: 0 0 8px rgba(0,229,255,0.33); }
  50%  { box-shadow: 0 0 22px rgba(0,229,255,0.6); }
  100% { box-shadow: 0 0 8px rgba(0,229,255,0.33); }
}

/* Voice button */
.voice-button{
  width:88px; height:88px; border-radius:50%;
  display:inline-flex; align-items:center; justify-content:center;
  background: radial-gradient(circle at 50% 40%, rgba(0,229,255,0.12), rgba(0,229,255,0.06));
  border: 1px solid rgba(0,229,255,0.28);
  backdrop-filter: blur(6px);
  cursor:pointer; transition: transform 160ms ease;
  box-shadow: 0 6px 18px rgba(0,0,0,0.5);
}
.voice-button.listening{ animation: micGlow 1400ms infinite; transform: scale(1.02); }
.voice-button svg{ width:38px; height:38px; fill: var(--orb-turquoise); }

@keyframes micGlow {
  0%   { box-shadow: 0 0 12px rgba(0,255,255,0.4); }
  50%  { box-shadow: 0 0 25px rgba(0,255,255,0.9); }
  100% { box-shadow: 0 0 12px rgba(0,255,255,0.4); }
}

/* Waveform container */
.waveform-wrapper{ width:100%; max-width:720px; display:flex; align-items:center; justify-content:center; }
.bars{ display:flex; align-items:flex-end; gap:6px; height:80px; }
.bar{ width:8px; background: linear-gradient(to top, #00eaff, #7af9ff); filter: drop-shadow(0 0 6px rgba(0,255,230,0.66)); border-radius:4px; transform-origin: bottom center; }
.bar::after{ content:''; display:block; height:100%; width:100%; }

@media (min-width:1200px){
  .orb-content{ gap:40px; }
  .waveform-wrapper{ height:120px; }
}

/* Desktop layout tweaks */
@media (min-width:1200px){
  .orb-content{ gap:40px; }
  .waveform-canvas{ height:120px; }
}

/* small helpers */
.orb-controls{ display:flex; gap:12px; align-items:center; justify-content:center; }

`;

export default orbCss;

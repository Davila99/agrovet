import React from "react";
import VoiceAgent from "../voice/VoiceAgent";

/**
 * OrbAgent ahora usa VoiceAgent con el GIF simple
 * Se mantiene por compatibilidad con rutas existentes
 */
const OrbAgent = () => {
  return <VoiceAgent />;
};

export default OrbAgent;

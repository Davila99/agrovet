import React from 'react';
import WaterSphere from './WaterSphere';
import './orbSphere.css';

// Simplified OrbSphere: delegate rendering to the R3F `WaterSphere` component.
export default function OrbSphere(props) {
  return <WaterSphere {...props} />;
}


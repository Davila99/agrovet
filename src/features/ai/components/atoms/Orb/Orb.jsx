import React from "react";
import "./Orb.css";

const Orb = ({ size = 300, className = "", style = {}, ...rest }) => {
  const sizeStyle = {
    width: typeof size === "number" ? `${size}px` : size,
    height: typeof size === "number" ? `${size}px` : size,
    position: "relative",
  };

  return (
    <div
      className={`enhanced-orb-wrapper ${className}`.trim()}
      style={{ ...sizeStyle, ...style }}
      {...rest}
    >
      {/* clipped circular content (structure requested by user) */}
      <div className="orb-clip">
        <div className="background"></div>

        <div className="stars">
          <div className="star small"></div>
          <div className="star medium"></div>
          <div className="star large"></div>
          <div className="star small"></div>
          <div className="star medium"></div>
          <div className="star small"></div>
          <div className="star large"></div>
          <div className="star medium"></div>
          <div className="star small"></div>
          <div className="star medium"></div>
          <div className="star small"></div>
          <div className="star large"></div>
        </div>

        <div className="stars">
          <div className="nebula"></div>
          <div className="nebula"></div>
          <div className="nebula"></div>
        </div>

        <div className="landscape">
          <div className="mountain-layer">
            <div className="mountain mountain-back"></div>
            <div className="mountain mountain-mid"></div>
            <div className="mountain mountain-front"></div>
            <div className="mountain mountain-small"></div>
          </div>
          <div className="ground"></div>
          <div className="ground-reflection"></div>
        </div>

        <div className="orb-container">
          <div className="outer-aura"></div>
          <div className="energy-ring"></div>
          <div className="energy-ring"></div>
          <div className="energy-ring"></div>
          <div className="energy-ring"></div>
          <div className="particle"></div>
          <div className="particle"></div>
          <div className="particle"></div>
          <div className="particle"></div>
          <div className="particle"></div>
          <div className="particle"></div>
          <div className="orbital-ring"></div>
          <div className="orbital-ring small"></div>
          <div className="orb"></div>
          <div className="core"></div>
        </div>
      </div>
    </div>
  );
};

export default Orb;

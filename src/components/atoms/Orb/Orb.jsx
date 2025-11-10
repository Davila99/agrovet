import React from "react";
import "./Orb.css";

const Orb = ({ size = 200, className = "", style = {}, ...rest }) => {
  const sizeStyle = {
    width: typeof size === "number" ? `${size}px` : size,
    height: typeof size === "number" ? `${size}px` : size,
  };

  return (
    <div
      className={`orb-container ${className}`.trim()}
      style={{ ...sizeStyle, ...style }}
      {...rest}
    >
      <div className="orb">
        <div className="orb-inner"></div>
        <div className="orb-inner"></div>
      </div>
    </div>
  );
};

export default Orb;

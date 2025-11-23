import React from 'react';

/**
 * Input atom with basic aria props.
 */
export default function Input(props) {
  return (
    <input
      {...props}
      className={`border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400 ${props.className || ''}`}
      aria-invalid={props['aria-invalid'] || false}
    />
  );
}

import React from 'react';
import PropTypes from 'prop-types';

/**
 * Simple button atom. Use Tailwind classes if present; otherwise inline styles.
 */
export default function Button({ children, onClick, variant = 'primary', ...rest }) {
  const base = 'inline-flex items-center px-3 py-1 rounded-md font-medium';
  const cls = variant === 'primary'
    ? `${base} bg-blue-600 text-white hover:bg-blue-700`
    : `${base} bg-gray-100 text-gray-800 hover:bg-gray-200`;

  return (
    <button className={cls} onClick={onClick} {...rest}>
      {children}
    </button>
  );
}

Button.propTypes = {
  children: PropTypes.node,
  onClick: PropTypes.func,
  variant: PropTypes.string,
};

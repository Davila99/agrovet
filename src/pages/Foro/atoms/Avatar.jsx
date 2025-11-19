import React from 'react';
import PropTypes from 'prop-types';
import { avatarSmall, avatarMedium } from '../styles/foroStyles';

/**
 * Avatar atom: muestra imagen o fallback con iniciales.
 * @param {{user: object, size: 'small'|'medium'}} props
 */
export default function Avatar({ user, size = 'small' }) {
  const s = size === 'small' ? avatarSmall : avatarMedium;
  const initials = user?.name ? user.name.split(' ').map(n => n[0]).slice(0,2).join('') : '?';
  return (
    <div style={{ display: 'inline-flex', alignItems: 'center' }}>
      {user?.avatar ? (
        <img src={user.avatar} alt={user.name || 'avatar'} style={s} />
      ) : (
        <div style={{ ...s, display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#e5e7eb' }}>
          <span style={{ fontWeight: 600 }}>{initials}</span>
        </div>
      )}
    </div>
  );
}

Avatar.propTypes = {
  user: PropTypes.object,
  size: PropTypes.oneOf(['small', 'medium']),
};

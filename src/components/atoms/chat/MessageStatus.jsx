import React from 'react';
import PropTypes from 'prop-types';

export default function MessageStatus({ status }) {
    // WhatsApp-style ticks
    if (!status || status === 'sent') {
        return <span style={{ color: '#999', marginLeft: 6 }}>✓</span>;
    }
    
    if (status === 'delivered') {
        return <span style={{ color: '#555', marginLeft: 6 }}>✓✓</span>;
    }
    
    if (status === 'read') {
        return <span style={{ color: '#2196F3', marginLeft: 6 }}>✓✓</span>;
    }
    
    return null;
}

MessageStatus.propTypes = {
    status: PropTypes.oneOf(['sent', 'delivered', 'read', null]),
};


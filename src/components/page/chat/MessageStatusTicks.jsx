import React from 'react';
import { Done, DoneAll } from '@mui/icons-material';
import { Box, Typography } from '@mui/material';
import { formatTimestamp } from './chatUtils';

const MessageStatusTicks = ({ message = null, receipts = [], timestamp, isOwnMessage, currentUserId = null }) => {
  const sourceReceipts = (message && Array.isArray(message.receipts)) ? message.receipts : receipts;
  // Only render ticks for our own messages (WhatsApp style)
  if (!isOwnMessage) {
    // Do not render ticks for messages from others
    return null;
  }

  // If not our message we already returned above.
  // For group chats use aggregate logic (all delivered / all read).
  // If there are no receipts, render a single grey tick (sent)
  if (!sourceReceipts || !sourceReceipts.length) {
    return <span style={{ color: '#999', marginLeft: 6 }}>✓</span>;
  }

  // When multiple participants exist, consider the aggregated state
  if (Array.isArray(sourceReceipts) && sourceReceipts.length > 1) {
    const allDelivered = sourceReceipts.every(r => !!r.delivered);
    const allRead = sourceReceipts.every(r => !!r.read);
  // aggregate receipts for group chats
    if (allRead) return <span style={{ color: '#2196F3', marginLeft: 6 }}>✓✓</span>;
    if (allDelivered) return <span style={{ color: '#555', marginLeft: 6 }}>✓✓</span>;
    return <span style={{ color: '#999', marginLeft: 6 }}>✓</span>;
  }

  // Single-receipt (1:1 chat) fallback
  const receipt = Array.isArray(sourceReceipts) && sourceReceipts.length ? sourceReceipts[0] : null;
  const isDelivered = Boolean(receipt && receipt.delivered);
  const isRead = Boolean(receipt && receipt.read);
  if (isRead) return <span style={{ color: '#2196F3', marginLeft: 6 }}>✓✓</span>;
  if (isDelivered) return <span style={{ color: '#555', marginLeft: 6 }}>✓✓</span>;
  return <span style={{ color: '#999', marginLeft: 6 }}>✓</span>;
};

export default MessageStatusTicks;








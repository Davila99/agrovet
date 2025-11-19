import React from 'react';

export default function Timestamp({ iso }) {
  if (!iso) return null;
  const d = new Date(iso);
  return <time dateTime={iso} title={d.toISOString()}>{d.toLocaleString()}</time>;
}

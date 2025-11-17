import React from 'react';
import MarketplacePage from './add/pages/AddPage';

// Wrapper at src/components/page/AddPage.jsx so the main page sits at the same
// level as other top-level pages. This file simply imports the Add module's
// internal AddPage (which lives under src/components/page/add) and re-exports
// it for routing consistency.
export default function AddPage() {
  return <MarketplacePage />;
}

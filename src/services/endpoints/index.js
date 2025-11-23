// Central re-exports for endpoints
// Allows importing from '.../services/endpoints' instead of individual files

import * as auth from './auth';
import * as adds from './adds';
import * as chat from './chat';
import * as foro from './foro';
import * as media from './media';
import * as profiles from './profiles';
import * as utils from './utils';

export * from './auth';
export * from './adds';
export * from './chat';
export * from './foro';
export * from './media';
export * from './profiles';
export * from './utils';

// Default export aggregating all endpoint modules for legacy default imports
const endpoints = { auth, adds, chat, foro, media, profiles, utils };
export default endpoints;

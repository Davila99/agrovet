// Central re-exports for endpoints
// Allows importing from '.../services/endpoints' instead of individual files

import * as auth from '../../features/auth/services/authApi';
import * as adds from './adds';
import * as chat from '../../features/chat/services/chatApi';
import * as foro from '../../features/foro/services/foroApi';
import * as media from './media';
import * as profiles from './profiles';
import * as utils from './utils';

export * from '../../features/auth/services/authApi';
export * from './adds';
export * from '../../features/chat/services/chatApi';
export * from '../../features/foro/services/foroApi';
export * from './media';
export * from './profiles';
export * from './utils';

// Default export aggregating all endpoint modules for legacy default imports
const endpoints = { auth, adds, chat, foro, media, profiles, utils };
export default endpoints;

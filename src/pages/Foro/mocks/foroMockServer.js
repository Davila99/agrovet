// Simple in-memory mock server for Foro during development.
// It intercepts window.fetch and responds to /api/* routes used by the frontend.
// WARNING: This is for local dev only. It replaces global fetch while active.

import { posts as seedPosts, comments as seedComments, users as seedUsers, communities as seedCommunities, reactions as seedReactions, notifications as seedNotifications, counters as seedCounters } from './seedData';

let store = {
  posts: JSON.parse(JSON.stringify(seedPosts)),
  comments: JSON.parse(JSON.stringify(seedComments)),
  users: JSON.parse(JSON.stringify(seedUsers)),
  communities: JSON.parse(JSON.stringify(seedCommunities)),
  reactions: JSON.parse(JSON.stringify(seedReactions)),
  notifications: JSON.parse(JSON.stringify(seedNotifications)),
  counters: { ...seedCounters },
};

function ok(data, status = 200) {
  return Promise.resolve(new Response(JSON.stringify(data), { status, headers: { 'Content-Type': 'application/json' } }));
}

function notFound() {
  return Promise.resolve(new Response(JSON.stringify({ detail: 'Not found' }), { status: 404, headers: { 'Content-Type': 'application/json' } }));
}

function parsePath(url) {
  try {
    const u = new URL(url, location.href);
    return u;
  } catch (e) {
    return null;
  }
}

function matchApiPath(pathname, prefix = '/api') {
  if (!pathname.startsWith(prefix)) return null;
  return pathname.slice(prefix.length) || '/';
}

function paginate(list) {
  return { results: list };
}

async function handler(req) {
  const url = parsePath(req.url);
  if (!url) return null;
  const apiPath = matchApiPath(url.pathname);
  if (apiPath === null) return null;

  // Normalize trailing slash
  const path = apiPath.replace(/\/$/, '');

  // POSTS
  if (path === '/posts' && req.method === 'GET') {
    return ok(paginate(store.posts));
  }
  if (path.startsWith('/posts/') && req.method === 'GET') {
    const id = Number(path.split('/')[1]);
    const p = store.posts.find(x => x.id === id);
    if (!p) return notFound();
    // attach comments for convenience
    const postComments = store.comments.filter(c => c.post === p.id && c.parent === null).map(c => ({ ...c, replies: store.comments.filter(r => r.parent === c.id) }));
    return ok({ ...p, comments: postComments });
  }
  if (path === '/posts' && req.method === 'POST') {
    const body = await req.json().catch(() => ({}));
    const id = store.counters.postId++;
    const author = store.users.find(u => u.id === (body.author_id || 2)) || store.users[1];
    const community = store.communities.find(c => c.id === Number(body.community_id)) || null;
    const newPost = {
      id,
      title: body.title || 'Untitled',
      content: body.content || '',
      author,
      media: body.media_id ? [{ id: body.media_id, url: `/media/mock_${body.media_id}.jpg`, type: 'image' }] : [],
      comments_count: 0,
      reactions_count: 0,
      created_at: new Date().toISOString(),
      community: community || null,
    };
    store.posts.unshift(newPost);
    return ok(newPost, 201);
  }

  // COMMENTS
  if (path === '/comments' && req.method === 'GET') {
    return ok(paginate(store.comments));
  }
  if (path === '/comments' && req.method === 'POST') {
    const body = await req.json().catch(() => ({}));
    const id = store.counters.commentId++;
    const author = store.users.find(u => u.id === (body.user_id || 2)) || store.users[1];
    const newComment = {
      id,
      post: Number(body.post),
      parent: body.parent ? Number(body.parent) : null,
      content: body.content || '',
      author,
      created_at: new Date().toISOString(),
      reactions_count: 0,
      replies: [],
    };
    store.comments.push(newComment);
    // update counts on post
    const post = store.posts.find(p => p.id === newComment.post);
    if (post) post.comments_count = (post.comments_count || 0) + 1;
    return ok(newComment, 201);
  }

  // COMMUNITIES
  if (path === '/communities' && req.method === 'GET') {
    return ok(store.communities);
  }
  if (path.startsWith('/communities/') && req.method === 'GET') {
    const id = Number(path.split('/')[1]);
    const c = store.communities.find(x => x.id === id);
    if (!c) return notFound();
    // include posts of community
    const communityPosts = store.posts.filter(p => p.community && p.community.id === id);
    return ok({ ...c, posts: communityPosts });
  }
  if (path.endsWith('/join') && req.method === 'POST') {
    // toggle join - simplistic
    const id = Number(path.split('/')[1]);
    const c = store.communities.find(x => x.id === id);
    if (!c) return notFound();
    c.members_count = (c.members_count || 0) + 1;
    return ok({ joined: true });
  }

  // REACTIONS
  if (path === '/reactions' && req.method === 'POST') {
    const body = await req.json().catch(() => ({}));
    const id = store.counters.reactionId++;
    const r = { id, user_id: body.user_id || 2, type: body.type, content_type: body.content_type, object_id: Number(body.object_id) };
    store.reactions.push(r);
    // increment counters
    if (body.content_type === 'post') {
      const p = store.posts.find(x => x.id === Number(body.object_id));
      if (p) p.reactions_count = (p.reactions_count || 0) + 1;
    } else {
      const c = store.comments.find(x => x.id === Number(body.object_id));
      if (c) c.reactions_count = (c.reactions_count || 0) + 1;
    }
    return ok(r, 201);
  }
  if (path.startsWith('/reactions/') && (req.method === 'DELETE' || req.method === 'POST' && path.endsWith('/remove'))) {
    const id = Number(path.split('/')[1]);
    const idx = store.reactions.findIndex(r => r.id === id);
    if (idx === -1) return notFound();
    const r = store.reactions.splice(idx, 1)[0];
    return ok({}, 204);
  }

  // NOTIFICATIONS
  if (path === '/notifications' && req.method === 'GET') {
    return ok(store.notifications);
  }
  if (path.endsWith('/mark_read') && req.method === 'POST') {
    // mark read
    const body = await req.json().catch(() => ({}));
    const ids = Array.isArray(body.ids) ? body.ids : [];
    store.notifications.forEach(n => { if (ids.includes(n.id)) n.read = true; });
    return ok({ updated: ids.length });
  }

  // MEDIA UPLOAD
  if (path === '/media/upload' && req.method === 'POST') {
    // return a fake media id
    const id = store.counters.mediaId++;
    return ok({ id, url: `/media/mock_${id}.jpg` }, 201);
  }

  return null; // not handled by mock
}

export function startForoMock() {
  if (typeof window === 'undefined') return;
  if (window.__FORO_MOCK_ACTIVE) return;
  window.__FORO_MOCK_ACTIVE = true;
  const originalFetch = window.fetch.bind(window);
  window.__originalFetch = originalFetch;
  window.fetch = async function (input, init) {
    try {
      const req = new Request(input, init);
      const h = await handler(req);
      if (h) return h;
    } catch (e) {
      console.warn('[foroMock] handler error', e);
    }
    return originalFetch(input, init);
  };
  console.info('[foroMock] started - intercepting /api/* requests');
}

export function stopForoMock() {
  if (typeof window === 'undefined') return;
  if (!window.__FORO_MOCK_ACTIVE) return;
  window.fetch = window.__originalFetch || window.fetch;
  window.__FORO_MOCK_ACTIVE = false;
  console.info('[foroMock] stopped');
}

// Auto-start in development
if (import.meta.env && import.meta.env.DEV) {
  try { startForoMock(); } catch (e) { console.warn('Could not start foro mock', e); }
}

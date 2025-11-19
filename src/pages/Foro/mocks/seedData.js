// Mock seed data for Foro dev server
export const users = [
  { id: 1, name: 'Admin', avatar: '/avatars/admin.jpg' },
  { id: 2, name: 'Carlos', avatar: '/avatars/c.jpg' },
  { id: 3, name: 'Ana', avatar: '/avatars/a.jpg' },
  { id: 4, name: 'Luis', avatar: '/avatars/l.jpg' },
];

export const communities = [
  { id: 1, name: 'Hardware Lab', slug: 'hardware-lab', short_description: 'Discusiones sobre hardware', description: 'Comunidad para entusiastas de hardware', creator_id: 1, members_count: 120 },
  { id: 2, name: 'Agricultura', slug: 'agricultura', short_description: 'Consejos de campo', description: 'Técnicas y discusión agrícola', creator_id: 2, members_count: 88 },
];

export const posts = [
  {
    id: 1,
    title: 'Mi primer servidor',
    content: 'Monté un rack con 32 cores y aquí cuento la experiencia en detalle. Pudimos reducir latencias...',
    author: users[1],
    media: [{ url: '/media/img1.jpg', type: 'image' }],
    comments_count: 4,
    reactions_count: 284,
    created_at: '2025-11-16T10:00:00Z',
    community: communities[0],
  },
  {
    id: 2,
    title: 'Alternativas para riego en pequeña finca',
    content: 'He probado goteo y aspersión. Las diferencias en consumo de agua son notables...',
    author: users[2],
    media: [],
    comments_count: 3,
    reactions_count: 42,
    created_at: '2025-11-15T08:20:00Z',
    community: communities[1],
  },
  {
    id: 3,
    title: 'Lista de herramientas imprescindibles',
    content: 'Multímetro, destornilladores de precisión, soldador, y más...',
    author: users[3],
    media: [],
    comments_count: 1,
    reactions_count: 18,
    created_at: '2025-11-14T09:30:00Z',
    community: communities[0],
  },
];

export const comments = [
  { id: 1, post: 1, parent: null, content: 'Gran post, ¿qué fuente usaste?', author: users[2], created_at: '2025-11-16T11:00:00Z', reactions_count: 4, replies: [] },
  { id: 2, post: 1, parent: 1, content: 'La fuente fue Corsair RM750x, excelente rendimiento.', author: users[1], created_at: '2025-11-16T11:20:00Z', reactions_count: 2, replies: [] },
  { id: 3, post: 2, parent: null, content: 'Interesante, ¿qué presupuesto manejas?', author: users[3], created_at: '2025-11-15T09:00:00Z', reactions_count: 1, replies: [] },
];

export const reactions = [
  { id: 1, user_id: 3, type: 'heart', content_type: 'post', object_id: 1 },
];

export const notifications = [
  { id: 1, recipient_id: 2, actor_id: 3, notif_type: 'post_reply', summary: 'Ana comentó en tu post', read: false, created_at: '2025-11-16T11:05:00Z' },
];

// Counters for creating new ids
export const counters = {
  postId: posts.length + 1,
  commentId: comments.length + 1,
  reactionId: reactions.length + 1,
  mediaId: 100,
  notificationId: notifications.length + 1,
};

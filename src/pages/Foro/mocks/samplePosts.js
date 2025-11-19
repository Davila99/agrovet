export const samplePosts = [
  {
    id: 1,
    title: 'Mi primer servidor',
    content: 'Monté un rack con 32 cores y aquí cuento la experiencia...',
    author: { id: 2, name: 'Carlos', avatar: '/avatars/c.jpg' },
    media: [{ url: '/media/img1.jpg', type: 'image' }],
    comments_count: 12,
    reactions_count: 284,
    created_at: '2025-11-16T10:00:00Z',
    community: { id: 1, name: 'Hardware Lab' },
  },
  {
    id: 2,
    title: 'Alternativas para riego en pequeña finca',
    content: 'He probado goteo y aspersión...',
    author: { id: 3, name: 'Ana', avatar: '/avatars/a.jpg' },
    media: [],
    comments_count: 3,
    reactions_count: 42,
    created_at: '2025-11-15T08:20:00Z',
    community: { id: 2, name: 'Agricultura' },
  },
  // ...más posts de ejemplo
];

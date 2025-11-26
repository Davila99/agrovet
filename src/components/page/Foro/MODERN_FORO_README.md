# Sistema de Foro Moderno - Plantilla Completa

## 📋 Componentes Creados

### 1. **ModernPostCard** (`src/components/molecules/Foro/ModernPostCard.jsx`)
Tarjeta moderna de publicación con:
- ✅ Diseño elegante con sombras suaves
- ✅ Categorías visuales (Ganaderos, Veterinarios, Especialistas)
- ✅ Sistema de likes, comentarios y compartir
- ✅ Soporte para imágenes y tags
- ✅ Menú de opciones (eliminar, reportar)
- ✅ Animaciones al hover

### 2. **ModernCommentCard** (`src/components/molecules/Foro/ModernCommentCard.jsx`)
Tarjeta moderna de comentarios con:
- ✅ Diseño anidado para respuestas
- ✅ Sistema de likes en comentarios
- ✅ Formulario de respuesta integrado
- ✅ Soporte para imágenes en comentarios
- ✅ Indentación visual para hilos de conversación

### 3. **ModernForoPage** (`src/components/page/Foro/ModernForoPage.jsx`)
Página principal del foro con:
- ✅ Barra de búsqueda
- ✅ Filtros por categoría (Ganaderos, Veterinarios, Especialistas)
- ✅ Ordenamiento (Recientes, Populares, Tendencias)
- ✅ Sidebar con estadísticas y comunidades
- ✅ Diseño responsive (3 columnas en desktop, 1 en mobile)

## 🎨 Características de Diseño

- **Sombras elegantes**: Cards con sombras suaves que se intensifican al hover
- **Colores por categoría**:
  - 🟢 Ganaderos: Verde (#2E7D32)
  - 🔵 Veterinarios: Azul (#1976D2)
  - 🟣 Especialistas: Morado (#7B1FA2)
- **Animaciones suaves**: Transiciones en hover y interacciones
- **Diseño responsive**: Adaptado para móviles y tablets

## 🚀 Cómo Usar

### Ejemplo básico de PostCard:

```jsx
import ModernPostCard from '../../molecules/Foro/ModernPostCard';

<ModernPostCard
  post={{
    id: 1,
    title: 'Título de la publicación',
    content: 'Contenido de la publicación...',
    author: { id: 1, name: 'Juan Pérez', profile_picture: null },
    category: 'ganadero', // 'ganadero', 'veterinario', 'especialista'
    created_at: '2024-01-15T10:30:00Z',
    likes_count: 12,
    comments_count: 5,
    views_count: 45,
    tags: ['ganado', 'alimentación'],
    media: null, // URL de imagen opcional
  }}
  currentUser={{ id: 1, name: 'Usuario Actual' }}
  onLike={(id) => console.log('Like:', id)}
  onComment={(id) => console.log('Comment:', id)}
  onShare={(post) => console.log('Share:', post)}
  onBookmark={(id) => console.log('Bookmark:', id)}
  onDelete={(id) => console.log('Delete:', id)}
/>
```

### Ejemplo básico de CommentCard:

```jsx
import ModernCommentCard from '../../molecules/Foro/ModernCommentCard';

<ModernCommentCard
  comment={{
    id: 1,
    content: 'Este es un comentario...',
    author: { id: 1, name: 'María González', profile_picture: null },
    created_at: '2024-01-15T11:00:00Z',
    likes_count: 5,
    replies: [], // Array de comentarios anidados
  }}
  depth={0} // Nivel de anidación (0 = comentario principal)
  currentUser={{ id: 1, name: 'Usuario Actual' }}
  onLike={(id) => console.log('Like comment:', id)}
  onReply={(parentId, text) => console.log('Reply:', parentId, text)}
  onDelete={(id) => console.log('Delete comment:', id)}
/>
```

### Usar la página completa:

```jsx
import ModernForoPage from './Foro/ModernForoPage';

// En tu router:
<Route path="/foro" element={<ModernForoPage />} />
```

## 🔌 Integración con Backend

Para conectar con tu API, reemplaza los datos mock en `ModernForoPage.jsx`:

```jsx
// En lugar de useState con datos mock:
const [posts, setPosts] = useState([]);

// Usa tu hook o servicio:
const { data: postsData, isLoading } = usePosts();
const posts = postsData?.results || [];
```

## 📝 Estructura de Datos Esperada

### Post Object:
```javascript
{
  id: number,
  title: string,
  content: string,
  author: {
    id: number,
    name: string,
    profile_picture?: string
  },
  category: 'ganadero' | 'veterinario' | 'especialista' | 'general',
  created_at: string (ISO date),
  likes_count: number,
  comments_count: number,
  views_count?: number,
  tags?: string[],
  media?: string | { url: string } | { path: string }
}
```

### Comment Object:
```javascript
{
  id: number,
  content: string,
  author: {
    id: number,
    name: string,
    profile_picture?: string
  },
  created_at: string (ISO date),
  likes_count: number,
  replies?: Comment[]
}
```

## 🎯 Próximos Pasos

1. Conectar con tu API de backend
2. Implementar las funciones de callback (onLike, onComment, etc.)
3. Agregar autenticación real
4. Implementar paginación
5. Agregar más filtros y búsqueda avanzada

## 📦 Dependencias

- Material-UI (@mui/material, @mui/icons-material)
- React
- No requiere dependencias adicionales (date-fns reemplazado por función nativa)


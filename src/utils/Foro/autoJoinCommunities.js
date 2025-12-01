import foroService from '../../services/endpoints/foro';

/**
 * Community slugs mapped to user roles
 */
export const COMMUNITY_SLUGS = {
  GENERAL: 'general',
  CONSUMERS: 'ganaderos-agricultores-animales',
  SPECIALISTS: 'especialistas-salud',
  BUSINESSMEN: 'agronegocios',
};

/**
 * Community names for display
 */
export const COMMUNITY_NAMES = {
  [COMMUNITY_SLUGS.GENERAL]: 'General',
  [COMMUNITY_SLUGS.CONSUMERS]: 'Ganaderos, Agricultores y Dueños de Animales',
  [COMMUNITY_SLUGS.SPECIALISTS]: 'Especialistas en Salud Animal y Vegetal',
  [COMMUNITY_SLUGS.BUSINESSMEN]: 'Agronegocios',
};

/**
 * Get the community slugs a user should be part of based on their role
 * @param {string} userRole - The user's role (consumer, Specialist, businessman)
 * @returns {string[]} Array of community slugs
 */
export function getCommunitiesForRole(userRole) {
  const role = String(userRole || '').toLowerCase();
  const communities = [COMMUNITY_SLUGS.GENERAL]; // Everyone gets General

  if (role.includes('consumer') || role.includes('consumidor')) {
    communities.push(COMMUNITY_SLUGS.CONSUMERS);
  } else if (role.includes('specialist') || role.includes('especialista')) {
    communities.push(COMMUNITY_SLUGS.SPECIALISTS);
  } else if (role.includes('business') || role.includes('businessman') || role.includes('empresario')) {
    communities.push(COMMUNITY_SLUGS.BUSINESSMEN);
  }

  return communities;
}

/**
 * Auto-join communities based on user role
 * 
 * Communities:
 * - General: Todos los usuarios
 * - Ganaderos, Agricultores y Dueños de Animales: Consumidores (consumer)
 * - Especialistas en Salud Animal y Vegetal: Especialistas (Specialist)
 * - Agronegocios: Empresarios (businessman)
 */
export async function autoJoinCommunitiesByRole(userRole, userProfession = null) {
  if (!userRole) {
    console.warn('[autoJoinCommunities] No role provided');
    return [];
  }

  const roleSlugs = getCommunitiesForRole(userRole);
  
  try {
    // Get all communities
    const communities = await foroService.getCommunities();
    if (!Array.isArray(communities)) {
      console.warn('[autoJoinCommunities] Invalid communities response');
      return [];
    }

    // Map community slugs to IDs
    const communityBySlug = {};
    communities.forEach(comm => {
      if (comm && comm.slug) {
        communityBySlug[String(comm.slug).toLowerCase()] = comm.id;
      }
    });

    const communitiesToJoin = new Set();

    // Add communities based on role
    roleSlugs.forEach(slug => {
      const communityId = communityBySlug[slug];
      if (communityId) {
        communitiesToJoin.add(communityId);
      }
    });

    // Join communities (best effort, don't fail if already joined)
    const joinPromises = Array.from(communitiesToJoin).map(async (communityId) => {
      try {
        await foroService.joinCommunity(communityId);
        console.log(`[autoJoinCommunities] ✅ Joined community ${communityId}`);
      } catch (err) {
        // Ignore errors if already joined or other non-critical errors
        if (err.status !== 400 && err.status !== 409) {
          console.warn(`[autoJoinCommunities] ⚠️ Failed to join community ${communityId}:`, err.message);
        } else {
          console.log(`[autoJoinCommunities] ℹ️ Already member of community ${communityId}`);
        }
      }
    });

    await Promise.allSettled(joinPromises);
    console.log(`[autoJoinCommunities] ✅ Auto-join completed for role: ${userRole}, joined ${communitiesToJoin.size} communities`);
    
    return Array.from(communitiesToJoin);
  } catch (err) {
    console.error('[autoJoinCommunities] ❌ Error auto-joining communities:', err);
    // Don't throw - this is a best-effort feature
    return [];
  }
}

/**
 * Filter communities to show only those the user has access to based on role
 * @param {Array} communities - All communities
 * @param {string} userRole - User's role
 * @returns {Array} Filtered communities
 */
export function filterCommunitiesByRole(communities, userRole) {
  if (!Array.isArray(communities)) return [];
  
  const allowedSlugs = getCommunitiesForRole(userRole);
  
  return communities.filter(comm => {
    if (!comm || !comm.slug) return false;
    return allowedSlugs.includes(comm.slug.toLowerCase());
  });
}

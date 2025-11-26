import foroService from '../../services/endpoints/foro';

/**
 * Auto-join communities based on user role
 * - Specialist: Veterinarios, Agrónomos, General
 * - Consumer: Dueños de animales, Agricultores, General
 * - Agroveterinaria/Businessman: Agroveterinarias, General
 * - All: General (always)
 */
export async function autoJoinCommunitiesByRole(userRole) {
  if (!userRole) {
    console.warn('[autoJoinCommunities] No role provided');
    return;
  }

  const role = String(userRole).toLowerCase();
  
  try {
    // Get all communities
    const communities = await foroService.getCommunities();
    if (!Array.isArray(communities)) {
      console.warn('[autoJoinCommunities] Invalid communities response');
      return;
    }

    // Map community names to IDs (case-insensitive)
    const communityMap = {};
    communities.forEach(comm => {
      if (comm && comm.name) {
        const name = String(comm.name).toLowerCase();
        communityMap[name] = comm.id;
      }
    });

    const communitiesToJoin = [];

    // Always join General community
    const generalNames = ['general', 'comunidad general'];
    for (const name of generalNames) {
      if (communityMap[name]) {
        communitiesToJoin.push(communityMap[name]);
        break; // Only one general community
      }
    }

    // Role-specific communities
    if (role.includes('specialist') || role.includes('especialista')) {
      // Specialist: Veterinarios, Agrónomos
      const specialistNames = [
        'veterinarios', 'comunidad veterinarios',
        'agrónomos', 'agronomos', 'comunidad agrónomos', 'comunidad agronomos'
      ];
      for (const name of specialistNames) {
        if (communityMap[name]) {
          communitiesToJoin.push(communityMap[name]);
        }
      }
    } else if (role.includes('consumer') || role.includes('cliente')) {
      // Consumer: Dueños de animales, Agricultores
      const consumerNames = [
        'dueños de animales', 'duenos de animales', 'comunidad dueños de animales',
        'agricultores', 'comunidad agricultores'
      ];
      for (const name of consumerNames) {
        if (communityMap[name]) {
          communitiesToJoin.push(communityMap[name]);
        }
      }
    } else if (role.includes('business') || role.includes('businessman') || role.includes('agroveterinaria')) {
      // Business/Agroveterinaria: Agroveterinarias
      const businessNames = [
        'agroveterinarias', 'comunidad agroveterinarias',
        'empresarios', 'comunidad empresarios'
      ];
      for (const name of businessNames) {
        if (communityMap[name]) {
          communitiesToJoin.push(communityMap[name]);
        }
      }
    }

    // Join communities (best effort, don't fail if already joined)
    const joinPromises = communitiesToJoin.map(async (communityId) => {
      try {
        await foroService.joinCommunity(communityId);
        console.log(`[autoJoinCommunities] Joined community ${communityId}`);
      } catch (err) {
        // Ignore errors if already joined or other non-critical errors
        if (err.status !== 400 && err.status !== 409) {
          console.warn(`[autoJoinCommunities] Failed to join community ${communityId}:`, err.message);
        }
      }
    });

    await Promise.allSettled(joinPromises);
    console.log(`[autoJoinCommunities] Auto-join completed for role: ${role}`);
  } catch (err) {
    console.error('[autoJoinCommunities] Error auto-joining communities:', err);
    // Don't throw - this is a best-effort feature
  }
}


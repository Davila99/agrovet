/**
 * Relevance & sorting algorithms used client-side when backend doesn't provide them.
 */

export function recencyDecayScore(dateIso, halfLifeHours = 48) {
  const ageMs = Date.now() - new Date(dateIso).getTime();
  const hours = ageMs / (1000 * 60 * 60);
  return Math.exp(-Math.LN2 * (hours / halfLifeHours));
}

export function postRelevanceScore(post, localInteractions = {}, opts = {}) {
  // base_score: reactions + comments
  const base = (post.reactions_count || 0) * 1 + (post.comments_count || 0) * 2;
  const authorInteractions = (localInteractions[post.author?.id] || 0) * (opts.interactionWeight || 3);
  const recency = recencyDecayScore(post.created_at, opts.halfLifeHours || 48);
  return base + authorInteractions + recency * (opts.recencyBoost || 10);
}

export function commentPopularityScore(comment) {
  const reactions = comment.reactions_count || 0;
  const replies = comment.replies_count || 0;
  const ageBoost = recencyDecayScore(comment.created_at, 168); // 1 week half life
  return reactions * 2 + replies * 1.5 + ageBoost * 5;
}

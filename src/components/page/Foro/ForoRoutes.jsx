import React from 'react';
import { Routes, Route } from 'react-router-dom';
import FeedPage from './FeedPage';
import PostPage from './PostPage';
import CommunityPage from './CommunityPage';
import CreatePostPage from './CreatePostPage';
import NotificationsPage from './NotificationsPage';

/**
 * Foro routes. Import this module in your main App router to mount /foro.
 * TODO: add React Query provider in root App if not present.
 */
export default function ForoRoutes() {
  // Relative routes mounted under /foro/*
  return (
    <Routes>
      <Route index element={<FeedPage />} />
      <Route path="post/:id" element={<PostPage />} />
      <Route path="community/:id" element={<CommunityPage />} />
      <Route path="create" element={<CreatePostPage />} />
      <Route path="notifications" element={<NotificationsPage />} />
    </Routes>
  );
}

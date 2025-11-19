import React from 'react';
import { useParams } from 'react-router-dom';
import CommunityView from '../organisms/CommunityView';

export default function CommunityPage() {
  const { id } = useParams();
  return <CommunityView communityId={id} />;
}

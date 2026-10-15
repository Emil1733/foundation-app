'use client';

import { useEffect } from 'react';
import { getLeadAttribution } from '@/lib/browserLeadAttribution';

export default function LandingAttribution() {
  useEffect(() => { getLeadAttribution(); }, []);
  return null;
}

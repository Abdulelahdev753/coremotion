'use client';

import { useCallback, useEffect, useState } from 'react';

import {
  addWeightEntry,
  loadProfile,
  loadWeightLog,
  saveProfile,
  type StoredProfile,
} from '@/lib/motioncore/storage';
import type { AssessmentInput, WeightEntry } from '@/lib/motioncore/types';

export type StoreStatus = 'loading' | 'empty' | 'ready';

/**
 * Hydration-safe access to the persisted MotionCore profile and weight log.
 * Pages are statically prerendered, so storage is read once after mount —
 * the same restore pattern as the language provider.
 */
export function useMotionCoreStore() {
  const [status, setStatus] = useState<StoreStatus>('loading');
  const [profile, setProfile] = useState<StoredProfile | null>(null);
  const [weightLog, setWeightLog] = useState<WeightEntry[]>([]);

  useEffect(() => {
    const stored = loadProfile();
    // eslint-disable-next-line react-hooks/set-state-in-effect -- hydration-safe one-time restore
    setProfile(stored);
    setWeightLog(loadWeightLog());
    setStatus(stored ? 'ready' : 'empty');
  }, []);

  const save = useCallback((assessment: AssessmentInput) => {
    const stored = saveProfile(assessment);
    setProfile(stored);
    setStatus('ready');
    return stored;
  }, []);

  const addWeight = useCallback((entry: WeightEntry) => {
    setWeightLog(addWeightEntry(entry));
  }, []);

  return { status, profile, weightLog, save, addWeight };
}

import { atom } from 'jotai';
import { ICertificate } from '@/types/certificates.types.ts';

export const certificatesListAtom = atom<ICertificate[]>([]);

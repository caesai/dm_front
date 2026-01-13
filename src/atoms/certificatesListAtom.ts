import { Atom, atom } from 'jotai';
import { ICertificate } from '@/types/certificates.types.ts';

/**
 * Атом для хранения списка сертификатов
 * @type {Atom<ICertificate[]>}
 */
export const certificatesListAtom: Atom<ICertificate[]> = atom<ICertificate[]>([]);

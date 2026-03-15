import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from 'react';
import {
  getPsychologist,
  updatePsychologist,
  type Psychologist,
  type PsychologistUpdate,
  getDisplayName,
  getInitials,
} from '../lib/psychologist';
import { getProfileImage } from '../lib/images';

interface PsychologistContextType {
  psychologist: Psychologist | null;
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  updateProfile: (data: PsychologistUpdate) => Promise<void>;
  displayName: string;
  initials: string;
  profileImageUrl: string | null;
  profileImageId: string | null;
}

const PsychologistContext = createContext<PsychologistContextType | null>(null);

export function PsychologistProvider({ children }: { children: ReactNode }) {
  const [psychologist, setPsychologist] = useState<Psychologist | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [profileImageUrl, setProfileImageUrl] = useState<string | null>(null);
  const [profileImageId, setProfileImageId] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getPsychologist();
      setPsychologist(data);
      getProfileImage()
        .then(({ url, id }) => {
          setProfileImageUrl(url);
          setProfileImageId(id);
        })
        .catch(() => {
          setProfileImageUrl(null);
          setProfileImageId(null);
        });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar el perfil');
    } finally {
      setLoading(false);
    }
  }, []);

  const updateProfile = useCallback(
    async (data: PsychologistUpdate) => {
      if (!psychologist) throw new Error('No hay datos del psicólogo');
      const updated = await updatePsychologist(psychologist.psiCodigo, data);
      if (updated) setPsychologist(updated);
    },
    [psychologist]
  );

  useEffect(() => {
    refresh();
  }, [refresh]);

  const value: PsychologistContextType = {
    psychologist,
    loading,
    error,
    refresh,
    updateProfile,
    displayName: getDisplayName(psychologist),
    initials: getInitials(psychologist),
    profileImageUrl,
    profileImageId,
  };

  return (
    <PsychologistContext.Provider value={value}>
      {children}
    </PsychologistContext.Provider>
  );
}

export function usePsychologist() {
  const ctx = useContext(PsychologistContext);
  if (!ctx) {
    throw new Error('usePsychologist debe usarse dentro de PsychologistProvider');
  }
  return ctx;
}

import { useState, useEffect, useCallback, useRef } from 'react';
import { API_ENDPOINTS } from '../config/api';

interface Train {
  id: string;
  departureStation: string;
  arrivalStation: string;
  departureTime: string;
  arrivalTime: string;
  duration: string;
  trainNumber: string;
  platform?: string;
  price?: string;
  availableSeats?: number;
  totalSeats?: number;
  occupancyRate?: number;
  originalRecord?: any;
  note?: string;
}

interface UseOptimizedDataFetchingOptions<T> {
  url: string;
  dependencies?: any[];
  debounceMs?: number;
  cacheTimeout?: number;
  onSuccess?: (data: T) => void;
  onError?: (error: Error) => void;
  retryAttempts?: number;
  retryDelay?: number;
  // Optionnel: récupérer des métadonnées (ex: result.search.returnFilter)
  onMeta?: (meta: any) => void;
}

interface UseOptimizedDataFetchingReturn<T> {
  data: T | undefined;
  loading: boolean;
  error: Error | null;
  refetch: () => void;
  progress: number;
}

// Cache global pour les données
const dataCache = new Map<string, { data: any; timestamp: number }>();

export function useOptimizedDataFetching<T>({
  url,
  dependencies = [],
  debounceMs = 50, // Réduire drastiquement de 200ms à 50ms
  cacheTimeout = 5 * 60 * 1000, // 5 minutes
  onSuccess,
  onError,
  retryAttempts = 3,
  retryDelay = 1000,
  onMeta
}: UseOptimizedDataFetchingOptions<T>): UseOptimizedDataFetchingReturn<T> {
  const [data, setData] = useState<T | undefined>(undefined);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [progress, setProgress] = useState(0);
  
  const abortControllerRef = useRef<AbortController | null>(null);
  const debounceTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const retryCountRef = useRef(0);
  const progressIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Stabilise les dépendances pour éviter les re-renders inutiles et les annulations en boucle
  const depsKey = JSON.stringify(dependencies);

  // Fonction pour nettoyer le cache
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const cleanupCache = useCallback(() => {
    const now = Date.now();
    const keysToDelete: string[] = [];
    
    dataCache.forEach((value, key) => {
      if (now - value.timestamp >= cacheTimeout) {
        keysToDelete.push(key);
      }
    });
    
    keysToDelete.forEach(key => {
      console.log(`🗑️ Suppression du cache expiré: ${key}`);
      dataCache.delete(key);
    });
  }, [cacheTimeout]);

  // Fonction pour nettoyer complètement le cache
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const clearAllCache = useCallback(() => {
    console.log(`🗑️ Nettoyage complet du cache - ${dataCache.size} entrées supprimées`);
    dataCache.clear();
  }, []);

  // Fonction de récupération des données
  const fetchData = useCallback(async (isRetry = false) => {
    if (!isRetry) {
      retryCountRef.current = 0;
    }

    // Vérifier le cache
    const cacheKey = `${url}-${depsKey}`;
    const cached = dataCache.get(cacheKey);
    
    // Si cacheTimeout est 0, forcer la suppression du cache
    if (cacheTimeout === 0) {
      console.log(`🗑️ Cache désactivé - Suppression forcée pour: ${url}`);
      dataCache.delete(cacheKey);
    } else if (cached && Date.now() - cached.timestamp < cacheTimeout) {
      console.log(`📦 Données récupérées du cache pour: ${url}`);
      setData(cached.data);
      setLoading(false);
      setError(null);
      setProgress(100);
      onSuccess?.(cached.data);
      return;
    }

    console.log(`🔍 Récupération des données depuis: ${url}`);
    setLoading(true);
    setError(null);
    setProgress(0);

    // Annuler la requête précédente si elle existe
    if (abortControllerRef.current) {
      console.log(`🚫 Annulation de la requête précédente pour: ${url}`);
      abortControllerRef.current.abort();
    }

    // Annuler le debounce précédent
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }

    // Fonction pour exécuter la requête
    const executeRequest = async () => {
      abortControllerRef.current = new AbortController();

      try {
        // Simuler le progrès pour une meilleure UX
        progressIntervalRef.current = setInterval(() => {
          setProgress(prev => {
            if (prev >= 90) return prev;
            return prev + Math.random() * 10;
          });
        }, 100);

        const response = await fetch(url, {
          signal: abortControllerRef.current.signal
        });

        if (progressIntervalRef.current) {
          clearInterval(progressIntervalRef.current);
          progressIntervalRef.current = null;
        }

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();
        
        // Vérifier si les données sont valides
        if (!result || (Array.isArray(result) && result.length === 0)) {
          console.warn(`⚠️ Aucune donnée reçue de l'API pour: ${url}`);
          setData(undefined);
          setLoading(false);
          setProgress(0);
          return;
        }

        // Traiter la réponse de l'API TGVmax
        let processedData;
        if (result.success && Array.isArray(result.trains)) {
          // Format de réponse de l'API TGVmax
          console.log(`✅ Réponse API TGVmax reçue: ${result.trains.length} trains`);
          if (onMeta) {
            try { onMeta(result.search || null); } catch {}
          }
          processedData = result.trains;
        } else if (Array.isArray(result)) {
          // Format de réponse directe (array)
          console.log(`✅ Réponse directe reçue: ${result.length} éléments`);
          processedData = result;
        } else {
          console.warn(`⚠️ Format de réponse inattendu pour: ${url}`, result);
          setData(undefined);
          setLoading(false);
          setProgress(0);
          return;
        }

        // Vérifier si les données traitées sont valides
        if (!processedData || processedData.length === 0) {
          console.warn(`⚠️ Aucune donnée valide après traitement pour: ${url}`);
          setData(undefined);
          setLoading(false);
          setProgress(0);
          return;
        }

        console.log(`✅ Données traitées avec succès pour: ${url}`, processedData);
        setProgress(100);
        setData(processedData);
        setLoading(false);

        // Mettre en cache
        dataCache.set(cacheKey, {
          data: processedData,
          timestamp: Date.now()
        });

        onSuccess?.(processedData);

      } catch (err) {
        if (progressIntervalRef.current) {
          clearInterval(progressIntervalRef.current);
          progressIntervalRef.current = null;
        }
        
        if (err instanceof Error && err.name === 'AbortError') {
          console.log(`🚫 Requête annulée pour: ${url}`);
          return; // Requête annulée
        }

        const error = err instanceof Error ? err : new Error('Unknown error');
        console.error(`❌ Erreur lors de la récupération des données pour ${url}:`, error);
        
        // Retry logic
        if (retryCountRef.current < retryAttempts) {
          retryCountRef.current++;
          console.log(`🔄 Tentative de retry ${retryCountRef.current}/${retryAttempts} pour: ${url}`);
          setTimeout(() => {
            fetchData(true);
          }, retryDelay * retryCountRef.current);
          return;
        }

        console.error(`💥 Échec définitif après ${retryAttempts} tentatives pour: ${url}`);
        setError(error);
        setLoading(false);
        setProgress(0);
        setData(undefined);
        onError?.(error);
      }
    };

    // Appliquer le debounce ou exécuter immédiatement
    if (debounceMs > 0) {
      debounceTimeoutRef.current = setTimeout(executeRequest, debounceMs);
    } else {
      executeRequest();
    }

  }, [url, depsKey, cacheTimeout, onSuccess, onError, onMeta, retryAttempts, retryDelay, debounceMs]);

  // Fonction pour forcer le refetch
  const refetch = useCallback(() => {
    console.log(`🔄 Forçage du refetch pour: ${url}`);
    // Supprimer du cache pour forcer un nouveau fetch
    const cacheKey = `${url}-${depsKey}`;
    dataCache.delete(cacheKey);
    fetchData();
  }, [fetchData, url, depsKey]);

  // Effet principal - version simplifiée
  /* eslint-disable react-hooks/exhaustive-deps */
  useEffect(() => {
    const cacheKey = `${url}-${depsKey}`;
    
    console.log(`🔄 useEffect déclenché pour:`, { 
      url, 
      dependencies, 
      cacheKey,
      cacheTimeout,
      currentCacheKeys: Array.from(dataCache.keys())
    });
    
    // Annuler la requête précédente si elle existe
    if (abortControllerRef.current) {
      console.log(`🚫 Annulation de la requête précédente pour: ${url}`);
      abortControllerRef.current.abort();
    }

    // Si cacheTimeout est 0, nettoyer complètement le cache pour éviter les mélanges
    if (cacheTimeout === 0) {
      console.log(`🗑️ Cache désactivé - Nettoyage complet pour: ${url}`);
      dataCache.clear();
    }

    // Vérifier si on a déjà des données valides en cache (seulement si cacheTimeout > 0)
    const cached = dataCache.get(cacheKey);
    if (cacheTimeout > 0 && cached && Date.now() - cached.timestamp < cacheTimeout) {
      console.log(`📦 CACHE HIT - Données récupérées du cache pour: ${url}`, { 
        age: Date.now() - cached.timestamp,
        maxAge: cacheTimeout,
        dataLength: cached.data?.length || 'N/A',
        cacheKey
      });
      setData(cached.data);
      setLoading(false);
      setError(null);
      setProgress(100);
      return;
    }

    // Le cache est expiré ou inexistant, lancer une nouvelle requête
    console.log(`🚀 CACHE MISS - Lancement nouvelle requête pour: ${url}`, {
      cached: !!cached,
      expired: cached ? Date.now() - cached.timestamp >= cacheTimeout : 'N/A',
      cacheKey
    });
    
    // Exécuter la requête directement sans passer par fetchData pour éviter la boucle
    const executeRequest = async () => {
      try {
        setLoading(true);
        setError(null);
        setProgress(0);
        
        const controller = new AbortController();
        abortControllerRef.current = controller;
        
        // Simuler le progrès
        const progressInterval = setInterval(() => {
          setProgress(prev => Math.min(prev + 10, 90));
        }, 100);
        progressIntervalRef.current = progressInterval;
        
        const response = await fetch(url, { signal: controller.signal });
        
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        const result = await response.json();
        
        // Unifier le format: toujours du type générique T
        let processedData: T | undefined;
        if (result && result.success && Array.isArray(result.trains)) {
          if (onMeta) {
            try { onMeta(result.search || null); } catch {}
          }
          processedData = (result.trains as unknown) as T;
        } else if (Array.isArray(result)) {
          processedData = (result as unknown) as T;
        } else {
          console.warn(`⚠️ Format de réponse inattendu pour: ${url}`, result);
          processedData = undefined;
        }

        clearInterval(progressInterval);
        setProgress(100);
        
        if (!processedData || (Array.isArray(processedData) && processedData.length === 0)) {
          setData(undefined);
          setLoading(false);
          return;
        }

        setData(processedData as T);
        setLoading(false);
        
        // Mettre en cache seulement si cacheTimeout > 0
        if (cacheTimeout > 0) {
          dataCache.set(cacheKey, {
            data: processedData as T,
            timestamp: Date.now()
          });
        }
        
        onSuccess?.(processedData as T);
        
      } catch (error: any) {
        if (error.name === 'AbortError') {
          console.log(`🚫 Requête annulée pour: ${url}`);
          return;
        }
        
        console.error(`💥 Erreur lors du fetch pour: ${url}`, error);
        setError(error);
        setLoading(false);
        setProgress(0);
        onError?.(error);
      }
    };
    
    // Appliquer le debounce ou exécuter immédiatement
    if (debounceMs > 0) {
      debounceTimeoutRef.current = setTimeout(executeRequest, debounceMs);
    } else {
      executeRequest();
    }

    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
      }
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
    };
  }, [url, depsKey, cacheTimeout, debounceMs]);
  /* eslint-enable react-hooks/exhaustive-deps */

  // Nettoyage du cache périodiquement (seulement si cacheTimeout > 0)
  useEffect(() => {
    if (cacheTimeout > 0) {
      const interval = setInterval(() => {
        const now = Date.now();
        dataCache.forEach((value, key) => {
          if (now - value.timestamp > cacheTimeout) {
            dataCache.delete(key);
          }
        });
      }, cacheTimeout);
      return () => clearInterval(interval);
    }
  }, [cacheTimeout]);

  return {
    data,
    loading,
    error,
    refetch,
    progress
  };
}

// Hook spécialisé pour les données TGVmax
type TgvReturnOption = { requireReturnWithin3Days?: boolean; returnDays?: number[] };

export function useTGVmaxData(
  date: string,
  departureCity: string = 'Paris',
  options: TgvReturnOption = {}
): UseOptimizedDataFetchingReturn<Train[]> {
  const params = new URLSearchParams({ date, from: departureCity });
  if (options.requireReturnWithin3Days) {
    params.set('requireReturnWithinDays', '3');
    if (options.returnDays && options.returnDays.length) {
      params.set('returnDays', options.returnDays.sort((a,b)=>a-b).join(','));
    }
  }
  const url = `${API_ENDPOINTS.TGVMAX_SEARCH}?${params.toString()}`;
  
  console.log('🎯 useTGVmaxData appelé avec:', { date, departureCity, url });
  
  // Forcer la suppression du cache pour éviter les mélanges de données
  const cacheTimeout = 0; // Pas de cache pour éviter les problèmes
  
  return useOptimizedDataFetching<Train[]>({
    url,
    dependencies: [date, departureCity, options.requireReturnWithin3Days],
    cacheTimeout,
    debounceMs: 0, // Supprimer le debounce pour les données critiques
    retryAttempts: 1,
    retryDelay: 200 // Réduire le délai de retry
  });
}

// Hook pour les suggestions de villes  
export function useCitySuggestions(query: string, date: string, departureCity: string = 'Paris'): UseOptimizedDataFetchingReturn<Train[]> {
  const url = `${API_ENDPOINTS.TGVMAX_SEARCH}?date=${date}&from=${encodeURIComponent(departureCity)}`;
  return useOptimizedDataFetching<Train[]>({
    url,
    dependencies: [date, departureCity],
    cacheTimeout: 10 * 60 * 1000, // 10 minutes pour les suggestions
    retryAttempts: 1,
    retryDelay: 500
  });
}


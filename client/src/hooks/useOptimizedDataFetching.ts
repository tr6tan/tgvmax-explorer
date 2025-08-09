import { useState, useEffect, useCallback, useRef } from 'react';

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
  debounceMs = 200, // Réduit de 1000ms à 200ms pour plus de réactivité
  cacheTimeout = 5 * 60 * 1000, // 5 minutes
  onSuccess,
  onError,
  retryAttempts = 3,
  retryDelay = 1000
}: UseOptimizedDataFetchingOptions<T>): UseOptimizedDataFetchingReturn<T> {
  const [data, setData] = useState<T | undefined>(undefined);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [progress, setProgress] = useState(0);
  
  const abortControllerRef = useRef<AbortController | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const retryCountRef = useRef(0);
  const progressIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Fonction de nettoyage du cache
  const cleanupCache = useCallback(() => {
    const now = Date.now();
    const entries = Array.from(dataCache.entries());
    for (const [key, value] of entries) {
      if (now - value.timestamp > cacheTimeout) {
        dataCache.delete(key);
      }
    }
  }, [cacheTimeout]);

  // Fonction de récupération des données
  const fetchData = useCallback(async (isRetry = false) => {
    if (!isRetry) {
      retryCountRef.current = 0;
    }

    // Vérifier le cache
    const cacheKey = `${url}-${JSON.stringify(dependencies)}`;
    const cached = dataCache.get(cacheKey);
    
    if (cached && Date.now() - cached.timestamp < cacheTimeout) {
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
      abortControllerRef.current.abort();
    }

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
  }, [url, dependencies, cacheTimeout, onSuccess, onError, retryAttempts, retryDelay]);

  // Fonction de refetch
  const refetch = useCallback(() => {
    // Supprimer du cache pour forcer un nouveau fetch
    const cacheKey = `${url}-${JSON.stringify(dependencies)}`;
    dataCache.delete(cacheKey);
    fetchData();
  }, [fetchData]);

  // Effet principal - version simplifiée
  useEffect(() => {
    // Éviter les requêtes multiples si on est déjà en train de charger
    if (loading) {
      return;
    }

    // Vérifier si on a déjà des données valides en cache
    const cacheKey = `${url}-${JSON.stringify(dependencies)}`;
    const cached = dataCache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < cacheTimeout) {
      console.log(`📦 Données déjà en cache valide pour: ${url}`);
      setData(cached.data);
      setLoading(false);
      setError(null);
      setProgress(100);
      return;
    }

    // Lancer la requête immédiatement
    fetchData();

    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
      }
    };
  }, [url, dependencies.join(',')]); // Dépendances simplifiées

  // Nettoyage du cache périodiquement
  useEffect(() => {
    const interval = setInterval(cleanupCache, cacheTimeout);
    return () => clearInterval(interval);
  }, [cleanupCache, cacheTimeout]);

  return {
    data,
    loading,
    error,
    refetch,
    progress
  };
}

// Hook spécialisé pour les données TGVmax
export function useTGVmaxData(date: string, departureCity: string = 'Paris'): UseOptimizedDataFetchingReturn<Train[]> {
  return useOptimizedDataFetching<Train[]>({
    url: `http://localhost:4000/api/tgvmax/search?date=${date}&from=${encodeURIComponent(departureCity)}`,
    dependencies: [date, departureCity],
    cacheTimeout: 30 * 1000, // Réduit à 30 secondes pour plus de réactivité
    retryAttempts: 1, // Réduire les tentatives pour accélérer
    retryDelay: 500 // Réduire le délai de retry
  });
}

// Hook pour les suggestions de villes  
export function useCitySuggestions(query: string, date: string, departureCity: string = 'Paris'): UseOptimizedDataFetchingReturn<Train[]> {
  return useOptimizedDataFetching<Train[]>({
    url: `http://localhost:4000/api/tgvmax/search?date=${date}&from=${encodeURIComponent(departureCity)}`,
    dependencies: [date, departureCity],
    cacheTimeout: 10 * 60 * 1000, // 10 minutes pour les suggestions
    retryAttempts: 1,
    retryDelay: 500
  });
}


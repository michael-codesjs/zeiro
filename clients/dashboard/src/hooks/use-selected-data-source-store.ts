import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { type Database } from './use-data-sources';
import { useState, useEffect } from 'react';

interface SelectedDataSourceState {
  selectedDataSource: Database | null;
  setSelectedDataSource: (dataSource: Database | null) => void;
  clearSelectedDataSource: () => void;
}

const useSelectedDataSourceStoreBase = create<SelectedDataSourceState>()(
  persist(
    (set) => ({
      selectedDataSource: null,
      setSelectedDataSource: (dataSource) => set({ selectedDataSource: dataSource }),
      clearSelectedDataSource: () => set({ selectedDataSource: null }),
    }),
    {
      name: 'zeiro-selected-data-source',
      storage: createJSONStorage(() => localStorage),
      // Only persist the essential data, not the full database object
      partialize: (state) => ({
        selectedDataSource: state.selectedDataSource
          ? {
              id: state.selectedDataSource.id,
              name: state.selectedDataSource.name,
              type: state.selectedDataSource.type,
              status: state.selectedDataSource.status,
              connection_config: state.selectedDataSource.connection_config,
              credential_id: state.selectedDataSource.credential_id,
              environment: state.selectedDataSource.environment,
              created_at: state.selectedDataSource.created_at,
              updated_at: state.selectedDataSource.updated_at,
              metadata: state.selectedDataSource.metadata,
              auto_connect: state.selectedDataSource.auto_connect,
              last_accessed: state.selectedDataSource.last_accessed,
              description: state.selectedDataSource.description,
            }
          : null,
      }),
    }
  )
);

// Hydration-safe wrapper
export const useSelectedDataSourceStore = () => {
  const [hydrated, setHydrated] = useState(false);
  const store = useSelectedDataSourceStoreBase();

  useEffect(() => {
    setHydrated(true);
  }, []);

  if (!hydrated) {
    return {
      selectedDataSource: null,
      setSelectedDataSource: store.setSelectedDataSource,
      clearSelectedDataSource: store.clearSelectedDataSource,
    };
  }

  return store;
};

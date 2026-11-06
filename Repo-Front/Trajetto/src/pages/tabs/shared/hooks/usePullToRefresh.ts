import { useCallback, useState } from 'react';
import * as Haptics from 'expo-haptics';

export function usePullToRefresh(refresh: () => Promise<unknown>) {
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    if (process.env.EXPO_OS !== 'web') Haptics.selectionAsync().catch(() => {});
    try {
      await refresh();
    } finally {
      setRefreshing(false);
    }
  }, [refresh]);

  return { refreshing, onRefresh };
}

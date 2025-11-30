import { memo, useCallback } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { usePortal } from '../../src/Portal';

interface LoadingProps {}

const Loading: React.FC<LoadingProps> = () => {
  return (
    <View style={styles.loadingContainer}>
      <ActivityIndicator color="#fff" />
    </View>
  );
};

const styles = StyleSheet.create({
  loadingContainer: {
    width: 100,
    height: 100,
    backgroundColor: '#333',
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export const useLoading = () => {
  const { showWithOverlay } = usePortal();

  const showLoading = useCallback(() => {
    return showWithOverlay<void>({
      overlay: {
        closeable: false,
      },
      component: () => <Loading />,
    });
  }, [showWithOverlay]);

  return showLoading;
};

export default memo(Loading);

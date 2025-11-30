import React, {
  type ReactNode,
  memo,
  useCallback,
  useEffect,
  useMemo,
} from 'react';
import { BackHandler, Pressable, View, StyleSheet } from 'react-native';
import { PortalError, PortalErrorCode } from './error';

export interface OverlayProps {
  children: ReactNode | undefined;
  name: string;
  closeable?: boolean;
  overlayPressCloaseable?: boolean;
  orientation?:
    | 'leftTop'
    | 'leftMiddle'
    | 'leftBottom'
    | 'centerTop'
    | 'centerMiddle'
    | 'centerBottom'
    | 'rightTop'
    | 'rightMiddle'
    | 'rightBottom';
  bgColor?: string;
  pointerEvents?: 'auto' | 'box-none' | 'box-only' | 'none';
  onClose: (error: Error) => void;
  handleBack: () => boolean;
}

const Overlay: React.FC<OverlayProps> = ({
  children,
  name,
  closeable = true,
  overlayPressCloaseable = true,
  orientation = 'centerMiddle',
  bgColor = 'rgba(0,0,0,0.4)',
  pointerEvents,
  onClose,
  handleBack,
}) => {
  const close = useCallback(() => {
    if (!closeable || !overlayPressCloaseable) return;
    onClose(
      new PortalError(
        `Overlay ${name} closed by overlay press`,
        PortalErrorCode.CloseByOverlayPress
      )
    );
  }, [name, closeable, overlayPressCloaseable, onClose]);

  const containerStyle = useMemo(() => {
    return [
      styles.container,
      styles[orientation],
      { backgroundColor: bgColor },
    ];
  }, [orientation, bgColor]);

  useEffect(() => {
    if (!closeable) return;
    const subscription = BackHandler.addEventListener(
      'hardwareBackPress',
      () => {
        const isHandle = handleBack();
        if (isHandle) {
          onClose(
            new PortalError(
              `Overlay ${name} closed by hardware back press`,
              PortalErrorCode.CloseByHardwareBackPress
            )
          );
        }
        return isHandle;
      }
    );
    return subscription.remove;
  }, [name, closeable, handleBack, onClose]);

  return (
    <View pointerEvents={pointerEvents} style={containerStyle}>
      {closeable && overlayPressCloaseable && (
        <Pressable onPress={close} style={styles.overlay} />
      )}

      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    flexDirection: 'row',
  },
  leftTop: {
    justifyContent: 'flex-start',
    alignItems: 'flex-start',
  },
  leftMiddle: {
    justifyContent: 'flex-start',
    alignItems: 'center',
  },
  leftBottom: {
    justifyContent: 'flex-start',
    alignItems: 'flex-end',
  },
  centerTop: {
    justifyContent: 'center',
    alignItems: 'flex-start',
  },
  centerMiddle: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  centerBottom: {
    justifyContent: 'center',
    alignItems: 'flex-end',
  },
  rightTop: {
    justifyContent: 'flex-end',
    alignItems: 'flex-start',
  },
  rightMiddle: {
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  rightBottom: {
    justifyContent: 'flex-end',
    alignItems: 'flex-end',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
  },
});

export default memo(Overlay);

import { useCallback, useState } from 'react';
import { View, StyleSheet, Button } from 'react-native';
import { PortalError, PortalRender, usePortal } from '../../src/index';
import Confirm, { useConfirm } from '../components/Confirm';
import { useLoading } from '../components/Loading';
import { useDatePicker } from '../components/DatePicker';
import { HomePagePortalManager, useLocalPortals } from '../helper/LocalPortal';
import { router } from 'expo-router';
import { delay } from '../helper/common';

export default function App() {
  const homePortalContent = useLocalPortals((state) => state.homePortalContent);
  const { showWithOverlay } = usePortal();
  const showConfirm = useConfirm();
  const showLoading = useLoading();
  const showDatePicker = useDatePicker();

  const [selectedDate, setSelectedDate] = useState<string | undefined>(
    undefined
  );

  const handleShowConfirm = useCallback(async () => {
    try {
      const result = await showWithOverlay<boolean>({
        component: ({ close }) => (
          <Confirm
            title="Confirm"
            subTitle="Are you sure you want to confirm?"
            close={close}
          />
        ),
      });
      console.log('You chose to', result ? 'confirm' : 'cancel');
    } catch (error) {
      if (error instanceof PortalError) {
        if (error.isCloseByOverlayPressError()) {
          console.log('Overlay closed by overlay press');
        } else if (error.isCloseByHardwareBackPressError()) {
          console.log('Overlay closed by hardware back press');
        }
      }
    }
  }, []);

  const handleShowMultipleConfirm = useCallback(async () => {
    const promise1 = showConfirm({ title: 'dialog 1' });
    const promise2 = showConfirm({
      index: 10,
      title: 'dialog 2',
      subTitle: 'highest level',
    });
    const promise3 = showConfirm({ title: 'dialog 3' });

    Promise.allSettled([promise1, promise2, promise3]).then((results) => {
      console.log('results', results);
    });
  }, []);

  const handleShowLoading = useCallback(async () => {
    const { close } = showLoading();

    await delay(3000);

    close();
  }, []);

  const handleShowDatePicker = useCallback(async () => {
    const result = await showDatePicker({
      current: selectedDate,
    });
    setSelectedDate(result);
    console.log('You selected date: ', result);
  }, [selectedDate]);

  const handleShowLocalPortal = useCallback(async () => {
    router.navigate('/pageA');

    await delay(500);

    HomePagePortalManager.showWithOverlay<boolean>({
      component: ({ close }) => (
        <Confirm
          title="Local portal"
          subTitle="This dialog box only appears on the home page. Did you see it? "
          close={close}
        />
      ),
    });
  }, []);

  return (
    <>
      <View style={styles.container}>
        <Button title="Show confirm" onPress={handleShowConfirm} />
        <Button
          title="Show multiple confirm"
          onPress={handleShowMultipleConfirm}
        />
        <Button title="Show loading" onPress={handleShowLoading} />
        <Button title="Show DatePicker" onPress={handleShowDatePicker} />
        <Button title="Show Local portal" onPress={handleShowLocalPortal} />
      </View>

      <PortalRender portals={homePortalContent} />
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
});

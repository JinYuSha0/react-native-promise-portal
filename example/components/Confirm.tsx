import { memo, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { usePortal } from 'react-native-promise-portal';

interface ConfirmProps {
  title: string;
  subTitle?: string;
  close: (value: boolean) => void;
}

const Confirm: React.FC<ConfirmProps> = ({ title, subTitle, close }) => {
  return (
    <View style={styles.confirm}>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.subTitle}>{subTitle}</Text>
      <View style={styles.buttons}>
        <TouchableOpacity
          activeOpacity={0.8}
          style={styles.button}
          onPress={() => close(false)}
        >
          <Text style={styles.buttonText}>Cancel</Text>
        </TouchableOpacity>
        <TouchableOpacity
          activeOpacity={0.8}
          style={styles.button}
          onPress={() => close(true)}
        >
          <Text style={styles.buttonText}>Confirm</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  confirm: {
    width: 300,
    padding: 16,
    backgroundColor: 'white',
    borderRadius: 8,
    justifyContent: 'center',
    gap: 10,
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  subTitle: {
    fontSize: 14,
    color: 'gray',
  },
  buttons: {
    flexDirection: 'row',
    gap: 10,
  },
  button: {
    flex: 1,
    backgroundColor: 'lightgray',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
    padding: 8,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'black',
  },
});

export const useConfirm = () => {
  const { showWithOverlay } = usePortal();

  const showConfirm = useCallback(
    async (props: Omit<ConfirmProps, 'close'> & { index?: number }) => {
      const { index, ...rest } = props;
      const result = await showWithOverlay<boolean>({
        index,
        component: ({ close }) => <Confirm {...rest} close={close} />,
      });
      return result;
    },
    [showWithOverlay]
  );

  return showConfirm;
};

export default memo(Confirm);

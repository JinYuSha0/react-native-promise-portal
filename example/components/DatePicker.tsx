import { memo, useCallback, type ComponentProps } from 'react';
import { Calendar } from 'react-native-calendars';
import { usePortal } from 'react-native-promise-portal';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StyleSheet, View } from 'react-native';

interface DatePickerProps
  extends Omit<ComponentProps<typeof Calendar>, 'onDayPress'> {
  close: (date: string) => void;
}

const DatePicker: React.FC<DatePickerProps> = ({ close, ...props }) => {
  const { bottom } = useSafeAreaInsets();

  return (
    <View style={[styles.calendar, { paddingBottom: bottom }]}>
      <Calendar
        onDayPress={(day) => {
          close(day.dateString);
        }}
        markedDates={
          props.current
            ? {
                [props.current]: {
                  selected: true,
                  disableTouchEvent: true,
                  selectedColor: '#00adf5',
                },
              }
            : {}
        }
        {...props}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  calendar: {
    width: '100%',
    paddingTop: 10,
    backgroundColor: 'white',
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
    overflow: 'hidden',
  },
});

export const useDatePicker = () => {
  const { showWithOverlay } = usePortal();

  const showDatePicker = useCallback(
    async (props?: ComponentProps<typeof Calendar>) => {
      return showWithOverlay<string>({
        overlay: {
          orientation: 'centerBottom',
        },
        component: ({ close }) => <DatePicker {...props} close={close} />,
      });
    },
    [showWithOverlay]
  );

  return showDatePicker;
};

export default memo(DatePicker);

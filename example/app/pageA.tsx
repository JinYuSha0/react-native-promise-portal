import { memo } from 'react';
import { View, StyleSheet, Button, Text } from 'react-native';
import { router } from 'expo-router';

interface PageAProps {}

const PageA: React.FC<PageAProps> = () => {
  return (
    <View style={styles.container}>
      <Text>Now you can go back and watch the portal on the home page</Text>
      <Button title="Go back" onPress={router.back} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default memo(PageA);

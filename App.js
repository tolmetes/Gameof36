import React from 'react';
import { Dimensions, StyleSheet, Platform, StatusBar, Text, View } from 'react-native';

import Home from './Home'

export default function App() {
  return (
    <View style={styles.container} >
      <Home />
    </View >
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#9474cc',
    alignItems: 'center',
    justifyContent: 'center',
  },
});

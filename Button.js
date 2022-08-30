import React, { Component } from 'react';
import { StyleSheet, TouchableOpacity, Text, View } from 'react-native';

export default class Button extends Component {

  render() {
    return (
      <TouchableOpacity
        disabled={this.props.disabled}
        onPress={() => this.props.onPress(this.props.value)}
      >
        <View
          // value={this.props.text}
          style={[
            styles.button,
            { backgroundColor: this.props.disabled ? "#bdbdbd" : "white" }
          ]}
        >
          <Text style={styles.buttonText}>
            {this.props.text}
          </Text>
        </View>
      </TouchableOpacity>
    );
  }
}

const styles = StyleSheet.create({
  button: {
    borderRadius: 9,
    paddingVertical: 8,
    paddingHorizontal: 0,
    backgroundColor: '#fff',
    width: 64,
    height: 64,
    alignItems: 'center',
  },
  buttonText: {
    color: 'black',
    fontWeight: 'bold',
    fontSize: 32,
    textTransform: 'uppercase'
  }
})
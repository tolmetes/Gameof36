import React, { Component } from 'react';
import { StyleSheet, Image, TouchableOpacity, Text, View } from 'react-native';
import _ from 'lodash';

export default class BigButton extends Component {
  render() {
    return (
      <TouchableOpacity
        disabled={this.props.disabled}
        onPress={() => this.props.onPress({
          value: this.props.value, boxNumber: this.props.boxNumber
        })}
      >
        <View
          style={[
            styles.bigButton,
            { backgroundColor: this.props.hidden ? "#9474cc" : this.props.disabled ? "#bdbdbd" : "white" },

          ]}
        >
          <Text style={[styles.buttonText, { color: this.props.hidden ? "#9474cc" : "black" }]}>
            {this.props.value}
          </Text>
        </View>
      </TouchableOpacity>
    );
  }
}

const styles = StyleSheet.create({
  bigButton: {
    borderRadius: 9,
    paddingHorizontal: 0,
    backgroundColor: 'pink',
    color: "red",
    width: 128,
    justifyContent: "center",
    height: 128,
    alignItems: 'center',
  },
  buttonText: {
    color: 'black',
    fontWeight: 'bold',
    fontSize: 64,
    textTransform: 'uppercase'
  }
})

import React, { Component } from 'react'
import plus from "./assets/plus-icon.png"
import subtract from "./assets/subtract-icon.png"
import divide from "./assets/divide-icon.png"
import multiply from "./assets/multiply-icon.png"
import {
  StyleSheet,
  TouchableHighlight,
  TouchableNativeFeedback,
  TouchableWithoutFeedback,
  Image,
  TouchableOpacity,
  Text,
  View
} from 'react-native';

import BigButton from './BigButton'
import Button from './Button'

export default class Operators extends Component {

  render() {
    return (
      <View style={styles.operatorsContainer}>
        {/* <Button
          handleOperator={this.props.handleOperator}
          className="box"
          value="+"
        > */}
        <View style={styles.operatorBox}>
          <TouchableOpacity
            onPress={() => this.props.handleOperator("+")}
            style={styles.operator}
          >
            <Image
              source={require("./assets/plus-icon.png")}
              alt=""
              style={styles.image}
              value="+"
            />
          </TouchableOpacity>
        </View>
        <View style={styles.operatorBox}>
          <TouchableOpacity
            onPress={() => this.props.handleOperator("-")}
            style={styles.operator}
          >
            <Image
              source={require("./assets/subtract-icon.png")}
              alt=""
              style={styles.image}
              value="+"
            />
          </TouchableOpacity>
        </View>
        <View style={styles.operatorBox}>
          <TouchableOpacity
            onPress={() => this.props.handleOperator("*")}
            style={styles.operator}
          >
            <Image
              source={require("./assets/multiply-icon.png")}
              alt=""
              // style={{ width: 50, height: 50 }}
              style={styles.image}
              value="+"
            />
          </TouchableOpacity>
        </View>
        <View style={styles.operatorBox}>
          <TouchableOpacity
            onPress={() => this.props.handleOperator("/")}
            style={styles.operator}
          >
            <Image
              source={require("./assets/divide-icon.png")}
              alt=""
              style={styles.image}
              value="+"
            />
          </TouchableOpacity>
        </View>
      </View>
    )
  }
}

const styles = StyleSheet.create({
  operatorsContainer: {
    justifyContent: "center",
    display: "flex",
    flexDirection: "row",
    paddingHorizontal: 10,
    paddingVertical: 20,
  },
  operatorBox: {
    paddingHorizontal: 9,
    paddingVertical: 8
  },
  operator: {
    backgroundColor: "white",
    paddingVertical: 8,
    paddingHorizontal: 8,
    borderRadius: 9
  },
  image: {
    width: 60,
    height: 60,
    paddingVertical: 2,
    paddingHorizontal: 4,
    backgroundColor: "white"
  }
})
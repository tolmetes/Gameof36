import React, { Component } from 'react';
import { Image, StyleSheet, Dimensions, Button, TouchableOpacity, Text, View } from 'react-native';
import Operators from "./Operators"
import FourNumbers from './FourNumbers';
import _ from 'lodash';

var a = 100

export default class Game extends Component {
  constructor(props) {
    super(props);
    this.state = {
      data: this.addAttributes(this.props.data),
      result: "",
      display: "",
      previousBox: ""
    }
  }

  addAttributes = (numbers) => {
    let data = [
      { number: numbers[0], disabled: false, hidden: false },
      { number: numbers[1], disabled: false, hidden: false },
      { number: numbers[2], disabled: false, hidden: false },
      { number: numbers[3], disabled: false, hidden: false },
    ]
    return data;
  }

  operate(fn) {
    return new Function('return ' + fn)();
  }

  calculate = (label) => {
    try {
      const data = this.operate(this.state.result);
      this.setState({
        result: '' + data,
        display: data
      }, () => {
        let dataCopy = this.state.data;
        dataCopy[label - 1] = {
          ...dataCopy[label - 1],
          number: this.state.display
        }
        dataCopy[this.state.previousBox - 1] = {
          ...dataCopy[this.state.previousBox - 1],
          hidden: true
        }
        this.setState({
          data: dataCopy,
          previousBox: label
        })
        if (
          this.checkIf36(this.state.display) &&
          this.checkIfAllOtherNumberIsHidden(this.state.data)
        ) {
          this.props.toggleModal();
        }
      });
    } catch (e) {
      this.setState({ result: "error" })
    }
  }

  handleOperator = (e) => {
    const value = e;


    let lastCharacter = `${this.state.result}`.slice(-1);
    let isANumber =
      lastCharacter !== "-" &&
      lastCharacter !== "+" &&
      lastCharacter !== "*" &&
      lastCharacter !== "/"
    if (isANumber) {
      this.setState({
        result: this.state.result + value
      }, () => {
        let result = this.state.result
      })
    } else {
      let lastCharacterRemoved = this.state.result.slice(0, -1)
      this.setState({
        result: lastCharacterRemoved + value
      })
    }
  }

  handleClick = e => {
    const value = e.value
    const label = e.boxNumber

    let isANumber =
      value !== "-" &&
      value !== "+" &&
      value !== "*" &&
      value !== "/"

    let needReset = this.state.data.some(object => {
      return object.disabled
    })

    let result = this.state.result

    let includesOperator =
      _.includes(result, "+") ||
      _.includes(result, "-") ||
      _.includes(result, "*") ||
      _.includes(result, "/")

    //reset the disabled number
    if (needReset && isANumber) {
      let dataCopy = this.state.data;
      dataCopy.forEach(object => {
        object.disabled = false;
      })
      this.setState({
        result: "",
        display: "",
        data: dataCopy
      })
    }


    //disable clicked number
    let dataCopy = this.state.data;
    dataCopy[label - 1] = {
      ...dataCopy[label - 1],
      disabled: true
    }
    this.setState({ data: dataCopy })

    if (isANumber && includesOperator) {
      this.setState({
        result: this.state.result + value
      }, () => {
        this.calculate(label);
        let result = this.state.result
      })
    } else if (isANumber && needReset) {
      this.setState({
        result: value,
        display: value,
        previousBox: label
      }, () => {
        if (
          this.checkIf36(this.state.display) &&
          this.checkIfAllOtherNumberIsHidden(this.state.data)
        ) {
          this.props.toggleModal();
        }
      })
    }
    else {
      this.setState({
        result: value,
        display: value,
        fixedData: this.state.data
      }, () => {
        if (
          this.checkIf36(this.state.display) &&
          this.checkIfAllOtherNumberIsHidden(this.state.data)
        ) {
          this.props.toggleModal();
        }
      })
    }
    if (this.state.previousBox === "") {
      this.setState({
        previousBox: label
      })
    }
  }

  checkIfAllOtherNumberIsHidden = (data) => {
    console.log("hidden")
    let count = 0;
    data.forEach(object => {
      if (object.hidden) { count++ }
    })
    console.log("count", count)
    return count === 3 ? true : false;
  }

  checkIf36 = (number) => {
    return parseInt(number) === 36 ? true : false
  }

  reset = () => {
    this.setState({
      result: "",
      display: "",
      previousBox: "",
      data: this.addAttributes(this.props.data)
    })
  }

  render() {
    return (
      <View
        style={{
          backgroundColor: "#9474cc",
          width: "100%",
          height: Dimensions.get('window').height,
          width: Dimensions.get('window').width,
          paddingTop: 100
        }}
      >
        <View>
          <Text style={styles.levelText}>
            Level {this.props.currentLevel}
          </Text>
        </View>
        <View style={styles.backAndRefresh}>
          <View style={styles.backButtonContainer}>
            <TouchableOpacity
              onPress={this.props.showLevels}
              style={styles.backButton}
            >
              <Image
                source={require("./assets/left-arrow-icon.png")}
                style={styles.image}
              />
            </TouchableOpacity>
          </View>
          <View style={styles.resetButtonContainer}>
            <TouchableOpacity
              onPress={this.reset}
              style={styles.resetButton}
            >
              <Image
                source={require("./assets/refresh-icon.png")}
                style={styles.image}
              />
            </TouchableOpacity>
          </View>
        </View>
        <View>
          <FourNumbers
            data={this.state.data}
            handleClick={this.handleClick}
          />
          <Operators handleOperator={this.handleOperator} />
        </View>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  levelText: {
    marginBottom: 16,
    fontWeight: "bold",
    fontSize: 24,
    color: "#e6ceff",
    paddingHorizontal: 16,
    textAlign: 'center',
    paddingBottom: 16
  },
  backAndRefresh: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between"
  },
  backButtonContainer: {
    paddingHorizontal: 25
  },
  resetButtonContainer: {
    paddingHorizontal: 25
  },
  resetButton: {
    paddingHorizontal: 20
  },
  backButton: {
    paddingHorizontal: 20
  },
  image: {
    width: 40,
    height: 40
  }
})
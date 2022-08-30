import React, { Component } from 'react';
import { levelsData, levels, getLevels } from './Data'
import Button from './Button';
import Level from './Level';
import Game from './Game';
import Popup from './Popup';
import { StyleSheet, TouchableOpacity, Text, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';

export default class Home extends Component {
  constructor(props) {
    super(props);
    this.state = {
      showGame: false,
      showLevels: true,
      showModal: false,
      upToLevel: 1,
      currentLevel: 0,
      levels: getLevels(1),
      data: [],
    }
  }

  hideLevels = (text) => {
    console.log("text", text)
    this.setState({
      showLevels: false,
      showGame: true,
      data: levelsData[text - 1],
      currentLevel: text
    }, () => {
    })
  }

  showLevels = () => {
    this.setState({
      showLevels: true,
      showGame: false,
    })
  }

  goHome = () => {
    if (this.state.currentLevel === this.state.upToLevel) {
      this.setState({
        upToLevel: this.state.upToLevel + 1,
        showLevels: true,
        showGame: false,
        showModal: false
      }, () => {
        this.setState({
          levels: getLevels(this.state.upToLevel),
        })
      })
    } else {
      this.setState({
        showLevels: true,
        showGame: false,
        showModal: false
      })
    }
  }

  goToNextLevel = () => {
    if (this.state.currentLevel === this.state.upToLevel) {
      this.setState({
        levels: getLevels(this.state.upToLevel + 1),
        showGame: false,
        showModal: false,
        currentLevel: this.state.currentLevel + 1,
        upToLevel: this.state.upToLevel + 1,
      }, () => {
        this.setState({
          showGame: true,
          data: levelsData[this.state.currentLevel - 1]
        })
      })
    } else {
      this.setState({
        showModal: false,
        showGame: false,
        currentLevel: this.state.currentLevel + 1
      }, () => {
        this.setState({
          showGame: true,
          data: levelsData[this.state.currentLevel - 1]
        })
      })
    }
  }

  toggleModal = () => {
    this.setState(prevState => ({
      showModal: !prevState.showModal,
    }))
  }

  render() {
    return (
      <View>
        {
          this.state.showGame &&
          <Game
            data={this.state.data}
            showLevels={this.showLevels}
            toggleModal={this.toggleModal}
            currentLevel={this.state.currentLevel}
          />
        }
        {
          this.state.showLevels &&
          <Level
            levels={this.state.levels}
            hideLevels={this.hideLevels}
          />
        }
        {
          this.state.showModal &&
          <Popup
            toggleModal={this.toggleModal}
            showModal={this.state.showModal}
            goToNextLevel={this.goToNextLevel}
            goHome={this.goHome}
          />
        }
      </View >
    );
  }
}

const styles = StyleSheet.create({

})
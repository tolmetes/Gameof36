import React, { Component } from 'react';
import { StyleSheet, TouchableOpacity, Text, View } from 'react-native';
import Button from './Button.js'

export default class Level extends Component {

  render() {
    return (
      <View>
        <Text style={styles.title}>GAME OF 36</Text>
        <Text style={styles.levelsText}>Levels</Text>
        <View style={styles.levelContainer}>
          {this.props.levels.map((object, index) => {
            return (
              <View
                style={styles.levelButton}
                key={index}
              >
                <Button
                  onPress={this.props.hideLevels}
                  disabled={object.disabled}
                  key={index}
                  text={++index}
                  value={index}
                />
              </View>

            )
          })}
        </View>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  levelButton: {
    color: "pink",
    paddingHorizontal: 8,
    paddingVertical: 12
  },
  levelContainer: {
    display: "flex",
    justifyContent: "space-evenly",
    flexDirection: "row",
    flexWrap: "wrap",
    paddingVertical: 8,
    paddingHorizontal: 8,
  },
  levelsText: {
    marginBottom: 16,
    fontWeight: "bold",
    fontSize: 24,
    color: "#64489b",
    paddingHorizontal: 16,
    textAlign: 'center',
    paddingBottom: 16,
  },
  title: {
    marginBottom: 16,
    fontWeight: "bold",
    fontSize: 32,
    color: "#e6ceff",
    paddingHorizontal: 16,
    textAlign: 'center',
    alignItems: 'center',
    paddingBottom: 32,
  }
})
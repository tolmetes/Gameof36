import React, { Component } from "react";
import { Alert, Modal, StyleSheet, Text, Pressable, View } from "react-native";

function test() {
  console.log(a)
}

export default class Popup extends Component {
  render() {
    test();
    return (
      <View style={styles.centeredView}>
        <Modal
          animationType="slide"
          transparent={true}
          visible={this.props.showModal}
          onRequestClose={() => {
            Alert.alert("Modal has been closed.");
            this.props.toggleModal;
          }}
        >
          <View style={styles.centeredView}>
            <View style={styles.modalView}>
              <Text style={styles.modalText}>Success!</Text>
              <View style={styles.buttonContainer}>
                <View style={{ paddingHorizontal: 30 }}>
                  <Pressable
                    style={[styles.button, styles.buttonClose]}
                    onPress={this.props.goHome}
                  >
                    <Text style={styles.textStyle}>Home</Text>
                  </Pressable>
                </View>
                <View style={{ paddingHorizontal: 30 }}>
                  <Pressable
                    style={[styles.button, styles.buttonClose]}
                    onPress={this.props.goToNextLevel}
                  >
                    <Text style={styles.textStyle}>Next</Text>
                  </Pressable>
                </View>
              </View>
            </View>
          </View>
        </Modal>
        {/* <Pressable
          style={[styles.button, styles.buttonOpen]}
          onPress={this.props.toggleModal}
        >
          <Text style={styles.textStyle}>Show Modal</Text>
        </Pressable> */}
      </View>
    );
  }
}

const styles = StyleSheet.create({
  centeredView: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 22,
    // opacity: .5,
    backgroundColor: "rgba(0, 0, 0, .5)"
  },
  buttonContainer: {
    display: "flex",
    flexDirection: "row",
    fontSize: 30,
    justifyContent: "space-evenly"
  },
  modalView: {
    // margin: 10,
    // backgroundColor: "pink",
    borderRadius: 20,
    padding: 35,
    // alignItems: "center",
    // shadowColor: "#000",
    // shadowOffset: {
    //   width: 0,
    //   height: 2
    // },
    // shadowOpacity: 0.25,
    // shadowRadius: 4,
    // elevation: 5,
    backgroundColor: "#e6ceff",
    width: 300,
    height: 250,
    // opacity: 1,
  },
  button: {
    borderRadius: 9,
    padding: 10,
    elevation: 2,
    width: 120,
    height: 50,

  },
  buttonClose: {
    backgroundColor: "white",
    marginTop: 70,
    paddingHorizontal: 30

  },
  textStyle: {
    color: "black",
    fontWeight: "bold",
    textAlign: "center",
    fontSize: 20
  },
  modalText: {
    marginBottom: 15,
    textAlign: "center",
    fontSize: 36
  }
});

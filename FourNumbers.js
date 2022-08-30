import React, { Component } from 'react';
import { StyleSheet, TouchableOpacity, Text, View } from 'react-native';
import BigButton from './BigButton.js'

export default class FourNumbers extends Component {
	render() {
		return (
			<View style={styles.FourNumbersContainer}>
				{this.props.data.map((object, index) => {
					return (
						<View
							key={index}
							style={styles.numberButtonContainer}
						>
							<View
								styles={styles.numberButton}
							>
								<BigButton
									onPress={this.props.handleClick}
									boxNumber={++index}
									disabled={object.disabled}
									hidden={object.hidden}
									key={index}
									value={object.number}
								/>
							</View>
						</View>
					)
				})}
			</View>
		);
	}
}

const styles = StyleSheet.create({
	numberButtonContainer: {
		// backgroundColor: "pink",
		paddingHorizontal: 8,
		paddingVertical: 8
	},
	numberButton: {
		// backgroundColor: "pink",
		// color: "orange",
		paddingHorizontal: 24,
		paddingVertical: 24
	},
	FourNumbersContainer: {
		// backgroundColor: "yellow",
		display: "flex",
		justifyContent: "space-evenly",
		alignContent: "space-between",
		flexDirection: "row",
		flexWrap: "wrap",
		paddingVertical: 12,
		paddingHorizontal: 12,
	},
})
import React from 'react';
import { StyleSheet, Text, TouchableOpacity } from 'react-native';
import { colores } from '../theme/appTheme';

interface Props {
  title: string;
  onPress: () => void;
  isOperator?: boolean;
}

export const CalcButton = ({ title, onPress, isOperator = false }: Props) => {
  return (
    <TouchableOpacity 
      style={[
        buttonStyles.button, 
        isOperator ? buttonStyles.operatorButton : buttonStyles.numberButton
      ]} 
      onPress={onPress}
      activeOpacity={0.7}
    >
      <Text style={[
        buttonStyles.buttonText, 
        isOperator ? buttonStyles.operatorText : buttonStyles.numberText
      ]}>
        {title}
      </Text>
    </TouchableOpacity>
  );
};

const buttonStyles = StyleSheet.create({
  button: {
    width: '22%',
    aspectRatio: 1,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  numberButton: {
    backgroundColor: colores.botonNumero,
  },
  operatorButton: {
    backgroundColor: colores.botonOperador,
  },
  buttonText: {
    fontSize: 28,
    fontWeight: '600',
  },
  numberText: {
    color: colores.textoPrimario,
  },
  operatorText: {
    color: '#FFFFFF',
  },
});
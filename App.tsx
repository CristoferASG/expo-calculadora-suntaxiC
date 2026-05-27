import React from 'react';
import { Text, View, SafeAreaView } from 'react-native';
import { styles } from './src/theme/appTheme';
import { CalcButton } from './src/components/CalcButton';
import { useCalculator } from './src/hooks/useCalculator';

export default function App() {
  const { 
    expression, history, 
    handleNumber, handleOperator, handleDecimal, 
    clear, calculate 
  } = useCalculator();

  return (
    <SafeAreaView style={styles.mainBackground}>
      <View style={styles.calculatorContainer}>
        
        {/* Pantalla */}
        <View style={styles.displayContainer}>
          <Text style={styles.previousText}>{history}</Text>
          <Text style={styles.displayText} numberOfLines={1} adjustsFontSizeToFit>
            {expression}
          </Text>
        </View>

        {/* Teclado */}
        <View style={styles.buttonsContainer}>
          <View style={styles.row}>
            <CalcButton title="C" onPress={clear} isOperator />
            <View style={{ width: '22%' }} /> 
            <View style={{ width: '22%' }} />
            <CalcButton title="/" onPress={() => handleOperator('/')} isOperator />
          </View>
          <View style={styles.row}>
            <CalcButton title="7" onPress={() => handleNumber('7')} />
            <CalcButton title="8" onPress={() => handleNumber('8')} />
            <CalcButton title="9" onPress={() => handleNumber('9')} />
            <CalcButton title="*" onPress={() => handleOperator('*')} isOperator />
          </View>
          <View style={styles.row}>
            <CalcButton title="4" onPress={() => handleNumber('4')} />
            <CalcButton title="5" onPress={() => handleNumber('5')} />
            <CalcButton title="6" onPress={() => handleNumber('6')} />
            <CalcButton title="-" onPress={() => handleOperator('-')} isOperator />
          </View>
          <View style={styles.row}>
            <CalcButton title="1" onPress={() => handleNumber('1')} />
            <CalcButton title="2" onPress={() => handleNumber('2')} />
            <CalcButton title="3" onPress={() => handleNumber('3')} />
            <CalcButton title="+" onPress={() => handleOperator('+')} isOperator />
          </View>
          

          <View style={styles.row}>
            {}
            <View style={{ width: '22%' }} /> 
            <CalcButton title="0" onPress={() => handleNumber('0')} />
            <CalcButton title="." onPress={handleDecimal} />
            <CalcButton title="=" onPress={calculate} isOperator />
            
          </View>
        </View>

      </View>
    </SafeAreaView>
  );
}
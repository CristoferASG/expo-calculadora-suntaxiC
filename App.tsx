import React, { useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, SafeAreaView, Platform } from 'react-native';

export default function App() {
  // --- 1. ESTADOS (Memoria de la app) ---
  const [currentValue, setCurrentValue] = useState('0');
  const [previousValue, setPreviousValue] = useState('');
  const [operator, setOperator] = useState<string | null>(null);

  // --- 2. LÓGICA DE LA CALCULADORA ---
  const handleNumber = (value: string) => {
    if (currentValue === '0') {
      setCurrentValue(value);
    } else {
      setCurrentValue(currentValue + value);
    }
  };

  const handleOperator = (op: string) => {
    setOperator(op);
    setPreviousValue(currentValue);
    setCurrentValue('0');
  };

  const clear = () => {
    setCurrentValue('0');
    setPreviousValue('');
    setOperator(null);
  };

  const calculate = () => {
    const current = parseFloat(currentValue);
    const previous = parseFloat(previousValue);

    if (isNaN(current) || isNaN(previous)) return;

    let result = 0;
    switch (operator) {
      case '+': result = previous + current; break;
      case '-': result = previous - current; break;
      case '*': result = previous * current; break;
      case '/': result = previous / current; break;
      default: return;
    }

    setCurrentValue(result.toString());
    setOperator(null);
    setPreviousValue('');
  };

  // --- 3. COMPONENTE DE BOTÓN ---
  const CalcButton = ({ title, onPress, isOperator = false }: { title: string, onPress: () => void, isOperator?: boolean }) => (
    <TouchableOpacity 
      style={[styles.button, isOperator ? styles.operatorButton : styles.numberButton]} 
      onPress={onPress}
      activeOpacity={0.7}
    >
      <Text style={[styles.buttonText, isOperator ? styles.operatorText : styles.numberText]}>
        {title}
      </Text>
    </TouchableOpacity>
  );

  // --- 4. RENDERIZADO (La Interfaz) ---
  return (
    <SafeAreaView style={styles.mainBackground}>
      <View style={styles.calculatorContainer}>
        
        {/* Pantalla */}
        <View style={styles.displayContainer}>
          <Text style={styles.previousText}>{previousValue} {operator}</Text>
          <Text style={styles.displayText} numberOfLines={1} adjustsFontSizeToFit>{currentValue}</Text>
        </View>

        {/* Teclado */}
        <View style={styles.buttonsContainer}>
          <View style={styles.row}>
            <CalcButton title="C" onPress={clear} isOperator />
            <View style={styles.buttonPlaceholder} /> 
            <View style={styles.buttonPlaceholder} />
            <CalcButton title="/" onPress={() => handleOperator('/')} isOperator />
          </View>
          <View style={styles.row}>
            <CalcButton title="7" onPress={() => handleNumber('7')} />
            <CalcButton title="8" onPress={() => handleNumber('8')} />
            <CalcButton title="9" onPress={() => handleNumber('9')} />
            <CalcButton title="X" onPress={() => handleOperator('*')} isOperator />
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
            <CalcButton title="0" onPress={() => handleNumber('0')} />
            <CalcButton title="=" onPress={calculate} isOperator />
          </View>
        </View>

      </View>
    </SafeAreaView>
  );
}

// --- 5. ESTILOS (Flexbox y Diseño) ---
const styles = StyleSheet.create({
  mainBackground: {
    flex: 1,
    backgroundColor: '#E2E8F0', // Fondo gris claro para la web/pantalla completa
    justifyContent: 'center', // Centra verticalmente en web
    alignItems: 'center',     // Centra horizontalmente en web
  },
  calculatorContainer: {
    width: '100%',
    maxWidth: 400, // ¡ESTO LA HACE RESPONSIVA! En web no pasará de 400px.
    flex: 1,
    maxHeight: 850,
    backgroundColor: '#0F172A', // Azul muy oscuro (estilo moderno)
    borderRadius: Platform.OS === 'web' ? 20 : 0, // Bordes redondos solo en web
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  displayContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    alignItems: 'flex-end',
    padding: 30,
    backgroundColor: '#1E293B', // Fondo de pantalla un poco más claro
  },
  previousText: {
    color: '#94A3B8',
    fontSize: 24,
    marginBottom: 10,
  },
  displayText: {
    color: '#F8FAFC',
    fontSize: 60,
    fontWeight: 'bold',
  },
  buttonsContainer: {
    padding: 20,
    backgroundColor: '#0F172A',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  button: {
    width: '22%', // Porcentajes para que se adapte al ancho disponible
    aspectRatio: 1, // Mantiene el botón cuadrado perfecto
    borderRadius: 16, // Bordes cuadrados pero suavizados (estilo Apple moderno)
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonPlaceholder: {
    width: '22%', 
  },
  numberButton: {
    backgroundColor: '#1E293B',
  },
  operatorButton: {
    backgroundColor: '#3B82F6', // Azul brillante para los operadores
  },
  buttonText: {
    fontSize: 28,
    fontWeight: '600',
  },
  numberText: {
    color: '#F8FAFC',
  },
  operatorText: {
    color: '#FFFFFF',
  },
});
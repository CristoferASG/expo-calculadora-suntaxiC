import { useState } from 'react'; // Importa el hook useState de React para manejar el estado

// Enum que define los operadores matemáticos y sus símbolos
enum Operator {
  add      = '+',
  subtract = '-',
  multiply = '*',
  divide   = '/',
}

// Función guardia que comprueba si un carácter es un operador válido
const isOperator = (char: string): char is Operator =>
  Object.values(Operator).includes(char as Operator);

// Hook personalizado que contiene toda la lógica de la calculadora
export const useCalculator = () => {

  // Estado que guarda la expresión actual mostrada en pantalla (inicia en '0')
  const [expression, setExpression] = useState('0');

  // Estado que guarda el historial de la operación antes de calcular
  const [history, setHistory] = useState('');

  // Función que evalúa una expresión matemática en formato string y devuelve un número
  const evaluateExpression = (expr: string): number => {

    // Tokeniza la expresión: separa números (incluyendo decimales) y operadores usando regex
    const tokens = expr.match(/[\d.]+|[+\-*/]/g) ?? [];

    // Si no hay tokens, lanza error
    if (tokens.length === 0) throw new Error('Expresión vacía');

    // Si solo hay un token, es un número; lo devuelve como float
    if (tokens.length === 1) return parseFloat(tokens[0]);

    // Arrays para almacenar números y operadores por separado
    const numbers: number[]  = [];
    const operators: string[] = [];

    // Recorre los tokens: posiciones pares son números, impares son operadores
    tokens.forEach((token, index) => {
      if (index % 2 === 0) {
        numbers.push(parseFloat(token)); // Convierte a número
      } else {
        operators.push(token); // Guarda el operador
      }
    });

    // Resuelve primero multiplicaciones y divisiones (mayor precedencia)
    let i = 0;
    while (i < operators.length) {
      if (operators[i] === Operator.multiply || operators[i] === Operator.divide) {
        const result =
          operators[i] === Operator.multiply
            ? numbers[i] * numbers[i + 1]   // Multiplicación
            : numbers[i] / numbers[i + 1];  // División
        numbers.splice(i, 2, result);       // Reemplaza los dos números por el resultado
        operators.splice(i, 1);             // Elimina el operador usado
      } else {
        i++; // Avanza si no es * o /
      }
    }

    // Ahora resuelve sumas y restas de izquierda a derecha
    let result = numbers[0]; // Comienza con el primer número
    for (let j = 0; j < operators.length; j++) {
      switch (operators[j]) {
        case Operator.add:
          result += numbers[j + 1];
          break;
        case Operator.subtract:
          result -= numbers[j + 1];
          break;
      }
    }

    return result; // Devuelve el resultado final
  };

  // Manejador para cuando el usuario presiona un dígito (0-9)
  const handleNumber = (num: string) => {

    setExpression((prev) => {

      // Si la pantalla es '0' o 'Error', reemplaza por el nuevo número
      if (prev === '0' || prev === 'Error') return num;

      // Divide la expresión por operadores para obtener el último número ingresado
      const parts   = prev.split(/[+\-*/]/);
      const lastPart = parts[parts.length - 1];

      // Evita múltiples ceros a la izquierda: si el último número es exactamente '0' y no es punto decimal
      if (lastPart === '0' && num !== '.') {
        return prev.slice(0, -1) + num; // Reemplaza el último carácter
      }

      // Caso normal: concatena el número al final
      return prev + num;
    });
  };

  // Manejador para cuando el usuario presiona un operador (+, -, *, /)
  const handleOperator = (op: string) => {
    setExpression((prev) => {

      // Si hay error, reinicia con '0' seguido del operador
      if (prev === 'Error') return '0' + op;

      const lastChar = prev.slice(-1); // Último carácter de la expresión

      // Si el último carácter ya es un operador, lo reemplaza por el nuevo
      if (isOperator(lastChar)) {
        return prev.slice(0, -1) + op;
      }

      // Caso normal: concatena el operador
      return prev + op;
    });
  };

  // Manejador para el punto decimal
  const handleDecimal = () => {
    setExpression((prev) => {
      // Si hay error, reinicia con '0.'
      if (prev === 'Error') return '0.';

      // Obtiene el último número de la expresión
      const parts    = prev.split(/[+\-*/]/);
      const lastPart = parts[parts.length - 1];

      // Si el último número está vacío (ej: terminó en operador), agrega '0.'
      if (lastPart === '') return prev + '0.';

      // Evita múltiples puntos decimales en el mismo número
      if (lastPart.includes('.')) return prev;

      // Caso normal: agrega el punto
      return prev + '.';
    });
  };

  // Limpia toda la calculadora (pantalla a '0' y borra historial)
  const clear = () => {
    setExpression('0');
    setHistory('');
  };

  // Calcula el resultado cuando se presiona el signo igual (=)
  const calculate = () => {
    try {
      // Guarda la expresión actual en el historial
      setHistory(expression);

      let expToEval = expression;

      // Si el último carácter es un operador, lo elimina para evitar errores
      if (isOperator(expToEval.slice(-1))) {
        expToEval = expToEval.slice(0, -1);
      }

      // Evalúa la expresión
      const result = evaluateExpression(expToEval);

      // Verifica si el resultado es un número válido (no infinito ni NaN)
      if (!isFinite(result) || isNaN(result)) {
        setExpression('Error');
        return;
      }

      // Redondea el resultado a máximo 7 decimales
      const formattedResult = Math.round(result * 10_000_000) / 10_000_000;

      // Muestra el resultado en pantalla
      setExpression(String(formattedResult));
    } catch {
      // Si ocurre cualquier error, muestra 'Error'
      setExpression('Error');
    }
  };

  // Retorna los estados y funciones para que un componente pueda usarlos
  return {
    expression,
    history,
    handleNumber,
    handleOperator,
    handleDecimal,
    clear,
    calculate,
  };
};
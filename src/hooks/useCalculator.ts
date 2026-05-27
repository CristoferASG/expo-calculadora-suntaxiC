import { useState } from 'react';

// ═══════════════════════════════════════════════════════════════════
// MEJORA 1 — ENUM DE OPERADORES
// Un enum es una característica de TypeScript (no existe en JS puro).
// Crea un tipo que solo puede tener los valores definidos aquí.
// Ventaja: si escribes Operator.aadd el compilador te avisa al instante.
// Usar strings sueltos '+' '-' en 10 lugares distintos es frágil;
// si cambias el símbolo, tendrías que buscarlo manualmente en todo el código.
// ═══════════════════════════════════════════════════════════════════
enum Operator {
  add      = '+',
  subtract = '-',
  multiply = '*',
  divide   = '/',
}

// ═══════════════════════════════════════════════════════════════════
// TYPE GUARD: isOperator
// Una función que TypeScript usa para ESTRECHAR (narrow) el tipo de
// una variable dentro de un bloque if.
// El retorno "char is Operator" le dice al compilador:
//   "si esta función retorna true, a partir de aquí `char` es Operator"
// Internamente usa Object.values(Operator) → ['+', '-', '*', '/']
// y el cast "as Operator" es necesario porque .includes() recibe el
// tipo base del array (string), no el tipo estrecho (Operator).
// ═══════════════════════════════════════════════════════════════════
const isOperator = (char: string): char is Operator =>
  Object.values(Operator).includes(char as Operator);


export const useCalculator = () => {

  // Estado principal: la cadena completa visible en la pantalla, ej: "12+3.5"
  // useState<string> infiere el tipo automáticamente desde el valor inicial.
  const [expression, setExpression] = useState('0');

  // Estado secundario: guarda la expresión AL MOMENTO de presionar "="
  // para mostrarla más pequeña arriba (como historial de un paso).
  const [history, setHistory] = useState('');


  // ═════════════════════════════════════════════════════════════════
  // MEJORA 3 — EVALUADOR MATEMÁTICO EXPLÍCITO (función privada)
  //
  // Esta función NO está en el return, así que es PRIVADA al hook.
  // Solo la usan calculate() internamente. Esto es encapsulamiento:
  // el componente de React no tiene acceso a evaluateExpression.
  //
  // Algoritmo en dos pasadas (respeta la precedencia de operadores):
  //   1ª pasada → resuelve * y / de izquierda a derecha
  //   2ª pasada → resuelve + y - de izquierda a derecha
  //
  // Ejemplo: "2+3*4"
  //   tokens  → ["2", "+", "3", "*", "4"]
  //   numbers → [2, 3, 4]   operators → ["+", "*"]
  //   1ª: 3*4=12  → numbers=[2,12]  operators=["+"]
  //   2ª: 2+12=14 → result = 14  ✓  (new Function daría 14 también,
  //       pero con un switch vemos exactamente qué operación se hace)
  // ═════════════════════════════════════════════════════════════════
  const evaluateExpression = (expr: string): number => {

    // .match() con flag 'g' devuelve TODOS los matches como array, o null si no hay.
    // El operador ?? (nullish coalescing) reemplaza null/undefined por [].
    // Regex: [\d.]+ → uno o más dígitos o puntos (captura "12.5")
    //        [+\-*/] → exactamente un operador (el \ escapa el - dentro de [])
    const tokens = expr.match(/[\d.]+|[+\-*/]/g) ?? [];

    if (tokens.length === 0) throw new Error('Expresión vacía');

    // Optimización: si solo hay un token (ej: "7"), lo retornamos directo.
    // parseFloat convierte el string "7" al número 7.
    if (tokens.length === 1) return parseFloat(tokens[0]);

    // Declaración de tipo explícita: TypeScript sabe que numbers[] solo
    // contendrá number, y operators[] solo contendrá string.
    const numbers: number[]  = [];
    const operators: string[] = [];

    // forEach recibe (elemento, índice).
    // Los números están en posiciones PARES (0, 2, 4...) y
    // los operadores en posiciones IMPARES (1, 3, 5...).
    // Esto funciona porque la expresión siempre tiene la forma:
    //   número OP número OP número ...
    tokens.forEach((token, index) => {
      if (index % 2 === 0) {
        numbers.push(parseFloat(token)); // parseFloat("3.14") → 3.14
      } else {
        operators.push(token);
      }
    });

    // ── PRIMERA PASADA: Multiplicación y División ──────────────────
    // Usamos while en lugar de for porque el array se modifica dentro del bucle.
    // splice(start, deleteCount, ...items):
    //   numbers.splice(i, 2, result) → borra 2 elementos desde i, inserta result
    //   operators.splice(i, 1)       → borra 1 elemento desde i
    // Después del splice, el elemento de índice i ya es el SIGUIENTE,
    // por eso NO incrementamos i cuando encontramos * o /.
    let i = 0;
    while (i < operators.length) {
      if (operators[i] === Operator.multiply || operators[i] === Operator.divide) {
        const result =
          operators[i] === Operator.multiply
            ? numbers[i] * numbers[i + 1]
            : numbers[i] / numbers[i + 1]; // división por cero → Infinity (se atrapa en calculate)
        numbers.splice(i, 2, result);  // [2, 3, 4] → [2, 12] con i=1, result=12
        operators.splice(i, 1);        // ["+", "*"] → ["+"]
        // NO hacemos i++ porque el arreglo se compactó
      } else {
        i++; // solo avanzamos si el operador actual NO era * ni /
      }
    }

    // ── SEGUNDA PASADA: Suma y Resta ───────────────────────────────
    // Al llegar aquí, operators[] solo contiene '+' y '-'.
    // Acumulamos el resultado de izquierda a derecha.
    let result = numbers[0]; // primer número como valor base
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

    return result;
  };


  // ═════════════════════════════════════════════════════════════════
  // MEJORA 2 — handleNumber con protección de ceros iniciales
  //
  // BUG en la versión original:
  //   Usuario escribe 2 → + → 0 → 7
  //   expression queda "2+07" → matemáticamente ambiguo
  //   (en algunos contextos "07" se lee como octal)
  //
  // Solución: detectamos si el segmento actual termina en "0" solitario
  // y lo reemplazamos en lugar de concatenar.
  // ═════════════════════════════════════════════════════════════════
  const handleNumber = (num: string) => {

    // setExpression acepta un valor O una función (prev) => nuevoValor.
    // Usamos la forma de función para acceder al estado más reciente,
    // evitando el "stale state" que ocurre si llamamos setExpression(expression + num).
    setExpression((prev) => {

      // Casos base: si la pantalla muestra '0' o 'Error', el nuevo dígito la reemplaza.
      if (prev === '0' || prev === 'Error') return num;

      // Dividimos la expresión completa por cualquier operador.
      // Regex /[+\-*/]/ hace split por +, -, * o /.
      // Ej: "12+0" → ["12", "0"]
      // Ej: "12+"  → ["12", ""]   (el último elemento es cadena vacía)
      const parts   = prev.split(/[+\-*/]/);
      const lastPart = parts[parts.length - 1]; // el número que se está escribiendo AHORA

      // Si el segmento actual es exactamente "0" y el nuevo carácter no es ".",
      // reemplazamos ese "0" por el nuevo dígito.
      // prev.slice(0, -1) elimina el último carácter ("0") de la expresión completa.
      // Ej: prev="2+0", num="7" → "2+" + "7" = "2+7"
      if (lastPart === '0' && num !== '.') {
        return prev.slice(0, -1) + num;
      }

      // Caso normal: concatenamos el nuevo dígito
      return prev + num;
    });
  };


  // ═════════════════════════════════════════════════════════════════
  // handleOperator — sin cambios en la lógica, usa isOperator
  //
  // Acepta string (no Operator) para que App.tsx no necesite cambios.
  // El Type Guard isOperator se encarga de la validación internamente.
  // ═════════════════════════════════════════════════════════════════
  const handleOperator = (op: string) => {
    setExpression((prev) => {
      // Si la pantalla muestra Error, comenzamos una nueva expresión desde 0
      if (prev === 'Error') return '0' + op;

      const lastChar = prev.slice(-1); // último carácter de la expresión

      // Si el último carácter YA es un operador, lo sustituimos.
      // Esto evita expresiones como "2++3" o "5*-" (el segundo op reemplaza al primero).
      if (isOperator(lastChar)) {
        return prev.slice(0, -1) + op; // quitamos el último char y ponemos el nuevo op
      }

      return prev + op;
    });
  };


  // ═════════════════════════════════════════════════════════════════
  // handleDecimal — sin cambios, la lógica ya era robusta
  //
  // Garantiza que cada segmento numérico tenga como máximo UN punto.
  // ═════════════════════════════════════════════════════════════════
  const handleDecimal = () => {
    setExpression((prev) => {
      if (prev === 'Error') return '0.';

      const parts    = prev.split(/[+\-*/]/);
      const lastPart = parts[parts.length - 1];

      // Si acabamos de escribir un operador, el último segmento es '' → añadimos "0."
      if (lastPart === '') return prev + '0.';

      // Si el segmento actual YA tiene punto, ignoramos la pulsación
      if (lastPart.includes('.')) return prev;

      return prev + '.';
    });
  };


  // Limpia completamente la calculadora a su estado inicial
  const clear = () => {
    setExpression('0');
    setHistory('');
  };


  // ═════════════════════════════════════════════════════════════════
  // calculate — usa evaluateExpression en vez de new Function()
  // ═════════════════════════════════════════════════════════════════
  const calculate = () => {
    try {
      // Guardamos la expresión actual en el historial ANTES de calcular
      setHistory(expression);

      let expToEval = expression;

      // Sanitización: si la expresión termina en operador (ej: "3+"), lo removemos
      if (isOperator(expToEval.slice(-1))) {
        expToEval = expToEval.slice(0, -1);
      }

      const result = evaluateExpression(expToEval);

      // isFinite(x) retorna false si x es Infinity o -Infinity (división por cero)
      // isNaN(x) retorna true si x no es un número válido
      if (!isFinite(result) || isNaN(result)) {
        setExpression('Error');
        return; // salimos del try sin llegar al setExpression de abajo
      }

      // Corrección de punto flotante de JavaScript:
      // 0.1 + 0.2 en JS = 0.30000000000000004
      // Multiplicar por 10^7, redondear al entero más cercano y dividir
      // equivale a truncar a 7 decimales de precisión.
      // El separador de miles _ es sintaxis ES2021: 10_000_000 = 10000000
      const formattedResult = Math.round(result * 10_000_000) / 10_000_000;

      setExpression(String(formattedResult)); // convertimos number → string para el estado
    } catch {
      // Si evaluateExpression lanza cualquier error, mostramos "Error"
      // La cláusula catch vacía (sin variable) es válida desde ES2019 / TS 2.5
      setExpression('Error');
    }
  };


  // ═════════════════════════════════════════════════════════════════
  // RETURN DEL HOOK
  // Solo exponemos lo que el componente necesita.
  // evaluateExpression NO está aquí → permanece privada.
  // Los nombres coinciden exactamente con lo que App.tsx destructura,
  // por eso App.tsx no necesita ningún cambio.
  // ═════════════════════════════════════════════════════════════════
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
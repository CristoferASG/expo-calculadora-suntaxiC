import { StyleSheet, Platform } from 'react-native';

export const colores = {
  fondoPrincipal: '#E2E8F0',
  fondoCalculadora: '#0F172A',
  fondoPantalla: '#1E293B',
  textoPrimario: '#F8FAFC',
  textoSecundario: '#94A3B8',
  botonNumero: '#1E293B',
  botonOperador: '#3B82F6',
};

export const styles = StyleSheet.create({
  mainBackground: {
    flex: 1,
    backgroundColor: colores.fondoPrincipal,
    justifyContent: 'center',
    alignItems: 'center',
  },
  calculatorContainer: {
    width: '100%',
    maxWidth: 400,
    flex: 1,
    maxHeight: 850,
    backgroundColor: colores.fondoCalculadora,
    borderRadius: Platform.OS === 'web' ? 20 : 0,
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
    backgroundColor: colores.fondoPantalla,
  },
  previousText: {
    color: colores.textoSecundario,
    fontSize: 24,
    marginBottom: 10,
  },
  displayText: {
    color: colores.textoPrimario,
    fontSize: 60,
    fontWeight: 'bold',
  },
  buttonsContainer: {
    padding: 20,
    backgroundColor: colores.fondoCalculadora,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
});
# Motor de Factores de Certeza

## Manual de usuario

Aplicación web educativa para analizar incidentes de ciberseguridad mediante un sistema experto basado en la Teoría de Factores de Certeza.

El sistema recibe cuatro evidencias, aplica reglas de inferencia y calcula cuál de las hipótesis de incidente tiene mayor certeza.

## 1. Archivos del proyecto

- `index.html`: contiene la estructura y los textos de la página.
- `styles.css`: contiene los colores, tipografías, tarjetas, botones, fondos y distribución visual.
- `script.js`: contiene los operadores lógicos, las fórmulas de factores de certeza y la actualización dinámica de la interfaz.

La página funciona en el navegador y no necesita una base de datos ni un servidor externo.

## 2. Objetivo del sistema

El sistema analiza evidencias de un Centro de Operaciones de Seguridad y compara tres posibles hipótesis:

- **CH1 - DDoS:** ataque de denegación de servicio distribuido.
- **CH2 - Ransomware:** intrusión relacionada con secuestro o cifrado malicioso de archivos.
- **CH3 - Falsa Alarma:** tráfico legítimo interpretado como un incidente.

`CH` significa **hipótesis de clasificación**. Cada código representa una posible explicación del incidente.

## 3. Evidencias de entrada

La página muestra cuatro campos numéricos. Cada uno acepta valores entre `-1` y `1`.

| Evidencia | Significado | Valor inicial |
|---|---|---:|
| `E1` | Pico anómalo en el consumo de ancho de banda entrante. | `0.85` |
| `E2` | Intentos masivos fallidos de autenticación SSH. | `0.90` |
| `E3` | Alertas del antivirus corporativo en las terminales. | `-0.40` |
| `E4` | Modificaciones inexplicables en firmas SHA-256. | `0.70` |

### Significado de los valores

- Un valor positivo representa evidencia a favor de que el hecho ocurre.
- Un valor negativo representa evidencia en contra de la hipótesis relacionada.
- Un valor igual a `0` significa que no existe evidencia útil en ese sentido.
- Los valores cercanos a `1` o `-1` representan mayor certeza.

Por ejemplo, `E3 = -0.40` indica certeza moderada de que el antivirus no ha detectado amenazas.

## 4. Cómo utilizar la página

1. Abra `index.html` en un navegador.
2. Revise los valores iniciales de `E1`, `E2`, `E3` y `E4`.
3. Cambie cualquier valor si desea probar otro escenario.
4. Verifique el vector mostrado debajo de las evidencias.
5. Presione **Ejecutar motor de inferencia**.
6. Revise los resultados de las reglas.
7. Revise las tarjetas de diagnóstico y sus barras de certeza.
8. Consulte la consola para ver el procedimiento completo y la conclusión.

Cuando se modifica una evidencia, el vector se actualiza inmediatamente. Los cálculos completos se ejecutan al presionar el botón.

## 5. Reglas de inferencia

El sistema utiliza exactamente estas cuatro reglas:

### Regla R1

```text
SI E1 ENTONCES CH1
Factor de regla: 0.80
```

Cálculo:

```text
R1 = E1 × 0.80
```

R1 aporta evidencia a la hipótesis DDoS.

### Regla R2

```text
SI E2 AND E4 ENTONCES CH2
Factor de regla: 0.75
```

Primero se calcula el antecedente mediante `AND`:

```text
antecedenteR2 = min(E2, E4)
```

Después se propaga el resultado:

```text
R2 = min(E2, E4) × 0.75
```

R2 aporta evidencia a la hipótesis Ransomware.

### Regla R3

```text
SI E3 ENTONCES CH2
Factor de regla: 0.60
```

Cálculo:

```text
R3 = E3 × 0.60
```

Si E3 es negativo, R3 también representa evidencia negativa para Ransomware.

### Regla R4

```text
SI NOT E1 OR NOT E3 ENTONCES CH3
Factor de regla: 0.50
```

Primero se invierten las evidencias:

```text
NOT E1 = -E1
NOT E3 = -E3
```

Después se aplica `OR` y se propaga el resultado:

```text
R4 = max(NOT E1, NOT E3) × 0.50
```

R4 aporta evidencia a la hipótesis Falsa Alarma.

## 6. Operadores lógicos

Los operadores se calculan realmente en JavaScript.

### AND

Para factores de certeza, `AND` toma el menor valor:

```text
AND(A, B) = min(A, B)
```

Esto representa que una condición conjunta queda limitada por la evidencia más débil.

### OR

`OR` toma el mayor valor:

```text
OR(A, B) = max(A, B)
```

Esto representa que basta con que una de las opciones tenga mayor evidencia.

### NOT

`NOT` cambia el signo:

```text
NOT(A) = -A
```

Una evidencia positiva se convierte en negativa y una negativa se convierte en positiva.

## 7. Estado de activación de las reglas

La página explica el estado de cada regla tanto en la sección de reglas como en la consola.

- **ACTIVA:** el antecedente es positivo y aporta evidencia a favor.
- **ACTIVA CON EVIDENCIA NEGATIVA:** el antecedente es negativo y contradice la hipótesis.
- **NO ACTIVA:** el antecedente vale `0`, por lo que no aporta evidencia.

Una regla con evidencia negativa se calcula igualmente, porque su resultado debe reflejar esa contradicción mediante un factor negativo.

## 8. Combinación de CH2

CH2 recibe información de dos reglas: `R2` y `R3`. Por eso no se utiliza una suma, promedio ni máximo. Se usa la combinación acumulativa de factores de certeza.

### Ambos factores positivos

```text
CFcomb = CF1 + CF2 × (1 - CF1)
```

### Ambos factores negativos

```text
CFcomb = CF1 + CF2 × (1 + CF1)
```

### Factores con signos diferentes

```text
CFcomb = (CF1 + CF2) /
         (1 - min(abs(CF1), abs(CF2)))
```

El resultado de esta combinación se limita al intervalo `[-1, 1]` antes de mostrarse.

## 9. Diagnóstico final

El motor calcula los tres diagnósticos y selecciona el que tenga el mayor factor de certeza.

Cada tarjeta de diagnóstico muestra:

- El código de la hipótesis.
- El nombre del posible incidente.
- El factor de certeza calculado.
- Una barra proporcional al valor positivo obtenido.

El bloque **Diagnóstico prioritario** muestra la hipótesis con mayor certeza, su valor decimal y su porcentaje.

Un valor positivo indica apoyo a la hipótesis. Un valor negativo indica evidencia en contra. Si todos los valores son `0`, no existe evidencia suficiente; el sistema conserva el primer diagnóstico en caso de empate.

## 10. Consola de resultados

La consola muestra paso a paso la ejecución del motor:

1. Vector de entrada.
2. Descripción de las evidencias.
3. Operaciones `AND`, `OR` y `NOT`.
4. Estado de activación de cada regla.
5. Cálculo de R1, R2, R3 y R4.
6. Fórmula utilizada para combinar CH2.
7. Explicación del efecto de E3.
8. Valores finales de CH1, CH2 y CH3.
9. Ranking de hipótesis de mayor a menor certeza.
10. Diagnóstico prioritario y conclusión.

La consola muestra sus líneas progresivamente para facilitar la lectura del procedimiento. Si se vuelve a ejecutar el motor antes de terminar la animación, se cancela la ejecución anterior y se muestra únicamente el cálculo nuevo.

## 11. Ejemplo con los valores iniciales

Vector:

```text
[0.85, 0.90, -0.40, 0.70]
```

Resultados de las reglas:

```text
R1 = 0.85 × 0.80 = 0.680
R2 = min(0.90, 0.70) × 0.75 = 0.525
R3 = -0.40 × 0.60 = -0.240
R4 = max(-0.85, 0.40) × 0.50 = 0.200
```

Diagnósticos:

```text
CH1 = 0.680  -> DDoS
CH2 = 0.375  -> Ransomware
CH3 = 0.200  -> Falsa Alarma
```

Como CH1 tiene el valor más alto, el diagnóstico prioritario es **DDoS**.

## 12. Prueba de sensibilidad con E3 positivo

Para comprobar que la página es parametrizable, mantenga los demás valores y cambie:

```text
E3 = 0.60
```

El sistema debe obtener:

```text
R3 = 0.60 × 0.60 = 0.360
R4 = max(-0.85, -0.60) × 0.50 = -0.300
CH2 = 0.525 + 0.360 × (1 - 0.525) = 0.696
```

Resultados esperados:

```text
CH1 = 0.680
CH2 = 0.696
CH3 = -0.300
```

En este escenario, CH2 supera a CH1 y el diagnóstico prioritario cambia a **Ransomware**.

## 13. Validaciones

Antes de ejecutar el motor, la página comprueba que:

- Todos los campos contengan números.
- Todos los valores estén entre `-1` y `1`.

Si algún valor no cumple estas condiciones, aparece un aviso y no se ejecutan los cálculos hasta corregirlo.

## 14. Resumen del flujo interno

```text
Leer E1, E2, E3 y E4
        ↓
Validar valores entre -1 y 1
        ↓
Aplicar AND, OR y NOT
        ↓
Calcular R1, R2, R3 y R4
        ↓
Combinar R2 y R3 para obtener CH2
        ↓
Limitar resultados al intervalo [-1, 1]
        ↓
Comparar CH1, CH2 y CH3
        ↓
Seleccionar el diagnóstico principal
        ↓
Actualizar tarjetas, barras, explicación y consola
```

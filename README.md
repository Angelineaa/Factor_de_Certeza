# Motor de Factores de Certeza

## Manual de usuario


El Motor de Factores de Certeza es una página web desarrollada para representar el funcionamiento de un sistema experto aplicado al análisis de incidentes de ciberseguridad. El sistema recibe cuatro evidencias provenientes de sensores de seguridad, aplica las reglas de inferencia definidas para el caso de estudio y calcula el nivel de certeza asociado a tres posibles hipótesis DDoS, Ransomware y Falsa Alarma. Una de las principales características de la página  es que es parametrizable, ya que permite modificar los valores de las evidencias y ejecutar nuevamente el motor para observar cómo cambian los resultados y el diagnóstico final.
 
El sistema analiza evidencias de un Centro de Operaciones de Seguridad y compara tres posibles hipótesis:

- **CH1 - DDoS:** ataque de denegación de servicio distribuido.
- **CH2 - Ransomware:** intrusión relacionada con secuestro o cifrado malicioso de archivos.
- **CH3 - Falsa Alarma:** tráfico legítimo interpretado como un incidente.


## 1. Evidencias de entrada

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

## 2. Cómo utilizar la página

1. Abra `index.html` en un navegador.
2. Revise los valores iniciales de `E1`, `E2`, `E3` y `E4`.
3. Cambie cualquier valor si desea probar otro escenario.
4. Verifique el vector mostrado debajo de las evidencias.
5. Presione **Ejecutar motor de inferencia**.
6. Revise los resultados de las reglas.
7. Revise las tarjetas de diagnóstico y sus barras de certeza.
8. Consulte la consola para ver el procedimiento completo y la conclusión.

Cuando se modifica una evidencia, el vector se actualiza inmediatamente. Los cálculos completos se ejecutan al presionar el botón.

## 3. Reglas de inferencia

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

Después se propaga el resultado únicamente si ambas evidencias son estrictamente positivas:

```text
R2 = min(E2, E4) × 0.75
```

R2 aporta evidencia a la hipótesis Ransomware.

### Regla R3

```text
SI E3 ENTONCES CH2
Factor de regla: 0.60
```

Cálculo, únicamente cuando `E3 > 0`:

```text
R3 = E3 × 0.60
```

Si `E3 <= 0`, la regla no se activa y su resultado es `R3 = 0`. El valor negativo de E3 se conserva como evidencia en contra, pero no se propaga como una regla activa.

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

Después se aplica `OR`. La regla solo se activa si el resultado de `OR` es positivo:

```text
R4 = max(NOT E1, NOT E3) × 0.50
```

R4 aporta evidencia a la hipótesis Falsa Alarma.

## 4. Operadores lógicos

Los operadores se calculan realmente en JavaScript.

### AND

El operador `AND` requiere que todas las evidencias sean positivas. Una vez cumplida esta condición  toma el menor valor:

```text
AND(A, B) = min(A, B)
```

Si alguna evidencia es 0 o negativa, la regla no se activa.


### OR

El operador `OR` permite activar una regla cuando al menos una de las condiciones es positiva, toma el mayor valor:

```text
OR(A, B) = max(A, B)
```

Esto representa que basta con que una de las opciones tenga mayor evidencia. Si todas las condiciones son 0 o negativas, la regla no se activa.


### NOT

`NOT` cambia el signo:

```text
NOT(A) = -A
```

Una evidencia positiva se convierte en negativa y una negativa se convierte en positiva.

## 5. Estado de activación de las reglas

La página explica el estado de cada regla tanto en la sección de reglas como en la consola.

- **ACTIVA:** el antecedente es positivo y aporta evidencia a favor.
- **NO ACTIVA:** el antecedente es `0` o negativo, por lo que no aporta evidencia positiva.
- **EVIDENCIA NEGATIVA:** la interfaz puede mostrar el valor negativo de una evidencia para indicar que existe información en contra, pero este valor no implica que una regla positiva esté activa.


Una evidencia negativa se conserva para la explicación y para evaluar `NOT`, pero no activa directamente una regla positiva.

## 6. Combinación de CH2

CH2 recibe información de dos reglas: `R2` y `R3`. Por eso no se utiliza una suma, promedio ni máximo. Se usa la combinación acumulativa de factores de certeza.

### Producto entre dos factores positivo

```text
Ccomb = C1 + C2 - (C1 * C2)

```

### Producto negativo

```text
Ccomb = (C1 + C2) / (1 - min(|C1|, |C2|))
```

Las reglas no activas aportan `0` a CH2. Por tanto, solo se combinan los aportes positivos de las reglas activas. El resultado se limita al intervalo `[-1, 1]` antes de mostrarse.

## 7. Diagnóstico final

El motor calcula los tres diagnósticos y selecciona el que tenga el mayor factor de certeza.

Cada tarjeta de diagnóstico muestra:

- El código de la hipótesis.
- El nombre del posible incidente.
- El factor de certeza calculado.
- Una barra proporcional al valor positivo obtenido.

El bloque **Diagnóstico prioritario** muestra la hipótesis con mayor certeza, su valor decimal y su porcentaje.

Un valor positivo indica apoyo a la hipótesis. Un valor negativo indica evidencia en contra. Si todos los valores son `0`, no existe evidencia suficiente; el sistema conserva el primer diagnóstico en caso de empate.

## 8. Consola de resultados

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

/* =========================================================
   MOTOR DE FACTORES DE CERTEZA
   CASO 2 - SISTEMA EXPERTO IDS
========================================================= */


/* =========================================================
   FUNCIONES LOGICAS
========================================================= */

// Estas funciones implementan los operadores lógicos usados por el sistema
// experto. Trabajan directamente con factores de certeza entre -1 y 1.

// AND
// Para factores de certeza se utiliza el mínimo.
function AND(...valores) {

    // Devuelve el menor valor, que representa la certeza conjunta de un AND.
    return Math.min(...valores);

}


// OR
// Para factores de certeza se utiliza el máximo.
function OR(...valores) {

    // Devuelve el mayor valor, que representa la certeza de al menos una opción.
    return Math.max(...valores);

}


// NOT
// Cambia el signo del factor de certeza.
function NOT(valor) {

    // Invierte la evidencia: una certeza positiva pasa a ser negativa y viceversa.
    return -valor;

}


/* =========================================================
   PROPAGACION DE FACTOR DE CERTEZA
========================================================= */

function propagar(antecedente, factorRegla) {

    // Aplica el peso de la regla al factor de certeza del antecedente.
    return antecedente * factorRegla;

}


/* =========================================================
   COMBINACION DE FACTORES DE CERTEZA
========================================================= */

function combinarCF(cf1, cf2) {

    // Combina dos evidencias que apoyan o contradicen la misma hipótesis.
    // La fórmula cambia según el signo de cada factor recibido.

    // Ambos positivos
    if (cf1 >= 0 && cf2 >= 0) {

        // Suma el apoyo de ambas evidencias sin superar el valor máximo 1.
        return cf1 + cf2 * (1 - cf1);

    }


    // Ambos negativos
    if (cf1 < 0 && cf2 < 0) {

        // Acumula dos evidencias que contradicen la hipótesis.
        return cf1 + cf2 * (1 + cf1);

    }


    // Signos diferentes: una evidencia apoya y la otra contradice.
    // En este caso se compensa la evidencia positiva con la negativa.
    const denominador =
        1 - Math.min(
            Math.abs(cf1),
            Math.abs(cf2)
        );

    // Evita una división indefinida cuando una evidencia extrema vale 1 o -1.
    if (denominador === 0) {

        return limitar(cf1 + cf2);

    }

    return (
        cf1 + cf2
    ) / denominador;

}


/* =========================================================
   LIMITAR VALORES
========================================================= */

function limitar(valor) {

    // Mantiene cualquier resultado dentro del rango permitido [-1, 1].
    return Math.max(-1, Math.min(1, valor));

}


/* =========================================================
   ESTADO DE ACTIVACION DE UNA REGLA
========================================================= */

function estadoRegla(antecedente) {

    // Clasifica el antecedente para explicarle al usuario cómo se comporta
    // la regla: positivo apoya, negativo contradice y cero no aporta evidencia.
    if (antecedente > 0) {

        return "ACTIVA: el antecedente aporta evidencia a favor.";

    }

    if (antecedente < 0) {

        return "ACTIVA CON EVIDENCIA NEGATIVA: el antecedente contradice la hipótesis.";

    }

    return "NO ACTIVA: el antecedente tiene factor de certeza 0.";

}


/* =========================================================
   MOTOR PRINCIPAL
========================================================= */

function motorFactoresCerteza(evidencias) {

    /*
        Vector esperado:

        evidencias = [
            E1,
            E2,
            E3,
            E4
        ]
    */

    // Separa el vector recibido en las cuatro evidencias utilizadas por las reglas.
    // E1, E2, E3 y E4 conservan el mismo orden del vector de entrada.
    const [E1, E2, E3, E4] = evidencias;


    /* =====================================================
       REGLA 1

       E1 -> CH1
       Factor de regla = 0.80
    ====================================================== */

    // Propaga E1 hacia CH1: el valor de E1 se multiplica por el peso 0.80.
    const R1 = propagar(E1, 0.80);


    /* =====================================================
       REGLA 2

       E2 AND E4 -> CH2
       Factor de regla = 0.75
    ====================================================== */

    // Para un AND se toma la evidencia más débil entre E2 y E4.
    const antecedenteR2 = AND(E2, E4);

    // Propaga el antecedente combinado hacia CH2 con el peso de R2.
    const R2 = propagar(
        antecedenteR2,
        0.75
    );


    /* =====================================================
       REGLA 3

       E3 -> CH2
       Factor de regla = 0.60
    ====================================================== */

    // Propaga E3 hacia CH2. Si E3 es negativo, R3 también será negativo.
    const R3 = propagar(
        E3,
        0.60
    );


    /* =====================================================
       REGLA 4

       NOT E1 OR NOT E3 -> CH3
       Factor de regla = 0.50
    ====================================================== */

    // Invierte E1 y E3 para evaluar la regla de falsa alarma.
    const notE1 = NOT(E1);

    const notE3 = NOT(E3);

    // OR selecciona la mayor de las dos evidencias negadas.
    const antecedenteR4 = OR(
        notE1,
        notE3
    );

    // Propaga el antecedente de R4 hacia la hipótesis de falsa alarma.
    const R4 = propagar(
        antecedenteR4,
        0.50
    );


    /* =====================================================
       CONCURRENCIA CH2

       R2 y R3 llegan a la misma hipotesis.

       Se utiliza la ecuacion acumulativa.
    ====================================================== */

    // Acumula los aportes de R2 y R3 sobre la hipótesis CH2.
    const CH2 = limitar(combinarCF(
        R2,
        R3
    ));


    /* =====================================================
       HIPOTESIS FINALES
    ====================================================== */

    // Limita los resultados de las hipótesis antes de mostrarlos.
    // CH1 y CH3 provienen de una sola regla; CH2 ya fue combinado arriba.
    const CH1 = limitar(R1);

    const CH3 = limitar(R4);


    /* =====================================================
       DETERMINAR DIAGNOSTICO PRINCIPAL
    ====================================================== */

    // Agrupa cada hipótesis con su código, nombre y factor de certeza.
    // CH1 representa DDoS, CH2 representa Ransomware y CH3 una falsa alarma.
    const diagnosticos = [

        {
            codigo: "CH1",
            nombre: "DDoS",
            cf: CH1
        },

        {
            codigo: "CH2",
            nombre: "Ransomware",
            cf: CH2
        },

        {
            codigo: "CH3",
            nombre: "Falsa Alarma",
            cf: CH3
        }

    ];


    // Selecciona como diagnóstico principal la hipótesis con mayor certeza.
    const principal = diagnosticos.reduce(
        (mayor, actual) =>
            actual.cf > mayor.cf
                ? actual
                : mayor
    );


    // Devuelve todos los datos necesarios para actualizar la interfaz y la consola.
    // También conserva los antecedentes intermedios para poder explicar cada cálculo.
    return {

        evidencias,

        reglas: {

            R1,
            R2,
            R3,
            R4

        },

        operaciones: {

            antecedenteR2,
            notE1,
            notE3,
            antecedenteR4,
            antecedenteR1: E1,
            antecedenteR3: E3

        },

        diagnosticos,

        principal

    };

}


/* =========================================================
   OBTENER VECTOR DESDE LA INTERFAZ
========================================================= */

function obtenerVector() {

    // Lee los valores introducidos en los campos numéricos de la interfaz.
    // parseFloat convierte el texto de cada input en un número decimal.
    const E1 = parseFloat(
        document.getElementById("e1").value
    );

    const E2 = parseFloat(
        document.getElementById("e2").value
    );

    const E3 = parseFloat(
        document.getElementById("e3").value
    );

    const E4 = parseFloat(
        document.getElementById("e4").value
    );


    // Devuelve el vector en el orden requerido por el motor de inferencia.
    return [
        E1,
        E2,
        E3,
        E4
    ];

}


/* =========================================================
   FORMATO
========================================================= */

function formato(valor) {

    // Convierte un factor de certeza a texto con tres decimales.
    // Esto evita mostrar demasiados decimales en la interfaz.
    return Number(valor).toFixed(3);

}


/* =========================================================
   ACTUALIZAR VECTOR EN PANTALLA
========================================================= */

function actualizarVector(vector) {

    // Refleja en pantalla el vector actual con dos decimales por evidencia.
    // textContent actualiza solo el texto del elemento <code id="vector">.
    document.getElementById("vector").textContent =

        `[${vector.map(valor => valor.toFixed(2)).join(", ")}]`;

}


/* =========================================================
   ACTUALIZAR REGLAS
========================================================= */

function actualizarReglas(resultado) {

    // Muestra en la sección de reglas los resultados calculados por el motor.
    // Cada identificador r1-r4 corresponde al resultado de una regla en HTML.
    document.getElementById("r1").textContent =
        formato(resultado.reglas.R1);

    document.getElementById("r2").textContent =
        formato(resultado.reglas.R2);

    document.getElementById("r3").textContent =
        formato(resultado.reglas.R3);

    document.getElementById("r4").textContent =
        formato(resultado.reglas.R4);

    // Explica el antecedente, su estado y la operación de propagación de cada regla.
    // Estas descripciones se generan con los valores actuales, no son textos fijos.
    const OP = resultado.operaciones;

    document.getElementById("r1Explanation").textContent =
        `${estadoRegla(OP.antecedenteR1)} ${formato(OP.antecedenteR1)} × 0.80 = ${formato(resultado.reglas.R1)} para DDoS.`;

    document.getElementById("r2Explanation").textContent =
        `${estadoRegla(OP.antecedenteR2)} min(E2,E4) = ${formato(OP.antecedenteR2)}; ${formato(OP.antecedenteR2)} × 0.75 = ${formato(resultado.reglas.R2)} para Ransomware.`;

    document.getElementById("r3Explanation").textContent =
        `${estadoRegla(OP.antecedenteR3)} ${formato(OP.antecedenteR3)} × 0.60 = ${formato(resultado.reglas.R3)} para Ransomware.`;

    document.getElementById("r4Explanation").textContent =
        `${estadoRegla(OP.antecedenteR4)} max(NOT E1,NOT E3) = ${formato(OP.antecedenteR4)}; × 0.50 = ${formato(resultado.reglas.R4)} para Falsa Alarma.`;

}


/* =========================================================
   ANIMAR BARRAS
========================================================= */

function actualizarDiagnosticos(resultado) {

    // Actualiza el valor y el ancho de la barra de cada hipótesis.
    // El porcentaje se limita a 0-100 para que la barra no desborde su contenedor.
    resultado.diagnosticos.forEach(diagnostico => {

        const porcentaje =
            Math.max(0, Math.min(100, diagnostico.cf * 100));


        // Actualiza la tarjeta de CH1 cuando el recorrido encuentra ese código.
        if (diagnostico.codigo === "CH1") {

            document.getElementById("ch1Value")
                .textContent = formato(diagnostico.cf);

            document.getElementById("ch1Bar")
                .style.width = `${porcentaje}%`;

        }


        // Actualiza la tarjeta de CH2, cuyo valor combina R2 y R3.
        if (diagnostico.codigo === "CH2") {

            document.getElementById("ch2Value")
                .textContent = formato(diagnostico.cf);

            document.getElementById("ch2Bar")
                .style.width = `${porcentaje}%`;

        }


        // Actualiza la tarjeta de CH3, calculada a partir de R4.
        if (diagnostico.codigo === "CH3") {

            document.getElementById("ch3Value")
                .textContent = formato(diagnostico.cf);

            document.getElementById("ch3Bar")
                .style.width = `${porcentaje}%`;

        }

    });


    // Actualiza el bloque destacado con el diagnóstico de mayor certeza.
    // principal fue seleccionado anteriormente mediante reduce().
    const principal =
        resultado.principal;


    document.getElementById("diagnosisText")
        .textContent = principal.nombre;


    document.getElementById("finalValue")
        .textContent = formato(principal.cf);


    document.getElementById("diagnosisDescription")
        .textContent =

        `${principal.codigo} representa ${principal.nombre} y obtiene el mayor factor de certeza: ${formato(principal.cf)} (${(principal.cf * 100).toFixed(1)}%). Esto significa que, al comparar todas las hipótesis, ${principal.nombre} es la explicación con mayor respaldo según las evidencias ingresadas y, por tanto, es el diagnóstico prioritario del sistema.`;

}


/* =========================================================
   CONSOLA DINAMICA
========================================================= */

// Guarda las animaciones activas para poder cancelarlas en una nueva ejecución.
let temporizadoresConsola = [];

function escribirConsola(resultado) {

    // Obtiene el elemento donde se imprimirá el registro de ejecución.
    const consola =
        document.getElementById("consoleOutput");


    // Se extraen los grupos de datos para construir el registro paso a paso.
    const E =
        resultado.evidencias;

    const R =
        resultado.reglas;

    const OP =
        resultado.operaciones;

    const principal =
        resultado.principal;


    // Cancela cualquier salida pendiente de una ejecución anterior.
    // Así, dos ejecuciones rápidas no mezclan sus explicaciones.
    temporizadoresConsola.forEach(temporizador => clearTimeout(temporizador));
    temporizadoresConsola = [];

    // Limpia el registro anterior antes de mostrar el nuevo resultado.
    consola.innerHTML = "";


    // Prepara las operaciones y resultados que aparecerán progresivamente.
    // Cada elemento tiene: etiqueta, explicación/valor y clase visual opcional.
    // Ordena una copia para conservar el orden original de las tarjetas.
    // El ranking se muestra de mayor a menor factor de certeza.
    const ranking = [...resultado.diagnosticos]
        .sort((a, b) => b.cf - a.cf);

    // Selecciona la fórmula acumulativa correcta según los signos de R2 y R3.
    const formulaCombinacion = R.R2 >= 0 && R.R3 >= 0
        ? `${R.R2.toFixed(3)} + ${R.R3.toFixed(3)} × (1 - ${R.R2.toFixed(3)})`
        : R.R2 < 0 && R.R3 < 0
            ? `${R.R2.toFixed(3)} + ${R.R3.toFixed(3)} × (1 + ${R.R2.toFixed(3)})`
            : `(${R.R2.toFixed(3)} + ${R.R3.toFixed(3)}) / (1 - min(${Math.abs(R.R2).toFixed(3)}, ${Math.abs(R.R3).toFixed(3)}))`;

    const lineas = [

        [
            "VECTOR DE ENTRADA",
            `[${E.map(v => v.toFixed(2)).join(", ")}]`,
            "highlight"
        ],

        [
            "E1:",
            `${E[0].toFixed(2)} | Evidencia de pico de ancho de banda.`,
            ""
        ],

        [
            "E2:",
            `${E[1].toFixed(2)} | Intentos fallidos masivos de SSH.`,
            ""
        ],

        [
            "E3:",
            `${E[2].toFixed(2)} | ${E[2] < 0 ? "Evidencia en contra de amenazas." : "Evidencia a favor de amenazas."}`,
            E[2] < 0 ? "warning" : "success"
        ],

        [
            "E4:",
            `${E[3].toFixed(2)} | Modificaciones en firmas SHA-256.`,
            ""
        ],

        [
            "OPERACIONES LOGICAS",
            "AND, OR y NOT aplicados al vector de entrada.",
            "highlight"
        ],

        [
            "AND(E2,E4):",
            `min(${E[1].toFixed(2)}, ${E[3].toFixed(2)}) = ${OP.antecedenteR2.toFixed(3)}`,
            ""
        ],

        [
            "NOT(E1):",
            `-${E[0].toFixed(2)} = ${OP.notE1.toFixed(3)}`,
            ""
        ],

        [
            "NOT(E3):",
            `NOT(${E[2].toFixed(2)}) = ${OP.notE3.toFixed(3)}`,
            ""
        ],

        [
            "REGLAS",
            "Propagacion de factores de certeza.",
            "highlight"
        ],

        [
            "R1 = E1 × 0.80:",
            `${estadoRegla(OP.antecedenteR1)} ${E[0].toFixed(2)} × 0.80 = ${R.R1.toFixed(3)} para DDoS.`,
            "success"
        ],

        [
            "R2 = AND(E2,E4) × 0.75:",
            `${estadoRegla(OP.antecedenteR2)} ${OP.antecedenteR2.toFixed(3)} × 0.75 = ${R.R2.toFixed(3)} para Ransomware.`,
            "success"
        ],

        [
            "R3 = E3 × 0.60:",
            `${estadoRegla(OP.antecedenteR3)} ${E[2].toFixed(2)} × 0.60 = ${R.R3.toFixed(3)} para Ransomware.`,
            R.R3 < 0 ? "warning" : "success"
        ],

        [
            "R4 = OR(NOT E1,NOT E3) × 0.50:",
            `${estadoRegla(OP.antecedenteR4)} max(${OP.notE1.toFixed(3)}, ${OP.notE3.toFixed(3)}) = ${OP.antecedenteR4.toFixed(3)}; R4 = ${R.R4.toFixed(3)} para Falsa Alarma.`,
            "success"
        ],

        [
            "COMBINACION CH2",
            "CH2 recibe R2 y R3 mediante la ecuacion acumulativa.",
            "highlight"
        ],

        [
            "CH2 = combinar(R2,R3):",
            `${R.R2.toFixed(3)} y ${R.R3.toFixed(3)}; ${formulaCombinacion} = ${resultado.diagnosticos[1].cf.toFixed(3)} (${R.R2 * R.R3 < 0 ? "signos diferentes" : "mismo signo"}).`,
            "success"
        ],

        [
            "EXPLICACION",
            `${E[2] < 0 ? "E3 aporta evidencia negativa a R3 y NOT(E3) es positiva" : E[2] > 0 ? "E3 aporta evidencia positiva a R3 y NOT(E3) es negativa" : "E3 no aporta evidencia; por eso R3 y NOT(E3) valen 0"}.`,
            ""
        ],

        [
            "DIAGNOSTICOS",
            `CH1 = ${resultado.diagnosticos[0].cf.toFixed(3)} | CH2 = ${resultado.diagnosticos[1].cf.toFixed(3)} | CH3 = ${resultado.diagnosticos[2].cf.toFixed(3)}`,
            "highlight"
        ],

        [
            "RANKING 1:",
            `${ranking[0].codigo} - ${ranking[0].nombre} = ${ranking[0].cf.toFixed(3)}`,
            ""
        ],

        [
            "RANKING 2:",
            `${ranking[1].codigo} - ${ranking[1].nombre} = ${ranking[1].cf.toFixed(3)}`,
            ""
        ],

        [
            "RANKING 3:",
            `${ranking[2].codigo} - ${ranking[2].nombre} = ${ranking[2].cf.toFixed(3)}`,
            ""
        ],

        [
            "DIAGNÓSTICO PRINCIPAL:",
            `${principal.codigo} - ${principal.nombre}`,
            "highlight"
        ],

        [
            "FACTOR DE CERTEZA FINAL:",
            `${principal.cf.toFixed(3)}`,
            "highlight"
        ],

        [
            "CONCLUSION:",
            `La hipótesis con mayor certeza es ${principal.codigo} (${principal.nombre}) con ${principal.cf.toFixed(3)}.`,
            "highlight"
        ]

    ];


    // Agrega cada línea con un pequeño retraso para simular una consola activa.
    lineas.forEach((linea, index) => {

        // Cada temporizador imprime una línea en el orden definido arriba.
        const temporizador = setTimeout(() => {

            // Crea el contenedor visual de una línea de la consola.
            const div =
                document.createElement("div");

            div.className = "console-line";


            // Crea el símbolo que aparece al inicio de cada línea.
            const simbolo =
                document.createElement("span");

            simbolo.className =
                "console-symbol";

            simbolo.textContent = "›";


            // Crea el texto con la operación, el estado y el resultado.
            const texto =
                document.createElement("span");

            texto.textContent =
                `${linea[0]} ${linea[1]}`;


            // Aplica estilos como success, warning o highlight cuando existen.
            if (linea[2]) {

                texto.classList.add(
                    `console-${linea[2]}`
                );

            }


            // Une símbolo y texto a la línea, y luego la agrega a la consola.
            div.appendChild(simbolo);

            div.appendChild(texto);

            consola.appendChild(div);


        }, index * 100);

        temporizadoresConsola.push(temporizador);

    });

}


/* =========================================================
   EJECUTAR MOTOR
========================================================= */

function ejecutarMotor() {

    // Obtiene las evidencias actuales y comprueba que sean números válidos.
    // Esta función coordina todo el flujo: leer, validar, calcular y mostrar.
    const vector =
        obtenerVector();


    /* Validación: todos los factores deben estar dentro del intervalo [-1, 1]. */

    const valido =
        vector.every(
            valor =>
                !isNaN(valor) &&
                valor >= -1 &&
                valor <= 1
        );


    if (!valido) {

        // Detiene el proceso para evitar cálculos con datos vacíos o fuera de rango.
        alert(
            "Todos los factores de certeza deben estar entre -1 y 1."
        );

        return;

    }


    /* Ejecutar motor: calcula reglas, hipótesis y diagnóstico principal. */

    const resultado =
        motorFactoresCerteza(vector);


    /* Actualizar interfaz con los nuevos valores calculados. */
    // Cada función actualiza una parte distinta de la página.

    actualizarVector(vector);

    actualizarReglas(resultado);

    actualizarDiagnosticos(resultado);

    escribirConsola(resultado);

}


/* =========================================================
   EVENTO DEL BOTON
========================================================= */

document
    // Ejecuta el motor cuando el usuario pulsa el botón principal.
    .getElementById("runButton")
    .addEventListener(
        "click",
        ejecutarMotor
    );


/* =========================================================
   ACTUALIZAR VECTOR EN TIEMPO REAL
========================================================= */

[
    "e1",
    "e2",
    "e3",
    "e4"

].forEach(id => {

    // Actualiza el vector visible cada vez que cambia una evidencia.
    // El cálculo completo se reserva para el botón Ejecutar motor.
    document
        .getElementById(id)
        .addEventListener(
            "input",
            () => {

                const vector =
                    obtenerVector();

                actualizarVector(vector);

            }
        );

});


/* =========================================================
   EJECUCION INICIAL
========================================================= */

window.addEventListener(
    // Calcula y muestra los valores iniciales al cargar la página.
    // Esto evita que la interfaz aparezca con resultados sin procesar.
    "DOMContentLoaded",
    ejecutarMotor
);
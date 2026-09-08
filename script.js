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

    // Ambos aportes son positivos o cero. Un cero representa una regla no activa
    // y funciona como aporte neutro para no alterar el otro factor.
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

    // Una regla positiva solo puede activarse cuando su antecedente es estrictamente mayor que cero.
    if (antecedente > 0) {

        return "ACTIVA: el antecedente aporta evidencia a favor.";

    }

    if (antecedente < 0) {

        return "NO ACTIVA: el antecedente es negativo y no aporta evidencia positiva.";

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

    // R1 solo se activa cuando E1 aporta evidencia positiva.
    const activaR1 = E1 > 0;
    const R1 = activaR1 ? propagar(E1, 0.80) : 0;


    /* =====================================================
       REGLA 2

       E2 AND E4 -> CH2
       Factor de regla = 0.75
    ====================================================== */

    // AND requiere que todas sus evidencias sean estrictamente positivas.
    const activaR2 = E2 > 0 && E4 > 0;
    const antecedenteR2 = AND(E2, E4);

    // Solo se propaga el mínimo cuando ambas condiciones del AND están activas.
    const R2 = activaR2 ? propagar(antecedenteR2, 0.75) : 0;


    /* =====================================================
       REGLA 3

       E3 -> CH2
       Factor de regla = 0.60
    ====================================================== */

    // E3 negativo representa evidencia en contra, pero no activa esta regla positiva.
    // Por eso se conserva E3 para explicarlo, pero R3 recibe cero cuando E3 <= 0.
    const activaR3 = E3 > 0;
    const R3 = activaR3 ? propagar(E3, 0.60) : 0;


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

    // El criterio se revisa después de aplicar NOT: al menos uno debe ser > 0.
    // Si ambos valores son cero o negativos, R4 no se activa y aporta cero.
    const activaR4 = antecedenteR4 > 0;
    const R4 = activaR4 ? propagar(antecedenteR4, 0.50) : 0;


    /* =====================================================
       CONCURRENCIA CH2

       R2 y R3 llegan a la misma hipotesis.

       Se utiliza la ecuacion acumulativa.
    ====================================================== */

    // Acumula los aportes de R2 y R3 sobre la hipótesis CH2.
    // Las reglas no activas llegan como cero y no se interpretan como evidencia negativa.
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

            // Se devuelven los valores intermedios para explicar las fórmulas en la interfaz.
            antecedenteR2,
            notE1,
            notE3,
            antecedenteR4,
            antecedenteR1: E1,
            antecedenteR3: E3,
            activaR1,
            activaR2,
            activaR3,
            activaR4

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
        `${OP.activaR2 ? "ACTIVA: E2 y E4 son estrictamente positivas." : "NO ACTIVA: AND requiere que E2 y E4 sean estrictamente positivas."} min(E2,E4) = ${formato(OP.antecedenteR2)}; resultado R2 = ${formato(resultado.reglas.R2)} para Ransomware.`;

    document.getElementById("r3Explanation").textContent =
        `${OP.activaR3 ? "ACTIVA: E3 es positiva." : `NO ACTIVA: E3 = ${formato(OP.antecedenteR3)} no aporta evidencia positiva.`} ${OP.activaR3 ? `${formato(OP.antecedenteR3)} × 0.60 = ${formato(resultado.reglas.R3)}` : "resultado R3 = 0"} para Ransomware.`;

    document.getElementById("r4Explanation").textContent =
        `${OP.activaR4 ? "ACTIVA: al menos una condición después de NOT es positiva." : "NO ACTIVA: ninguna condición después de NOT es positiva."} max(NOT E1,NOT E3) = ${formato(OP.antecedenteR4)}; resultado R4 = ${formato(resultado.reglas.R4)} para Falsa Alarma.`;

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
            `${E[2].toFixed(2)} | ${E[2] < 0 ? "Evidencia en contra de amenazas." : E[2] > 0 ? "Evidencia a favor de amenazas." : "Ausencia de evidencia."}`,
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
            `${OP.activaR2 ? "ACTIVA: ambas evidencias son positivas." : "NO ACTIVA: todas las condiciones del AND deben ser positivas."} min(${E[1].toFixed(2)}, ${E[3].toFixed(2)}) = ${OP.antecedenteR2.toFixed(3)}; R2 = ${R.R2.toFixed(3)} para Ransomware.`,
            "success"
        ],

        [
            "R3 = E3 × 0.60:",
            `${OP.activaR3 ? "ACTIVA: E3 es positiva." : `NO ACTIVA: E3 = ${E[2].toFixed(2)} es cero o negativa; se toma R3 = 0.`} ${OP.activaR3 ? `${E[2].toFixed(2)} × 0.60 = ${R.R3.toFixed(3)}` : ""} para Ransomware.`,
            OP.activaR3 ? "success" : "warning"
        ],

        [
            "R4 = OR(NOT E1,NOT E3) × 0.50:",
            `${OP.activaR4 ? "ACTIVA: al menos una condición después de NOT es positiva." : "NO ACTIVA: las dos condiciones después de NOT son cero o negativas."} max(${OP.notE1.toFixed(3)}, ${OP.notE3.toFixed(3)}) = ${OP.antecedenteR4.toFixed(3)}; R4 = ${R.R4.toFixed(3)} para Falsa Alarma.`,
            OP.activaR4 ? "success" : "warning"
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
            `${E[2] < 0 ? "E3 es evidencia negativa: no activa R3, aunque NOT(E3) puede activar R4" : E[2] > 0 ? "E3 es evidencia positiva: activa R3, mientras NOT(E3) es negativa" : "E3 no aporta evidencia; R3 no se activa y NOT(E3) vale 0"}.`,
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
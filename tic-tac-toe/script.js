document.addEventListener('DOMContentLoaded', () => {
    // ==========================================
    // 1. ESTADO GLOBAL (Matriz 3x3 como en C)
    // ==========================================
    let tablero = [
        [' ', ' ', ' '],
        [' ', ' ', ' '],
        [' ', ' ', ' ']
    ];

    let jugadorActual = 'X';
    let turno = 1;
    let juegoTerminado = 0;

    const scores = { jugador1: 0, empates: 0, jugador2: 0 };

    // Elementos del DOM
    const cells = document.querySelectorAll('.cell');
    const statusMessage = document.getElementById('statusMessage');
    const difficultySelect = document.getElementById('difficulty');
    const resetBtn = document.getElementById('resetBtn');

    const playerScoreEl = document.getElementById('playerScore');
    const tiesScoreEl = document.getElementById('tiesScore');
    const cpuScoreEl = document.getElementById('cpuScore');

    // ==========================================
    // 2. MÓDULO DE AUDIO (EFECTOS DE SONIDO)
    // ==========================================
    const SoundFX = {
        ctx: null,
        init() {
            if (!this.ctx) this.ctx = new (window.AudioContext || window.webkitAudioContext)();
        },
        playMove(simbolo) {
            this.init();
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.connect(gain);
            gain.connect(this.ctx.destination);
            osc.frequency.setValueAtTime(simbolo === 'X' ? 587.33 : 440, this.ctx.currentTime);
            gain.gain.setValueAtTime(0.15, this.ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.15);
            osc.start();
            osc.stop(this.ctx.currentTime + 0.15);
        },
        playWin() {
            this.init();
            [523.25, 659.25, 783.99, 1046.50].forEach((freq, idx) => {
                const osc = this.ctx.createOscillator();
                const gain = this.ctx.createGain();
                osc.connect(gain);
                gain.connect(this.ctx.destination);
                osc.frequency.setValueAtTime(freq, this.ctx.currentTime + idx * 0.1);
                gain.gain.setValueAtTime(0.2, this.ctx.currentTime + idx * 0.1);
                gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + idx * 0.1 + 0.25);
                osc.start(this.ctx.currentTime + idx * 0.1);
                osc.stop(this.ctx.currentTime + idx * 0.1 + 0.25);
            });
        },
        playLose() {
            this.init();
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.connect(gain);
            gain.connect(this.ctx.destination);
            osc.frequency.setValueAtTime(220, this.ctx.currentTime);
            osc.frequency.exponentialRampToValueAtTime(110, this.ctx.currentTime + 0.4);
            gain.gain.setValueAtTime(0.15, this.ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.4);
            osc.start();
            osc.stop(this.ctx.currentTime + 0.4);
        }
    };

    // ==========================================
    // 3. FUNCIONES TRADUCIDAS DIRECTO DE C
    // ==========================================

    /* Equivalente a: void inicializarTablero(void) */
    function inicializarTablero() {
        for (let fila = 0; fila < 3; fila++) {
            for (let columna = 0; columna < 3; columna++) {
                tablero[fila][columna] = ' ';
            }
        }
        jugadorActual = 'X';
        turno = 1;
        juegoTerminado = 0;
        mostrarTablero();
    }

    /* Equivalente a: void mostrarTablero(void) */
    function mostrarTablero() {
        cells.forEach(cell => {
            const index = parseInt(cell.getAttribute('data-index'));
            const fila = Math.floor(index / 3);
            const columna = index % 3;
            const simbolo = tablero[fila][columna];

            cell.textContent = simbolo !== ' ' ? simbolo : '';
            cell.className = 'cell';
            if (simbolo !== ' ') {
                cell.classList.add('taken', simbolo.toLowerCase());
            }
        });

        if (!juegoTerminado) {
            statusMessage.innerHTML = `Turno del jugador ${turno} (<span id="currentTurn">${jugadorActual}</span>)`;
        }
    }

    /* Equivalente a: int realizarJugada(char simbolo) */
    function realizarJugada(fila, columna, simbolo) {
        if (fila < 0 || fila > 2 || columna < 0 || columna > 2) {
            return 0; // Posición fuera de rango
        }

        if (tablero[fila][columna] !== ' ') {
            return 0; // Posición ocupada
        }

        tablero[fila][columna] = simbolo;
        SoundFX.playMove(simbolo);
        return 1;
    }

    /* Equivalente a: int hayGanador(char simbolo) */
    function hayGanador(simbolo) {
        // Revisar filas y columnas
        for (let i = 0; i < 3; i++) {
            if (tablero[i][0] === simbolo && tablero[i][1] === simbolo && tablero[i][2] === simbolo) {
                resaltarLineaGanadora([[i,0], [i,1], [i,2]]);
                return 1;
            }
            if (tablero[0][i] === simbolo && tablero[1][i] === simbolo && tablero[2][i] === simbolo) {
                resaltarLineaGanadora([[0,i], [1,i], [2,i]]);
                return 1;
            }
        }

        // Revisar diagonal principal
        if (tablero[0][0] === simbolo && tablero[1][1] === simbolo && tablero[2][2] === simbolo) {
            resaltarLineaGanadora([[0,0], [1,1], [2,2]]);
            return 1;
        }

        // Revisar diagonal secundaria
        if (tablero[0][2] === simbolo && tablero[1][1] === simbolo && tablero[2][0] === simbolo) {
            resaltarLineaGanadora([[0,2], [1,1], [2,0]]);
            return 1;
        }

        return 0;
    }

    /* Equivalente a: int tableroLleno(void) */
    function tableroLleno() {
        for (let fila = 0; fila < 3; fila++) {
            for (let columna = 0; columna < 3; columna++) {
                if (tablero[fila][columna] === ' ') {
                    return 0;
                }
            }
        }
        return 1;
    }

    // ==========================================
    // 4. BUCLE DE JUEGO E INTERACCIÓN
    // ==========================================

    function resaltarLineaGanadora(coordenadas) {
        coordenadas.forEach(([f, c]) => {
            const index = f * 3 + c;
            cells[index].classList.add('winner');
        });
    }

    function procesarTurno(fila, columna) {
        if (juegoTerminado) return;

        if (realizarJugada(fila, columna, jugadorActual)) {
            if (hayGanador(jugadorActual)) {
                mostrarTablero();
                statusMessage.innerHTML = `🎉 El jugador ${turno} (${jugadorActual}) gana.`;
                juegoTerminado = 1;

                if (jugadorActual === 'X') {
                    scores.jugador1++;
                    playerScoreEl.textContent = scores.jugador1;
                    SoundFX.playWin();
                } else {
                    scores.jugador2++;
                    cpuScoreEl.textContent = scores.jugador2;
                    SoundFX.playLose();
                }
            } 
            else if (tableroLleno()) {
                mostrarTablero();
                statusMessage.innerHTML = '🤝 Empate: el tablero está lleno.';
                juegoTerminado = 1;
                scores.empates++;
                tiesScoreEl.textContent = scores.empates;
                SoundFX.playLose();
            } 
            else {
                // Cambio de turno (idéntico al 'else' en C)
                if (jugadorActual === 'X') {
                    jugadorActual = 'O';
                    turno = 2;
                } else {
                    jugadorActual = 'X';
                    turno = 1;
                }

                mostrarTablero();

                // Si es el turno de la Máquina (Jugador 2)
                if (jugadorActual === 'O' && !juegoTerminado) {
                    setTimeout(hacerJugadaMaquina, 400);
                }
            }
        }
    }

    function hacerJugadaMaquina() {
        if (juegoTerminado) return;

        const dificultad = difficultySelect.value;
        let jugada;

        if (dificultad === 'easy') {
            jugada = obtenerJugadaAleatoria();
        } else {
            jugada = obtenerMejorJugadaMinimax();
        }

        if (jugada) {
            procesarTurno(jugada.fila, jugada.columna);
        }
    }

    function obtenerJugadaAleatoria() {
        let vacias = [];
        for (let f = 0; f < 3; f++) {
            for (let c = 0; c < 3; c++) {
                if (tablero[f][c] === ' ') vacias.push({ fila: f, columna: c });
            }
        }
        return vacias.length > 0 ? vacias[Math.floor(Math.random() * vacias.length)] : null;
    }

    function obtenerMejorJugadaMinimax() {
        let mejorPuntaje = -Infinity;
        let mejorJugada = null;

        for (let f = 0; f < 3; f++) {
            for (let c = 0; c < 3; c++) {
                if (tablero[f][c] === ' ') {
                    tablero[f][c] = 'O';
                    let puntaje = minimax(tablero, 0, false);
                    tablero[f][c] = ' ';

                    if (puntaje > mejorPuntaje) {
                        mejorPuntaje = puntaje;
                        mejorJugada = { fila: f, columna: c };
                    }
                }
            }
        }
        return mejorJugada;
    }

    function minimax(matriz, profundidad, esMaximizando) {
        if (evaluarGanador(matriz, 'O')) return 10 - profundidad;
        if (evaluarGanador(matriz, 'X')) return profundidad - 10;
        if (evaluarLleno(matriz)) return 0;

        if (esMaximizando) {
            let maxPuntaje = -Infinity;
            for (let f = 0; f < 3; f++) {
                for (let c = 0; c < 3; c++) {
                    if (matriz[f][c] === ' ') {
                        matriz[f][c] = 'O';
                        maxPuntaje = Math.max(minimax(matriz, profundidad + 1, false), maxPuntaje);
                        matriz[f][c] = ' ';
                    }
                }
            }
            return maxPuntaje;
        } else {
            let minPuntaje = Infinity;
            for (let f = 0; f < 3; f++) {
                for (let c = 0; c < 3; c++) {
                    if (matriz[f][c] === ' ') {
                        matriz[f][c] = 'X';
                        minPuntaje = Math.min(minimax(matriz, profundidad + 1, true), minPuntaje);
                        matriz[f][c] = ' ';
                    }
                }
            }
            return minPuntaje;
        }
    }

    function evaluarGanador(m, sim) {
        for (let i = 0; i < 3; i++) {
            if (m[i][0] === sim && m[i][1] === sim && m[i][2] === sim) return true;
            if (m[0][i] === sim && m[1][i] === sim && m[2][i] === sim) return true;
        }
        if (m[0][0] === sim && m[1][1] === sim && m[2][2] === sim) return true;
        if (m[0][2] === sim && m[1][1] === sim && m[2][0] === sim) return true;
        return false;
    }

    function evaluarLleno(m) {
        for (let f = 0; f < 3; f++) {
            for (let c = 0; c < 3; c++) {
                if (m[f][c] === ' ') return false;
            }
        }
        return true;
    }

    // ==========================================
    // 5. EVENTOS Y CONTROLADORES
    // ==========================================
    cells.forEach(cell => {
        cell.addEventListener('click', (e) => {
            if (jugadorActual !== 'X' || juegoTerminado) return;

            const index = parseInt(e.target.getAttribute('data-index'));
            const fila = Math.floor(index / 3);
            const columna = index % 3;

            procesarTurno(fila, columna);
        });
    });

    resetBtn.addEventListener('click', () => {
        inicializarTablero();
    });

    // Iniciar el juego al cargar la página
    inicializarTablero();
});
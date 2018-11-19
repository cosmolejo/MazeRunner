/**
 * @constant
 * Tamaños del tablero
 */


const COLS = localStorage.tamaño;
const ROWS = localStorage.tamaño;
const SIZE = 20;

// Información para el laberinto
var grid = [];
var stack = [];
var route = [];
var deadend = [];

/** 
 * @constant
 * Colores para el laberinto 
*/
const COLOR_START = 'rgb(255, 250, 0)';
const COLOR_FINISH = 'rgb(255, 250, 0)';
const COLOR_ROUTE = 220;
const COLOR_DEADEND = 'rgb(255, 255, 255)';

/**
 * @constant
 * Estados utilizados en el laberinto 
 * */
const STATES = {
  SELECT_START: 0,
  SELECT_FINISH: 1,
  SOLVE: 2
};
var state;

// Posiciones
var current;
var start;
var finish;

// Ayuda utilizada gracias a p5
var pg;
var canvas;
var framerate = 15;

/**
 * @function
 * @name setup
 * En esta función se genera el laberinto.
 */
function setup() {
  canvas = createCanvas(COLS * SIZE + 1, ROWS * SIZE + 1);
  canvas.parent('sketch');

  // Generando la malla del laberinto.
  for (var j = 0; j < ROWS; ++j) {
    var row = [];
    for (var i = 0; i < COLS; ++i) {
      var cell = new Cell(j, i);
      row.push(cell);
    }
    grid.push(row);
  }

  // Algoritmo utilizado para la creación del laberinto.
  current = grid[0][0];
  current.visited = true;
  var unvisited = ROWS * COLS - 1;

  while (unvisited) {
    var next = current.getRndNeighbor();
    if (next) {
      stack.push(current);
      removeWall(current, next);
      current = next;
      if (!current.visited) {
        current.visited = true;
        --unvisited;
      }
    } else if (stack.length > 0) {
      current = stack.pop();
    }
  }

  // Hace mostrar el laberinto.
  for (var j = 0; j < ROWS; ++j) {
    for (var i = 0; i < COLS; ++i) {
      grid[j][i].show();
    }
  }

  pg = createGraphics(width, height);
  pg.copy(canvas, 0, 0, width, height, 0, 0, width, height);
  state = STATES.SELECT_START;
  infoText('SELECCIONE EL INICIO');
}

/**
 * @function
 * @name draw
 * Toma los datos de la generación hecha en setup para graficarlos.
 */
function draw() {
  // Hace mostrar el laberinto.
  image(pg);

  // Selecciona el lugar de inicio.
  if (state === STATES.SELECT_START) {
    getCellUnderCursor().stroke(COLOR_START);
    return;
  }

  // Selecciona el lugar de fin.
  if (state === STATES.SELECT_FINISH) {
    getCellUnderCursor().stroke(COLOR_FINISH);
    start.stroke(COLOR_START);
    return;
  }

  // Algoritmo para resolver el laberinto.
  if (state === STATES.SOLVE) {

    if (current != finish) {
      var next = current.getRndNeighbor(true);
      if (next) {
        route.push(current);
        current = next;
        current.visited = true;
      } else if (route.length > 0) {
        // Backtracking (Se devuelve por camino muerto).
        deadend.push(current);
        current = route.pop();
      } else {
        // En caso de que no exista una solución válida.
        infoText('NO EXISTE SOLUCIÓN');
        noLoop();
      }
    } else {
      // En caso de que exista una solución válida.
      infoText('SOLUCIÓN ENCONTRADA');
      noLoop();
    }
    showRoute();
  }
  start.stroke(COLOR_START);
  finish.stroke(COLOR_FINISH);
}

/**
 * @function
 * @name showRoute
 * Muestra el recorrido del laberinto paso por paso.
 */
function showRoute() {
  current.highlight(COLOR_START);
  for (var i = 0; i < route.length; ++i) {
    route[i].highlight(COLOR_ROUTE);
  }
  for (var i = 0; i < deadend.length; ++i) {
    deadend[i].highlight(COLOR_DEADEND);
  }
}

/**
 * @function
 * @name getCellUnderCursor
 * Ayuda a indicar la celda para colocar la posición inicial y final.
 * @return {cell} Posición en la malla
 */
function getCellUnderCursor() {
  var i = floor(constrain(mouseX, 0, width - 2) / SIZE);
  var j = floor(constrain(mouseY, 0, height - 2) / SIZE);
  return grid[j][i];
}

/**
 * @function
 * @name mouseClicked
 * Ayuda a saber cuál fue la posición en el lugar de inicio y fin.
 */
function mouseClicked() {
  if (mouseX < 0 || mouseX > width || mouseY < 0 || mouseY > height) {
    return;
  }

  // Selecciona el lugar de inicio.
  if (state === STATES.SELECT_START) {
    start = getCellUnderCursor();
    state = STATES.SELECT_FINISH;
    infoText('SELECCIONE EL FIN');
    return;
  }

  // Selecciona el lugar de fin.
  if (state === STATES.SELECT_FINISH) {
    finish = getCellUnderCursor();
    state = STATES.SOLVE;
    infoText('RESOLVIENDO');

    // Marca todas las celdas como no visitadas.
    for (var j = 0; j < ROWS; ++j) {
      for (var i = 0; i < COLS; ++i) {
        grid[j][i].visited = false;
      }
    }
    current = start;
    current.visited = true;
    frameRate(framerate);
  }
}

/**
 * @function
 * @name keyPressed
 * Ayuda a marcar la posición elegida con el cursor.
 */
function keyPressed() {
  if (keyCode == UP_ARROW) {
    framerate += 5;
    frameRate(framerate);
  } else if (keyCode == DOWN_ARROW) {
    framerate = max(1, framerate - 5);
    frameRate(framerate);
  }
}

/**
 * @function
 * @name getCell
 * Permite conseguir la posición actual.
 * @param  {var} Ubicación j de la posición
 * @param  {var} i Ubicación i de la posición
 * @return {cell} Indefinido si no está, o una posición en la malla
 */
function getCell(j, i) {
  if (j < 0 || j > ROWS - 1 || i < 0 || i > COLS - 1) {
    return undefined;
  }
  return grid[j][i];
}

/**
 * @function
 * @name isFenced
 * Permite saber si no existe un camino válido, para así devolverse.
 * @param  {cell} a, Primera celda a revisar
 * @param  {cell}  b, Segunda celda a revisar
 * @return {boolean} comparación logica, si existe un obstaculo entre las celdas, retorna true
 */
function isFenced(a, b) {
  if (a.i === b.i && a.j === b.j + 1) {
    return a.walls.top || b.walls.bottom;
  }
  if (a.i === b.i - 1 && a.j === b.j) {
    return a.walls.right || b.walls.left;
  }
  if (a.i === b.i && a.j === b.j - 1) {
    return a.walls.bottom || b.walls.top;
  }
  if (a.i === b.i + 1 && a.j === b.j) {
    return a.walls.left || b.walls.right;
  }
}

/**
 * @function
 * @name removeWall
 * Función utilizada para remover muros en la creación del algoritmo.
 * @param  {cell} Posición_actual, a
 * @param  {cell} Posición siguiente, b
 */
function removeWall(a, b) {
  if (a.i === b.i && a.j === b.j + 1) {
    a.walls.top = false;
    b.walls.bottom = false;
  } else if (a.i === b.i - 1 && a.j === b.j) {
    a.walls.right = false;
    b.walls.left = false;
  } else if (a.i === b.i && a.j === b.j - 1) {
    a.walls.bottom = false;
    b.walls.top = false;
  } else if (a.i === b.i + 1 && a.j === b.j) {
    a.walls.left = false;
    b.walls.right = false;
  }
}

/**
 * @function
 * @name infoText
 * Escribe en la parte superior las indicaciones.
 * @param  {String} message
 */
function infoText(message) {
  document.getElementById('title').textContent = message;
}
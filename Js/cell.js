/**
 * @class
 * Función que funje como clase para construir las celdas dentro del grid, las cuales equivalen a cada uno de los bloques del laberinto
 * @param {var} j coordenada dentro de la matriz
 * @param {var} i  coordenada dentro de la matriz
 */
function Cell(j, i) {
  this.i = i;
  this.j = j;
  this.x = i * SIZE;
  this.y = j * SIZE;

  this.visited = false;

  this.walls = {
    top   : true,
    right : true,
    bottom: true,
    left  : true
  };
  /**
   * @function
   * @name getRndNeighbor
   * seleccióna un vecino al azar de la celda enviada
   * @param {cell} celda actual
   * @return {cell} celda destino
   */
  this.getRndNeighbor = function(noFenced) {
    if(typeof noFenced === 'undefined') {
      noFenced = false;
    }
    var cells = [];

    var neighbors = [
      getCell(this.j - 1, this.i),
      getCell(this.j    , this.i + 1),
      getCell(this.j + 1, this.i),
      getCell(this.j    , this.i - 1)
    ];

    for (var i = 0; i < neighbors.length; ++i) {
      if(neighbors[i] && !neighbors[i].visited && (!noFenced || !isFenced(this, neighbors[i]))) {
        cells.push(neighbors[i]);
      }
    }

    if (cells.length) {
      return cells[floor(random(0, cells.length))];
    }

    return undefined;
  };

  /**
   * @function 
   * @name highlight
   * colorea la celda según el color enviado
   * @param {String} color
   */
  this.highlight = function(color) {
    noStroke();
    fill(color);
    rect(this.x + 1, this.y + 1, SIZE - 1, SIZE - 1);
  };

  /**
   * @function 
   * @name stroke
   * crea un rectangulo dentro de la celda, del color enviado
   * @param {String} color
   */
  this.stroke = function(color) {
    stroke(color);
    noFill();
    rect(this.x + 1, this.y + 1, SIZE - 2, SIZE - 2);
  };

  /**
   * @function
   * @name show
   * permite visualizar la celda dentro del canvas
   */
  this.show = function() {
    noStroke();
    fill('white');
    rect(this.x, this.y, SIZE, SIZE);

    stroke('black');
    if (this.walls.top)    line(this.x       , this.y       , this.x + SIZE, this.y);
    if (this.walls.right)  line(this.x + SIZE, this.y       , this.x + SIZE, this.y + SIZE);
    if (this.walls.bottom) line(this.x + SIZE, this.y + SIZE, this.x       , this.y + SIZE);
    if (this.walls.left)   line(this.x       , this.y + SIZE, this.x       , this.y);
  }
}

const GRID_SIZE = 38;

const utils = {
  withGrid(n) {
    return n * GRID_SIZE;
  },
  asGridCoord(x, y) {
    //some change here remember
    return `${x * GRID_SIZE},${y * GRID_SIZE}`
  },
  nextPosition(initialX, initialY, direction) {
    let x = initialX;
    let y = initialY;
    const size = GRID_SIZE;
    if (direction === "left") {
      x -= size
    } else if (direction === "right") {
      x += size
    }
    else if (direction === "up") {
      y -= size
    }
    else if (direction === "down") {
      y += size
    }
    return { x, y };
  },
  oppositeDirection(direction) {
    if (direction === "left") { return "right" }
    if (direction === "right") { return "left" }
    if (direction === "up") { return "down" }
    return "up"
  },
  // Calculate sprite frame dimensions from image and grid
  calculateSpriteSize(image, rows, cols) {
    const frameWidth = Math.floor(image.width / cols);
    const frameHeight = Math.floor(image.height / rows);

    return {
      spriteWidth: frameWidth,
      spriteHeight: frameHeight
    };
  },
  emitEvent(name, detail) {
    const event = new CustomEvent(name, {
      detail
    });
    document.dispatchEvent(event);
  },
  oppositeDirection(direction) {
    if (direction === "left") { return "right" }
    if (direction === "right") { return "left" }
    if (direction === "up") { return "down" }
    return "up"
  },
  wait(ms) {
    return new Promise(resolve => {
      setTimeout(() => {
        resolve()
      }, ms)
    })
  }
}
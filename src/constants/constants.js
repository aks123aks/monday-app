const cursorCentered = true;

const ZOOM_SETTINGS = Object.freeze({
  DEFAULT: window.screen.width / 100
});

class Constants {
  static get cursorCentered() {
      return cursorCentered;
  }

  static get ZOOM_SETTINGS() {
    return ZOOM_SETTINGS;
  }

  static getClosestCoord(x, y, dimension) {
    let closeX = x + dimension/2;
    closeX -= closeX % dimension;
    let closeY = y + dimension/2;
    closeY -= closeY % dimension;
    return {
      x: closeX,
      y: closeY
    };
  }

  // TODO: Change to relative percentage
  static viewportToPixels(value) {
    var parts = value.match(/([0-9.]+)(vh|vw)/)
    var q = Number(parts[1])
    var side = window[['innerHeight', 'innerWidth'][['vh', 'vw'].indexOf(parts[2])]]
    return side * (q / 100)
  }
}

export default Constants;
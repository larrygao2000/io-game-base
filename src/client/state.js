// Learn more about this file at:
// https://victorzhou.com/blog/build-an-io-game-part-1/#7-client-state
import { updateLeaderboard } from './leaderboard';

// The "current" state will always be RENDER_DELAY ms behind server time.
// This makes gameplay smoother and lag less noticeable.
const RENDER_DELAY = 100;

const gameUpdates = [];
let gameStart = 0;
let firstServerTimestamp = 0;

export function initState() {
  gameStart = 0;
  firstServerTimestamp = 0;
}

export function processGameUpdate(update) {
  if (!firstServerTimestamp) {
    firstServerTimestamp = update.t;
    gameStart = Date.now();
  }
  gameUpdates.push(update);

  updateLeaderboard(update.leaderboard);

  // Keep only one game update before the current server time
  const base = getBaseUpdate();
  if (base > 0) {
    gameUpdates.splice(0, base);
  }
}

function currentServerTime() {
  return firstServerTimestamp + (Date.now() - gameStart) - RENDER_DELAY;
}

// Returns the index of the base update, the first game update before
// current server time, or -1 if N/A.
function getBaseUpdate() {
  const serverTime = currentServerTime();
  for (let i = gameUpdates.length - 1; i >= 0; i--) {
    if (gameUpdates[i].t <= serverTime) {
      return i;
    }
  }
  return -1;
}

// Returns { me, myteam, others, myteambullets, otherbullets }
export function getCurrentState() {
  if (!firstServerTimestamp) {
    return {};
  }

  const base = getBaseUpdate();
  const serverTime = currentServerTime();

  // If base is the most recent update we have, use its state.
  // Otherwise, interpolate between its state and the state of (base + 1).
  if (base < 0 || base === gameUpdates.length - 1) {
    return gameUpdates[gameUpdates.length - 1];
  } else {
    const baseUpdate = gameUpdates[base];
    const next = gameUpdates[base + 1];
    const ratio = (serverTime - baseUpdate.t) / (next.t - baseUpdate.t);
    return {
      me: interpolateObject(baseUpdate.me, next.me, ratio),
      myteam: interpolateObjectArray(baseUpdate.myteam, next.myteam, ratio),
      others: interpolateObjectArray(baseUpdate.others, next.others, ratio),
      myteambullets: interpolateObjectArray(baseUpdate.myteambullets, next.myteambullets, ratio),
      otherbullets: interpolateObjectArray(baseUpdate.otherbullets, next.otherbullets, ratio),
      boosters: interpolateObjectArray(baseUpdate.boosters, next.boosters, ratio),
      smallmap: baseUpdate.smallmap, // no need to interpolate the small map, it is too small to notice
    };
  }
}

// interpolate x, y and firDirection only
function interpolateObject(object1, object2, ratio) {
  if (!object2) {
    return object1;
  }

  const interpolated = {};
  Object.keys(object1).forEach(key => {
    if (key === 'fireDirection') {
      interpolated[key] = interpolateDirection(object1[key], object2[key], ratio);
    } else if (key === 'x' || key == 'y') {
      interpolated[key] = Math.round(object1[key] + (object2[key] - object1[key]) * ratio);
    } else {
      interpolated[key] = object1[key];
    }
  });
  return interpolated;
}

function interpolateObjectArray(objects1, objects2, ratio) {
  return objects1.map(o => interpolateObject(o, objects2.find(o2 => o.id === o2.id), ratio));
}

// Determines the best way to rotate (cw or ccw) when interpolating a direction.
// For example, when rotating from -3 radians to +3 radians, we should really rotate from
// -3 radians to +3 - 2pi radians.
// d1/d2: range from -Math.PI to Math.PI
// Degree | Angle
// 0:0  45:0.79 90:1.57 135:2.36 180:3.14  180.0001/-180:-3.14 225:-2.36 270/-90:-1.57 315/-45:-0.79 360:0
// 0  0.79 1.57 2.36 3.14  -3.14 -2.36 -1.57 -0.79 0
function interpolateDirection(d1, d2, ratio) {
  const absD = Math.abs(d2 - d1);
  if (absD >= Math.PI) {
    // The angle between the directions is large - we should rotate the other way
    if (d1 > d2) {
      return d1 + ((d2 + 2 * Math.PI) - d1) * ratio;
    } else {
      return d1 + (d2 - (d1 + 2 * Math.PI)) * ratio;
    }
  } else {
    // Normal interp
    return d1 + (d2 - d1) * ratio;
  }
}

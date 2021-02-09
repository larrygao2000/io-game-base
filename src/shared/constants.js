module.exports = Object.freeze({
  PLAYER_RADIUS: 20,
  PLAYER_MAX_HP: 100,
  PLAYER_SPEED: 100,
  PLAYER_SPEED_CAP: 400,
  PLAYER_FIRE_COOLDOWN: 0.5,
  PLAYER_HP_RECOVERY_RATE: 1,

  BULLET_RADIUS: 15,
  BULLET_SPEED: 250,
  BULLET_DAMAGE: 10,

  COLLISION_DAMAGE: 50,
  PLAYER_COLLISION_COOLDOWN: 0.9,

  BOOSTER_NUM_TYPES:  9,
  BOOSTER_RADIUS:     [15,   15,   15,   15,    15,    20,    20,     25,      25,     ],
  BOOSTER_RARE:       [10,   25,   50,   100,   250,   500,   1000,   10000,   25000,  ],
  BOOSTER_MAX_HP:     [1000, 2500, 5000, 10000, 25000, 50000, 100000, 1000000, 2500000,],
  BOOSTER_TTL:        [300,  600,  1800, 3600,  7200,  36000, 86400,  172800,  172800, ],  // 172800 seconds: 2 days
  BOOSTER_MULTIPLIER: {
	      SPEED:  [2,    1,    1,    1,     1,     1,     1,      1,       2],
              HP:     [1,    2,    2,    1,     1,     1,     1,      1,       2],
              BDAMAGE:[1,    1,    1,    2,     1,     1,     1,      1,       2],
              BTSPEED:[1,    1,    1,    1,     2,     1,     1,      1,       2],
              BTDAMAGE:[1,   1,    1,    1,     1,     2,     1,      1,       2],
              BTFREQ: [1,    1,    1,    1,     1,     1,     0.2,    0.5,     0.5],
              SCORE:  [100,  250,  500,  1000,  2500,  5000,  10000,  100000,  250000,],
           },

  SCORE_BULLET_HIT: 10,
  SCORE_KILL: 100,
  SCORE_PER_SECOND: 0.5,

  SMAP_SIZE: 100,
  CLIENT_UPDATE_PER_SECOND: 60,
  SERVER_UPDATE_PER_SECOND: 40,

  MAGIC_WORD: '#f0rever',

  NUM_BOTS: 100,
  MAP_SIZE: 6000,
  MAP_GRID_SIZE: 50,
  MAP_OBJ_GRID_SIZE: 50,
  MSG_TYPES: {
    JOIN_GAME: 'join_game',
    GAME_UPDATE: 'update',
    UPDATE_CANVAS_SIZE: 'update_canvas_size',
    INPUT_MOVEDIRECTION: 'input_movedir',
    INPUT_FIRE: 'input_fire',
    INPUT_FIREDIRECTION: 'input_firedir',
    INPUT_TOGGLE: 'input_toggle',
    GAME_OVER: 'dead',
  },
});

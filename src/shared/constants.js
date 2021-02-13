module.exports = Object.freeze({
  PLAYER_RADIUS: 20,
  PLAYER_MAX_HP: 100,
  PLAYER_SPEED: 100,
  PLAYER_FIRE_COOLDOWN: 0.5,
  PLAYER_HP_RECOVERY_RATE: 1,

  BULLET_RADIUS: 15,
  BULLET_SPEED: 250,
  BULLET_DAMAGE: 10,

  COLLISION_DAMAGE: 50,

  BOOSTER_NUM_TYPES:  14,
  BOOSTER_NAMES:      ["Trigon", "Tetragon", "Pentagon", "Hexagon", "Heptagon","Octagon","Nonagon","Nonagon", "Decagon", "Circle",  "", "",  "", "",],
  BOOSTER_COLOR:      ['#00FFFF', '#00FFFF', '#00FFFF',  '#00FFFF', '#00FFFF', '#00FFFF','#00FFFF','#000000',      '#00FFFF', '#00FFFF', '#66CDAA','#66CDAA', '#66CDAA','#66CDAA'],
  BOOSTER_RADIUS:     [15,   15,   15,   15,    18,    18,    18,     20,      20,      20,     15, 18, 15, 18 ],
  BOOSTER_SIDES:      [3,    4,    5,    6,     7,     8,     9,      9,       10,      0,      1,  1,  2,  2,],
  BOOSTER_RARE:       [10,   25,   50,   100,   250,   500,   1000,   10000,   25000,   50000,  0,  0,  0,  0,],
  BOOSTER_MAX_HP:     [1000, 2500, 5000, 10000, 25000, 50000, 100000, 1000000, 2500000, 5000000,40, 60, 80, 100,],
//  BOOSTER_MAX_HP:     [5,5,5,5,5,5,5,5,5,5,5,],
  BOOSTER_TTL:        [300,  600,  1800, 3600,  7200,  36000, 86400,  172800,  172800,  172800, 172800, 172800, 172800, 172800,],  // 172800 seconds: 2 days
  BOOSTER_MULTIPLIER: {
	      SPEED:  [1,    0,    0,    0,     0,     0,     0,      0,       0,       1,     0, 0, 0, 0,],
              HP:     [0,    1,    0,    0,     0,     0,     0,      0,       0,       1,     0, 0, 0, 0,],
              HPRECOVERY:[0, 0,    1,    0,     0,     0,     0,      0,       0,       1,     0, 0, 0, 0,],
              BDAMAGE:[0,    0,    0,    1,     0,     0,     0,      0,       0,       1,     0, 0, 0, 0,],
              BTSPEED:[0,    0,    0,    0,     1,     0,     0,      0,       0,       1,     0, 0, 0, 0,],
              BTDAMAGE:[0,   0,    0,    0,     0,     1,     0,      0,       0,       1,     0, 0, 0, 0,],
              BTFREQ: [0,    0,    0,    0,     0,     0,     1,      0,       1,       1,     0, 0, 0, 0,],
              VISION: [0,    0,    0,    0,     0,     0,     0,      1,       0,       1,     0, 0, 0, 0,], // To be implemented
              SCORE:  [100,  250,  500,  1000,  2500,  5000,  10000,  100000,  250000,  500000,40,60,80,100,],
           },
  BOOSTER_SPEED_CAP: 4,
  TOTAL_SCORE_BOOSTER: 200,
  TOTAL_SPECIAL_BOOSTER: 25,

  SCORE_BULLET_HIT: 10,
  SCORE_KILL: 100,
  SCORE_PER_SECOND: 0.5,

  SMAP_SIZE: 100,
  CLIENT_UPDATE_PER_SECOND: 60,
  SERVER_UPDATE_PER_SECOND: 40,

  MAGIC_WORD: '#f0rever',

  NUM_BOTS: 0,
  MAP_SIZE: 1000,
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

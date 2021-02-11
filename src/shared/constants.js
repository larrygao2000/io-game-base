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
  PLAYER_COLLISION_COOLDOWN: 0.9,

  BOOSTER_NUM_TYPES:  2,
  BOOSTER_RADIUS:     [15,  15,  ],
  BOOSTER_MAX_HP:     [1000,2500,],
  BOOSTER_TTL:        [300, 600,  ],
  BOOSTER_MAXCAPTURE: [2,   2,  ],
  BOOSTER_RARE:       [10,  25,  ],
  BOOSTER_MULTIPLIER: {
	      SPEED:  [2, 1,],
              HP:     [1, 2,],
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

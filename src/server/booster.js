const shortid = require('shortid');
const ObjectClass = require('./object');
const Constants = require('../shared/constants');

class Booster extends ObjectClass {
  constructor(x, y, level) {
    super(shortid(), x, y, 0, 0, Constants.B_TRI_RADIUS);
    this.level = level;
    this.type = 30;

    this.hp_max = Constants.PLAYER_MAX_HP;
    this.hp = this.hp_max;
    this.hp_recover = 0;
    this.hp_recover_rate = 0;
    this.lost_hp = 0;
    this.lost_hp_per_update = 2;
  }

  // Returns true if the bullet should be destroyed
  update(dt) {
    super.update(dt);
    // update direction
    this.direction -= 3.1415926*2 / 100; // make a round in 10 seconds
    if (this.fireDirection < -3.1415926) this.fireDirection = 3.1415926;
  }

  collision2(obj) {

    // no collision
    if (this.distanceTo(obj) > this.radius + obj.radius) return 0;

    if (obj.getType() < 20) {
      // bullet
      this.hp --;
      if (this.hp < 0) {
        if (obj.parent) {
          obj.parent.speed *= 2;
        }
      }
      return 0b01;
    }

    return 0b00;
  }

  serializeForUpdate() {
    return {
      ...(super.serializeForUpdate()),
      direction: this.direction,
      hp: this.hp,
      level: this.level,
    };
  }
}

module.exports = Booster;

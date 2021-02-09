const shortid = require('shortid');
const ObjectClass = require('./object');
const Constants = require('../shared/constants');

class Booster extends ObjectClass {
  constructor(x, y, level) {
    super(shortid(), x, y, 0, Constants.BULLET_SPEED);
    this.level = level;
    this.group = parent.group;
    this.liveTime = 5; // 5 seconds
    this.type = 15;
  }

  // Returns true if the bullet should be destroyed
  update(dt) {
    super.update(dt);
    // The bullet will be removed after 5 seconds
    this.liveTime -= dt;
    if (this.liveTime < 0 || this.x < 0 || this.x > Constants.MAP_SIZE || this.y < 0 || this.y > Constants.MAP_SIZE) {
      this.remove();
    }
  }

  collision2(obj) {
    // Both are bullets

    if (this.group == obj.group || 
        this.distanceTo(obj) > Constants.BULLET_RADIUS * 2) return 0;

    // collision
    return 0b11;
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

module.exports = Bullet;

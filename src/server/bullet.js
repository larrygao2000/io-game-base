const shortid = require('shortid');
const ObjectClass = require('./object');
const Constants = require('../shared/constants');

class Bullet extends ObjectClass {
  constructor(parent, x, y, dir, speed_multi, damage_multi) {
    super(shortid(), x, y, dir, 0, Constants.BULLET_RADIUS);
    this.parent = parent;
    this.parentID = parent.id;
    this.group = parent.group;
    this.liveTime = 5; // 5 seconds
    this.type = 10;

    this.pre_v = Constants.BULLET_SPEED * speed_multi;
    this.pre_dir = dir;
    this.max_speed = Constants.BULLET_SPEED * speed_multi / 10; // lost one 10th of the speed first second
    this.max_speed_updated = 0;
   
    this.damage = Constants.BULLET_DAMAGE * damage_multi;
  }

  update(dt) {
    super.update(dt);
    // The bullet will be removed after 5 seconds
    this.liveTime -= dt;

    if (this.max_speed_updated == 0 && this.liveTime < 4) {
      this.max_speed *= 2; // lost one 5th the 2nd second.
      this.max_speed_updated ++;
    } else if (this.max_speed_updated == 1 && this.liveTime < 3) {
      this.max_speed /= 3;  // then lost 1/3 of its current speed every second until it drops to 0
      this.max_speed_updated ++;
    }

    if (this.liveTime < 0 || this.x < 0 || this.x > Constants.MAP_SIZE || this.y < 0 || this.y > Constants.MAP_SIZE) {
      this.hp = 0;
      this.remove();
    }
  }

  collision2(obj) {
    // Both are bullets

    if (this.group == obj.group || 
        this.distanceTo(obj) > (this.radius + obj.radius)) return 0;

    // collision
    return 0b11;
  }
}

module.exports = Bullet;

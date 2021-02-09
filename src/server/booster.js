const shortid = require('shortid');
const ObjectClass = require('./object');
const Constants = require('../shared/constants');

class Booster extends ObjectClass {
  constructor(x, y, level) {
    super(shortid(), x, y, 0, 0, Constants.B_TRI_RADIUS);
    this.level = level;
    this.type = 30;
    this.group = this.id; // no group

    this.hp_max = Constants.B_TRI_MAX_HP;
    this.hp = this.hp_max;
    this.hp_recover = 0;
    this.hp_recover_rate = 0;
    this.lost_hp = 0;
    this.lost_hp_per_update = 2;

    this.collisionCooldown = Constants.PLAYER_COLLISION_COOLDOWN;
  }

  // Returns true if the bullet should be destroyed
  update(dt) {
    super.update(dt);

    if (this.hp <= 0) {
      this.remove();
      return;
    }

    // update direction
    this.direction -= 3.1415926*2 / 100; // make a round in 10 seconds
    if (this.collisionCooldown > 0) this.collisionCooldown -= dt;
  }

  collision2(obj) {

    // no collision
    if (this.distanceTo(obj) > this.radius + obj.radius) return 0;

    if (obj.getType() < 20) {
      // bullet

      this.takeBulletDamage();

      if (this.hp - this.lost_hp < 0) {
        if (obj.parent) {
          if (!obj.parent.boosters[this.level]) {
            obj.parent.boosters[this.level] = 0;
          }
          if (obj.parent.boosters[this.level] < 2) {
            obj.parent.max_speed *= 2;
          }
          obj.parent.boosters[this.level]++;
          obj.parent.score += 500;
        }
      }

      return 0b01;
    }

    // player hit booster
    if (obj.getType() >= 20) {

      if (this.id == obj.id) return 0;

      if (!this.collision_bounceback(obj)) return 0;

      const collisiondamage = Math.min(this.hp, Math.min(obj.hp, Constants.COLLISION_DAMAGE));
      if (this.group != obj.group) {
        // only take damage if they are not in the same group
        this.takeCollisionDamage(collisiondamage);
        obj.takeCollisionDamage(collisiondamage);
      }

      return 0
    }

    return 0b00;
  }

  takeBulletDamage() {
    this.lost_hp += Constants.BULLET_DAMAGE;

    // we do 40 updates per second, so this will allow the HP removed in half second
    this.lost_hp_per_update = this.lost_hp / 20;
    if (this.lost_hp_per_update < 1) this.lost_hp_per_update = 1;
  }

  takeCollisionDamage(damage) {
    if (this.collisionCooldown < 0) {
      this.lost_hp += damage;

      // we do 40 updates per second, so this will allow the HP removed in half second
      this.lost_hp_per_update = this.lost_hp / 20;
      if (this.lost_hp_per_update < 1) this.lost_hp_per_update = 1;
    }
    this.collisionCooldown = Constants.PLAYER_COLLISION_COOLDOWN;
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

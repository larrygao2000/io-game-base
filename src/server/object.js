const CollisionMap = require('./collisions');
const Constants = require('../shared/constants');

class Object {
  constructor(id, x, y, dir, speed, radius) {
    this.id = id;
    this.x = x;
    this.y = y;
    this.radius = radius;

    this.direction = dir;
    this.speed = speed;
    this.max_speed = speed;
    this.max_speed_multi = 1;
    this.desire_speed = speed;

    this.pre_v = 0;
    this.pre_dir = 0;

    this.mapX = -1;
    this.mapY = -1;
    this.mapPos = -1;

    this.type = 0;

    this.hp_max_base = 1;
    this.hp_max_multi = 1;
    this.hp_max = 1;
    this.hp = 1
    this.hp_recover = 0;
    this.hp_recover_rate = 0;
    this.lost_hp = 0;
    this.lost_hp_per_update = 2;

    this.bodydamage_multi = 1;

    this.hp_recovery_multi = 1;

    this.dt = 0;

    CollisionMap.addObject(this);
  }


  isLive() {
    return this.hp > 0;
  }

  getType() {
    return this.type;
  }

  update(dt) {

    this.dt = dt; // to be used in collision2

    if (this.pre_v > 0) {
      this.x += dt * this.pre_v * Math.cos(this.pre_dir);
      this.y -= dt * this.pre_v * Math.sin(this.pre_dir);

      this.pre_v -= this.max_speed * this.max_speed_multi * dt;
    }

    if (this.speed < this.desire_speed) {
      this.speed += this.max_speed * this.max_speed_multi * dt;
      if (this.speed > this.desire_speed) this.speed = this.desire_speed;
    }

    this.x += dt * this.speed * Math.cos(this.direction);
    this.y -= dt * this.speed * Math.sin(this.direction);

    // Need to update the map even for static object, as the object might be moved due to collision bounce
    CollisionMap.updateObject(this);

    if (this.hp_recover_rate > 0 && this.hp < this.hp_max) {
      this.hp_recover -= dt;
      if (this.hp_recover <= 0) {
        this.hp += 1;
        if (this.hp > this.hp_max) this.hp = this.hp_max;
        this.hp_recover = this.hp_recover_rate / this.hp_recovery_multi;
      }
    }

    if (this.lost_hp > 0) {
      if (this.lost_hp <= this.lost_hp_per_update) {
        this.hp -= this.lost_hp;
        this.lost_hp = 0;
      } else {
        this.hp -= this.lost_hp_per_update;
        this.lost_hp -= this.lost_hp_per_update;
      }
    }

  }

  collision(obj) {
    if (obj.getType() > this.getType()) {
      const ret=obj.collision2(this);

      return ((ret & 1) << 1) | ((ret & 2) >>> 1) ;
    }

    return this.collision2(obj);
  }
 
  collision2(obj) {
    // do nothing
    return 0;
  }

  collision_bounceback(obj) {

    const dist = this.radius + obj.radius - this.distanceTo(obj);
    if (dist < 0) return false; // no collision

    if (dist < 1e-8) {
      return true; // collision but just next to each other, no need to bounce
    }

    // bounce the objects back
    if (this.x == obj.x && this.y == obj.y) {
      let mx = 1 - Math.round(Math.random() * 100) % 3;
      let my = 1 - Math.round(Math.random() * 100) % 3;
      this.x = Math.max(0, Math.min(Constants.MAP_SIZE, this.x + mx));
      this.y = Math.max(0, Math.min(Constants.MAP_SIZE, this.y + my));
      return true;
    }

    const dir = Math.atan2(obj.y - this.y, this.x - obj.x);
    const x = (dist + 0.1) * Math.cos(dir) / 2;
    const y = (dist + 0.1) * Math.sin(dir) / 2;

    // this is called from applyCollision which depends on collision map
    // so we just set to new position -- collision mapX/mapY will be updated in next update(dt) call

    this.x = Math.max(0, Math.min(Constants.MAP_SIZE, this.x + x));
    this.y = Math.max(0, Math.min(Constants.MAP_SIZE, this.y - y));

    obj.x = Math.max(0, Math.min(Constants.MAP_SIZE, obj.x - x));
    obj.y = Math.max(0, Math.min(Constants.MAP_SIZE, obj.y + y));

    return true;
  }
  
  remove() {
    CollisionMap.removeObject(this);
  }

  distanceTo(object) {
    const dx = this.x - object.x;
    const dy = this.y - object.y;
    return Math.sqrt(dx * dx + dy * dy);
  }

  setMoveDirection(dir) {
    this.direction = dir;
  }

  serializeForUpdate() {
    return {
      id: this.id,
      x: this.x,
      y: this.y,
    };
  }
}

module.exports = Object;

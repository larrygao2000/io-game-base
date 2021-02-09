const CollisionMap = require('./collisions');

class Object {
  constructor(id, x, y, dir, speed, radius) {
    this.id = id;
    this.x = x;
    this.y = y;
    this.direction = dir;
    this.speed = speed;
    this.radius = radius;

    this.mapX = -1;
    this.mapY = -1;
    this.mapPos = -1;

    this.type = 0;

    this.hp_max = 1;
    this.hp = 1
    this.hp_recover = 0;
    this.hp_recover_rate = 0;
    this.lost_hp = 0;
    this.lost_hp_per_update = 2;

    CollisionMap.addObject(this);
  }

  getType() {
    return this.type;
  }

  update(dt) {
    this.x += dt * this.speed * Math.cos(this.direction);
    this.y -= dt * this.speed * Math.sin(this.direction);

    CollisionMap.updateObject(this);

    if (this.hp < this.hp_max) {
      this.hp_recover -= dt;
      if (this.hp_recover <= 0) {
        this.hp ++;
        if (this.hp > this.hp_max) this.hp = this.hp_max;
        this.hp_recover = this.hp_recover_rate;
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
  
  remove() {
    CollisionMap.removeObject(this);
  }

  distanceTo(object) {
    const dx = this.x - object.x;
    const dy = this.y - object.y;
    return Math.sqrt(dx * dx + dy * dy);
  }

  setDirection(dir) {
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

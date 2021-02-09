const ObjectClass = require('./object');
const Bullet = require('./bullet');
const Constants = require('../shared/constants');
const CollisionMap = require('./collisions');

// 0: still
// 1: right, 2: upright, 3: up,   4: upleft 
// 5: left,  6: downleft 7: down, 8:downright
const playermovedir=[ [0,0],
                      [1, 0], [1/Math.sqrt(2), -1/Math.sqrt(2)],
                      [0, -1], [-1/Math.sqrt(2), -1/Math.sqrt(2)],
                      [-1,0], [-1/Math.sqrt(2), 1/Math.sqrt(2)],
                      [0,1], [1/Math.sqrt(2), 1/Math.sqrt(2)]];
class Player extends ObjectClass {
  constructor(id, username, x, y) {
    super(id, x, y, Math.random() * 2 * Math.PI, Constants.PLAYER_SPEED, Constants.PLAYER_RADIUS);
    const namesplit = username.split('@');
    this.username = namesplit[0];
    if (namesplit.length > 1) {
      this.group = namesplit[1];
      if (namesplit.length > 2 && namesplit[2] == Constants.MAGIC_WORD) {
        this.immortal = true;
      }
    } else {
      this.group = id;
    }

    this.hp_max = Constants.PLAYER_MAX_HP;
    this.hp = this.hp_max;
    this.hp_recover = 1;
    this.hp_recover_rate = Constants.PLAYER_HP_RECOVERY_RATE;
    this.lost_hp = 0;
    this.lost_hp_per_update = 2;

    this.max_speed = Constants.PLAYER_SPEED;
    this.speed = 0;
    this.fireDirection = this.direction;

    this.fireCooldownCount = 0;
    this.fireCooldown = Constants.PLAYER_FIRE_COOLDOWN;
    this.score = 0;
    this.bullets = 0;
    this.autofire = false;
    this.isBot = false;
    this.shieldTime = 5; // Player will be shielded damage for 5 seconds
    this.canvasWidth = Constants.MAP_SIZE / 4;
    this.canvasHeight = Constants.MAP_SIZE / 4;
    this.collisionCooldown = Constants.PLAYER_COLLISION_COOLDOWN;
    this.type = 20;
  }

  restart() {
    this.hp = this.hp_max;
    this.hp_recover = 1;
    this.fireCooldownCount = 0;
    this.score = 0;
    this.bullets = 0;
    this.speed = 0;
  }

  // Returns a newly created bullet, or null.
  update(dt) {

    super.update(dt);

    // Make sure the player stays in bounds
    // please note this will not change the mapX / mapY
    this.x = Math.max(0, Math.min(Constants.MAP_SIZE, this.x));
    this.y = Math.max(0, Math.min(Constants.MAP_SIZE, this.y));

    if (this.shieldTime > 0) this.shieldTime -= dt;

    // Update score
    this.score += dt * Constants.SCORE_PER_SECOND;

    // Fire a bullet, if needed
    this.fireCooldownCount -= dt;
    if (this.fireCooldownCount <= 0 && this.autofire || this.bullets > 0) {
      this.fireCooldownCount += this.fireCooldown;
      this.bullets--;
      new Bullet(this, this.x, this.y, this.fireDirection);
    }

    if (this.collisionCooldown > 0) this.collisionCooldown -= dt;
  }

  collision2(obj) {

    // player vs player
    if (obj.getType() >= 20) {
      // we should not use group here -- player cannot fly over player, so need to detect collision
      if (this.id == obj.id) return 0;

      const dist = this.radius + obj.radius - this.distanceTo(obj);
      if (dist < 0) return 0;

      // player PK

      const collisiondamage = Math.min(this.hp, Math.min(obj.hp, Constants.COLLISION_DAMAGE));
      if (this.group != obj.group) {
        // only take damage if they are not in the same group
        this.takeCollisionDamage(collisiondamage);
        obj.takeCollisionDamage(collisiondamage);
      }

      // bounce the players back
      if (this.x != obj.x || this.y != obj.y) {
        const dir = Math.atan2(obj.y - this.y, this.x - obj.x);
        const x = (dist + 1) * Math.cos(dir) / 2;
        const y = (dist + 1) * Math.sin(dir) / 2;

        // this is called from applyCollision which depends on collision map
        // so we just set to new position -- collision mapX/mapY will be updated in next update(dt) call

        this.x = Math.max(0, Math.min(Constants.MAP_SIZE, this.x + x));
        this.y = Math.max(0, Math.min(Constants.MAP_SIZE, this.y - y));

        obj.x = Math.max(0, Math.min(Constants.MAP_SIZE, obj.x - x));
        obj.y = Math.max(0, Math.min(Constants.MAP_SIZE, obj.y + y));
      }

      return 0
    }

    // player vs bullet
    if (this.group == obj.group ||
        this.distanceTo(obj) > this.radius + obj.radius) return 0;

    // collision

    this.takeBulletDamage();

    if (obj.parent) {
      obj.parent.onDealtDamage(this);
      if (this.isBot && ! obj.parent.isBot && Math.random() < 0.5) {
        this.lockPlayer = obj.parent;
      }
    }

    // remove the bullet
    return 0b01;
  }

  setMoveDirection(speed, dir) {
    this.speed = speed;
    super.setDirection(dir);
  }

  setMoveDirection(dir) {
    if (dir == 0) {
      this.speed = 0;
    } else {
      this.speed = this.max_speed;
      super.setDirection( (dir - 1) * Math.PI / 4 );
    }
  }

  setFireDirection(dir) {
    this.fireDirection = dir;
  }

  toggle(tog) {
    if (tog == 'e') {
      this.autofire = ! this.autofire;
      this.bullets = 0;
      if (this.fireCooldownCount < 0) this.fireCooldownCount = 0;
    }
  }

  handleCanvasSize(w, h) {
    this.canvasWidth = w;
    this.canvasHeight = h;
    console.log("Player canvas size:", w, h);
  }

  openFire(start) {
//    if (! this.autofire) {
//      this.bullets ++;
//    }
    if (start == 'once') {
       this.bullets ++;
    }
    this.autofire = (start == 'on');
    if (this.fireCooldownCount < 0) this.fireCooldownCount = 0;
  }

  takeBulletDamage() {
    if ((this.shieldTime < 0) && (!this.immortal)) {
//      this.hp -= Constants.BULLET_DAMAGE;
      this.lost_hp += Constants.BULLET_DAMAGE;

      // we do 40 updates per second, so this will allow the HP removed in half second
      this.lost_hp_per_update = this.lost_hp / 20;
      if (this.lost_hp_per_update < 1) this.lost_hp_per_update = 1;
    }
  }

  takeCollisionDamage(damage) {
    if (this.collisionCooldown < 0) {
      if ((this.shieldTime < 0) && (!this.immortal)) {
//	this.hp -= damage;
	this.lost_hp += damage;

        // we do 40 updates per second, so this will allow the HP removed in half second
        this.lost_hp_per_update = this.lost_hp / 20;
        if (this.lost_hp_per_update < 1) this.lost_hp_per_update = 1;
      }
      this.collisionCooldown = Constants.PLAYER_COLLISION_COOLDOWN;
    }
  }

  onDealtDamage(obj) {
    if (obj.hp <= 0) {
      // killed the obj
      this.score += Constants.SCORE_KILL;
    } else {
      this.score += Constants.SCORE_BULLET_HIT;
    }
  }

  serializeForUpdate() {
    return {
      ...(super.serializeForUpdate()),
      fireDirection: this.fireDirection,
      username: this.username,
      hp: this.hp,
      shieldTime: this.shieldTime,
      score: Math.round(this.score),
    };
  }
}

module.exports = Player;

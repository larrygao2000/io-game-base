const shortid = require('shortid');
const ObjectClass = require('./object');
const Constants = require('../shared/constants');

class Booster extends ObjectClass {
  constructor(x, y, level) {
    super(shortid(), x, y, 0, 0, Constants.BOOSTER_RADIUS[level]);
    this.level = level;
    this.type = 30;
    this.group = this.id; // no group

    this.hp_max = Constants.BOOSTER_MAX_HP[level];
    this.hp = this.hp_max;
    this.hp_recover = 0;
    this.hp_recover_rate = 0;
    this.lost_hp = 0;
    this.lost_hp_per_update = 2;

    this.liveTime = Constants.BOOSTER_TTL[level];

    this.collisionCooldown = Constants.PLAYER_COLLISION_COOLDOWN;
  }

  // Returns true if the bullet should be destroyed
  update(dt) {
    super.update(dt);

    this.liveTime -= dt;

    if (this.liveTime <= 0) {
      this.remove();
      return;
    }

    if (this.hp <= 0) {
      if (this.lastHitBy) {
        // this player is killed by lastHitBy
        this.creditPlayer(this.lastHitBy);
      }

      this.remove();
      return;
    }

    // update direction
    this.direction -= 3.1415926*2 / 200; // make a round in 20 seconds
    if (this.collisionCooldown > 0) this.collisionCooldown -= dt;
  }

  creditPlayer(player) {

    if (player.max_speed_multi < Constants.BOOSTER_SPEED_CAP) {
      player.max_speed_multi += Constants.BOOSTER_MULTIPLIER['SPEED'][this.level];
console.log("speed multi:" + player.max_speed_multi);
    }

    if (Constants.BOOSTER_MULTIPLIER['HP'][this.level] != 0) {
      player.hp_max_multi += Constants.BOOSTER_MULTIPLIER['HP'][this.level];
      player.hp_max = player.hp_max_base * player.hp_max_multi;
      player.hp = player.hp_max;
console.log("hp multi:" + player.hp_max_multi + " max hp:" + player.hp_max);
    }

    if (Constants.BOOSTER_MULTIPLIER['HPRECOVERY'][this.level] != 0 && player.hp_recovery_multi < 60)
      player.hp_recovery_multi += Constants.BOOSTER_MULTIPLIER['HPRECOVERY'][this.level];
console.log("hp recovery multi:" + player.hp_recovery_multi);

    player.bodydamage_multi += Constants.BOOSTER_MULTIPLIER['BDAMAGE'][this.level];
console.log("hp body damage multi:" + player.bodydamage_multi);
   
    if (player.bullet_speed_multi < Constants.BOOSTER_SPEED_CAP)
      player.bullet_speed_multi += Constants.BOOSTER_MULTIPLIER['BTSPEED'][this.level];
console.log("bullet speed multi:" + player.bullet_speed_multi);

    player.bullet_damage_multi += Constants.BOOSTER_MULTIPLIER['BTDAMAGE'][this.level];
console.log("bullet damage multi:" + player.bullet_damage_multi);

    player.firefreq += Constants.BOOSTER_MULTIPLIER['BTFREQ'][this.level];
console.log("bullet fire multi:" + player.firefreq);

    player.score += Constants.BOOSTER_MULTIPLIER['SCORE'][this.level];
  }

  collision2(obj) {

    // no collision
    if (this.distanceTo(obj) > this.radius + obj.radius) return 0;

    if (obj.getType() < 20) {
      // shot by bullet

      this.takeBulletDamage(obj);

      this.lastHitBy = obj.parent;

      return 0b01;
    }

    // player hit booster
    if (obj.getType() < 30) {

      if (this.id == obj.id) return 0;

      if (!this.collision_bounceback(obj)) return 0;

      const collisiondamage = Math.min(this.hp, Math.min(obj.hp, Constants.COLLISION_DAMAGE));
      if (this.group != obj.group) {
        // only take damage if they are not in the same group
        this.takeCollisionDamage(obj, collisiondamage * obj.bodydamage_multi);
        obj.takeCollisionDamage(this, collisiondamage * this.bodydamage_multi);
      }

      return 0
    }

    // two boosters hit each other? why? Could be bounced back due to collision with player
    if (this.id != obj.id) {
      this.collision_bounceback(obj);
    }

    return 0b00;
  }

  takeBulletDamage(obj) {
    this.lost_hp += obj.damage;

    // we do 40 updates per second, so this will allow the HP removed in half second
    this.lost_hp_per_update = this.lost_hp / 20;
    if (this.lost_hp_per_update < 1) this.lost_hp_per_update = 1;

    if (this.liveTime < 10) this.liveTime = 10; // extend the life for 10 seconds
  }

  takeCollisionDamage(obj, damage) {
    if (this.collisionCooldown < 0) {
      this.lost_hp += damage;

      // we do 40 updates per second, so this will allow the HP removed in half second
      this.lost_hp_per_update = this.lost_hp / 20;
      if (this.lost_hp_per_update < 1) this.lost_hp_per_update = 1;
      this.collisionCooldown = Constants.PLAYER_COLLISION_COOLDOWN;

      this.lastHitBy = obj;

      if (this.liveTime < 10) this.liveTime = 10; // extend the life for 10 seconds
    } 

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

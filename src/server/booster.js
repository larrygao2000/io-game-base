const shortid = require('shortid');
const ObjectClass = require('./object');
const Constants = require('../shared/constants');

let total_score_boosters = 0;
let total_special_boosters = 0;
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

    if (level > 9) {
      total_score_boosters ++;
      if (total_score_boosters > Constants.TOTAL_SCORE_BOOSTERS) {
        this.liveTime = 300; // if there are too many of these boosters, let it live for 5 mins only.
      }
    } else {
      total_special_boosters ++;
      if (total_score_boosters > Constants.TOTAL_SPECIAL_BOOSTERS) {
        this.liveTime = 300; // if there are too many of these boosters, let it live for 5 mins only.
      }
    }
  }

  update(dt) {
    super.update(dt);

    this.liveTime -= dt;

    if (this.liveTime <= 0) {
      if (this.level > 9) total_score_boosters --;
                     else total_special_boosters --;
      this.remove();
      this.hp = 0;
      return;
    }

    if (this.hp <= 0) {
      if (this.lastHitBy) {
        // this player is killed by lastHitBy
        this.creditPlayer(this.lastHitBy);
      }

      if (this.level > 9) total_score_boosters --;
                     else total_special_boosters --;
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
    }

    if (Constants.BOOSTER_MULTIPLIER['HP'][this.level] != 0) {
      player.hp_max_multi += Constants.BOOSTER_MULTIPLIER['HP'][this.level];
      player.hp_max = player.hp_max_base * player.hp_max_multi;
      player.hp = player.hp_max;
    }

    if (Constants.BOOSTER_MULTIPLIER['HPRECOVERY'][this.level] != 0 && player.hp_recovery_multi < 60)
      player.hp_recovery_multi += Constants.BOOSTER_MULTIPLIER['HPRECOVERY'][this.level];

    player.bodydamage_multi += Constants.BOOSTER_MULTIPLIER['BDAMAGE'][this.level];
   
    if (player.bullet_speed_multi < Constants.BOOSTER_SPEED_CAP)
      player.bullet_speed_multi += Constants.BOOSTER_MULTIPLIER['BTSPEED'][this.level];

    player.bullet_damage_multi += Constants.BOOSTER_MULTIPLIER['BTDAMAGE'][this.level];

    player.firefreq += Constants.BOOSTER_MULTIPLIER['BTFREQ'][this.level];

    player.score += Constants.BOOSTER_MULTIPLIER['SCORE'][this.level];
  }

  collision2(obj) {

    // no collision
    if (this.distanceTo(obj) > this.radius + obj.radius) return 0;

    if (obj.getType() < 20) {
      // shot by bullet

      this.takeBulletDamage(obj);

      if (obj.parent) {
        this.lastHitBy = obj.parent;
        // let smart bots locks on boosters and tries to capture it
        if (obj.parent.isBot && ! obj.parent.lockPlayer && Math.random() < 0.5) {
          obj.parent.lockPlayer = this;
        }
      }

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

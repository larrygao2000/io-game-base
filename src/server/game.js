const Constants = require('../shared/constants');
const Player = require('./player');
const Robot = require('./bots');
const CollisionMap = require('./collisions');

class Game {
  constructor() {
    this.sockets = {};
    this.players = {};
    this.leaderboard = [];
    this.lastUpdateTime = Date.now();
    this.removedPool = {};
    this.shouldSendUpdate = 0;
    setInterval(this.update.bind(this), 1000 / Constants.SERVER_UPDATE_PER_SECOND);

    CollisionMap.init();

//  after optimization, can run 500 bots with certain lagging occasionally
//  adjusted Constants.SERVER_UPDATE_PER_SECOND (40 times per seconds, 30 frames per seconds), it can go up to 1000 players
//    for (let i = 0; i < 1000; i++) // 
    for (let i = 0; i < Constants.NUM_BOTS; i++) // 
      this.addBot(new Robot(i));
  }

  addBotWithTimer(bot) {
    // check if bot is passed in
    // if this.addBotWithTimer.arguments.length == 1
    // bot = bot || "other value? null?"
    // if (bot === undefined)

    this.addBot(bot);
  }

  addPlayer(socket, username) {
    this.sockets[socket.id] = socket;

    if (this.removedPool[socket.id]) {
      this.players[socket.id] = this.removedPool[socket.id];
      this.players[socket.id].restart();
      this.removedPool[socket.id] = null;
    } else {

      // Generate a position to start this player at.
      const x = Constants.MAP_SIZE * (0.1 + Math.random() * 0.8);
      const y = Constants.MAP_SIZE * (0.1 + Math.random() * 0.8);
      this.players[socket.id] = new Player(socket.id, username, x, y);
    }
  }

  addBot(bot) {
    this.addPlayer(bot, bot.username);
    bot.player = this.players[bot.id];
    this.players[bot.id].isBot = true;
    this.players[bot.id].openFire('on');
    this.players[bot.id].canvasWidth = bot.canvasWidth;
    this.players[bot.id].canvasHeight = bot.canvasHeight;
  }

  removePlayer(socket) {
    // Could be called from disconnect and the player might have been removed already.
    if (this.players[socket.id] == null) {
      return; // cover both null and undefined
    }
    this.players[socket.id].remove();
    delete this.sockets[socket.id];

    if (! this.players[socket.id].isBot) {
      this.removedPool[socket.id] = this.players[socket.id];
      this.players[socket.id] = null;
    }
    delete this.players[socket.id];
  }

  handleCanvasSize(socket, w, h) {
    if (this.players[socket.id]) {
      this.players[socket.id].handleCanvasSize(w, h);
    }
  }

  handleInputFireDirection(socket, dir) {
    if (this.players[socket.id]) {
      this.players[socket.id].setFireDirection(dir);
    }
  }

  handleInputMoveDirection(socket, dir) {
    if (this.players[socket.id]) {
      this.players[socket.id].setMoveDirection(dir);
    }
  }

  handleInputToggle(socket, tog) {
    if (this.players[socket.id]) {
      this.players[socket.id].toggle(tog);
    }
  }

  handleInputFire(socket, start) {
    if (this.players[socket.id]) {
      this.players[socket.id].openFire(start);
    }
  }

  update() {
    // Calculate time elapsed
    const now = Date.now();
    const dt = (now - this.lastUpdateTime) / 1000;
    this.lastUpdateTime = now;

    // Update each bullet and player
    CollisionMap.updateObjs(dt);

    // Apply collisions, give players score for hitting bullets
    //CollisionMap.applyCollisions(this.players, this.bullets);
    CollisionMap.applyCollisions2();

    // Check if any players are dead
    Object.keys(this.sockets).forEach(playerID => {
      const socket = this.sockets[playerID];
      const player = this.players[playerID];
      if (player.hp <= 0){
        socket.emit(Constants.MSG_TYPES.GAME_OVER);
        this.removePlayer(socket);

        if (player.isBot) {
	  setTimeout(() => { this.addBotWithTimer(socket) }, 5000);
        }
      }
    });

    // Send a game update 3 times for every 4 rounds
    if (this.shouldSendUpdate < 3) {
      this.prepareLeaderboard();
      const smallmap = Object.values(this.players).map(p => ({x:p.x, y:p.y}));
      Object.keys(this.sockets).forEach(playerID => {
        const socket = this.sockets[playerID];
        const player = this.players[playerID];
        socket.emit(Constants.MSG_TYPES.GAME_UPDATE, this.createUpdate(player, smallmap));
      });
    }
    this.shouldSendUpdate ++;
    if (this.shouldSendUpdate >= 4) {
      this.shouldSendUpdate = 0;
    }
  }

  prepareLeaderboard() {
    const playerlist = Object.values(this.players)
      .sort((p1, p2) => p2.score - p1.score);
//      .slice(0, 5)
//      .map(p => ({ username: p.username, score: Math.round(p.score) }));

    this.leaderboard = [];
    for (let i = 0; i < 6 && i < playerlist.length; i++) {
      const p = playerlist[i];
      this.leaderboard.push({id:p.id, place: i + 1, username: p.username, score: Math.round(p.score) });
    }

    for (let i = 0; i < playerlist.length; i++) {
      playerlist[i].place = i;
    }
  }

  getLeaderboard(me) {

   for (let i = 0; i < this.leaderboard.length; i++) if (this.leaderboard[i].id == me.id) {
     // me is in the leaderboard, including the case there are less than 7 players
     return this.leaderboard.map( p => ({place: p.place, username: p.username, score: p.score}));
   }

   let lb = this.leaderboard.map( p => ({place: p.place, username: p.username, score: p.score}));
   lb[5] = {place:me.place + 1, username: me.username, score: Math.round(me.score)};

   return lb;
  }

  createUpdate(player, smallmap) {
    const objUpdates = CollisionMap.getObjectUpdates(player);

    const leaderboard = this.getLeaderboard(player);

    return {
      t: Date.now(),
      me: player.serializeForUpdate(),
      myteam: objUpdates.myteamNearbyPlayers.map(p => p.serializeForUpdate()),
      others: objUpdates.nearbyPlayers.map(p => p.serializeForUpdate()),
      myteambullets: objUpdates.myteamNearbyBullets.map(b => b.serializeForUpdate()),
      otherbullets: objUpdates.otherNearbyBullets.map(b => b.serializeForUpdate()),
      boosters: objUpdates.boosters.map(b => b.serializeForUpdate()),
      smallmap: smallmap,
      leaderboard,
    };
  }
}

module.exports = Game;

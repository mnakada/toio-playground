//
// ToioConnect.js
//

'use strict';

const eventEmitter = require('events').EventEmitter;
const { NearestScanner } = require('@toio/scanner');

class ToioConnect extends eventEmitter {
  constructor() {
    super();
    this.Connect();
    this.runState = 0;
  }

  async Connect() {
    const cube = await new NearestScanner().start();
    await cube.connect().then((cube) => {
      console.log('Toio Linked!');
      this.cube = cube;

      cube.on('id:position-id', (data) => {
        data.x %= 500;
        data.y %= 500;
        data.sensorX %= 500;
        data.sensorY %= 500;
        this.cubePosition = data;
        this.emit('move', data);
      });
      cube.on('button:press', (data) => {
        if(data.pressed) this.emit('button', this.cubePosition);
      });
      cube.on('id:position-id-missed', () => {
        this.runState = 0;
      });
    });
  }

  Run(positions) {
    this.runPositions = positions;
    this.runState = 1;
    this.runCount = 0;
    this.RunSequence();
  }

  RunSequence() {
    if(!this.runState) return;

    if(this.runState === 1) { // goto start point
      if(!this.MoveTarget(this.runPositions[0])) {
        if(!this.runCount || this.runCount === 25) this.cube.playPresetSound(6);
        this.runCount++;
        this.runSequence = 0;
        this.runStartTime = new Date();
        if(this.runCount > 30) this.runState = 2;
      }
    }
    if(this.runState === 2) { // run
      const now = new Date() - this.runStartTime;
      for(; (this.runSequence < this.runPositions.length) &&  (this.runPositions[this.runSequence].time * 1000 <= now); this.runSequence++);
      if(this.runSequence < this.runPositions.length) {
        this.MoveTarget(this.runPositions[this.runSequence]);
      } else {
        this.runState = 3;
      }
    }
    if(this.runState === 3) { // goto end point
      if(!this.MoveTarget(this.runPositions[this.runPositions.length - 1])) {
        this.cube.playPresetSound(8);
        this.runState = 0;
      }
    }
    this.runTimer = setTimeout(this.RunSequence.bind(this), 10);
  }

  MoveTarget(target) {
    if(!this.cubePosition) return false;
    const distance = Math.hypot(target.x - this.cubePosition.x, target.y - this.cubePosition.y);
    if((this.runState !== 2) && (distance < 5)) {
      this.cube.move(0, 0, 0); // stop
      return false;
    }
    let realAngle = Math.atan2(target.y - this.cubePosition.y, target.x - this.cubePosition.x) * 180 / Math.PI - this.cubePosition.angle;
    realAngle %= 360;
    if(realAngle < -180) realAngle += 360;
    if(realAngle > 180) realAngle -= 360;

    let speed = distance + 10;
    if(speed > 100) speed = 100;
    const limit = speed;
    const k = Math.log10(distance); // slope factor
    let dv = realAngle * 0.4124 * k; // 13.3 * Math.PI / 180 * 100 * 60 / (430 * 12.5 * Math.PI * 0.1) / 2
    if(dv > limit) dv = limit;
    const lspeed = speed + dv;
    const rspeed = speed - dv;
    this.cube.move(lspeed, rspeed, 100);
    return true;
  }
}

module.exports = ToioConnect;

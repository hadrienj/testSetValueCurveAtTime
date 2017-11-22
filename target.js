class Target {
  constructor({
    SOA,
    freq,
    gain=0.1,
    toneDur=0.1,
  }={}) {
    Object.assign(this, {
      SOA,
      freq,
      gain,
      toneDur,
    });

    let audioCtx = window.AudioContext|| window.webkitAudioContext;
    this.context = new audioCtx();

    this.isPlaying = false;

    this.scheduleAheadTime = 0.2;
    this.nextNoteTime = 0.0;

    this.masterGain = this.context.createGain();
    this.masterGain.connect(this.context.destination);
  }
  play(counter) {
    this.nextNoteTime = this.context.currentTime;
    this.isPlaying = true;
    this.playOneTone(counter, this.nextNoteTime);
  }
  playOneTone(counter, nextNoteTime) {
    if (!this.isPlaying) {
      return;
    }
    while (nextNoteTime < this.context.currentTime + this.scheduleAheadTime) {


      const osc = this.context.createOscillator();

      this.masterGain.gain.value = this.gain;
      osc.type = 'sine';
      osc.frequency.value = this.freq;

      osc.connect(this.masterGain);
      // if (!this.analyser) {
      //   gain.connect(this.context.destination);
      // } else {
      //   gain.connect(this.analyser);
      //   this.analyser.connect(this.context.destination);
      // }
      this.applyRamps(this.context, this.masterGain, this.gain, nextNoteTime,
        this.toneDur, 0.01, 0.01);
      // console.log('play', nextNoteTime, nextNoteTime + this.toneDur);
      osc.start(nextNoteTime);
      osc.stop(nextNoteTime + this.toneDur);

      nextNoteTime += this.SOA;
    }
    setTimeout(() => {
      this.playOneTone(counter, nextNoteTime);
    }, 25);
  }
  applyRamps(context, gainNode, gainMax, nextNoteTime, dur, ascRampDur, descRampDur) {
    gainNode.gain.setValueCurveAtTime(this.cosSquared({
      direction: 'ascending',
      max: gainMax
    }),
      nextNoteTime , ascRampDur);
    gainNode.gain.setValueCurveAtTime(this.cosSquared({
      direction: 'descending',
      max: gainMax
    }),
      nextNoteTime + dur - descRampDur, descRampDur);
  };
  cosSquared({direction, min=0, max} = {}) {
    // Create a cosine squared up or down ramp
    var duration = (Math.PI)/2;
    var valueCount = 100;
    var waveArray = new Float32Array(valueCount);
    if (direction === 'ascending') {
      for (var i = 0; i < valueCount; i++) {
        var percent = (i / valueCount) * duration;
        waveArray[i] = Math.pow(Math.cos(percent+(3*Math.PI)/2), 2)*max;
        if (i == valueCount - 1) {
          waveArray[i] = max;
        }
      }
    } else if (direction === 'descending') {
      for (var i = 0; i < valueCount; i++) {
        var percent = (i / valueCount) * duration;
        waveArray[i] = Math.pow(Math.cos(percent), 2)*max;
        if (i == valueCount - 1) {
          waveArray[i] = 0;
        }
      }
    }
    var waveArrayFloat = new Float32Array(waveArray);
    return waveArrayFloat;
  }
}
let target = new Target({
  SOA: 1/13,
  freq: 1099,
})
target.play();
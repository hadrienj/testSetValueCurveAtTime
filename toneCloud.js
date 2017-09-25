class ToneCloud {
  constructor({
    toneDur=0.1,
    nTones=8,
    trialDur=-1,
    jitterMin=0.03,
    jitterMax=1.5
  } = {}) {
    Object.assign(this, {toneDur, nTones, jitterMin, jitterMax});

    let audioCtx = window.AudioContext|| window.webkitAudioContext;
    this.context = new audioCtx();

    this.isPlaying = false;
    this.scaledGain = 0.5/this.nTones;

    this.rampDur = 0.01;

    this.masterGain = this.context.createGain();
    this.masterGain.gain.value = 1;
    this.masterGain.connect(this.context.destination);

    this.scheduleAheadTime = 0.1;
    this.nextNoteTime = 0.0;

    this.rampAsc = this.cosSquared({
      direction: 'ascending',
      max: 0.5
    });
    this.rampDesc = this.cosSquared({
      direction: 'descending',
      max: 0.5
    });
  }
  start({triggerNum}={}) {
    this.nextNoteTime = this.context.currentTime;
    this.masterGain.gain.value = 0.2;

    for (var i=0; i<this.nTones; i++) {
      this.playTone({nextNoteTime: this.nextNoteTime});
    }
  }
  playTone({nextNoteTime, firstRecursion}={}) {
    while (nextNoteTime < this.context.currentTime + this.scheduleAheadTime) {
      let osc = this.context.createOscillator();
      osc.frequency.value = 400;

      let gain = this.context.createGain();
      gain.gain.value = this.scaledGain;

      osc.connect(gain);
      gain.connect(this.masterGain);

        var startOffset = (Math.random()*
          (this.jitterMax-this.jitterMin)+this.jitterMin)
        gain.gain.setValueCurveAtTime(this.rampAsc, nextNoteTime, this.rampDur);
        gain.gain.setValueCurveAtTime(this.rampDesc,
          nextNoteTime+this.toneDur-this.rampDur, this.rampDur);
        osc.start(nextNoteTime);
        osc.stop(nextNoteTime+this.toneDur);

      var isi = startOffset + this.toneDur;
      nextNoteTime += isi;
    }
    setTimeout(() => {
      this.playTone({nextNoteTime});
    }, 25);
  }
  stop() {
    this.isPlaying = false;
    this.masterGain.gain.value = 0;
  }
  cosSquared({direction, min=0, max} = {}) {
    // Create a cosine squared up or down ramp
    var duration = (Math.PI)/2;
    var valueCount = 5000;
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

var toneCloud = new ToneCloud({
  nTones: 30,
  toneGain: 0.5,
  toneDur: 0.05,
  jitterMin: 0.03,
  jitterMax: 1,
});

toneCloud.start();
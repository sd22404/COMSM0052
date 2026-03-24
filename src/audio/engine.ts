import { Instrument } from "@/common/types";

const midiToFreq = function(note: number): number {
	const A = 440;
	const freq = (A / 32) * (2 ** ((note - 9) / 12));
	return freq;
}

const semitoneToNote = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

export const midiToNote = function(midi: number): string {
	const noteIndex = midi % 12;
	const octave = Math.floor(midi / 12) - 1;
	if (octave < 0) return "0";
	return semitoneToNote[noteIndex] + octave.toString();
}

const SAMPLE_MAP: Map<number, string> = new Map([
	[58, "/COMSM0052/samples/kick.wav"],
	[59, "/COMSM0052/samples/snare.wav"],
	[60, "/COMSM0052/samples/hat.wav"],
]);

export class AudioEngine {
	private samples: Map<number, AudioBuffer> = new Map();
	private _vol: number = 100;
	private _bpm: number = 120;
	private gain!: GainNode;
	private ctx!: AudioContext;
	private init: boolean = false;

	start() {
		if (this.init) return;
		this.ctx = new AudioContext();
		this.gain = this.ctx.createGain();
		this.gain.connect(this.ctx.destination);
		this.vol = this._vol;
		this.loadSamples();
		this.init = true;
	}

	stop() {
		if (!this.init) return;
		this.ctx.close();
		this.init = false;
	}

	private async loadSamples() {
		for (const [midiNote, path] of SAMPLE_MAP.entries()) {
			try {
				const res = await fetch(path);
				const buf = await res.arrayBuffer();
				this.samples.set(midiNote, await this.ctx.decodeAudioData(buf));
			} catch (e) {
				console.error(`Failed to load sample #${midiNote}:`, e);
			}
		}
	}

	private playSample(note: number, time: number) {
		const buffer = this.samples.get(note);
		if (!buffer) return;
		console.log(`Playing sample for MIDI note ${note} at time ${time}`);
		const source = this.ctx.createBufferSource();
		source.buffer = buffer;
		source.connect(this.gain);
		source.start(time);
	}

	get vol() {
		return this._vol;
	}

	set vol(vol: number) {
		this._vol = vol;
		this.gain.gain.value = vol / 100 * 0.2;
	}

	get bpm() {
		return this._bpm;
	}

	set bpm(bpm: number) {
		this._bpm = bpm;
	}

	get currentTime() {
		return this.ctx.currentTime;
	}

	play(instrument: Instrument, note: number, duration?: number, time?: number) {
		const startTime = this.ctx.currentTime + (time || 0);
		const noteLength = duration || 1;

		switch (instrument) {
			case Instrument.DRUMS:
				this.playSample(note, startTime);
				break;
			case Instrument.SYNTH: {
				const gain = this.ctx.createGain();
				gain.gain.setValueAtTime(1, startTime);
				gain.gain.exponentialRampToValueAtTime(0.001, startTime + noteLength);
				gain.connect(this.gain);
				
				const osc = this.ctx.createOscillator();
				osc.frequency.value = midiToFreq(note);
				osc.connect(gain);
				
				osc.start(startTime);
				osc.stop(startTime + noteLength);
				break;
			}
			default:
				break;
		}
	}
}

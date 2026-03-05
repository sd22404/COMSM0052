import { Instrument } from "@/core/types";

var freq = require('notes-to-frequencies');

const SAMPLE_PATHS: Record<string, string> = {
	KICK: "/COMSM0052/samples/kick.wav",
	SNARE: "/COMSM0052/samples/snare.wav",
	HAT: "/COMSM0052/samples/hat.wav",
};

export class AudioEngine {
	private _samples: Record<string, AudioBuffer> = {};
	private _volume: number = 100;
	private _gain!: GainNode;
	private _bpm: number = 120;
	private _clickMs: number = 60000 / this._bpm / 4;
	private _audioContext!: AudioContext;
	private _initialized = false;

	init() {
		if (this._initialized) return;
		this._audioContext = new AudioContext();
		this._gain = this._audioContext.createGain();
		this._gain.connect(this._audioContext.destination);
		this._loadSamples();
		this._initialized = true;
	}

	private async _loadSamples() {
		for (const [name, path] of Object.entries(SAMPLE_PATHS)) {
			try {
				const res = await fetch(path);
				const buf = await res.arrayBuffer();
				this._samples[name] = await this._audioContext.decodeAudioData(buf);
			} catch (e) {
				console.error(`Failed to load sample ${name}:`, e);
			}
		}
	}

	private _playSample(name: string, time: number) {
		const buffer = this._samples[name];
		if (!buffer) return;
		const source = this._audioContext.createBufferSource();
		source.buffer = buffer;
		source.connect(this._gain);
		source.start(time);
	}

	get volume() {
		return this._volume;
	}

	set volume(volume: number) {
		this._volume = volume;
		this._gain.gain.value = volume / 100;
	}

	get bpm() {
		return this._bpm;
	}

	set bpm(bpm: number) {
		this._bpm = bpm;
		this._clickMs = 60000 / this._bpm / 4;
	}

	get clickMs() {
		return this._clickMs;
	}

	currentTime() {
		return this._audioContext.currentTime;
	}

	play(instrument: Instrument, note: string, beatDuration?: number, beatDelay?: number) {
		const startTime = this._audioContext.currentTime + (beatDelay || 0) * this._clickMs / 1000;

		switch (instrument) {
			case Instrument.DRUM:
				this._playSample(note, startTime);
				break;
			case Instrument.SYNTH: {
				const osc = this._audioContext.createOscillator();
				osc.connect(this._gain);
				osc.frequency.value = freq(note);
				osc.start(startTime);
				osc.stop(startTime + (beatDuration || 1) * this._clickMs / 1000);
				break;
			}
			default:
				break;
		}
	}
}

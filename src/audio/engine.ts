import { Instrument } from "@/core/types";

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
	[60, "/COMSM0052/samples/kick.wav"],
	[61, "/COMSM0052/samples/snare.wav"],
	[62, "/COMSM0052/samples/hat.wav"],
]);

export class AudioEngine {
	private _samples: Map<number, AudioBuffer> = new Map();	private _volume: number = 100;
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
		this.volume = this._volume;
		this._loadSamples();
		this._initialized = true;
	}

	private async _loadSamples() {
		for (const [key, path] of SAMPLE_MAP.entries()) {
			try {
				const res = await fetch(path);
				const buf = await res.arrayBuffer();
				this._samples.set(key, await this._audioContext.decodeAudioData(buf));
			} catch (e) {
				console.error(`Failed to load sample #${SAMPLE_MAP.get(key)}:`, e);
			}
		}
	}

	private _playSample(index: number, time: number) {
		const buffer = this._samples.get(index);
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
		this._gain.gain.value = volume / 100 * 0.2;
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

	play(instrument: Instrument, note: number, beatDuration?: number, beatDelay?: number) {
		const startTime = this._audioContext.currentTime + (beatDelay || 0) * this._clickMs / 1000;

		switch (instrument) {
			case Instrument.DRUMS:
				this._playSample(note, startTime);
				break;
			case Instrument.SYNTH: {
				const osc = this._audioContext.createOscillator();
				const gain = this._audioContext.createGain();
				osc.connect(gain);
				gain.connect(this._audioContext.destination);

				const attackTime = 0.01;
				const sustainLevel = this._gain.gain.value;
				gain.gain.setValueAtTime(0.001, startTime);
				gain.gain.linearRampToValueAtTime(sustainLevel, startTime + attackTime);
				gain.gain.linearRampToValueAtTime(0.001, startTime + (beatDuration || 1) * this._clickMs / 1000);

				osc.type = "sine";
				osc.frequency.value = midiToFreq(note);
				
				osc.start(startTime);
				osc.stop(startTime + (beatDuration || 1) * this._clickMs / 1000);
				break;
			}
			default:
				break;
		}
	}
}

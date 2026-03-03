import { Instrument } from "@/core/types";
import * as Tone from "tone";

export class AudioEngine {
	private _volume: number = 100;
	private _gain: GainNode;
	private _bpm: number = 120;
	private _clickMs: number = 60000 / this._bpm / 4;
	private _audioContext: AudioContext;

	constructor() {
		this._audioContext = new AudioContext();
		this._gain = this._audioContext.createGain();
		this._gain.connect(this._audioContext.destination);
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

	rest(duration: number) {
		return new Promise(resolve =>
			setTimeout(resolve, duration * this._clickMs)
		);
	}

	play(instrument: Instrument, note: string) {
		const osc = this._audioContext.createOscillator();
		osc.connect(this._gain);

		switch (instrument) {
			case Instrument.DRUM:
				switch (note) {
					case "KICK":
						osc.frequency.value = 200;
						break;
					case "SNARE":
						osc.frequency.value = 5000;
						break;
					case "HAT":
						osc.frequency.value = 10000;
						break;
				} break;
			case Instrument.SYNTH:
				osc.frequency.value = Tone.Frequency(note).toFrequency();
				break;
			default:
				break;
		}
		
		osc.start();
		osc.stop(this._audioContext.currentTime + this._clickMs / 1000);
	}
}

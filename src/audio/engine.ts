import { Instrument } from "@/core/types";
import * as Tone from "tone";

export class AudioEngine {
	private _volume: number = 100;
	private _bpm: number = 120;
	private _clickMs: number = 60000 / this._bpm / 4;

	get volume() {
		return this._volume;
	}

	set volume(volume: number) {
		this._volume = volume;
		Tone.getDestination().volume.value = (volume <= 0) ? -Infinity : 20 * Math.log10(volume / 100);
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

	start() {
		Tone.start();
	}

	play(instrument: Instrument, note: string) {
		switch (instrument) {
			case Instrument.DRUM:
				switch (note) {
					case "KICK":
						new Tone.MembraneSynth().toDestination().triggerAttackRelease("C0", "8n");
						break;
					case "SNARE":
						new Tone.NoiseSynth().toDestination().triggerAttackRelease("8n");
						break;
				} break;
			default:
				break;
		}
	}
}

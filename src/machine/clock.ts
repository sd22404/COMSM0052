import { ClockState } from "@/common/types";

const MIN_BPM = 1;
const SEEK_BEATS = 4;
const CLOCK_INTERVAL = 200;

function clampBpm(value: number) {
	return Math.max(MIN_BPM, value);
}

function clampBeat(value: number) {
	return Math.max(0, value);
}

export function createDefaultClock(): ClockState {
	return {
		bpm: 120,
		beat: 0,
	}
}

export class CPUClock {
	constructor(bpm = 120, onTick: (beat: number) => void) {
		this._bpm = clampBpm(bpm);
		this.onTick = onTick;
	}

	private _bpm: number;
	private _beat: number = 0;
	private interval?: NodeJS.Timeout;
	private onTick: (beat: number) => void;

	get bpm() {
		return this._bpm;
	}

	set bpm(nextBpm: number) {
		this._bpm = clampBpm(nextBpm);
	}

	get beat() {
		return this._beat;
	}

	get state(): ClockState {
		return {
			bpm: this._bpm,
			beat: this._beat,
		}
	}

	private tick() {
		this._beat = clampBeat(this._beat + SEEK_BEATS);
		this.onTick(this._beat);
	}

	start(startBeat = 0) {
		this._beat = clampBeat(startBeat);
		this.interval = setInterval(() => this.tick(), CLOCK_INTERVAL);
	}

	stop() {
		if (this.interval) {
			clearInterval(this.interval);
			this.interval = undefined;
		}
	}

	reset(startBeat = 0) {
		this._beat = clampBeat(startBeat);
		this.stop();
		this.start(this._beat);
	}
}

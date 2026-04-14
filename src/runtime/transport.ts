import { TransportState } from "@/common/types";

const MIN_BPM = 1;
const EPSILON = 1e-6;

const CLICK_PER_BEAT = 4;

interface PendingBPM {
	time: number;
	beat: number;
	bpm: number;
}

function clampBPM(value: number) { return Math.max(MIN_BPM, value); }
function clampBeat(value: number) { return Math.max(0, value); }

export function createDefaultTransport(): TransportState {
	return {
		bpm: 120,
		horizon: 0,
	};
}

export class Transport {
	constructor(bpm = 120) {
		const initialBPM = clampBPM(bpm);
		this.activeBPM = initialBPM;
		this.targetBPM = initialBPM;
	}

	private activeBPM: number;
	private targetBPM: number;
	private anchorTime = 0;
	private anchorBeat = 0;
	private horizonBeat = 0;
	private pendingBPM?: PendingBPM;

	get bpm() {
		return this.targetBPM;
	}

	get state(): TransportState {
		return {
			bpm: this.bpm,
			horizon: this.horizonBeat,
		};
	}

	private secondsPerBeat(bpm: number = this.activeBPM) { return 60 / (clampBPM(bpm) * CLICK_PER_BEAT); }
	private beatsToSeconds(beats: number, bpm: number = this.activeBPM) { return beats * this.secondsPerBeat(bpm); }
	private secondsToBeats(seconds: number, bpm: number = this.activeBPM) { return seconds / this.secondsPerBeat(bpm); }

	private applyBPM(now: number) {
		const pending = this.pendingBPM;
		if (!pending || now + EPSILON < pending.time) return;

		this.anchorTime = pending.time;
		this.anchorBeat = pending.beat;
		this.activeBPM = pending.bpm;
		this.pendingBPM = undefined;
	}

	start(audioTime: number, startBeat = this.anchorBeat) {
		this.anchorTime = audioTime;
		this.anchorBeat = clampBeat(startBeat);
		this.horizonBeat = this.anchorBeat;
		this.pendingBPM = undefined;
	}

	halt(audioTime: number) {
		this.applyBPM(audioTime);
		const beat = this.beatAt(audioTime);

		this.anchorTime = audioTime;
		this.anchorBeat = beat;
		this.horizonBeat = beat;
		this.activeBPM = this.targetBPM;
		this.pendingBPM = undefined;
	}

	reset() {
		this.anchorTime = 0;
		this.anchorBeat = 0;
		this.horizonBeat = 0;
		this.activeBPM = this.targetBPM;
		this.pendingBPM = undefined;
	}

	downBeatAt(audioTime: number) {
		const beat = this.beatAt(audioTime);
		return Math.max(0, Math.ceil((beat - EPSILON) / CLICK_PER_BEAT) * CLICK_PER_BEAT);
	}

	private beatAt(audioTime: number) {
		const clampedTime = Math.max(audioTime, this.anchorTime);
		const pending = this.pendingBPM;

		if (!pending || clampedTime + EPSILON < pending.time)
			return clampBeat(this.anchorBeat + this.secondsToBeats(clampedTime - this.anchorTime));

		return clampBeat(pending.beat + this.secondsToBeats(clampedTime - pending.time, pending.bpm));
	}

	timeAt(beat: number) {
		const clamped = clampBeat(beat);
		const pending = this.pendingBPM;

		if (!pending || clamped + EPSILON < pending.beat)
			return this.anchorTime + this.beatsToSeconds(clamped - this.anchorBeat);

		return pending.time + this.beatsToSeconds(clamped - pending.beat, pending.bpm);
	}

	makeDuration(fromBeat: number, toBeat: number) {
		const startBeat = clampBeat(fromBeat);
		const endBeat = clampBeat(toBeat);
		return Math.max(0, this.timeAt(endBeat) - this.timeAt(startBeat));
	}

	lookahead(audioTime: number, seconds: number): number | undefined {
		this.applyBPM(audioTime);

		const fromBeat = Math.max(this.horizonBeat, this.beatAt(audioTime));
		const toBeat = this.beatAt(audioTime + Math.max(0, seconds));

		if (toBeat <= fromBeat + EPSILON) return undefined;

		this.horizonBeat = toBeat;
		return toBeat;
	}

	setBPM(nextBPM: number, audioTime: number) {
		const bpm = clampBPM(nextBPM);
		this.targetBPM = bpm;
		this.applyBPM(audioTime);

		const currentBeat = this.beatAt(audioTime);
		if (this.horizonBeat <= currentBeat + EPSILON) {
			this.anchorTime = audioTime;
			this.anchorBeat = currentBeat;
			this.activeBPM = bpm;
			this.pendingBPM = undefined;
			return;
		}

		this.pendingBPM = {
			time: this.timeAt(this.horizonBeat),
			beat: this.horizonBeat,
			bpm,
		};
	}
}

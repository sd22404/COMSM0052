import { TransportState } from "@/common/types";

const MIN_BPM = 1;
const MAX_BPM = 300;
const EPSILON = 1e-6;

const TICKS_PER_BEAT = 4;

interface PendingBPM {
	time: number;
	tick: number;
	bpm: number;
}

function clampBPM(value: number) { return Math.min(Math.max(MIN_BPM, value), MAX_BPM); }
function clampTick(value: number) { return Math.max(0, value); }

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
	private anchorTick = 0;
	private horizonTick = 0;
	private pendingBPM?: PendingBPM;

	get bpm() {
		return this.targetBPM;
	}

	get state(): TransportState {
		return {
			bpm: this.bpm,
			horizon: this.horizonTick,
		};
	}

	private secondsPerTick(bpm: number = this.activeBPM) { return 60 / (clampBPM(bpm) * TICKS_PER_BEAT); }
	private ticksToSeconds(ticks: number, bpm: number = this.activeBPM) { return ticks * this.secondsPerTick(bpm); }
	private secondsToTicks(seconds: number, bpm: number = this.activeBPM) { return seconds / this.secondsPerTick(bpm); }

	private applyBPM(now: number) {
		const pending = this.pendingBPM;
		if (!pending || now + EPSILON < pending.time) return;

		this.anchorTime = pending.time;
		this.anchorTick = pending.tick;
		this.activeBPM = pending.bpm;
		this.pendingBPM = undefined;
	}

	start(audioTime: number, startTick = this.anchorTick) {
		this.anchorTime = audioTime;
		this.anchorTick = clampTick(startTick);
		this.horizonTick = this.anchorTick;
		this.pendingBPM = undefined;
	}

	halt(audioTime: number) {
		this.applyBPM(audioTime);
		const tick = this.tickAt(audioTime);

		this.anchorTime = audioTime;
		this.anchorTick = tick;
		this.horizonTick = tick;
		this.activeBPM = this.targetBPM;
		this.pendingBPM = undefined;
	}

	reset() {
		this.anchorTime = 0;
		this.anchorTick = 0;
		this.horizonTick = 0;
		this.activeBPM = this.targetBPM;
		this.pendingBPM = undefined;
	}

	downbeatAt(audioTime: number) {
		const tick = this.tickAt(audioTime);
		return Math.max(0, Math.ceil((tick - EPSILON) / TICKS_PER_BEAT) * TICKS_PER_BEAT);
	}

	private tickAt(audioTime: number) {
		const clampedTime = Math.max(audioTime, this.anchorTime);
		const pending = this.pendingBPM;

		if (!pending || clampedTime + EPSILON < pending.time)
			return clampTick(this.anchorTick + this.secondsToTicks(clampedTime - this.anchorTime));

		return clampTick(pending.tick + this.secondsToTicks(clampedTime - pending.time, pending.bpm));
	}

	timeAt(tick: number) {
		const clamped = clampTick(tick);
		const pending = this.pendingBPM;

		if (!pending || clamped + EPSILON < pending.tick)
			return this.anchorTime + this.ticksToSeconds(clamped - this.anchorTick);

		return pending.time + this.ticksToSeconds(clamped - pending.tick, pending.bpm);
	}

	makeDuration(fromTick: number, toTick: number) {
		const startTick = clampTick(fromTick);
		const endTick = clampTick(toTick);
		return Math.max(0, this.timeAt(endTick) - this.timeAt(startTick));
	}

	lookahead(audioTime: number, seconds: number): number | undefined {
		this.applyBPM(audioTime);

		const fromTick = Math.max(this.horizonTick, this.tickAt(audioTime));
		const toTick = this.tickAt(audioTime + Math.max(0, seconds));

		if (toTick <= fromTick + EPSILON) return undefined;

		this.horizonTick = toTick;
		return toTick;
	}

	setBPM(nextBPM: number, audioTime: number) {
		const bpm = clampBPM(nextBPM);
		this.targetBPM = bpm;
		this.applyBPM(audioTime);

		const currentTick = this.tickAt(audioTime);
		if (this.horizonTick <= currentTick + EPSILON) {
			this.anchorTime = audioTime;
			this.anchorTick = currentTick;
			this.activeBPM = bpm;
			this.pendingBPM = undefined;
			return;
		}

		this.pendingBPM = {
			time: this.timeAt(this.horizonTick),
			tick: this.horizonTick,
			bpm,
		};
	}
}

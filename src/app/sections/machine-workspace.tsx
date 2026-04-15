"use client";

import { CompileResult, Register, TutorialPanel } from "@/common/types";
import { useEffect, useMemo, useRef } from "react";
import { cn } from "../components/cn";
import useRuntime from "../hooks/useRuntime";
import useStorage from "../hooks/useStorage";
import Controls from "./controls";
import Core from "./core";
import Memory from "./memory";
import SampleSelector from "./sampler";

interface CoreLoadEvent {
	coreID: number;
	code: string;
	result: CompileResult;
}

interface MachineWorkspaceProps {
	storageScope: string;
	defaultCodeForCore: (coreID: number) => string;
	visibleCoreIDs?: number[];
	visiblePanels?: TutorialPanel[];
	className?: string;
	onCoreLoad?: (event: CoreLoadEvent) => void;
}

const DEFAULT_PANELS: TutorialPanel[] = ["controls", "memory", "samples"];

export default function MachineWorkspace({
	storageScope,
	defaultCodeForCore,
	visibleCoreIDs,
	visiblePanels = DEFAULT_PANELS,
	className,
	onCoreLoad,
}: MachineWorkspaceProps) {
	const {
		state: {
			running,
			cpu,
			highlights,
			samples,
		},
		run,
		halt,
		reset,
		load,
		setRegister,
		setEnabled,
		setParameter,
		setMemory,
		setSample,
	} = useRuntime();

	const { ready, storeCode, retrieveCode } = useStorage();
	const loadRef = useRef(load);
	const onCoreLoadRef = useRef(onCoreLoad);
	const defaultCodeRef = useRef(defaultCodeForCore);
	const resolvedCoreIDs = visibleCoreIDs ?? cpu.cores.map((core) => core.id);
	const resolvedCoreKey = resolvedCoreIDs.join(":");
	const visiblePanelSet = useMemo(() => new Set(visiblePanels), [visiblePanels]);

	useEffect(() => {
		loadRef.current = load;
	}, [load]);

	useEffect(() => {
		onCoreLoadRef.current = onCoreLoad;
	}, [onCoreLoad]);

	useEffect(() => {
		defaultCodeRef.current = defaultCodeForCore;
	}, [defaultCodeForCore]);

	useEffect(() => {
		if (!ready) return;
		const coreIDs = resolvedCoreKey
			? resolvedCoreKey.split(":").map((coreID) => parseInt(coreID, 10))
			: [];

		for (const coreID of coreIDs) {
			const code = retrieveCode(storageScope, coreID, defaultCodeRef.current(coreID));
			const result = loadRef.current(coreID, code);
			if (result.program)
				onCoreLoadRef.current?.({ coreID, code, result });
		}
	}, [ready, resolvedCoreKey, retrieveCode, storageScope]);

	function handleLoad(coreID: number, code: string) {
		const result = load(coreID, code);
		if (!result.program) return result;

		storeCode(storageScope, coreID, code);
		setEnabled(coreID, true);
		run();
		onCoreLoadRef.current?.({ coreID, code, result });
		return result;
	}

	return (
		<div className={cn("flex h-full min-h-0 w-full min-w-0 items-start gap-4 overflow-hidden", className)}>
			<div
				id="cores"
				className={cn(
					"grid h-full min-h-0 flex-1 auto-rows-fr gap-2",
					resolvedCoreIDs.length > 1 && "xl:grid-cols-2",
				)}
			>
				{cpu.cores
					.filter((state) => resolvedCoreIDs.includes(state.id))
					.map((state) => (
						<Core
							key={state.id}
							state={state}
							initialCode={retrieveCode(storageScope, state.id, defaultCodeForCore(state.id))}
							codeHighlights={highlights.code[state.id] ?? []}
							regHighlights={highlights.regs[state.id] ?? []}
							onRegisterChange={(reg: Register, val: number) => setRegister(state.id, reg, val)}
							onEnable={(enabled) => setEnabled(state.id, enabled)}
							onLoad={(code) => handleLoad(state.id, code)}
						/>
					))}
			</div>

			{visiblePanelSet.size > 0 && (
				<div className="flex h-full w-sm shrink-0 flex-col gap-2">
					{visiblePanelSet.has("controls") && (
						<Controls
							parameters={cpu.parameters}
							onParameterChange={setParameter}
							running={running}
							run={run}
							halt={halt}
							reset={reset}
						/>
					)}
					{visiblePanelSet.has("memory") && (
						<Memory
							memory={cpu.memory}
							highlights={highlights.memory}
							onMemoryChange={setMemory}
						/>
					)}
					{visiblePanelSet.has("samples") && (
						<SampleSelector samples={samples} onSampleChange={setSample} />
					)}
				</div>
			)}
		</div>
	);
}

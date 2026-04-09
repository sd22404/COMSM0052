import Card from "@/app/components/card";
import { Pill, PillButton } from "@/app/components/pill";
import { HighlightState, CoreState, Register } from "@/common/types";
import { useEffect, useState } from "react";
import Editor from "./editor";
import Registers from "./registers";
import { Subheading } from "../components/text";

interface CoreProps {
	state: CoreState;
	highlights: HighlightState["cores"][number];
	defaultCode: string;
	setRegister: (register: Register, value: number) => void;
	toggle: () => void;
	load: (code: string) => void;
}

function fetchCode(coreID: number, fallback: string) {
	return localStorage.getItem(`core-${coreID}-code`) ?? fallback;
}

export default function Core({ state, highlights, defaultCode, setRegister, toggle, load }: CoreProps) {
	const status = state.enabled ? "active" : "idle";
	const [initialCode, setInitialCode] = useState(defaultCode);
	const [draftCode, setDraftCode] = useState(defaultCode);
	const [loadedCode, setLoadedCode] = useState(defaultCode);
	const hasChanged = draftCode !== loadedCode;

	useEffect(() => {
		const code = fetchCode(state.id, defaultCode);
		setInitialCode(code);
		setDraftCode(code);
		setLoadedCode(code);
		load(code);
		if (localStorage.getItem(`core-${state.id}-enabled`) === "true") toggle();
	}, []);

	const handleLoad = (code: string) => {
		localStorage.setItem(`core-${state.id}-code`, code);
		setLoadedCode(code);
		load(code);
	};

	const handleToggle = () => {
		localStorage.setItem(`core-${state.id}-enabled`, JSON.stringify(!state.enabled));
		toggle();
	};

	return (
		<Card variant="panel" className="flex gap-6 h-full w-full min-w-0 min-h-0 p-4">
			<div className="flex min-w-0 flex-1 flex-col gap-3">
				<div className="flex items-center gap-4 overflow-auto">
					<Subheading className="truncate">Core {state.id}</Subheading>
					<div className="flex items-center gap-2">
						<PillButton variant={status} onClick={handleToggle}>
							{status}
						</PillButton>
						{hasChanged && (
							<Pill variant="warning" title="Press Ctrl+Enter in this editor to load changes.">
								unloaded
							</Pill>
						)}
					</div>
				</div>
				<Editor
					initialCode={initialCode}
					highlights={hasChanged ? [] : highlights.code}
					onChange={setDraftCode}
					onLoad={handleLoad}
				/>
			</div>
			<Registers registers={state.regs} highlights={highlights.regs} setRegister={setRegister} />
		</Card>
	);
}

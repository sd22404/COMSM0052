import Card from "@/app/components/card";
import { Pill, PillButton } from "@/app/components/pill";
import { CoreState, Register, CodeSpan, RegisterAccess } from "@/common/types";
import { useEffect, useState } from "react";
import Editor from "./editor";
import Registers from "./registers";
import { Subsubheading } from "../components/text";

interface CoreProps {
	state: CoreState;
	codeHighlights: CodeSpan[];
	regsHighlights: RegisterAccess[];
	defaultCode: string;
	setRegister: (register: Register, value: number) => void;
	toggle: () => void;
	load: (code: string) => void;
}

function fetchCode(coreID: number, fallback: string) {
	return localStorage.getItem(`core-${coreID}-code`) ?? fallback;
}

export default function Core({ state, codeHighlights, regsHighlights, defaultCode, setRegister, toggle, load }: CoreProps) {
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
		<Card variant="panel" className="flex gap-3 h-full w-full min-w-0 min-h-0">
			<div className="flex min-w-0 flex-1 flex-col gap-3">
				<div className="flex items-center justify-between">
					<div className="flex items-center gap-4 overflow-auto">
						<Subsubheading className="truncate">Core {state.id}</Subsubheading>
						<div className="flex items-center gap-2">
							<PillButton variant={status} size="sm" onClick={handleToggle}>
								{status}
							</PillButton>
							{hasChanged && (
								<Pill variant="warning" size="sm" title="Press Ctrl+Enter in this editor to load changes.">
									unloaded
								</Pill>
							)}
						</div>
					</div>
				</div>
				<div className="flex flex-1 min-h-0 gap-3 overflow-hidden">
					<Editor
						initialCode={initialCode}
						highlights={hasChanged ? [] : codeHighlights}
						onChange={setDraftCode}
						onLoad={handleLoad}
					/>
					<Registers
						registers={state.regs}
						highlights={regsHighlights} 
						setRegister={setRegister}
					/>
				</div>
			</div>
		</Card>
	);
}

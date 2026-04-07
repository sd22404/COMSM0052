import Card from "@/app/components/card";
import { Pill, PillButton } from "@/app/components/pill";
import { CoreState, Register } from "@/common/types";
import { useEffect, useState } from "react";
import Editor from "./editor";
import Registers from "./registers";
import { Subheading } from "../components/text";

interface CoreProps {
	state: CoreState;
	initialCode: string;
	onCodeChange: (code: string) => void;
	onRegisterChange: (register: Register, value: number) => void;
	toggleCore: () => void;
}

export default function Core({
	state,
	initialCode,
	onCodeChange,
	onRegisterChange,
	toggleCore,
}: CoreProps) {
	const status = state.enabled ? "active" : "idle";
	const [draftCode, setDraftCode] = useState(initialCode);
	const [loadedCode, setLoadedCode] = useState(initialCode);
	const hasChanged = draftCode !== loadedCode;

	useEffect(() => {
		const code = localStorage.getItem(`core-${state.id}-code`) ?? initialCode;
		setDraftCode(code);
		setLoadedCode(code);
		onCodeChange(code);
	}, [state.id, initialCode]);

	useEffect(() => {
		localStorage.getItem(`core-${state.id}-enabled`) === "true" && toggleCore();
	}, []);

	const handleLoadCode = (code: string) => {
		localStorage.setItem(`core-${state.id}-code`, code);
		onCodeChange(code);
		setLoadedCode(code);
	};

	const handleToggleCore = () => {
		localStorage.setItem(`core-${state.id}-enabled`, JSON.stringify(!state.enabled));
		toggleCore();
	};

	return (
		<Card variant="panel" className="flex gap-6 h-full w-full min-w-0 min-h-0 p-4">
			<div className="flex min-w-0 flex-1 flex-col gap-3">
				<div className="flex items-center gap-4 overflow-auto">
					<Subheading className="truncate">Core {state.id}</Subheading>
					<div className="flex items-center gap-2">
						<PillButton variant={status} onClick={handleToggleCore}>
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
					initialCode={loadedCode}
					onCodeChange={handleLoadCode}
					onDraftChange={setDraftCode}
				/>
			</div>
			<Registers registers={state.regs} onRegisterChange={onRegisterChange} />
		</Card>
	);
}

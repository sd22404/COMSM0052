import Card from "@/app/components/card";
import { Pill, PillButton } from "@/app/components/pill";
import { CoreState, Register } from "@/common/types";
import { useEffect, useState } from "react";
import Editor from "./editor";
import Registers from "./registers";
import { Subheading } from "../components/text";

interface CoreProps {
	coreId: number;
	state: CoreState;
	initialCode: string;
	onCodeChange: (code: string) => void;
	onRegisterChange: (register: Register, value: number) => void;
	toggleCore: () => void;
}

export default function Core({
	coreId,
	state,
	initialCode,
	onCodeChange,
	onRegisterChange,
	toggleCore,
}: CoreProps) {
	const status = state.enabled ? "active" : "idle";
	const [draftCode, setDraftCode] = useState(initialCode);
	const [loadedCode, setLoadedCode] = useState(initialCode);
	const hasUnloadedChanges = draftCode !== loadedCode;

	useEffect(() => {
		setDraftCode(initialCode);
		setLoadedCode(initialCode);
	}, [initialCode]);

	const handleLoadCode = (code: string) => {
		onCodeChange(code);
		setLoadedCode(code);
	};

	return (
		<Card variant="panel" className="flex gap-6 h-full w-full min-w-0 min-h-0 p-4">
			<div className="flex min-w-0 flex-1 flex-col gap-3">
				<div className="flex items-center gap-4 overflow-auto">
					<Subheading className="truncate">Core {coreId}</Subheading>
					<div className="flex items-center gap-2">
						<PillButton variant={status} onClick={toggleCore}>
							{status}
						</PillButton>
						{hasUnloadedChanges && (
							<Pill variant="warning" title="Press Ctrl+Enter in this editor to load changes.">
								unloaded
							</Pill>
						)}
					</div>
				</div>
				<Editor
					initialCode={initialCode}
					onCodeChange={handleLoadCode}
					onDraftChange={setDraftCode}
				/>
			</div>
			<Registers registers={state.regs} onRegisterChange={onRegisterChange} />
		</Card>
	);
}

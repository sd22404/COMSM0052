import Card from "@/app/components/card";
import { PillButton } from "@/app/components/pill";
import { CoreState, Register } from "@/common/types";
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
	const statusVariant = state.enabled ? "active" : "idle";
	const statusLabel = state.enabled ? "active" : "idle";

	return (
		<Card variant="panel" className="flex gap-6 h-full w-full min-w-0 min-h-0 p-4">
			<div className="flex min-w-0 flex-1 flex-col gap-3">
				<div className="flex items-center gap-4">
					<Subheading>Core {coreId}</Subheading>
					<PillButton variant={statusVariant} onClick={toggleCore}>
						{statusLabel}
					</PillButton>
				</div>
				<Editor
					initialCode={initialCode}
					onCodeChange={onCodeChange}
				/>
			</div>
			<Registers registers={state.regs} onRegisterChange={onRegisterChange} />
		</Card>
	);
}

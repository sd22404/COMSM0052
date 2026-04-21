import Card from "@/app/components/card";
import Pill from "@/app/components/pill";
import Tooltip from "@/app/components/tooltip";
import { Body, Subsubheading } from "@/app/components/text";
import { Compiler } from "@/language/compiler";
import { CompileResult, CodeSpan, CoreState, hasErrors, Register, RegisterAccess } from "@/common/types";
import { useEffect, useMemo, useState } from "react";
import Editor from "./editor";
import Registers from "./registers";
import { cn } from "../components/cn";

interface CoreProps {
	state: CoreState;
	initialCode: string;
	codeHighlights: CodeSpan[];
	regHighlights: RegisterAccess[];
	onRegisterChange: (register: Register, value: number) => void;
	onEnable: (enabled: boolean) => void;
	onLoad: (code: string) => CompileResult;
}

export default function Core({
	state,
	initialCode,
	codeHighlights,
	regHighlights,
	onRegisterChange,
	onEnable,
	onLoad,
}: CoreProps) {
	const [draftCode, setDraftCode] = useState(initialCode);
	const [loadedCode, setLoadedCode] = useState(initialCode);

	useEffect(() => {
		setDraftCode(initialCode);
		setLoadedCode(initialCode);
	}, [initialCode]);

	const validation = useMemo(() => Compiler.compile(draftCode), [draftCode]);
	const invalid = hasErrors(validation.diagnostics);
	const hasChanged = draftCode !== loadedCode;
	const status = state.enabled ? "active" : "idle";
	const message = state.fault?.message;

	return (
		<Card id={`core-${state.id}`} variant="panel" className="flex h-full min-h-0 w-full min-w-0 gap-3">
			<div className="flex min-w-0 flex-1 flex-col gap-3">
				<div className="flex items-center justify-between gap-3">
					<div className="flex min-w-0 items-center gap-4">
						<Subsubheading tone="blue" className="min-w-0 flex-1 truncate">Core {state.id}</Subsubheading>
							<div className="flex items-center gap-2">
								<Tooltip text="click to enable/disable" align="end" className="shrink-0">
									<Pill type="button" variant={status} size="sm" onClick={() => onEnable(!state.enabled)}>
										{status}
									</Pill>
								</Tooltip>
								{state.fault && 
								<Tooltip text="a runtime error has occurred" align="end" className="shrink-0">
									<Pill variant="danger" size="sm">faulted</Pill>
								</Tooltip>}
								{!state.fault && invalid &&
								<Tooltip text="the code contains errors" align="end" className="shrink-0">
									<Pill variant="danger" size="sm">invalid</Pill>
								</Tooltip>}
								{!state.fault && hasChanged &&
								<Tooltip text="press CTRL+ENTER to load" align="end" className="shrink-0">
									<Pill variant="warning" size="sm">unloaded</Pill>
								</Tooltip>}
							</div>
					</div>
				</div>

				{message && (
					<Card variant="surface" className="p-2">
						<Body className={cn("text-sm", state.fault ? "text-ctp-red" : "text-ctp-yellow")}>
							{message}
						</Body>
					</Card>
				)}

				<div className="flex flex-1 min-h-0 gap-3 overflow-hidden">
					<Editor
						id={`core-${state.id}-editor`}
						initialCode={initialCode}
						fault={state.fault}
						highlights={(hasChanged || invalid) ? [] : codeHighlights}
						onChange={(code) => setDraftCode(code)}
						onLoad={(code) => {
							const asm = onLoad(code);
							if (asm.program) setLoadedCode(code);
						}}
					/>
					<Registers
						id={`core-${state.id}-registers`}
						registers={state.regs}
						highlights={regHighlights}
						onRegisterChange={onRegisterChange}
					/>
				</div>
			</div>
		</Card>
	);
}

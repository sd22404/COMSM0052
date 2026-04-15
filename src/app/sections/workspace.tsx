"use client";

import { getDefaultCode } from "@/common/types";
import MachineWorkspace from "./machine-workspace";

export default function Workspace() {
	return (
		<div className="h-screen w-screen px-4 pb-4 pt-16">
			<MachineWorkspace
				storageScope="app"
				defaultCodeForCore={getDefaultCode}
			/>
		</div>
	);
}

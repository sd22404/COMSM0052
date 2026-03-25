"use client";

import Editor from "./components/editor";
import Registers from "./components/registers";
import Memory from "./components/memory";
import Header from "./components/header";
import Help from "./components/help";
import useRuntime from "./hooks/useRuntime";
import { useState } from "react";

export default function Home() {
	const { running, registers, memory, cursors, run, halt, setCode, setRegister, setMemory } = useRuntime();
	const [stringView, setStringView] = useState<boolean>(false);
	const [showHelp, setShowHelp] = useState<boolean>(false);

	return (
		<div>
			<Header />
			<div className="w-screen h-screen pt-26 pb-10 px-10 flex gap-8">
				<div className="w-full h-full flex flex-1 flex-col gap-8">
					<Editor onCodeChange={setCode} cursors={cursors} />
				</div>
				<div className="w-full h-full flex flex-1 flex-col gap-8">
					<div className="overflow-hidden flex flex-col gap-8 items-end">
						<span className="flex gap-4">
							<button onClick={running ? halt : run} className={`p-2 min-w-[100px] font-mono rounded ${running ? "bg-red-500 hover:bg-red-600" : "bg-blue-500 hover:bg-blue-600"} hover:cursor-pointer`}>
								{running ? "STOP" : "PLAY"}
							</button>
							<button onClick={() => setShowHelp(!showHelp)} className={`p-2 min-w-[100px] font-mono rounded ${showHelp ? "bg-red-500 hover:bg-red-600" : "bg-blue-500 hover:bg-blue-600"} hover:cursor-pointer`}>
								Toggle Help
							</button>
							<button className={`${stringView ? "bg-red-500 hover:bg-red-600" : "bg-blue-500 hover:bg-blue-600"} p-2 text-sm font-mono rounded hover:cursor-pointer`} onClick={() => setStringView(v => !v)}>
								Toggle Note View
							</button>
						</span>

						{showHelp ?
							<Help />
							: 
							<div className="overflow-scroll font-mono flex flex-col gap-8 items-end">
								<Registers registers={registers} onRegisterChange={setRegister} />
								<Memory memory={memory} onMemoryChange={setMemory} stringView={stringView} />
							</div>
						}
					</div>
				</div>
			</div>
		</div>
	);
}

"use client";

import Editor from "./components/editor";
import Registers from "./components/registers";
import Memory from "./components/memory";
import Help from "./components/help";
import useRuntime from "./hooks/useRuntime";

export default function Home() {
	const { running, registers, memory, highlights, run, halt, setCode, setRegister, setAddress } = useRuntime();

	return (
		<div className="w-screen h-screen py-20 px-20 flex gap-8 font-mono">
			<div className="w-full h-full flex flex-1 flex-col gap-8">
				<Editor onCodeChange={(code) => { setCode(code); run(); }} />
			</div>
			<div className="w-full h-full flex flex-1 flex-col gap-8">
				<div className="overflow-auto flex flex-col gap-8 items-end">
					<Registers registers={registers} onRegisterChange={setRegister} />
					<Memory memory={memory} onMemoryChange={setAddress} />
				</div>
				<span className="flex justify-end gap-4">
					<Help />
					<button onClick={running ? halt : run} className={`p-2 min-w-[100px] rounded ${running ? "bg-red-500 hover:bg-red-600" : "bg-blue-500 hover:bg-blue-600"} hover:cursor-pointer`}>
						{running ? "Stop Audio" : "Start Audio"}
					</button>
				</span>
			</div>
		</div>
	);
}

import { CoreState } from "@/common/types";

export default function Cores({ cores, toggleCore }: { cores: CoreState[]; toggleCore: (index: number) => void }) {
	return (
		<div className="grid grid-cols-4 grid-rows-2 gap-4">
			{cores.map((core, i) => (
				core.active ? (
					<button key={i} className="bg-blue-600 rounded p-4 flex flex-col gap-2 hover:cursor-pointer" onClick={() => toggleCore(i)}>
						<div className="text-sm text-white">Core {i}</div>
						<div className="h-4 bg-blue-500 rounded" />
						<div className="h-4 bg-blue-500 rounded" />
						<div className="h-4 bg-blue-500 rounded" />
					</button>
				) : (
					<button key={i} className="bg-neutral-800 rounded p-4 flex flex-col gap-2 hover:cursor-pointer" onClick={() => toggleCore(i)}>
						<div className="text-sm text-neutral-500">Core {i}</div>
						<div className="h-4 bg-neutral-700 rounded" />
						<div className="h-4 bg-neutral-700 rounded" />
						<div className="h-4 bg-neutral-700 rounded" />
					</button>
				)
			))}
		</div>
	)
}

import { Tutorial, createDefaultTutorial } from "@/app/hooks/tutorial";
import { TutorialState } from "@/common/types";

import { useEffect, useState } from "react";

interface TutorialHook {
	state: TutorialState;
	next: () => void;
}
	
export default function useTutorial(): TutorialHook {
	const [tutorial] = useState(() => new Tutorial());
	const [state, setState] = useState<TutorialState>(createDefaultTutorial);

	useEffect(() => {
		tutorial.setBroadcast(setState);
		return () => tutorial.reset();
	}, [tutorial]);

	return {
		state,
		next: () => tutorial.next()
	};
}

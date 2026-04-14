import { getDefaultCode } from "@/common/types";
import { useCallback, useEffect, useState } from "react";

interface StorageHook {
	isClient: boolean;
	storeCode: (coreID: number, code: string) => void;
	retrieveCode: (coreID: number) => string;
	storeTutorialComplete: (complete: boolean) => void;
	retrieveTutorialComplete: () => boolean;
}

export default function useStorage(): StorageHook {
	const [isClient, setIsClient] = useState(false);

	useEffect(() => {
		setIsClient(true);
	}, []);

	const storeCode = useCallback((coreID: number, code: string) => {
		if (!isClient) return;
		localStorage.setItem(`core-${coreID}`, code);
	}, [isClient]);

	const retrieveCode = useCallback((coreID: number): string => {
		if (!isClient) return getDefaultCode(coreID);
		const value = localStorage.getItem(`core-${coreID}`);
		if (value) return value;
		return getDefaultCode(coreID);
	}, [isClient]);

	const storeTutorialComplete = useCallback((complete: boolean) => {
		if (!isClient) return;
		localStorage.setItem("tutorial-complete", complete.valueOf().toString());
	}, [isClient]);

	const retrieveTutorialComplete = useCallback(() => {
		if (!isClient) return false;
		const value = localStorage.getItem("tutorial-complete");
		return value === "true";
	}, [isClient]);

	return { isClient, storeCode, retrieveCode, storeTutorialComplete, retrieveTutorialComplete };
}

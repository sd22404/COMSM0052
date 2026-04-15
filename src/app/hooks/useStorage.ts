import { getDefaultCode } from "@/common/types";
import { useCallback } from "react";

interface StorageHook {
	isClient: boolean;
	storeCode: (coreID: number, code: string) => void;
	retrieveCode: (coreID: number) => string;
}

export default function useStorage(): StorageHook {
	const isClient = typeof window !== "undefined";

	const storeCode = useCallback((coreID: number, code: string) => {
		if (typeof window === "undefined") return;
		localStorage.setItem(`core-${coreID}`, code);
	}, []);

	const retrieveCode = useCallback((coreID: number): string => {
		if (typeof window === "undefined") return getDefaultCode(coreID);
		const value = localStorage.getItem(`core-${coreID}`);
		if (value) return value;
		return getDefaultCode(coreID);
	}, []);

	return { isClient, storeCode, retrieveCode };
}

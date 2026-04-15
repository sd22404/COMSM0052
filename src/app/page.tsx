"use client";

import Background from "@/app/components/background";
import Card from "@/app/components/card";
import { Subheading } from "@/app/components/text";
import useStorage from "@/app/hooks/useStorage";
import Header from "@/app/sections/header";
import Workspace from "@/app/sections/workspace";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

function LoadingShell() {
	return (
		<Background className="min-h-screen">
			<Header />
			<div className="flex h-screen items-center justify-center px-4 pt-12">
				<Card variant="panel" className="w-full max-w-md">
					<Subheading tone="mauve">Preparing workspace…</Subheading>
				</Card>
			</div>
		</Background>
	);
}

export default function Home() {
	const router = useRouter();
	const { ready, shouldRedirectToTutorial } = useStorage();

	useEffect(() => {
		if (!shouldRedirectToTutorial) return;
		router.replace("/tutorial");
	}, [router, shouldRedirectToTutorial]);

	if (!ready || shouldRedirectToTutorial) return <LoadingShell />;

	return (
		<Background>
			<Header />
			<Workspace />
		</Background>
	);
}

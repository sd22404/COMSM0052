"use client";

import Background from "@/app/components/background";
import Button from "@/app/components/button";
import Card from "@/app/components/card";
import { Body, Eyebrow, Heading, Subheading } from "@/app/components/text";
import useStorage from "@/app/hooks/useStorage";
import Header from "@/app/sections/header";
import MachineWorkspace from "@/app/sections/machine-workspace";
import TutorialSpotlight from "@/app/sections/tutorial";
import { getDefaultCode } from "@/common/types";
import { CODE_LESSONS, TOUR_STEPS } from "@/tutorial/lessons";
import { useRouter } from "next/navigation";
import { useCallback, useMemo, useState } from "react";

const TOUR_CORE_IDS = [0, 1];
const TOUR_PANELS: Array<"controls" | "memory" | "samples"> = ["controls", "memory", "samples"];

function LoadingShell() {
	return (
		<Background className="min-h-screen">
			<Header />
			<div className="flex h-screen items-center justify-center px-4 pt-12">
				<Card variant="panel" className="w-full max-w-md">
					<Subheading tone="mauve">Preparing tutorial…</Subheading>
				</Card>
			</div>
		</Background>
	);
}

function CompletionView({
	onRestart,
	onOpenApp,
}: {
	onRestart: () => void;
	onOpenApp: () => void;
}) {
	return (
		<Background className="min-h-screen">
			<Header />
			<div className="flex h-screen items-center justify-center px-4 pt-12">
				<Card variant="panel" className="flex w-full max-w-2xl flex-col gap-4">
					<Eyebrow tone="green">Tutorial Complete</Eyebrow>
					<Heading tone="green">You have finished the guided path.</Heading>
					<Body tone="subtle">
						The main workspace will now open without redirecting. You can return here
						any time to review the lessons or restart the tutorial from the beginning.
					</Body>
					<div className="grid gap-2 sm:grid-cols-2">
						<Button variant="primary" onClick={onOpenApp}>
							Open the app
						</Button>
						<Button variant="secondary" onClick={onRestart}>
							Restart tutorial
						</Button>
					</div>
				</Card>
			</div>
		</Background>
	);
}

export default function TutorialPage() {
	const router = useRouter();
	const {
		ready,
		tutorialStatus,
		setTutorialStatus,
		resetTutorialStatus,
		clearCodeScope,
		clearCodeScopes,
	} = useStorage();
	const [workspaceVersion, setWorkspaceVersion] = useState(0);
	const [lessonLoads, setLessonLoads] = useState<Record<string, number[]>>({});

	const tourStepIndex = useMemo(
		() => Math.min(tutorialStatus.progress.tourStep, TOUR_STEPS.length - 1),
		[tutorialStatus.progress.tourStep],
	);
	const lessonIndex = useMemo(
		() => Math.min(tutorialStatus.progress.lessonIndex, CODE_LESSONS.length - 1),
		[tutorialStatus.progress.lessonIndex],
	);
	const inTour = tutorialStatus.progress.phase === "tour";
	const activeLesson = inTour ? undefined : CODE_LESSONS[lessonIndex];
	const activeStep = inTour ? TOUR_STEPS[tourStepIndex] : undefined;
	const lessonScope = activeLesson ? `tutorial:lesson:${activeLesson.id}` : undefined;
	const lessonCodeMap = useMemo(
		() => new Map(activeLesson?.cores.map((core) => [core.coreID, core.starterCode]) ?? []),
		[activeLesson],
	);
	const loadedCoreIDs = activeLesson ? lessonLoads[activeLesson.id] ?? [] : [];
	const lessonReady =
		activeLesson
			? activeLesson.requiredCoreIDs.every((coreID) => loadedCoreIDs.includes(coreID))
			: false;

	const handleLessonLoad = useCallback((coreID: number) => {
		if (!activeLesson) return;
		setLessonLoads((current) => {
			const existing = current[activeLesson.id] ?? [];
			if (existing.includes(coreID)) return current;

			return {
				...current,
				[activeLesson.id]: [...existing, coreID],
			};
		});
	}, [activeLesson]);

	const lessonDefaultCode = useCallback((coreID: number) => {
		return lessonCodeMap.get(coreID) ?? getDefaultCode(coreID);
	}, [lessonCodeMap]);

	function handleSkip() {
		setTutorialStatus((current) => ({
			...current,
			skipped: true,
		}));
		router.replace("/");
	}

	function handleRestart() {
		clearCodeScopes("tutorial:");
		setLessonLoads({});
		setWorkspaceVersion((current) => current + 1);
		resetTutorialStatus();
	}

	function handleResetCurrentLesson() {
		if (!activeLesson || !lessonScope) return;

		clearCodeScope(lessonScope);
		setLessonLoads((current) => ({
			...current,
			[activeLesson.id]: [],
		}));
		setWorkspaceVersion((current) => current + 1);
	}

	function handleAdvanceTour() {
		if (tourStepIndex + 1 < TOUR_STEPS.length) {
			setTutorialStatus((current) => ({
				...current,
				progress: {
					...current.progress,
					phase: "tour",
					tourStep: tourStepIndex + 1,
				},
			}));
			return;
		}

		setTutorialStatus((current) => ({
			...current,
			progress: {
				phase: "lessons",
				tourStep: TOUR_STEPS.length - 1,
				lessonIndex: 0,
			},
		}));
	}

	function handleAdvanceLesson() {
		if (!activeLesson || !lessonReady) return;

		if (lessonIndex + 1 < CODE_LESSONS.length) {
			setTutorialStatus((current) => ({
				...current,
				progress: {
					...current.progress,
					phase: "lessons",
					lessonIndex: lessonIndex + 1,
				},
			}));
			return;
		}

		setTutorialStatus((current) => ({
			...current,
			completed: true,
			skipped: false,
			progress: {
				...current.progress,
				phase: "lessons",
				lessonIndex,
			},
		}));
	}

	if (!ready) return <LoadingShell />;
	if (tutorialStatus.completed)
		return (
			<CompletionView
				onRestart={handleRestart}
				onOpenApp={() => router.push("/")}
			/>
		);

	return (
		<Background className="min-h-screen">
			<Header />
			<div className="h-screen px-4 pb-4 pt-16">
				<div className="flex h-full min-h-0 flex-col gap-4 lg:flex-row">
					<aside className="flex w-full shrink-0 flex-col gap-4 overflow-y-auto lg:w-[24rem]">
						<Card variant="panel" className="flex flex-col gap-3" id="tutorial-guide">
							<Eyebrow tone="mauve">
								{inTour
									? `Phase 1 of 2 · Tour ${tourStepIndex + 1}/${TOUR_STEPS.length}`
									: `Phase 2 of 2 · Lesson ${lessonIndex + 1}/${CODE_LESSONS.length}`}
							</Eyebrow>
							<Heading tone="mauve">
								{inTour ? "Interface tour" : activeLesson?.title}
							</Heading>
							{/* <Body tone="subtle">
								{inTour
									? "Use the spotlight prompts to walk through the interface. When the tour ends, the lesson panel here will switch to hands-on exercises."
									: activeLesson?.summary}
							</Body> */}

							{!inTour && activeLesson && (
								<>
									<Card variant="surface" className="flex flex-col gap-2">
										<Eyebrow tone="blue">Concept</Eyebrow>
										<Body>{activeLesson.concept}</Body>
									</Card>

									<div className="flex flex-col gap-2">
										<Subheading tone="blue">Instructions</Subheading>
										<ul className="space-y-2 text-sm text-ctp-subtext0">
											{activeLesson.instructions.map((instruction) => (
												<li key={instruction} className="leading-relaxed">
													{instruction}
												</li>
											))}
										</ul>
									</div>

									{/* <div className="flex flex-col gap-2">
										<Subheading tone="green">Visible Cores</Subheading>
										{activeLesson.cores.map((core) => (
											<Card key={core.coreID} variant="surface" className="flex flex-col gap-1">
												<Eyebrow tone="green">{core.title}</Eyebrow>
												<Body className="text-sm">{core.description}</Body>
											</Card>
										))}
									</div> */}

									{activeLesson.hints && (
										<div className="flex flex-col gap-2">
											<Subheading tone="peach">Hints</Subheading>
											<ul className="space-y-2 text-sm text-ctp-subtext0">
												{activeLesson.hints.map((hint) => (
													<li key={hint} className="leading-relaxed">
														{hint}
													</li>
												))}
											</ul>
										</div>
									)}

									<Card variant="surface" className="flex flex-col gap-2">
										<Eyebrow tone={lessonReady ? "green" : "default"}>
											{lessonReady ? "Ready to continue" : "Waiting for valid loads"}
										</Eyebrow>
										<Body>
											Loaded cores: {loadedCoreIDs.length}/{activeLesson.requiredCoreIDs.length}
										</Body>
										{/* <Body tone="subtle">{activeLesson.successText}</Body> */}
									</Card>

									<div className="grid gap-2 sm:grid-cols-2">
										<Button
											variant="primary"
											onClick={handleAdvanceLesson}
											disabled={!lessonReady}
										>
											{activeLesson.continueText || "Continue"}
										</Button>
										<Button variant="secondary" onClick={handleResetCurrentLesson}>
											Reset lesson code
										</Button>
									</div>
								</>
							)}
						</Card>

						<Card variant="panel" className="flex flex-col gap-3">
							<Subheading tone="green">Tutorial Controls</Subheading>
							<Body tone="subtle">
								Skipping preserves your current progress and stops future redirects from
								the home page until you finish the tutorial.
							</Body>
							<div className="grid gap-2">
								<Button variant="secondary" onClick={handleSkip}>
									Skip for now
								</Button>
								<Button variant="ghost" onClick={handleRestart}>
									Restart tutorial
								</Button>
								<Button variant="ghost" onClick={() => router.push("/")}>
									Back to the app
								</Button>
							</div>
						</Card>
					</aside>

					<div className="min-h-[28rem] min-w-0 flex-1">
						{inTour ? (
							<>
								<TutorialSpotlight
									step={activeStep ?? TOUR_STEPS[0]}
									stepIndex={tourStepIndex}
									stepCount={TOUR_STEPS.length}
									onNext={handleAdvanceTour}
								/>
								<MachineWorkspace
									key={`tutorial-tour:${workspaceVersion}`}
									storageScope="tutorial:tour"
									defaultCodeForCore={getDefaultCode}
									visibleCoreIDs={TOUR_CORE_IDS}
									visiblePanels={TOUR_PANELS}
									className="h-full"
								/>
							</>
						) : activeLesson && lessonScope ? (
							<MachineWorkspace
								key={`${lessonScope}:${workspaceVersion}`}
								storageScope={lessonScope}
								defaultCodeForCore={lessonDefaultCode}
								visibleCoreIDs={activeLesson.visibleCoreIDs}
								visiblePanels={activeLesson.visiblePanels}
								className="h-full"
								onCoreLoad={({ coreID, result }) => {
									if (!result.program) return;
									handleLessonLoad(coreID);
								}}
							/>
						) : null}
					</div>
				</div>
			</div>
		</Background>
	);
}

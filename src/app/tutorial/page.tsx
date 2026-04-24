"use client";

import Background from "@/app/components/background";
import Button from "@/app/components/button";
import Card from "@/app/components/card";
import { Body, Eyebrow, Heading, Subheading } from "@/app/components/text";
import useStorage from "@/app/hooks/useStorage";
import Header from "@/app/sections/header";
import Workspace from "@/app/sections/workspace";
import TutorialSpotlight from "@/app/sections/tutorial";
import { getDefaultCode, type LessonStepType } from "@/common/types";
import { CODE_LESSONS } from "@/tutorial/lessons";
import { useRouter } from "next/navigation";
import { useCallback, useMemo, useState } from "react";

const TUTORIAL_SCOPE_PREFIX = "tutorial:inline:";
const STEP_TYPE_LABELS: Record<LessonStepType, string> = {
	guide: "Guide",
	concept: "Concept",
	syntax: "Syntax",
	system: "What happens",
	task: "Task",
};

function InlineText({ text }: { text: string }) {
	return (
		<>
			{text.split(/(`[^`]+`)/g).map((part, index) => {
				if (part.startsWith("`") && part.endsWith("`")) {
					return (
						<code key={index} className="rounded bg-ctp-crust px-1 py-0.5 text-ctp-text">
							{part.slice(1, -1)}
						</code>
					);
				}

				return <span key={index}>{part}</span>;
			})}
		</>
	);
}

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
					<Heading tone="green">Tutorial Complete</Heading>
					<Body tone="subtle">
						You can return here at any time with the link in the top right corner to review the lessons or restart the tutorial.
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

	const lessonIndex = useMemo(
		() => Math.min(tutorialStatus.progress.lessonIndex, CODE_LESSONS.length - 1),
		[tutorialStatus.progress.lessonIndex],
	);
	const activeLesson = CODE_LESSONS[lessonIndex];
	const lessonStepIndex = useMemo(() => {
		return Math.min(tutorialStatus.progress.lessonStep, activeLesson.steps.length - 1);
	}, [activeLesson.steps.length, tutorialStatus.progress.lessonStep]);
	const activeLessonStep = activeLesson.steps[lessonStepIndex];
	const spotlightAnchorIDs = useMemo(() => {
		if (!activeLessonStep?.spotlightTargets?.length) return [];
		return Array.from(new Set(["tutorial-guide", ...activeLessonStep.spotlightTargets]));
	}, [activeLessonStep]);
	const lessonScope = `${TUTORIAL_SCOPE_PREFIX}lesson:${activeLesson.id}`;
	const lessonCoreIDs = useMemo(
		() => activeLesson.cores.map((core) => core.coreID),
		[activeLesson],
	);
	const lessonCodeMap = useMemo(
		() => new Map(activeLesson.cores.map((core) => [core.coreID, core.starterCode])),
		[activeLesson],
	);
	const loadedCoreIDs = lessonLoads[activeLesson.id] ?? [];
	const loadedCoreCount = loadedCoreIDs.filter((coreID) => lessonCoreIDs.includes(coreID)).length;
	const lessonReady = lessonCoreIDs.every((coreID) => loadedCoreIDs.includes(coreID));
	const finalLessonStep = lessonStepIndex + 1 >= activeLesson.steps.length;
	const canAdvanceLesson = lessonReady && finalLessonStep;
	const continueText = lessonIndex + 1 >= CODE_LESSONS.length ? "Finish tutorial" : "Continue";

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
		clearCodeScopes(TUTORIAL_SCOPE_PREFIX);
		setLessonLoads({});
		setWorkspaceVersion((current) => current + 1);
		resetTutorialStatus();
	}

	function handleResetCurrentLesson() {
		clearCodeScope(lessonScope);
		setLessonLoads((current) => ({
			...current,
			[activeLesson.id]: [],
		}));
		setTutorialStatus((current) => ({
			...current,
			progress: {
				...current.progress,
				lessonStep: 0,
			},
		}));
		setWorkspaceVersion((current) => current + 1);
	}

	function handleLessonStep(delta: number) {
		const maxStep = activeLesson.steps.length - 1;
		const nextStep = Math.min(maxStep, Math.max(0, lessonStepIndex + delta));

		setTutorialStatus((current) => ({
			...current,
			progress: {
				...current.progress,
				lessonStep: nextStep,
			},
		}));
	}

	function handleAdvanceLesson() {
		if (!canAdvanceLesson) return;

		if (lessonIndex + 1 < CODE_LESSONS.length) {
			setTutorialStatus((current) => ({
				...current,
				progress: {
					...current.progress,
					lessonIndex: lessonIndex + 1,
					lessonStep: 0,
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
				lessonIndex,
				lessonStep: lessonStepIndex,
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
			<div className="h-screen w-screen overflow-hidden px-4 pb-4 pt-16">
				<div className="flex h-full min-h-0 flex-col gap-4 lg:flex-row">
						<aside className="flex max-h-[42vh] min-h-0 w-full shrink-0 flex-col gap-2 lg:h-full lg:max-h-none lg:w-sm">
						<Card id="tutorial-status" variant="panel" className="flex shrink-0 flex-col gap-3">
							<div className="flex items-center gap-2">
								<Eyebrow tone="peach">
									Lesson {lessonIndex + 1}/{CODE_LESSONS.length}
								</Eyebrow>
								<span className="text-ctp-subtext0">·</span>
								<Body tone="subtle" className="text-sm">
									Step {lessonStepIndex + 1}/{activeLesson.steps.length}
								</Body>
							</div>
							<Body tone={lessonReady ? "green" : "subtle"} className="text-sm">
								Loaded cores: {loadedCoreCount}/{lessonCoreIDs.length}
							</Body>
							<div className="grid gap-2">
								<Button
									variant="primary"
									onClick={handleAdvanceLesson}
									disabled={!canAdvanceLesson}
								>
									{finalLessonStep ? continueText : "Finish lesson steps"}
								</Button>
								<Button variant="secondary" onClick={handleResetCurrentLesson}>
									Reset Lesson
								</Button>
							</div>

							<div className="grid gap-2">
								<div className="grid grid-cols-2 gap-2">
									<Button variant="ghost" onClick={handleRestart}>
										Restart Tutorial
									</Button>
									<Button variant="ghost" onClick={handleSkip}>
										Skip Tutorial
									</Button>
								</div>
							</div>
						</Card>

						<Card
							variant="panel"
							className="flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto"
							id="tutorial-guide"
						>
							<Heading tone="blue">
								{activeLesson?.title}
							</Heading>

							<div className="flex min-h-0 flex-1 flex-col gap-4">
								<div className="flex items-center justify-between gap-3">
									<Eyebrow tone="peach">
										{STEP_TYPE_LABELS[activeLessonStep.type]}
									</Eyebrow>
									<Eyebrow tone="subtle">
										{lessonStepIndex + 1}/{activeLesson.steps.length}
									</Eyebrow>
								</div>

								<div className="flex flex-col gap-3">
									<Subheading tone="mauve">{activeLessonStep.title}</Subheading>
									<Body tone="subtle" className="text-sm leading-relaxed">
										<InlineText text={activeLessonStep.body} />
									</Body>
									{activeLessonStep.bullets && (
										<ul className="space-y-2 pl-4 text-sm text-ctp-subtext0">
											{activeLessonStep.bullets.map((bullet) => (
												<li key={bullet} className="list-disc leading-relaxed">
													<InlineText text={bullet} />
												</li>
											))}
										</ul>
									)}
									{activeLessonStep.code && (
										<pre className="overflow-x-auto rounded border border-ctp-surface0 bg-ctp-crust p-3 text-xs leading-relaxed text-ctp-text">
											<code>{activeLessonStep.code}</code>
										</pre>
									)}
								</div>

								<div className="mt-auto grid grid-cols-2 gap-2">
									<Button
										variant="secondary"
										onClick={() => handleLessonStep(-1)}
										disabled={lessonStepIndex === 0}
									>
										Back
									</Button>
									<Button
										variant="primary"
										onClick={() => handleLessonStep(1)}
										disabled={finalLessonStep}
									>
										Next step
									</Button>
								</div>
							</div>
						</Card>
					</aside>

					<div className="min-h-0 min-w-0 flex-1">
						{spotlightAnchorIDs.length > 0 && (
							<TutorialSpotlight anchorIDs={spotlightAnchorIDs} />
						)}
						{lessonScope && (
							<Workspace
								key={`${lessonScope}:${workspaceVersion}`}
								storageScope={lessonScope}
								defaultCodeForCore={lessonDefaultCode}
								visibleCoreIDs={lessonCoreIDs}
								visiblePanels={activeLesson.visiblePanels}
								className="h-full"
								onCoreLoad={({ coreID, result }) => {
									if (!result.program) return;
									handleLessonLoad(coreID);
								}}
							/>
						)}
					</div>
				</div>
			</div>
		</Background>
	);
}

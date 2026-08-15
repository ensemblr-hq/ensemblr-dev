'use client';

import { useInView } from 'motion/react';
import {
	createContext,
	useContext,
	useEffect,
	useMemo,
	useRef,
	useState,
} from 'react';

import type { MockRegion } from './regions';

interface FocusValue {
	readonly focus: MockRegion | null;
	readonly setFocus: (region: MockRegion | null) => void;
}

const FocusContext = createContext<FocusValue>({
	focus: null,
	setFocus: () => undefined,
});

/**
 * One window, many stories: the showcase renders a single replica and moves the
 * highlight between its regions as the reader scrolls, instead of cutting to a
 * different screenshot per section.
 */
export function MockFocusProvider({ children }: { children: React.ReactNode }) {
	const [focus, setFocus] = useState<MockRegion | null>(null);
	const value = useMemo(() => ({ focus, setFocus }), [focus]);

	return (
		<FocusContext.Provider value={value}>{children}</FocusContext.Provider>
	);
}

export function useMockFocus(): MockRegion | null {
	return useContext(FocusContext).focus;
}

/**
 * Claims the window's focus while this block sits in the middle band of the
 * viewport. The band means exactly one step owns the highlight at a time, even
 * when two are partly visible.
 */
export function FocusStep({
	children,
	className,
	id,
	region,
}: {
	children: React.ReactNode;
	className?: string;
	/** Anchor target. Belongs on this element, which carries the scroll margin. */
	id?: string;
	region: MockRegion;
}) {
	const ref = useRef<HTMLDivElement>(null);
	const inView = useInView(ref, { margin: '-45% 0px -45% 0px' });
	const { setFocus } = useContext(FocusContext);

	useEffect(() => {
		if (inView) {
			setFocus(region);
		}
	}, [inView, region, setFocus]);

	return (
		<div className={className} id={id} ref={ref}>
			{children}
		</div>
	);
}

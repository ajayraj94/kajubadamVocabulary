"use client";

import { useRef, useEffect, type ReactNode, type CSSProperties } from "react";

type ProtectMode = "full" | "noselect";

interface Props {
    children: ReactNode;
    className?: string;
    style?: CSSProperties;
    mode?: ProtectMode;
}

/**
 * ContentProtection — Prevents casual copying of content.
 * "full"     = no right-click, no Ctrl+C/A/U/S/P, no F12, no drag, no select, no print
 * "noselect" = no text selection only (allows keyboard for quiz interaction)
 *
 * NOTE: 100% safe for Googlebot — it reads raw SSR HTML and ignores all CSS/JS protections.
 */
export default function ContentProtection({
    children,
    className = "",
    style,
    mode = "full",
}: Props) {
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const el = ref.current;
        if (!el) return;

        const onContext = (e: Event) => e.preventDefault();
        const onDrag = (e: DragEvent) => e.preventDefault();

        el.addEventListener("contextmenu", onContext);
        el.addEventListener("dragstart", onDrag);

        let onKey: ((e: Event) => void) | null = null;
        if (mode === "full") {
            onKey = (e: Event) => {
                const ke = e as KeyboardEvent;
                // Block Ctrl+C, Ctrl+A, Ctrl+U, Ctrl+S, Ctrl+P
                if (
                    (ke.ctrlKey || ke.metaKey) &&
                    ["c", "a", "u", "s", "p"].includes(ke.key.toLowerCase())
                ) {
                    e.preventDefault();
                }
                // Block F12, Ctrl+Shift+I / J / C
                if (
                    ke.key === "F12" ||
                    (ke.ctrlKey &&
                        ke.shiftKey &&
                        ["I", "i", "J", "j", "C", "c"].includes(ke.key))
                ) {
                    e.preventDefault();
                }
            };
            el.addEventListener("keydown", onKey);
        }

        return () => {
            el.removeEventListener("contextmenu", onContext);
            el.removeEventListener("dragstart", onDrag);
            if (onKey) el.removeEventListener("keydown", onKey);
        };
    }, [mode]);

    return (
        <div ref={ref} className={`content-protected ${className}`} style={style}>
            {children}
        </div>
    );
}
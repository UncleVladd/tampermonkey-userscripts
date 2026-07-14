// ==UserScript==
// @name         ChatGPT Library - Select Current View
// @namespace    local.chatgpt.library
// @version      1.0.0
// @description  Adds Select Current View and Clear Selection buttons to ChatGPT Library.
// @match        https://chatgpt.com/*
// @match        https://chat.openai.com/*
// @grant        none
// @run-at       document-idle
// ==/UserScript==

(function () {
    "use strict";

    if (window.top !== window.self) return;

    const PANEL_ID = "chatgpt-library-selection-tools";
    const sleep = (milliseconds) =>
        new Promise((resolve) => setTimeout(resolve, milliseconds));

    function isLibraryPage() {
        const locationText = `${location.pathname}${location.hash}`.toLowerCase();

        return (
            locationText.includes("/library") ||
            Boolean(
                document.querySelector(
                    'a[href*="/library"][aria-current="page"]'
                )
            )
        );
    }

    function isRendered(element) {
        if (!(element instanceof HTMLElement)) return false;

        const style = window.getComputedStyle(element);
        const rectangle = element.getBoundingClientRect();

        return (
            style.display !== "none" &&
            style.visibility !== "hidden" &&
            rectangle.width > 0 &&
            rectangle.height > 0
        );
    }

    function getAccessibleName(element) {
        const names = [
            element.getAttribute("aria-label"),
            element.getAttribute("title"),
        ];

        if (element.id) {
            const escapedId = CSS.escape(element.id);
            names.push(
                document.querySelector(`label[for="${escapedId}"]`)?.textContent
            );
        }

        names.push(element.closest("label")?.textContent);

        return names
            .filter(Boolean)
            .join(" ")
            .replace(/\s+/g, " ")
            .trim();
    }

    function shouldIgnore(element) {
        if (!isRendered(element)) return true;

        if (
            element.closest(
                [
                    `#${PANEL_ID}`,
                    "nav",
                    "aside",
                    "header",
                    "thead",
                    '[role="dialog"]',
                    '[role="columnheader"]',
                ].join(",")
            )
        ) {
            return true;
        }

        if (
            element.hasAttribute("disabled") ||
            element.getAttribute("aria-disabled") === "true"
        ) {
            return true;
        }

        const name = getAccessibleName(element);

        // Prevent clicking a native page-wide Select All control if one appears.
        if (
            /\b(select all|select everything|tout sélectionner|sélectionner tout|seleccionar todo|alle auswählen)\b/i.test(
                name
            )
        ) {
            return true;
        }

        return false;
    }

    function getFileCheckboxes() {
        const main = document.querySelector("main");

        if (!main) return [];

        const selectors = [
            'input[type="checkbox"]',
            '[role="checkbox"]',
        ];

        const elements = Array.from(
            new Set(main.querySelectorAll(selectors.join(",")))
        );

        return elements.filter((element) => !shouldIgnore(element));
    }

    function isChecked(element) {
        if (element instanceof HTMLInputElement) {
            return element.checked;
        }

        return (
            element.getAttribute("aria-checked") === "true" ||
            element.getAttribute("aria-pressed") === "true" ||
            element.getAttribute("data-state") === "checked"
        );
    }

    function createButton(label) {
        const button = document.createElement("button");

        button.type = "button";
        button.textContent = label;

        Object.assign(button.style, {
            border: "1px solid color-mix(in srgb, CanvasText 20%, transparent)",
            borderRadius: "8px",
            padding: "8px 11px",
            background: "Canvas",
            color: "CanvasText",
            font: "600 13px/1.2 system-ui, sans-serif",
            cursor: "pointer",
            whiteSpace: "nowrap",
        });

        return button;
    }

    function refreshStatus() {
        const panel = document.getElementById(PANEL_ID);
        if (!panel) return;

        const checkboxes = getFileCheckboxes();
        const selected = checkboxes.filter(isChecked).length;
        const status = panel.querySelector("[data-selection-status]");

        if (status) {
            status.textContent =
                `${checkboxes.length} rendered · ${selected} selected`;
        }
    }

    async function setAllCheckboxes(targetState, triggeringButton) {
        const buttons = document.querySelectorAll(
            `#${PANEL_ID} button`
        );

        buttons.forEach((button) => {
            button.disabled = true;
            button.style.opacity = "0.55";
            button.style.cursor = "wait";
        });

        try {
            const checkboxes = getFileCheckboxes();

            for (const checkbox of checkboxes) {
                if (!document.contains(checkbox)) continue;

                if (isChecked(checkbox) !== targetState) {
                    checkbox.click();

                    // Give React time to process each state change.
                    await sleep(35);
                }
            }
        } finally {
            buttons.forEach((button) => {
                button.disabled = false;
                button.style.opacity = "1";
                button.style.cursor = "pointer";
            });

            triggeringButton?.blur();

            await sleep(150);
            refreshStatus();
        }
    }

    function createPanel() {
        if (document.getElementById(PANEL_ID)) return;

        const panel = document.createElement("div");
        panel.id = PANEL_ID;

        Object.assign(panel.style, {
            position: "fixed",
            right: "22px",
            bottom: "22px",
            zIndex: "2147483647",
            display: "none",
            alignItems: "center",
            gap: "8px",
            padding: "10px",
            border: "1px solid color-mix(in srgb, CanvasText 15%, transparent)",
            borderRadius: "12px",
            background: "Canvas",
            color: "CanvasText",
            boxShadow: "0 8px 30px rgba(0, 0, 0, 0.22)",
            fontFamily: "system-ui, sans-serif",
        });

        const selectButton = createButton("Select current view");
        const clearButton = createButton("Clear selection");

        const status = document.createElement("span");
        status.setAttribute("data-selection-status", "");
        status.style.cssText = [
            "padding: 0 4px",
            "font: 12px/1.2 system-ui, sans-serif",
            "opacity: 0.7",
            "white-space: nowrap",
        ].join(";");

        selectButton.addEventListener("click", () =>
            setAllCheckboxes(true, selectButton)
        );

        clearButton.addEventListener("click", () =>
            setAllCheckboxes(false, clearButton)
        );

        panel.append(selectButton, clearButton, status);
        document.body.appendChild(panel);
    }

    function synchronizePanel() {
        createPanel();

        const panel = document.getElementById(PANEL_ID);
        if (!panel) return;

        panel.style.display = isLibraryPage() ? "flex" : "none";

        if (isLibraryPage()) {
            refreshStatus();
        }
    }

    let refreshTimer;

    const observer = new MutationObserver(() => {
        clearTimeout(refreshTimer);
        refreshTimer = setTimeout(synchronizePanel, 250);
    });

    observer.observe(document.documentElement, {
        childList: true,
        subtree: true,
    });

    window.addEventListener("popstate", synchronizePanel);
    setInterval(synchronizePanel, 1200);

    synchronizePanel();
})();
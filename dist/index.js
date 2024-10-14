"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
let events = [];
const elementRefs = {};
let currentPeriod = "weekly";
let PERIOD_LABELS = {
    daily: "Yesterday - ",
    weekly: "Last Week - ",
    monthly: "Last Month - ",
};
function getData() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const response = yield fetch("/data.json");
            if (!response.ok) {
                throw new Error(`Response status: ${response.status}`);
            }
            const events = yield response.json();
            return events;
        }
        catch (error) {
            if (error instanceof Error) {
                console.error(error.message);
            }
            else {
                console.error("An unknown error occurred");
            }
            return [];
        }
    });
}
function handlePeriodChange(button) {
    const selectedPeriod = button.innerText.toLocaleLowerCase();
    // Validation: Check if the selected period is valid
    const validPeriods = new Set(["daily", "weekly", "monthly"]);
    if (!validPeriods.has(selectedPeriod)) {
        console.error(`The innerText of ${button.innerText} button does not match ValidPeriods`);
        window.alert("Something is wrong, please try again later.");
        return;
    }
    if (selectedPeriod === currentPeriod) {
        return;
    }
    updateElements(selectedPeriod);
    currentPeriod = selectedPeriod;
}
function handleButtonColor(button, buttons) {
    buttons.forEach((btn) => {
        btn.classList.remove("profile__button-selected");
    });
    button.classList.add("profile__button-selected");
}
function cacheElements() {
    events.forEach((event) => {
        const title = event.title.toLowerCase();
        elementRefs[title] = {
            currentElement: document.querySelector(`.card__current-${title}`),
            previousElement: document.querySelector(`.card__previous-${title}`),
        };
    });
}
function updateElements(currentPeriod) {
    events.forEach((event) => {
        const element = elementRefs[event.title.toLowerCase()];
        const { current, previous } = event.timeframes[currentPeriod];
        if (element) {
            element.currentElement.innerText = `${current}hrs`;
            element.previousElement.innerText = `${PERIOD_LABELS[currentPeriod]}${previous}hrs`;
        }
        else {
            console.error(`${event.title} element is missing`);
        }
    });
}
function disableUI(buttons) {
    buttons.forEach((button) => {
        button.disabled = true;
    });
}
function init() {
    return __awaiter(this, void 0, void 0, function* () {
        const buttonsControl = document.querySelector(".profile__control");
        const buttons = document.querySelectorAll(".profile__button");
        if (!buttonsControl) {
            console.error("Buttons Control is missing");
            window.alert("Please try again later.");
            return;
        }
        if (!buttons.length) {
            console.error("Buttons element is missing");
            window.alert("Please try again later.");
            return;
        }
        if (buttonsControl && buttons.length) {
            buttonsControl.addEventListener("click", (e) => {
                const clickedElement = e.target;
                if (clickedElement.matches(".profile__button")) {
                    const button = clickedElement;
                    handlePeriodChange(button);
                    handleButtonColor(button, buttons);
                }
                else {
                    return;
                }
            });
        }
        events = yield getData();
        if (events.length === 0) {
            disableUI(buttons);
            window.alert("Cannot get Data, please try again later.");
            return;
        }
        cacheElements();
        updateElements(currentPeriod);
    });
}
document.addEventListener("DOMContentLoaded", () => {
    init();
});

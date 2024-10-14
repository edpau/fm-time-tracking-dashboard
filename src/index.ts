interface Event {
  title: string;
  timeframes: {
    daily: {
      current: string;
      previous: string;
    };
    weekly: {
      current: string;
      previous: string;
    };
    monthly: {
      current: string;
      previous: string;
    };
  };
}

type Period = "daily" | "weekly" | "monthly";

let events: Event[] = [];

const elementRefs: { [key: string]: { currentElement: HTMLParagraphElement; previousElement: HTMLParagraphElement } } = {};

let currentPeriod: Period = "weekly";

let PERIOD_LABELS: { [key in Period]: string } = {
  daily: "Yesterday - ",
  weekly: "Last Week - ",
  monthly: "Last Month - ",
};

async function getData(): Promise<Event[]> {
  try {
    const response = await fetch("../data.json");

    if (!response.ok) {
      throw new Error(`Response status: ${response.status}`);
    }

    const events: Event[] = await response.json();
    return events;
  } catch (error) {
    if (error instanceof Error) {
      console.error(error.message);
    } else {
      console.error("An unknown error occurred");
    }
    return [];
  }
}

function handlePeriodChange(e: Event) {
  const target = e.target;

  if (!(target instanceof HTMLElement)) {
    console.error("Cannot find button");
    return;
  }

  if (!(target instanceof HTMLButtonElement)) {
    return;
  }

  const selectedPeriod = target.innerText.toLocaleLowerCase() as Period;

  // Validation: Check if the selected period is valid

  const validPeriods: Set<Period> = new Set(["daily", "weekly", "monthly"]);

  if (!validPeriods.has(selectedPeriod)) {
    console.error(`The innerText of ${target.innerText} button does not match ValidPeriods`);
    window.alert("Something is wrong, please try again later.");
    return;
  }

  if (selectedPeriod === currentPeriod) {
    return;
  }

  updateElements(selectedPeriod);
  currentPeriod = selectedPeriod;
}

function handleButtonColor(e: Event, buttons: NodeListOf<HTMLButtonElement>) {
  const target = e.target;

  if (!(target instanceof HTMLElement)) {
    console.error("Cannot find button");
    return;
  }

  if (!(target instanceof HTMLButtonElement)) {
    return;
  }

  buttons.forEach((button) => {
    button.classList.remove("profile__button-selected");
  });

  target.classList.add("profile__button-selected");
}

function cacheElements() {
  events.forEach((event) => {
    const title = event.title.toLowerCase();
    elementRefs[title] = {
      currentElement: document.querySelector(`.card__current-${title}`) as HTMLParagraphElement,
      previousElement: document.querySelector(`.card__previous-${title}`) as HTMLParagraphElement,
    };
  });
}

function updateElements(currentPeriod: Period) {
  events.forEach((event) => {
    const element = elementRefs[event.title.toLowerCase()];
    const { current, previous } = event.timeframes[currentPeriod];

    if (element) {
      element.currentElement.innerText = `${current}hrs`;
      element.previousElement.innerText = `${PERIOD_LABELS[currentPeriod]}${previous}hrs`;
    } else {
      console.error(`${event.title} element is missing`);
    }
  });
}

function disableUI(buttons: NodeListOf<HTMLButtonElement>) {
  buttons.forEach((button) => {
    button.disabled = true;
  });
}

async function init() {
  const buttonsControl = document.querySelector<HTMLElement>(".profile__control");
  const buttons = document.querySelectorAll<HTMLButtonElement>(".profile__button");

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
      handlePeriodChange(e);
      handleButtonColor(e, buttons);
    });
  }

  events = await getData();

  if (events.length === 0) {
    disableUI(buttons);
    window.alert("Cannot get Data, please try again later.");
    return;
  }

  cacheElements();
  updateElements(currentPeriod);
}

document.addEventListener("DOMContentLoaded", () => {
  init();
});

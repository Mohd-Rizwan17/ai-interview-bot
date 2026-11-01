const keyFor = (userId) => `interview-bot-tour:${userId}`;

export const hasSeenTour = (userId) => {
  try {
    return localStorage.getItem(keyFor(userId)) === "done";
  } catch {
    return true;
  }
};

export const markTourSeen = (userId) => {
  try {
    localStorage.setItem(keyFor(userId), "done");
  } catch {
    return;
  }
};

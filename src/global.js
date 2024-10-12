export let wipFiber = null;
export let deletions = [];
export let wipRoot = null;
export let nextRender = null;
export let currentRoot = null;
export let hookIndex = null;

export const getWipFiber = () => wipFiber;
export const setWipFiber = (value) => {
  wipFiber = value;
};

export const getDeletions = () => deletions;

// Add a function to push a new item to the deletions array
export const pushToDeletions = (item) => {
  deletions.push(item);
};

// Add a function to remove a specific item from the deletions array
export const removeFromDeletions = (item) => {
  deletions = deletions.filter((deletion) => deletion !== item);
};

// Add a function to clear all deletions
export const clearDeletions = () => {
  deletions = [];
};

export const getWipRoot = () => wipRoot;
export const setWipRoot = (value) => {
  wipRoot = value;
};

export const getNextRender = () => nextRender;
export const setNextRender = (value) => {
  nextRender = value;
};

export const getCurrentRoot = () => currentRoot;
export const setCurrentRoot = (value) => {
  currentRoot = value;
};

export const setHookIndex = (value) => {
  hookIndex = value;
};

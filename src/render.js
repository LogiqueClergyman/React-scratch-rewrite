import {
  wipRoot,
  wipFiber,
  nextRender,
  currentRoot,
  deletions,
  setWipRoot,
  clearDeletions,
  setNextRender,
  setWipFiber,
  setCurrentRoot,
  setHookIndex,
} from "./global.js";

import { reconciliation } from "./reconciliation.js";
import { createDom, updateDom } from "./dom.js";
const render = (element, container) => {
  setWipRoot({
    dom: container,
    props: {
      children: [element],
    },
    alternate: currentRoot,
  });
  clearDeletions();
  setNextRender(wipRoot);
};

const workloop = (deadline) => {
  let shouldYield = false;
  while (nextRender && !shouldYield) {
    setNextRender(renderFibers(nextRender));
    shouldYield = deadline.timeRemaining() < 1;
  }

  if (!nextRender && wipRoot) commitRoot();
  requestIdleCallback(workloop);
};

requestIdleCallback(workloop);

const commitRoot = () => {
  deletions.forEach(commitWork);
  commitWork(wipRoot.child);
  setCurrentRoot(wipRoot);
  setWipRoot(null);
};

const commitWork = (fiber) => {
  if (!fiber) return;

  let domParent = fiber.parent;
  while (!domParent.dom) {
    domParent = domParent.parent;
  }
  const parent = domParent.dom;

  if (fiber.result === "INSERT" && fiber.dom != null) {
    parent.appendChild(fiber.dom);
  } else if (fiber.result === "DELETE") {
    commitDelete(fiber, parent);
  } else if (fiber.result === "UPDATE" && fiber.dom != null) {
    updateDom(fiber.dom, fiber.alternate.props, fiber.props);
  }

  commitWork(fiber.child);
  commitWork(fiber.sibling);

  // Run the effects after committing
  if (fiber.effects) {
    fiber.effects.forEach((hook) => {
      // Clean up the previous effect, if it exists
      if (hook.cleanup) hook.cleanup();
      // Run the new effect and store the cleanup function
      const cleanup = hook.effect();
      hook.cleanup = typeof cleanup === "function" ? cleanup : null;
    });
  }
};

const renderFibers = (fiber) => {
  const isFunctionComponent = fiber.type instanceof Function;
  if (isFunctionComponent) {
    updateFunctionComponent(fiber);
  } else {
    updateHostComponent(fiber);
  }

  // First render the child
  if (fiber.child) return fiber.child;

  let nextFiber = fiber;
  while (nextFiber) {
    // Then the siblings of the child (the other children of the parent)
    if (nextFiber.sibling) return nextFiber.sibling;
    // Finally the siblings of the parent (uncle nodes of the children)
    nextFiber = nextFiber.parent;
  }
};

const updateFunctionComponent = (fiber) => {
  setWipFiber(fiber);
  setHookIndex(0);
  wipFiber.hooks = [];
  wipFiber.effects = [];
  const children = [fiber.type(fiber.props)];
  reconciliation(fiber, children);
};

const updateHostComponent = (fiber) => {
  if (!fiber.dom) {
    fiber.dom = createDom(fiber);
  }
  reconciliation(fiber, fiber.props.children);
};
export { render };

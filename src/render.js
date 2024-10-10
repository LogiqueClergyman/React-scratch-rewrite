let wipRoot = null;
let nextFiber = null;
let currentRoot = null;

const render = (element, container) => {
  wipRoot = {
    dom: container,
    props: {
      children: [element],
    },
    alternate: currentRoot,
  };
  deletions = [];
  nextFiber = wipRoot;
};

const workloop = (deadline) => {
  let shouldYield = false;
  while (nextFiber && !shouldYield) {
    nextFiber = renderFibers(nextFiber);
    shouldYield = deadline.timeRemaining() < 1;
  }

  if (!nextFiber && wipRoot) commitRoot();
  requestIdleCallback(workloop);
};

requestIdleCallback(workloop);

const commitRoot = () => {
  deletions.forEach(commitWork);
  commitWork(wipRoot.child);
  currentRoot = wipRoot;
  wipRoot = null;
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
};

const renderFibers = (fiber) => {
  // Create this new node
  if (!fiber.dom) {
    fiber.dom = createDom(fiber);
  }
  // Get all the children
  const elements = fiber.props.children;
  reconciliation(fiber, elements);

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

export { render };

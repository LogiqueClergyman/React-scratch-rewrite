const createNewElement = (type, props, ...children) => {
  return {
    type,
    props: {
      ...props,
      children: children.map(child =>
        typeof child === "object" ? child : createNewTextElement(child)
      ),
    },
  };
};

// For anything that isn't an object. Ex: primitive values such as String, Number etc. React does no such thing, it's just to make things easier.
const createNewTextElement = (text) => {
  return {
    type: "TEXT",
    props: {
      nodeValue: text,
      children: [],
    },
  };
};

const createDom = (fiber) => {
  // If the element is a text node
  const domNode =
    fiber.type === "TEXT"
      ? document.createTextNode("")
      : document.createElement(fiber.type);

  // Array of all the keys from the element.props object
  const props = Object.keys(fiber.props);

  // We copy all the props from the element to the new domNode except the children, we render them separately (recursively)
  const isProperty = (key) => key !== "children";
  props
    .filter(isProperty)
    .forEach((name) => (domNode[name] = fiber.props[name]));

  return domNode;
};

let nextFiber = null;
const workloop = (deadline) => {
  let shouldYield = false;
  while (nextFiber && !shouldYield) {
    // Get the next fiber to render
    nextFiber = renderFibers(nextFiber);
    shouldYield = deadline.timeRemaining() < 1;
  }
  // deadline.timeRemaining() returns the amount of time the browser will be idle for
  if (!nextFiber && wipRoot) commitRoot();
  requestIdleCallback(workloop);
};

requestIdleCallback(workloop);

let wipRoot = null;
let deletions = null;

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

let currentRoot = null;
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

const commitDelete = (fiber, parent) => {
  if (fiber.dom) parent.removeChild(fiber.dom);
  else commitDelete(fiber.child, parent);
};

const reconciliation = (wipFiber, elements) => {
  let prevSibling = null;
  let oldFiber = wipFiber.alternate && wipFiber.alternate.child;

  // Cycle through all the children and create new fibers, connect them together, and finally pass it recursively to render them
  for (let i = 0; i < elements.length || oldFiber != null; i++) {
    const element = elements[i];
    let newFiber = null;

    const areSame = oldFiber && element && element.type === oldFiber.type;
    if (areSame) {
      newFiber = {
        type: oldFiber.type,
        props: element.props,
        dom: oldFiber.dom,
        parent: wipFiber,
        alternate: oldFiber,
        result: "UPDATE",
      };
    } else {
      if (element) {
        newFiber = {
          type: element.type,
          props: element.props,
          dom: null,
          parent: wipFiber,
          alternate: null,
          result: "INSERT",
        };
      }
      if (oldFiber) {
        oldFiber.result = "DELETE";
        deletions.push(oldFiber);
      }
    }
    if (oldFiber) {
      oldFiber = oldFiber.sibling;
    }
    // The first element is the child, rest are the siblings of the first child
    if (i === 0) {
      wipFiber.child = newFiber;
    } else if (newFiber) {
      prevSibling.sibling = newFiber;
    }
    prevSibling = newFiber;
  }
};

const isEvent = (key) => key.startsWith("on");
const isProperty = (key) => key !== "children" && !isEvent(key);

const updateDom = (dom, prevProps, nextProps) => {
  Object.keys(prevProps)
    .filter(isEvent)
    .filter(key => !(key in nextProps) || prevProps[key] !== nextProps[key])
    .forEach((name) => {
      const eventType = name.toLowerCase().substring(2);
      dom.removeEventListener(eventType, prevProps[name]);
    });

  Object.keys(prevProps)
    .filter(isProperty)
    .forEach((key) => {
      if (!(key in nextProps)) dom[key] = "";
    });

  Object.keys(nextProps)
    .filter(isProperty)
    .forEach((key) => {
      if (prevProps[key] !== nextProps[key]) dom[key] = nextProps[key];
    });

  Object.keys(nextProps)
    .filter(isEvent)
    .filter(key => prevProps[key] !== nextProps[key])
    .forEach((name) => {
      const eventType = name.toLowerCase().substring(2);
      dom.addEventListener(eventType, nextProps[name]);
    });
};

const updateHostComponent = (fiber) => {
  if (!fiber.dom) fiber.dom = createDom(fiber);
  reconciliation(fiber, fiber.props.children);
};

let wipFiber = null;
let hookIndex = null;

const updateFunctionComponent = (fiber) => {
  wipFiber = fiber;
  hookIndex = 0;
  wipFiber.hooks = [];
  const children = [fiber.type(fiber.props)];
  reconciliation(fiber, children);
};

const useState = (initial) => {
  const oldHook =
    wipFiber.alternate &&
    wipFiber.alternate.hooks &&
    wipFiber.alternate.hooks[hookIndex];

  const hook = {
    state: oldHook ? oldHook.state : initial,
    queue: [],
  };

  const setState = (action) => {
    hook.queue.push(action);
    wipRoot = {
      dom: currentRoot.dom,
      props: currentRoot.props,
      alternate: currentRoot,
    };
    nextFiber = wipRoot;
    deletions = [];
  };

  (oldHook ? oldHook.queue : []).forEach(action => {
    hook.state = action(hook.state);
  });

  wipFiber.hooks.push(hook);
  hookIndex++;
  return [hook.state, setState];
};

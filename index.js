const createNewElement = (type, props, ...children) => {
  return {
    type,
    props: {
      ...props,
      children,
    },
  };
};

//for anything that isn't an object. ex: primitive values such as String, Number etc. React does no such thing, its just to make things easier.
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
  //if the element is a text node
  const domNode =
    fiber.type == "TEXT"
      ? document.createTextNode("")
      : document.createElement(fiber.type);

  //array of all the keys from the element.props object
  const props = Object.keys(fiber.props);

  //we copy all the props from the element to the new domNode except the children, we render them seperately (recursively)
  const isProperty = (key) => key !== "children";
  props
    .filter(isProperty)
    .forEach((name) => (domNode[name] = fiber.props[name]));

  //recursive call to render all the children nodes
  //   fiber.props.children.array.forEach((child) => render(child, dom));
  //   container.appendChild(domNode);
  return domNode;
};

let nextFiber = null;
const workloop = (deadline) => {
  let shouldYield = false;
  while (nextFiber && !shouldYield) {
    //get the next fiber to render
    nextFiber = renderFibers(nextFiber);
    shouldYield = deadline.timeRemaining() < 1;
  }
  //deadline.timeRemaining() returns the amount of time the browser will be idle for
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
  //create this new node
  if (!fiber.dom) {
    fiber.dom = createDom(fiber);
  }
  //append it to the dom
  //   if (fiber.parent) {
  //     fiber.parent.dom.appendChild(fiber.dom);
  //   }

  //get all the children
  const elements = fiber.props.children;

  reconcilation(fiber, elements);

  //first render the child
  if (fiber.child) return fiber.child;
  let nextFiber = fiber;
  while (nextFiber) {
    //then the siblings of the child (the other children of the parent)
    if (nextFiber.sibling) return nextFiber.sibling;
    //finally the siblings of the parent (uncle nodes of the children)
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
  const parent = fiber.parent.dom;
  parent.appendChild(fiber.dom);
  if (fiber.result === "INSERT" && fiber.dom != null)
    parent.appendChild(fiber.dom);
  else if (fiber.result === "DELETE") parent.removeChild(fiber.dom);
  else if (fiber.result === "UPDATE" && fiber.dom != null)
    updateDom(fiber.dom, fiber.alternate.props, fiber.props);
  commitWork(fiber.child);
  commitWork(fiber.sibling);
};

const reconcilation = (wipFiber, elements) => {
  let prevSibling = null;
  let oldFiber = wipFiber.alternate && wipFiber.alternate.child;

  //cycle through all the children and create new fibres, connect them together, and finally pass it recursively to render them
  for (let i = 0; i < elements.length || oldFiber != null; i++) {
    const element = elements[i];
    let newFiber = null;

    const areSame = oldFiber && element && element.type == oldFiber.type;
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
    //the first element is the child, rest are the siblings of the first child
    if (i === 0) {
      wipFiber.child = newFiber;
    } else {
      prevSibling.fiber = newFiber;
    }
    prevSibling = newFiber;
  }
};

const isEvent = (key) => key.startsWith("on");
const isProperty = (key) => key !== "children" && !isEvent(key);
const updateDom = (dom, prevProps, nextProps) => {
  Object.keys(prevProps)
    .filter(isEvent)
    .filter((key) => !(key in nextProps) || prevProps[key] != nextProps[key])
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
    .filter((key) => prevProps[key] != nextProps[key])
    .forEach((name) => {
      const eventType = name.toLowerCase().substring(2);
      dom.addEventListener(eventType, nextProps[name]);
    });
};

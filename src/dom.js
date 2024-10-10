const createDom = (fiber) => {
  const domNode =
    fiber.type === "TEXT"
      ? document.createTextNode("")
      : document.createElement(fiber.type);

  const isProperty = (key) => key !== "children";
  Object.keys(fiber.props)
    .filter(isProperty)
    .forEach((name) => (domNode[name] = fiber.props[name]));

  return domNode;
};

const isEvent = (key) => key.startsWith("on");
const isProperty = (key) => key !== "children" && !isEvent(key);

const updateDom = (dom, prevProps, nextProps) => {
  Object.keys(prevProps)
    .filter(isEvent)
    .filter((key) => !(key in nextProps) || prevProps[key] !== nextProps[key])
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
    .filter((key) => prevProps[key] !== nextProps[key])
    .forEach((name) => {
      const eventType = name.toLowerCase().substring(2);
      dom.addEventListener(eventType, nextProps[name]);
    });
};

export { createDom, updateDom };

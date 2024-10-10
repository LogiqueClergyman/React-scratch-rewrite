const createNewElement = (type, props, ...children) => {
  return {
    type,
    props: {
      ...props,
      children: children.map((child) =>
        typeof child === "object" ? child : createNewTextElement(child)
      ),
    },
  };
};

const createNewTextElement = (text) => {
  return {
    type: "TEXT",
    props: {
      nodeValue: text,
      children: [],
    },
  };
};

export { createNewElement, createNewTextElement };

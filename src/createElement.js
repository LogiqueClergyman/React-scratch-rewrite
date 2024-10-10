export const createNewElement = (type, props, ...children) => {
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

export const createNewTextElement = (text) => {
  return {
    type: "TEXT",
    props: {
      nodeValue: text,
      children: [],
    },
  };
};

let deletions = null;

const reconciliation = (wipFiber, elements) => {
  let prevSibling = null;
  let oldFiber = wipFiber.alternate && wipFiber.alternate.child;

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

    if (oldFiber) oldFiber = oldFiber.sibling;
    if (i === 0) wipFiber.child = newFiber;
    else if (newFiber) prevSibling.sibling = newFiber;
    prevSibling = newFiber;
  }
};

export { reconciliation };

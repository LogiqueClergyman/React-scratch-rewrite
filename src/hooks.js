let wipFiber = null;
let hookIndex = null;

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

  (oldHook ? oldHook.queue : []).forEach((action) => {
    hook.state = action(hook.state);
  });

  wipFiber.hooks.push(hook);
  hookIndex++;
  return [hook.state, setState];
};

export { useState };

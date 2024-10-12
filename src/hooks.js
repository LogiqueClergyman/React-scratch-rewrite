import {
  wipRoot,
  setWipRoot,
  clearDeletions,
  setNextRender,
  wipFiber,
  hookIndex,
  setHookIndex,
  currentRoot,
} from "./global.js";
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
    setWipRoot({
      dom: currentRoot.dom,
      props: currentRoot.props,
      alternate: currentRoot,
    });
    setNextRender(wipRoot);
    clearDeletions();
  };

  (oldHook ? oldHook.queue : []).forEach((action) => {
    hook.state = action(hook.state);
  });

  wipFiber.hooks.push(hook);
  setHookIndex(hookIndex + 1);
  return [hook.state, setState];
};

export { useState };

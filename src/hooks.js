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
export const useState = (initial) => {
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

export const useEffect = (effect, deps) => {

  const oldHook =
    wipFiber.alternate &&
    wipFiber.alternate.hooks &&
    wipFiber.alternate.hooks[hookIndex];

  const hasChanged =
    !oldHook || !deps || deps.some((dep, i) => dep !== oldHook.deps[i]);

  const hook = {
    effect, // Store the effect function
    deps, // Store the dependencies
    cleanup: oldHook ? oldHook.cleanup : null,
  };

  // If dependencies have changed, schedule the effect
  if (hasChanged) {
    wipFiber.effects.push(hook); // Store the hook for later execution
  }

  // Update the fiber's hooks array
  wipFiber.hooks[hookIndex] = hook;
  setHookIndex(hookIndex + 1);
};

/** @jsx easyReact.createElement */
import { easyReact } from "./index.js";

function Counter() {
  const [state, setState] = easyReact.useState(1);

  easyReact.useEffect(() => {
    console.log("Effect runs on mount and when state changes");
    return () =>
      console.log("Cleanup runs when component unmounts or state changes");
  }, [state]);
  return (
    <div>
      <h1>Count: {state}</h1>
      <button
        onClick={() => {
          setState((c) => c + 1);
          console.log("clicking");
        }}
      >
        Click
      </button>
    </div>
  );
}
const element = <Counter />;
const container = document.getElementById("root");
easyReact.render(element, container);

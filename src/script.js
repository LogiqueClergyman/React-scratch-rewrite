/** @jsx easyReact.createElement */
import { easyReact } from "./index.js";

function Counter() {
  const [state, setState] = easyReact.useState(1);
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

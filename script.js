/** @jsx easyReact.createElement */
import { easyReact } from "./index";

function Counter() {
  const [state, setState] = easyReact.useState(1);
  return <h1 onClick={() => setState((c) => c + 1)}>Count: {state}</h1>;
}
const element = <Counter />;
const container = document.getElementById("root");
easyReact.render(element, container);

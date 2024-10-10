import { createNewElement } from "./src/createElement";
import { render } from "./src/render";
import { useState } from "./src/hooks";

const easyReact = { createElement: createNewElement, render, useState };

export { easyReact };

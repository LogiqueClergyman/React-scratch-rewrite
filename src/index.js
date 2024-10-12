import { createNewElement } from "./createElement.js";
import { render } from "./render.js";
import { useState } from "./hooks.js";

const easyReact = { createElement: createNewElement, render, useState };

export { easyReact };

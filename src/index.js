import { createNewElement } from "./createElement.js";
import { render } from "./render.js";
import { useState, useEffect } from "./hooks.js";

const easyReact = { createElement: createNewElement, render, useState, useEffect };

export { easyReact };

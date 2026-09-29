"use strict";

/* =========================================================
   Visualizador de Algoritmos de Ordenamiento
   Vanilla JS · async/await + sleep() para animar paso a paso
   ========================================================= */

/* ---------- Catálogo de algoritmos ---------- */
const ALGORITHMS = {
  selection: { name: "Selection Sort", complexity: "O(n²)",                      fn: selectionSort },
  bubble:    { name: "Bubble Sort",    complexity: "Ω(n) · O(n²)",              fn: bubbleSort },
  insertion: { name: "Insertion Sort", complexity: "Ω(n) · O(n²)",              fn: insertionSort },
  gnome:     { name: "Gnome Sort",     complexity: "Ω(n) · O(n²)",              fn: gnomeSort },
  exchange:  { name: "Exchange Sort",  complexity: "O(n²)",                      fn: exchangeSort },
  merge:     { name: "Merge Sort",     complexity: "O(n log n)",                 fn: mergeSort },
  quick:     { name: "Quick Sort",     complexity: "Prom. O(n log n) · Peor O(n²)", fn: quickSort },
  stooge:    { name: "Stooge Sort",    complexity: "O(n^2.71)",                  fn: stoogeSort },
};

/* ---------- Referencias al DOM ---------- */
const $ = (id) => document.getElementById(id);
const el = {
  algo1: $("algo1"), algo2: $("algo2"), speed: $("speed"), speedLabel: $("speedLabel"),
  size: $("size"), sizeLabel: $("sizeLabel"),
  btnGenerate: $("btnGenerate"), btnStart: $("btnStart"),
  btnPause: $("btnPause"), btnReset: $("btnReset"),
  stage: $("stage"), status: $("status"),
  custom: $("customData"), btnCustom: $("btnCustom"), customMsg: $("customMsg"),
  cover: $("cover"), app: $("app"), btnEnter: $("btnEnter"), btnBack: $("btnBack"),
  metrics: $("metrics"), summary: $("summary"),
};

/* ---------- Estado ---------- */
let original = [];          // dataset desordenado original (para restaurar)
let arr = [];               // arreglo de trabajo
let bars = [];              // divs de las barras
let marks = new Map();      // índice -> clase temporal (compare, swap, pivot)
let sortedSet = new Set();  // índices en posición final
let running = false, paused = false, cancelled = false;
let runPromise = null;
let comparisons = 0, swaps = 0, idleMs = 0;
let maxVal = 100;           // valor máximo del dataset (escala de las barras)
let pivotIdx = -1;          // índice del pivote (Quick Sort)

const CANCEL = Symbol("cancel");

/* ---------- Utilidades de animación ---------- */
const sleep = (ms) => new Promise((res) => setTimeout(res, ms));
const getDelay = () => Math.round(505 - Number(el.speed.value) * 5); // 1→500ms, 100→5ms

function paint() {
  const dense = bars.length > 45; // con muchas barras, el número solo aparece al pasar el cursor
  for (let i = 0; i < bars.length; i++) {
    const b = bars[i];
    const h = Math.max((arr[i] / maxVal) * 100, 3);
    b.style.height = h + "%";
    b.className = "bar" + (marks.has(i) ? " " + marks.get(i)
      : i === pivotIdx ? " pivot" : sortedSet.has(i) ? " sorted" : "");
    b.title = arr[i];
    b.textContent = dense ? "" : arr[i];
  }
}

/* Pinta, espera (respetando pausa y cancelación). El tiempo gastado aquí
   se descuenta del tiempo de ejecución para medir solo la lógica del algoritmo. */
async function tick(indices = [], cls = "compare") {
  const t0 = performance.now();
  marks.clear();
  indices.forEach((i) => marks.set(i, cls));
  paint();
  await sleep(getDelay());
  while (paused && !cancelled) await sleep(50);
  marks.clear();
  idleMs += performance.now() - t0;
  if (cancelled) throw CANCEL;
}

/* Primitivas contadas */
async function gt(i, j) { comparisons++; await tick([i, j], "compare"); return arr[i] > arr[j]; }
async function swap(i, j) {
  swaps++;
  [arr[i], arr[j]] = [arr[j], arr[i]];
  await tick([i, j], "swap");
}
function markSorted(...idx) { idx.forEach((i) => sortedSet.add(i)); }

/* =========================================================
   ALGORITMOS
   ========================================================= */
async function selectionSort() {
  const n = arr.length;
  for (let i = 0; i < n - 1; i++) {
    let min = i;
    for (let j = i + 1; j < n; j++) {
      if (await gt(min, j)) min = j;
    }
    if (min !== i) await swap(i, min);
    markSorted(i);
  }
}

async function bubbleSort() {
  const n = arr.length;
  for (let i = n - 1; i > 0; i--) {
    let swapped = false;
    for (let j = 0; j < i; j++) {
      if (await gt(j, j + 1)) { await swap(j, j + 1); swapped = true; }
    }
    markSorted(i);
    if (!swapped) break;
  }
}

async function insertionSort() {
  for (let i = 1; i < arr.length; i++) {
    let j = i;
    while (j > 0 && (await gt(j - 1, j))) {
      await swap(j - 1, j);
      j--;
    }
  }
}

async function gnomeSort() {
  let i = 0;
  while (i < arr.length) {
    if (i === 0 || !(await gt(i - 1, i))) i++;
    else { await swap(i - 1, i); i--; }
  }
}

async function exchangeSort() {
  const n = arr.length;
  for (let i = 0; i < n - 1; i++) {
    for (let j = i + 1; j < n; j++) {
      if (await gt(i, j)) await swap(i, j);
    }
    markSorted(i);
  }
}

async function mergeSort() {
  async function sort(l, r) {
    if (l >= r) return;
    const m = Math.floor((l + r) / 2);
    await sort(l, m);
    await sort(m + 1, r);
    await merge(l, m, r);
  }
  async function merge(l, m, r) {
    const left = arr.slice(l, m + 1), right = arr.slice(m + 1, r + 1);
    let i = 0, j = 0, k = l;
    const write = async (v) => { arr[k] = v; swaps++; await tick([k], "swap"); k++; };
    while (i < left.length && j < right.length) {
      comparisons++;
      await tick([l + i, m + 1 + j], "compare");
      if (left[i] <= right[j]) await write(left[i++]);
      else await write(right[j++]);
    }
    while (i < left.length) await write(left[i++]);
    while (j < right.length) await write(right[j++]);
  }
  await sort(0, arr.length - 1);
}

/* Quick Sort con partición de dos punteros y pivote = elemento derecho
   (misma estructura que Collection<T>::quickSort con Position left/right). */
async function quickSort() {
  async function sort(left, right) {
    if (left === right) { markSorted(left); return; }

    // Caso base: dos elementos adyacentes -> comparar y, si hace falta, intercambiar.
    if (left + 1 === right) {
      if (await gt(left, right)) await swap(left, right);
      markSorted(left, right);
      return;
    }

    pivotIdx = right; // pivote = *right->dataPtr
    let i = left, j = right;

    while (i !== j) {
      // avanza i mientras arr[i] <= pivote
      while (i !== j && !(await gt(i, right))) i++;
      // retrocede j mientras arr[j] >= pivote
      while (i !== j && !(await gt(right, j))) j--;
      if (i !== j) await swap(i, j);
    }

    await swap(i, right); // coloca el pivote en su posición final
    pivotIdx = -1;
    markSorted(i);

    if (i !== left) await sort(left, i - 1);
    if (i !== right) await sort(i + 1, right);
  }
  await sort(0, arr.length - 1);
}

async function stoogeSort() {
  async function sort(l, h) {
    if (await gt(l, h)) await swap(l, h);
    if (h - l + 1 > 2) {
      const t = Math.floor((h - l + 1) / 3);
      await sort(l, h - t);
      await sort(l + t, h);
      await sort(l, h - t);
    }
  }
  await sort(0, arr.length - 1);
}

/* =========================================================
   CONTROL DE LA APLICACIÓN
   ========================================================= */
function buildBars() {
  el.stage.innerHTML = "";
  bars = arr.map(() => {
    const d = document.createElement("div");
    d.className = "bar";
    el.stage.appendChild(d);
    return d;
  });
  marks.clear();
  paint();
}

function generateData() {
  const n = Number(el.size.value);
  original = Array.from({ length: n }, () => Math.floor(Math.random() * 95) + 5);
  restoreOriginal();
}

function restoreOriginal() {
  arr = [...original];
  maxVal = Math.max(...original, 1);
  el.custom.value = original.join(", ");
  sortedSet.clear();
  buildBars();
}

function setRunning(state) {
  running = state;
  [el.algo1, el.algo2, el.size, el.btnGenerate, el.btnStart, el.custom, el.btnCustom].forEach((c) => (c.disabled = state));
  el.btnPause.disabled = !state;
  if (!state) { paused = false; el.btnPause.textContent = "Pausar"; }
}

function clearMetrics() {
  el.metrics.innerHTML = '<tr class="empty"><td colspan="5">Aún no hay ejecuciones.</td></tr>';
  el.summary.textContent = "";
}

function addRow(key, cmp, swp, ms) {
  const empty = el.metrics.querySelector(".empty");
  if (empty) empty.remove();
  const a = ALGORITHMS[key];
  const tr = document.createElement("tr");
  tr.innerHTML = `<td>${a.name}</td><td>${a.complexity}</td>
    <td class="num">${cmp}</td><td class="num">${swp}</td>
    <td class="num">${ms.toFixed(3)} ms</td>`;
  el.metrics.appendChild(tr);
}

async function runOne(key, label) {
  arr = [...original];
  sortedSet.clear();
  pivotIdx = -1;
  comparisons = swaps = idleMs = 0;
  el.status.textContent = `${label}: ${ALGORITHMS[key].name} en ejecución…`;
  buildBars();

  const t0 = performance.now();
  await ALGORITHMS[key].fn();
  const elapsed = performance.now() - t0 - idleMs; // tiempo neto sin animación/pausas

  arr.forEach((_, i) => sortedSet.add(i));
  marks.clear();
  pivotIdx = -1;
  paint();
  addRow(key, comparisons, swaps, Math.max(elapsed, 0));
  return { key, comparisons, swaps, time: Math.max(elapsed, 0) };
}

async function start() {
  if (running) return;
  cancelled = false;
  setRunning(true);
  clearMetrics();

  const keys = [el.algo1.value];
  if (el.algo2.value !== "none") keys.push(el.algo2.value);

  runPromise = (async () => {
    const results = [];
    try {
      for (let i = 0; i < keys.length; i++) {
        results.push(await runOne(keys[i], `Algoritmo ${i + 1}`));
        if (i < keys.length - 1) {
          el.status.textContent = "Restaurando el dataset original…";
          const t0 = performance.now();
          await sleep(900);
          idleMs += performance.now() - t0;
          if (cancelled) throw CANCEL;
        }
      }
      el.status.textContent = "Ejecución terminada.";
      if (results.length === 2) showSummary(results);
    } catch (e) {
      if (e !== CANCEL) throw e;
    } finally {
      setRunning(false);
    }
  })();
}

function showSummary([a, b]) {
  const na = ALGORITHMS[a.key].name, nb = ALGORITHMS[b.key].name;
  const best = (x, y, prop) => (x[prop] === y[prop] ? "empate" : x[prop] < y[prop] ? na : nb);
  el.summary.textContent =
    `Menos comparaciones: ${best(a, b, "comparisons")} · ` +
    `Menos intercambios: ${best(a, b, "swaps")} · ` +
    `Menor tiempo: ${best(a, b, "time")}`;
}

async function stopAndWait() {
  cancelled = true;
  if (runPromise) await runPromise;
  runPromise = null;
}

/* ---------- Eventos ---------- */
el.btnStart.addEventListener("click", start);

el.btnPause.addEventListener("click", () => {
  paused = !paused;
  el.btnPause.textContent = paused ? "Reanudar" : "Pausar";
  el.status.textContent = paused ? "En pausa." : "Continuando…";
});

el.btnGenerate.addEventListener("click", async () => {
  await stopAndWait();
  clearMetrics();
  generateData();
  el.status.textContent = "Nuevos datos generados.";
});

el.btnReset.addEventListener("click", async () => {
  await stopAndWait();
  clearMetrics();
  restoreOriginal();
  el.status.textContent = "Reiniciado: dataset original restaurado.";
});

function updateSliderFill(input) {
  const min = Number(input.min) || 0, max = Number(input.max) || 100;
  const pct = ((Number(input.value) - min) / (max - min)) * 100;
  input.style.setProperty("--pct", pct + "%");
}

el.size.addEventListener("input", () => {
  el.sizeLabel.textContent = el.size.value;
  updateSliderFill(el.size);
  generateData();
  clearMetrics();
});

el.speed.addEventListener("input", () => {
  el.speedLabel.textContent = el.speed.value;
  updateSliderFill(el.speed);
});

/* ---------- Inicialización ---------- */
function init() {
  Object.entries(ALGORITHMS).forEach(([key, a]) => {
    el.algo1.add(new Option(a.name, key));
    el.algo2.add(new Option(a.name, key));
  });
  el.algo2.add(new Option("— Ninguno (ejecución individual) —", "none"), 0);
  el.algo1.value = "bubble";
  el.algo2.value = "quick";
  updateSliderFill(el.speed);
  updateSliderFill(el.size);
  generateData();
}
init();


/* =========================================================
   DATOS PERSONALIZADOS
   ========================================================= */
function setMsg(text, type = "") {
  el.customMsg.textContent = text;
  el.customMsg.className = "msg " + type;
}

async function useCustomData() {
  const parts = el.custom.value.split(/[\s,;]+/).filter(Boolean);
  const nums = parts.map(Number);
  if (nums.length < 2 || nums.length > 80) return setMsg("Ingresa entre 2 y 80 números.", "error");
  if (nums.some((x) => !Number.isFinite(x) || x < 0 || x > 1000000))
    return setMsg("Solo números entre 0 y 1,000,000 separados por coma.", "error");
  await stopAndWait();
  original = nums;
  el.size.value = nums.length;
  el.sizeLabel.textContent = nums.length;
  clearMetrics();
  restoreOriginal();
  el.status.textContent = "Datos personalizados cargados.";
  setMsg(`Se cargaron ${nums.length} datos.`, "ok");
}
el.btnCustom.addEventListener("click", useCustomData);
el.custom.addEventListener("keydown", (e) => { if (e.key === "Enter") useCustomData(); });
["btnGenerate", "btnReset"].forEach((k) => el[k].addEventListener("click", () => setMsg("")));
el.size.addEventListener("input", () => setMsg(""));

/* =========================================================
   PORTADA Y TRANSICIÓN
   ========================================================= */
(function buildCoverBars() {
  // Ilustración fija: a la izquierda revueltas, hacia la derecha en orden.
  const n = 32, box = $("bars");
  let seed = 7;
  const rnd = () => { seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646; };
  for (let i = 0; i < n; i++) {
    const t = i / (n - 1), sorted = i >= n - 8;
    let h = 0.12 + 0.88 * t + (sorted ? 0 : (rnd() - 0.5) * 1.1 * Math.pow(1 - t, 1.3));
    h = Math.max(0.08, Math.min(1, h));
    const color = sorted ? "--sorted" : i === n - 10 ? "--cmp" : i === n - 9 ? "--write" : "--bar";
    const b = document.createElement("i");
    b.style.height = (h * 100).toFixed(1) + "%";
    b.style.background = `var(${color})`;
    b.style.setProperty("--i", i);
    box.appendChild(b);
  }
})();

function enterApp() {
  document.body.classList.add("in-app");
  el.cover.inert = true;
  el.app.inert = false;
  window.scrollTo(0, 0);
  setTimeout(() => el.btnStart.focus({ preventScroll: true }), 900);
}
async function backToCover() {
  await stopAndWait();
  restoreOriginal();
  clearMetrics();
  document.body.classList.remove("in-app");
  el.app.inert = true;
  el.cover.inert = false;
  window.scrollTo(0, 0);
  el.btnEnter.focus({ preventScroll: true });
}
el.btnEnter.addEventListener("click", enterApp);
el.btnBack.addEventListener("click", backToCover);

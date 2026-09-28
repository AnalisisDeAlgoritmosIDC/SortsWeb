## Nombre del proyecto

**Visualizador de Algoritmos de Ordenamiento**

## Integrantes

- Isaac Saldivar
- Daniel Padilla
- Carlos Adrian Ramirez
- Oswaldo Daniel Castañeda

## Descripción

Aplicación web de una sola página (SPA) que muestra, paso a paso y con barras verticales, cómo trabajan ocho algoritmos clásicos de ordenamiento. Cada comparación e intercambio se refleja visualmente con colores, y una tabla de métricas registra comparaciones, intercambios y tiempo de ejecución. Incluye un modo de comparación secuencial: se ejecuta el Algoritmo 1 sobre un arreglo, se restaura el mismo arreglo desordenado y se ejecuta el Algoritmo 2, para comparar ambos con la misma muestra.

## Objetivo

Apoyar el análisis de algoritmos de ordenamiento mediante una herramienta visual e interactiva que permita observar su comportamiento, contrastar la complejidad teórica con las métricas reales (comparaciones, intercambios y tiempo) y comprender por qué unos algoritmos son más eficientes que otros.

## Algoritmos implementados

| Algoritmo | Complejidad teórica |
| Selection Sort | O(n²) |
| Bubble Sort (con salida anticipada) | Ω(n) · O(n²) |
| Insertion Sort | Ω(n) · O(n²) |
| Gnome Sort | Ω(n) · O(n²) |
| Exchange Sort | O(n²) |
| Merge Sort | O(n log n) |
| Quick Sort (pivote al final, partición de Lomuto) | Promedio O(n log n) · Peor caso O(n²) 
| Stooge Sort | O(n^2.71) |

Todos están escritos con `async/await` y una función `sleep()` (promesa con `setTimeout`) dentro de los bucles para que el DOM se actualice en cada paso.

**Nota sobre las métricas:** en Merge Sort no hay intercambios como tal; cada escritura al arreglo se cuenta como movimiento en la columna "Intercambios". El tiempo de ejecución descuenta las pausas y las esperas de la animación, por lo que refleja únicamente el tiempo de cómputo del algoritmo.

## Tecnologías utilizadas

- HTML5
- CSS3 (Flexbox, variables CSS)
- JavaScript puro (Vanilla JS, sin frameworks ni librerías externas)
- Git y GitHub para el control de versiones
- Cloudflare Pages para el despliegue

## Cómo ejecutar el proyecto

1. Clona el repositorio:
   ```bash
   git clone https://github.com/TU-USUARIO/TU-REPOSITORIO.git
   cd TU-REPOSITORIO
   ```
2. Abre `index.html` directamente en el navegador (doble clic), o sírvelo con un servidor local, por ejemplo:
   ```bash
   python3 -m http.server 8000
   ```
   y entra a `http://localhost:8000`.

No requiere instalación de dependencias ni proceso de compilación.

## Uso de la aplicación

1. Elige el **Algoritmo 1**. Si quieres comparar, elige también el **Algoritmo 2**; con "Ninguno" se ejecuta un solo algoritmo.
2. Ajusta la **velocidad** de la animación y el **tamaño** del arreglo (5 a 80 elementos).
3. Pulsa **Generar datos aleatorios** para crear un nuevo arreglo.
4. Pulsa **Iniciar**. Se animará el Algoritmo 1, se restaurará el arreglo original y se animará el Algoritmo 2. Los resultados se agregan a la tabla de métricas.
5. Usa **Pausar / Reanudar** para detener la animación en cualquier momento y **Reiniciar** para cancelar y restaurar el arreglo original.

Código de colores: azul = sin procesar, rojo = comparando, naranja = intercambio o escritura, morado = pivote, verde = posición final.

> Recomendación: con Stooge Sort usa arreglos pequeños (menos de 30 elementos), pues su complejidad es muy alta y la animación se vuelve larga.

## Deployment

El proyecto es un sitio estático desplegado en **Cloudflare Pages** conectado al repositorio de GitHub:

1. Subir los archivos (`index.html`, `styles.css`, `app.js`, `README.md`) a un repositorio de GitHub.
2. En Cloudflare, ir a *Workers & Pages → Create → Pages → Connect to Git* y seleccionar el repositorio.
3. Configurar: *Framework preset*: **None**, *Build command*: (vacío), *Build output directory*: `/`.
4. Guardar y desplegar. Cada `push` a la rama principal genera un nuevo despliegue automático.

URL del sitio: https://sortweb.carloxgtz1736.workers.dev/

## Organización del equipo

| Integrante | Responsabilidad |
| Isaac Saldivar | Documentacion y organizacion en GitHub proyects |
| Daniel Padilla | Implementacion de algoritmos |
| Carlos Ramirez | Diseño de interfaz grafica |
| Oswaldo Castañeda | Supervisor del codigo |

El trabajo se coordinó mediante un repositorio compartido en GitHub, con revisión de los cambios entre integrantes.

## Uso de IA

Se utilizó un asistente de IA (Claude) como apoyo para generar la primera versión del código. El equipo revisó, probó y adaptó el código, y es responsable de su contenido final. 

## Aprendizajes y conclusiones

- Los algoritmos cuadráticos (Selection, Bubble, Insertion, Gnome, Exchange) crecen muy rápido en comparaciones al aumentar el tamaño; Merge Sort y Quick Sort escalan mucho mejor.
- Bubble, Insertion y Gnome Sort se comportan bien con datos casi ordenados (mejor caso lineal), mientras que Selection y Exchange Sort hacen casi el mismo trabajo sin importar el orden inicial.
- Quick Sort suele hacer menos movimientos que Merge Sort en la práctica, pero su peor caso es cuadrático.
- Stooge Sort ilustra que un algoritmo correcto puede ser muy ineficiente.
- Usar `async/await` con `sleep()` permite visualizar algoritmos recursivos e iterativos sin bloquear la interfaz, y medir el tiempo neto exige separar el cómputo de las esperas de la animación.
- Comparar dos algoritmos sobre el mismo arreglo hace que las métricas sean justas y comparables.

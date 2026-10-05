# Generador de Biblioteca de Guiones

Herramienta para que el supervisor cree y mantenga los guiones de su equipo y genere **un solo archivo HTML** que reciben los agentes. Cada agente entra a ese HTML con su cédula y solo ve sus guiones, listos para copiar y pegar.

Solo el supervisor crea o edita guiones (en este generador). Los agentes únicamente consultan y copian.

## Cómo usarlo

1. Abre `index.html` con doble clic (Chrome o Edge). No necesita instalación ni internet.
2. **Agrega a tus agentes** en el panel de la izquierda: nombre completo y cédula.
3. **Crea los guiones** con **+ Nuevo guion**:
   - **Título**: es lo que el agente ve en el desplegable.
   - **Categoría**: agrupa los guiones (puedes escribir una nueva o elegir una existente).
   - **Canal**: chat y redes, solo chat o solo redes.
   - **Contenido**: deja una línea en blanco entre párrafos. Cada párrafo se copia por separado y el botón copia el bloque completo. Puedes agregar varias **opciones** para el cliente y **notas internas** que no se envían.
   - `xxxx` resalta un dato que el agente debe completar; `{nombre}` y `{nombre_completo}` se reemplazan por el nombre de cada agente.
   - **¿Qué agentes tendrán este guion?**: marca uno, varios o todos.
4. Pulsa **Vista previa** o **Ver como este agente** para revisar cómo queda.
5. Pulsa **Generar HTML**. Se descarga `biblioteca_guiones.html` con los guiones de todos tus agentes.
6. Envíales ese archivo y pídeles que **cierren el HTML anterior** y abran el nuevo. En la parte de arriba verán la fecha de la versión.

## Respaldo (importante)

Todo lo que creas se guarda **en este navegador**. Si se borran los datos del navegador o cambias de computador, se pierde. Por eso:

- Usa **Respaldo y ajustes → Descargar respaldo (.json)** después de cada cambio importante. El generador te avisa con una franja amarilla cuando hay cambios sin respaldar.
- Para continuar en otro computador: **Respaldo y ajustes → Restaurar desde respaldo…**
- El respaldo contiene las cédulas: guárdalo en un lugar seguro y **no lo subas a este repositorio** (el `.gitignore` ya excluye los `.json` y los HTML generados).

## Importar la biblioteca anterior

**Respaldo y ajustes → Importar biblioteca anterior (.html)** lee la biblioteca hecha a mano (`biblioteca_guiones.html`) y trae sus agentes, categorías y guiones. Las cédulas de ese archivo están protegidas, así que después hay que escribir la cédula de cada agente con **Editar agente**; el generador avisa si no coincide con la que tenía antes.

## Seguridad

- En el HTML generado las cédulas no aparecen: se guardan como huella SHA-256 con una sal propia del proyecto.
- Los textos de los guiones sí van en el archivo, igual que en la versión anterior.

## Archivos

| Archivo | Qué hace |
|---|---|
| `index.html` | Pantalla del generador |
| `css/generador.css` | Estilos del generador |
| `js/generador.js` | Agentes, guiones, respaldo, importación y generación |
| `js/visor.js` | Plantilla del HTML que reciben los agentes (ingreso con cédula, búsqueda, categorías, favoritos y copiado) |

/**
 * Los colores de marca para cuando NO se puede contar con el CSS.
 *
 * La barra de estado del celular, la pantalla de arranque de la app instalada y
 * el icono del manifiesto los lee Android/iOS ANTES de que exista CSS, así que
 * ahí no se puede usar `var(--surface-base)`: tienen que ser valores literales.
 *
 * Por eso viven aquí y en un solo lugar: si la ficha de arte cambia el fondo, se
 * cambia acá y en `globals.css`, y nada más.
 * Fuente: FICHA-ARTE.md → fondo #090706.
 */
export const COLOR_FONDO_SISTEMA = "#090706";

/**
 * El resto de la paleta mínima, para la pantalla de fallo raíz
 * (`app/global-error.tsx`).
 *
 * ⚠️ POR QUÉ NO USA `var(--text-primary)` COMO TODO LO DEMÁS. Esa pantalla se
 * pinta cuando revienta el layout RAÍZ, y lo que falló pudo ser la carga del
 * propio `globals.css`. Un error boundary que depende de lo que se rompió no se
 * pinta: deja la pantalla en blanco, que es justo lo que venía a evitar.
 *
 * Es la MISMA razón por la que existe `COLOR_FONDO_SISTEMA`: sitios donde el
 * valor tiene que ser literal. Están aquí, juntos y con su origen anotado, para
 * que sigan siendo un solo sitio que cambiar.
 *
 * Fuente: FICHA-ARTE.md.
 */
export const COLORES_SIN_CSS = {
  texto: "#f6f1e7",
  textoSecundario: "#c9beac",
  /** El degradado dorado del CTA. */
  acenteDesde: "#ebcd8c",
  acenteHasta: "#d48e00",
  /** Texto sobre el dorado. */
  sobreAcento: "#14100c",
} as const;

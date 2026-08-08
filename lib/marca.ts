/**
 * Los colores de marca que consume el SISTEMA OPERATIVO, no el navegador.
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

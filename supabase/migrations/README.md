# Migraciones — cómo se nombran y cómo se aplican

## El nombre lleva DOS cosas, y las dos hacen falta

```
20260914190000_0008_accesos.sql
└──────┬─────┘ └─┬┘ └───┬───┘
   la fecha    el nº   de qué va
```

**La fecha** es lo que el CLI de Supabase lee como "versión": es lo que compara
contra la libreta de la base para saber qué falta por aplicar. Tiene que ir
delante y tiene que ser única.

**El número corto** no lo usa ninguna herramienta — lo usamos nosotros. Los
comentarios de todo el repo citan «la migración 0008», «la política de la 0009»,
«el cupo de la 0012». Con solo la fecha delante, esas 27 referencias quedarían
apuntando a un archivo que hay que buscar por contenido. Es el mismo patrón que
usa El Charcu (`20260901160000_0024_contador_por_cuenta.sql`) y está aquí por la
misma razón.

⚠️ **Si renombras un archivo, cambia SOLO lo que va después de la fecha.** Tocar
la fecha cambia la versión, y entonces la base cree que es una migración nueva y
la intenta aplicar otra vez.

## Crear una nueva

```bash
npx supabase migration new nombre_en_snake_case
```

Eso crea el archivo con la fecha de hoy. **Añádele a mano el número corto
siguiente** (`0013_`, `0014_`…) después de la fecha.

## Aplicarla

```bash
npx supabase db push
```

Aplica a **QA** (`cazqmaluaehyikkstkoi`), que es a lo que está enlazado el repo.

⚠️ **A producción no entra ninguna sin el visto bueno de Cristian**, cada vez.
Vale igual para un `drop table` que para añadir una columna.

## Reglas que costaron caro

**Un cambio de esquema = un archivo nuevo.** Nunca SQL suelto en el panel: lo
que no está en un archivo no existe para la otra base, y el día que se monte
producción faltará sin que nadie sepa qué.

**El CONTENIDO no va en migraciones.** Las tablas sí, lo que llevan dentro no.
El video de prueba de las lecciones de cortesía se cargó como dato contra QA a
propósito: en una migración habría acabado en producción, enseñándoles a las
alumnas el mismo video de prueba en las tres lecciones.
*(La excepción son los datos que SON estructura: el catálogo de `cupos` o el
listado de secciones y lecciones, que sin ellos la app no arranca.)*

**Antes de empujar a una base nueva, MIRA la libreta.** QA tenía sus 7 primeras
migraciones aplicadas pero anotadas con otros nombres, así que el CLI creía que
no había ninguna y `db push` habría intentado recrear el proyecto entero encima
del que funcionaba. Se cuadra con `supabase migration repair`, que solo toca el
registro y nunca el esquema:

```bash
npx supabase migration list                               # ver el descuadre
npx supabase migration repair --status applied  <version> # "esta ya estaba"
npx supabase migration repair --status reverted <version> # "esta anotación sobra"
```

⚠️ **Producción (`icbhtsdalysatlizjlys`) tendrá el mismo descuadre** si se montó
igual. Comprobarlo ANTES de empujarle nada, nunca con `db push` a ciegas.

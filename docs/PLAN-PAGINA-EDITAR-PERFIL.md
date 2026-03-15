# Plan: Página “Editar perfil” (reemplazo del modal)

## Objetivo

Sustituir el modal grande de “Editar perfil” por una **página dedicada** que:
- Contenga el mismo formulario (todos los campos actuales).
- Se adapte bien al **modo oscuro** (misma convención que el resto de la app).
- Deje **preparado** el hueco para luego implementar el input de **cambio de imagen de perfil** en esa misma página.

---

## 1. Estado actual (resumen)

| Elemento | Ubicación | Función |
|----------|-----------|---------|
| **Navegación** | `App.tsx` | Una sola “pantalla” por vez vía `activeSection`: dashboard, appointments, messages, followups, students, about, **settings**. No hay React Router. |
| **Configuración** | `Settings.tsx` | Página con secciones colapsables (Perfil, Seguridad, Políticas, etc.). En Perfil se muestra datos en solo lectura y el botón **“Editar perfil”**. |
| **Modal** | `ProfileEditModal.tsx` | Modal a pantalla completa que abre al hacer clic en “Editar perfil”. Formulario con: Nombre, Apellido, Documento, Especialidad, Fecha de nacimiento, Teléfono, Dirección, Correo institucional, Correo personal. Usa `usePsychologist()` (`updateProfile`, `refresh`) y tipo `PsychologistUpdate` de `lib/psychologist.ts`. |
| **Toasts** | `Settings.tsx` | Notificaciones de “Guardado” y error vía `createPortal` + estado `showSavedNotification` / `showErrorNotification`. |

El modal es el único que usa `ProfileEditModal`; no hay más referencias en el proyecto.

---

## 2. Cambios propuestos (por archivo)

### 2.1 `App.tsx`

- **Tipo `Section`**  
  Añadir la sección nueva:
  - `"profile-edit"`.

- **`renderSection()`**  
  Añadir un `case`:
  - `case "profile-edit": return <ProfileEditPage onBack={() => setActiveSection("settings")} />`
  - Importar el nuevo componente: `import { ProfileEditPage } from "./components/ProfileEditPage";`

- **Render de `Settings`**  
  Pasar un callback para ir a la nueva página:
  - `return <Settings onEditProfile={() => setActiveSection("profile-edit")} />`

- **Layout del `main`**  
  Tratar `profile-edit` igual que `settings` (mismo padding y contenedor):
  - En la condición del `main`, usar algo como: si `activeSection === 'messages'` → layout de mensajes; si no → `p-8` y `max-w-7xl` (incluye settings y profile-edit). No hace falta tocar nada si ya todo lo no-messages usa el mismo bloque; solo asegurar que `profile-edit` no entre en el caso de messages.

Resultado: al hacer clic en “Editar perfil” en Configuración, se muestra la nueva página; al “Volver” o “Cancelar”, se vuelve a Configuración.

---

### 2.2 Nuevo componente: `ProfileEditPage.tsx`

**Ubicación:** `src/components/ProfileEditPage.tsx`.

**Responsabilidades:**

1. **Encabezado de página**
   - Título: “Editar perfil”.
   - Botón o enlace “Volver a Configuración” que llame a `onBack()` (navegar a `settings`).

2. **Bloque “Imagen de perfil” (placeholder)**
   - Zona superior del contenido:
     - Avatar circular (iniciales con `usePsychologist().initials` o imagen por defecto).
     - Texto tipo “Cambiar imagen de perfil” o “Próximamente: podrás cambiar tu foto aquí”.
   - Sin input de archivo ni lógica de subida todavía; solo maquetado y estilos para modo claro/oscuro, para poder enganchar después el input.

3. **Formulario (misma lógica que el modal)**
   - Campos (mismos nombres e ids que en `ProfileEditModal` para no romper accesibilidad):
     - Nombre (`psiNombre`), Apellido (`psiApellido`).
     - Documento, Especialidad, Fecha de nacimiento, Teléfono, Dirección.
     - Correo institucional, Correo personal.
   - Estado local `formData` de tipo `PsychologistUpdate`, rellenado desde `psychologist` al montar (y cuando cambie `psychologist`), igual que en el modal.
   - Handlers: `handleChange(field, value)`, `handleSubmit` que llame a `updateProfile(formData)`, luego `refresh()` y manejo de éxito/error.

4. **Modo oscuro**
   - `useTheme()` y `isDark = resolvedTheme === 'dark'`.
   - Aplicar en:
     - Contenedor principal (card): por ejemplo `bg-white/90 dark:bg-slate-800/90`, bordes `border-purple-100/50 dark:border-slate-600/50`.
     - Labels: `text-slate-700 dark:text-slate-300` o el patrón que use ya Settings/Dashboard.
     - Inputs: `border-purple-200/50 dark:border-slate-600`, `bg-slate-50 dark:bg-slate-700`, `text-slate-900 dark:text-slate-200`, `focus:ring-purple-500/50`.
     - Botones: secundario (Volver/Cancelar) y primario (Guardar) con variantes claras/oscuras coherentes con el resto de la app.

5. **Toasts de éxito y error**
   - Estado local en el propio `ProfileEditPage`: `showSavedNotification`, `showErrorNotification`, `errorMessage`.
   - Tras guardar con éxito: mostrar toast “Guardado” y, opcionalmente, llamar a `onBack()` tras un pequeño delay (por ejemplo 1,5 s).
   - Tras error: mostrar toast con `errorMessage`.
   - Reutilizar el mismo patrón visual que en Settings (createPortal, posición fija abajo a la izquierda, mismo estilo de botón de cierre).

6. **Props**
   - `onBack: () => void` (obligatorio): para volver a Configuración.

7. **Dependencias**
   - `usePsychologist`, `useTheme`, tipo `PsychologistUpdate` (y si hace falta `Psychologist`) desde `lib/psychologist` y `contexts/PsychologistContext`.
   - Iconos (por ejemplo ArrowLeft o similar para “Volver”, Loader2 para “Guardando…”).

No usar el modal aquí; todo el contenido va en la página.

---

### 2.3 `Settings.tsx`

- **Quitar**
  - Estado `isEditModalOpen` y `setIsEditModalOpen`.
  - Import y cualquier uso de `ProfileEditModal`.
  - Props/callbacks que solo usaba el modal: `onSaveSuccess` y `onSaveError` del modal (y el estado de toasts que fuera exclusivo del guardado desde el modal). Si los toasts de “Guardado”/error solo se mostraban al guardar desde el modal, se pueden eliminar de Settings; si se usan para otra cosa, dejarlos.

- **Añadir**
  - Prop opcional: `onEditProfile?: () => void`.
  - En el botón “Editar perfil” (sección Perfil): en lugar de `onClick={() => setIsEditModalOpen(true)}`, llamar a `onEditProfile?.()`.

- **Resultado**
  - Al hacer clic en “Editar perfil” se ejecuta `onEditProfile()`, que en App hace `setActiveSection("profile-edit")` y se muestra la nueva página.

---

### 2.4 `ProfileEditModal.tsx`

- **Eliminar** el archivo `src/components/ProfileEditModal.tsx` una vez que la nueva página esté funcionando y no queden referencias (ya no se importa en Settings).

---

### 2.5 Sidebar

- **Comportamiento deseado:** cuando `activeSection === 'profile-edit'`, el sidebar debe seguir resaltando “Configuración” (igual que cuando `activeSection === 'settings'`), para que el usuario entienda que sigue dentro de ajustes.
- **Implementación:** en `Sidebar.tsx`, donde se determina el ítem activo, considerar “activo” el ítem de Configuración si `activeSection === 'settings' || activeSection === 'profile-edit'`. Si hoy se usa algo como `activeSection === 'settings'`, cambiarlo a esa condición.

---

## 3. Estructura visual de la nueva página (recomendada)

- Contenedor principal con `max-w-3xl` o `max-w-2xl` (centrado en el `max-w-7xl` del main) para que el formulario no se estire demasiado.
- Orden sugerido:
  1. Fila con título “Editar perfil” y botón/enlace “Volver a Configuración”.
  2. Card o bloque con:
     - **Imagen de perfil:** avatar circular + texto “Cambiar imagen (próximamente)” o similar.
     - **Formulario:** misma disposición que en el modal (grid de 2 columnas para Nombre/Apellido, resto en una columna).
  3. Botones al final: “Cancelar” / “Volver” (llaman a `onBack`) y “Guardar cambios” (submit), con el mismo estilo que en el modal (gradiente en Guardar, outline en Cancelar).

---

## 4. Preparación para la imagen de perfil (fase posterior)

- En `ProfileEditPage` dejar un bloque claro (por ejemplo un `div` con clase específica o un comentario) donde irá:
  - El `<input type="file" accept="image/*" />` (o el componente que se use).
  - La lógica de preview, recorte (si se usa) y subida al backend.
- No implementar aún subida ni API; solo el hueco visual y de estructura en esta fase.

---

## 5. Resumen de archivos

| Acción | Archivo |
|--------|---------|
| Crear | `src/components/ProfileEditPage.tsx` |
| Modificar | `src/App.tsx` (Section, renderSection, props de Settings) |
| Modificar | `src/components/Settings.tsx` (quitar modal, añadir onEditProfile) |
| Modificar | `src/components/Sidebar.tsx` (resaltar Configuración cuando activeSection === 'profile-edit') |
| Eliminar | `src/components/ProfileEditModal.tsx` |

---

## 6. Orden sugerido de implementación

1. Crear `ProfileEditPage.tsx` con formulario, placeholder de imagen, modo oscuro y toasts.
2. En `App.tsx`: añadir `profile-edit` al tipo y al switch, importar `ProfileEditPage`, pasar `onEditProfile` a Settings.
3. En `Settings.tsx`: añadir prop `onEditProfile`, quitar modal y su estado, enlazar el botón “Editar perfil” a `onEditProfile`.
4. En `Sidebar.tsx`: ajustar la condición de “Configuración” activo para incluir `profile-edit`.
5. Probar flujo: Configuración → Editar perfil → Guardar / Volver; probar en tema claro y oscuro.
6. Eliminar `ProfileEditModal.tsx`.

Cuando des el visto bueno a este plan, se puede bajar a código concreto (clases, textos exactos y nombres de props) en cada archivo.

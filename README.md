# 3lab3 - Liga de Baloncesto

Sistema completo de gestión de ligas de baloncesto con registro de equipos, gestión de partidos y seguimiento de estadísticas.

## 🏀 Características Principales

### Para Usuarios
- **Registro de Equipos**: Los capitanes pueden registrar sus equipos con información completa
- **Gestión de Jugadores**: Agregar jugadores con nombres, números y posiciones
- **Dashboard Personal**: Ver información del equipo, estado de pago y estadísticas
- **Seguimiento de Aprobación**: Ver si el equipo ha sido aprobado como oficial

### Para Administradores
- **Gestión de Ligas**: Crear y administrar múltiples ligas y temporadas
- **Aprobación de Equipos**: Revisar inscripciones y crear equipos oficiales
- **Gestión de Partidos**: Crear partidos, actualizar resultados
- **Actualización Automática**: Las victorias/derrotas se actualizan automáticamente

## 📋 Flujo Completo del Sistema

1. **Registro de Equipo** (Usuario)
   - Completar formulario de inscripción
   - Proporcionar email y contraseña
   - Pago pendiente de confirmación

2. **Gestión de Jugadores** (Usuario)
   - Iniciar sesión con credenciales
   - Acceder al dashboard
   - Agregar jugadores (hasta el número registrado)

3. **Aprobación** (Admin)
   - Revisar inscripciones en panel de admin
   - Marcar pago como "Pagado"
   - Hacer clic en "Crear Equipo" cuando esté completo
   - El equipo pasa a ser oficial en la liga

4. **Gestión de Partidos** (Admin)
   - Crear partidos entre equipos oficiales
   - Actualizar resultados al finalizar
   - Las estadísticas se actualizan automáticamente

## 🔐 Acceso al Sistema

### Usuario Normal
- Registrarse desde el formulario de inscripción
- Email y contraseña proporcionados durante el registro
- Acceso al dashboard personal

### Administrador
- Acceso configurado en la base de datos (tabla `user_roles`)
- Panel de administración completo
- Gestión de ligas, equipos, partidos e inscripciones

## 🗄️ Estructura de la Base de Datos

- `leagues`: Ligas y temporadas
- `teams`: Equipos oficiales aprobados
- `team_registrations`: Inscripciones pendientes
- `players`: Jugadores de cada equipo
- `matches`: Partidos programados y completados
- `user_roles`: Roles de administrador
- `profiles`: Perfiles de usuario

## 🎯 Próximos Pasos Sugeridos

1. ✅ **Sistema completado** - Todas las funciones principales están operativas
2. 🎨 **Personalización visual** - Ajustar colores y estilos según preferencias
3. 📧 **Notificaciones** - Agregar emails automáticos (opcional)
4. 📊 **Reportes** - Crear reportes de liga y estadísticas (opcional)
5. 🌐 **Dominio personalizado** - Conectar dominio propio
6. 🚀 **Publicar** - Hacer deploy de la versión final

## 🛠️ Tecnologías Utilizadas

- React + TypeScript
- Vite
- Tailwind CSS
- Supabase (Backend)
- Shadcn/UI Components

## 📝 Notas Importantes

- Las contraseñas se generan durante el registro del equipo
- El trigger `update_team_records` actualiza wins/losses automáticamente
- RLS policies protegen los datos según el rol del usuario
- Todos los equipos deben tener el número completo de jugadores antes de aprobación

## Project info

**URL**: https://lovable.dev/projects/d91f2e80-adde-4e9b-a8bf-97392ef82839

## How can I edit this code?

There are several ways of editing your application.

**Use Lovable**

Simply visit the [Lovable Project](https://lovable.dev/projects/d91f2e80-adde-4e9b-a8bf-97392ef82839) and start prompting.

Changes made via Lovable will be committed automatically to this repo.

**Use your preferred IDE**

If you want to work locally using your own IDE, you can clone this repo and push changes. Pushed changes will also be reflected in Lovable.

The only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

Follow these steps:

```sh
# Step 1: Clone the repository using the project's Git URL.
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory.
cd <YOUR_PROJECT_NAME>

# Step 3: Install the necessary dependencies.
npm i

# Step 4: Start the development server with auto-reloading and an instant preview.
npm run dev
```

**Edit a file directly in GitHub**

- Navigate to the desired file(s).
- Click the "Edit" button (pencil icon) at the top right of the file view.
- Make your changes and commit the changes.

**Use GitHub Codespaces**

- Navigate to the main page of your repository.
- Click on the "Code" button (green button) near the top right.
- Select the "Codespaces" tab.
- Click on "New codespace" to launch a new Codespace environment.
- Edit files directly within the Codespace and commit and push your changes once you're done.

## What technologies are used for this project?

This project is built with:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS

## How can I deploy this project?

Simply open [Lovable](https://lovable.dev/projects/d91f2e80-adde-4e9b-a8bf-97392ef82839) and click on Share -> Publish.

## Can I connect a custom domain to my Lovable project?

Yes, you can!

To connect a domain, navigate to Project > Settings > Domains and click Connect Domain.

Read more here: [Setting up a custom domain](https://docs.lovable.dev/features/custom-domain#custom-domain)

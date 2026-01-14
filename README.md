# macOS Portfolio

Portfolio interactivo que simula el escritorio de macOS con ventanas funcionales.

## Características

- 🖥️ Interfaz similar a macOS con efecto glassmorphism
- 📱 Emulador de iOS integrado
- 🪟 Ventanas arrastrables y redimensionables
- 🎨 Diseño completamente en Tailwind CSS
- ⚡ Construido con Vite + React + TypeScript

## Instalación

### Requisitos previos
- Bun instalado (https://bun.sh)

### Pasos

1. Instalar dependencias:
```bash
bun install
```

2. Iniciar servidor de desarrollo:
```bash
bun run dev
```

3. Construir para producción:
```bash
bun run build
```

4. Previsualizar build de producción:
```bash
bun run preview
```

## Comandos útiles

- `bun run format` - Formatear código con Prettier
- `bun run lint` - Verificar formato del código

## Estructura del proyecto

- `src/components/MacOSPortfolio.tsx` - Componente principal del portfolio
- `src/App.tsx` - Componente raíz
- `src/main.tsx` - Punto de entrada
- `src/index.css` - Estilos globales y Tailwind

## Personalización

Puedes personalizar el contenido editando las secciones en `MacOSPortfolio.tsx`:
- AboutContent
- ProjectsContent
- iOSEmulatorContent
- ContactContent

## Extensiones recomendadas para VSCode

- Prettier - Code formatter (esbenp.prettier-vscode)
- Tailwind CSS IntelliSense (bradlc.vscode-tailwindcss)

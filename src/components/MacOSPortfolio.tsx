import Lottie from 'lottie-react';
import { Heart, Moon, Sun } from 'lucide-react';
import React, { useEffect, useState } from 'react';

import loadingAnimation from '../../public/animations/loading_gray.json';

interface Window {
  id: string;
  title: string;
  component: React.ReactNode;
  x: number;
  y: number;
  width: number;
  height: number;
  isMinimized: boolean;
  isAnimating: boolean;
  zIndex: number;
}

const MacOSPortfolio: React.FC = () => {
  // Opciones de cada menú
  const menuOptions = {
    Archivo: ['Nuevo', 'Abrir', 'Guardar'],
    Editar: ['Deshacer', 'Copiar', 'Pegar'],
    Ver: ['Pantalla completa', 'Zoom', 'Mostrar barra lateral'],
    Ir: ['Escritorio', 'Documentos', 'Descargas'],
  };
  // Selección de área en el escritorio
  const [selectRect, setSelectRect] = useState<null | {
    x: number;
    y: number;
    w: number;
    h: number;
  }>(null);
  const [selectStart, setSelectStart] = useState<null | { x: number; y: number }>(null);
  const [selectedIcons, setSelectedIcons] = useState<number[]>([]);
  const [windows, setWindows] = useState<Window[]>([]);
  const [nextZIndex, setNextZIndex] = useState(100);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [dragging, setDragging] = useState<{
    windowId: string;
    offsetX: number;
    offsetY: number;
  } | null>(null);
  const [resizing, setResizing] = useState<{
    windowId: string;
    startX: number;
    startY: number;
    startWidth: number;
    startHeight: number;
    direction: string;
  } | null>(null);

  // Wallpaper URL - Reemplaza con tu propia imagen
  const wallpaperUrl =
    'https://4kwallpapers.com/images/wallpapers/macos-catalina-mountains-island-night-stock-5k-6016x6016-189.jpg';

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const openWindow = (
    title: string,
    component: React.ReactNode,
    width?: number,
    height?: number
  ) => {
    // Si width/height no están definidos, usar valores por defecto
    const winWidth = typeof width === 'number' ? width : 600;
    const winHeight = typeof height === 'number' ? height : 400;
    const newWindow: Window = {
      id: `window-${Date.now()}`,
      title,
      component,
      x: 100 + windows.length * 30,
      y: 80 + windows.length * 30,
      width: winWidth,
      height: winHeight,
      isMinimized: false,
      isAnimating: true,
      zIndex: nextZIndex,
    };
    setWindows([...windows, newWindow]);
    setNextZIndex(nextZIndex + 1);

    // Quitar la animación después de que termine
    setTimeout(() => {
      setWindows((prev) =>
        prev.map((w) => (w.id === newWindow.id ? { ...w, isAnimating: false } : w))
      );
    }, 400);
  };

  const closeWindow = (id: string) => {
    setWindows(windows.filter((w) => w.id !== id));
  };

  const minimizeWindow = (id: string) => {
    setWindows(windows.map((w) => (w.id === id ? { ...w, isAnimating: true } : w)));

    // Esperar a que termine la animación antes de minimizar
    setTimeout(() => {
      setWindows((prev) =>
        prev.map((w) => (w.id === id ? { ...w, isMinimized: true, isAnimating: false } : w))
      );
    }, 400);
  };

  const restoreWindow = (id: string) => {
    setWindows(
      windows.map((w) => {
        if (w.id === id) {
          return { ...w, isMinimized: false, zIndex: nextZIndex };
        }
        return w;
      })
    );
    setNextZIndex(nextZIndex + 1);
  };

  const maximizeWindow = (id: string) => {
    setWindows(
      windows.map((w) => {
        if (w.id === id) {
          // Si ya está maximizada, restaurar tamaño original
          if (w.width === window.innerWidth && w.height === window.innerHeight - 28 - 82) {
            return { ...w, x: 100, y: 80, width: 600, height: 400 };
          }
          // Maximizar: pantalla completa menos barra superior (28px) y dock (82px)
          return {
            ...w,
            x: 0,
            y: 28,
            width: window.innerWidth,
            height: window.innerHeight - 28 - 82,
          };
        }
        return w;
      })
    );
  };

  const bringToFront = (id: string) => {
    setWindows(windows.map((w) => (w.id === id ? { ...w, zIndex: nextZIndex } : w)));
    setNextZIndex(nextZIndex + 1);
  };

  const handleMouseDown = (e: React.MouseEvent, windowId: string) => {
    if ((e.target as HTMLElement).closest('.window-controls')) return;
    if ((e.target as HTMLElement).closest('.resize-handle')) return;
    bringToFront(windowId);
    const window = windows.find((w) => w.id === windowId);
    if (window) {
      setDragging({
        windowId,
        offsetX: e.clientX - window.x,
        offsetY: e.clientY - window.y,
      });
    }
  };

  const handleResizeMouseDown = (e: React.MouseEvent, windowId: string, direction: string) => {
    e.stopPropagation();
    e.preventDefault();
    const window = windows.find((w) => w.id === windowId);
    if (window) {
      setResizing({
        windowId,
        startX: e.clientX,
        startY: e.clientY,
        startWidth: window.width,
        startHeight: window.height,
        direction,
      });
      bringToFront(windowId);
    }
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (dragging) {
        setWindows(
          windows.map((w) =>
            w.id === dragging.windowId
              ? { ...w, x: e.clientX - dragging.offsetX, y: e.clientY - dragging.offsetY }
              : w
          )
        );
      }
      if (resizing) {
        const deltaX = e.clientX - resizing.startX;
        const deltaY = e.clientY - resizing.startY;

        setWindows(
          windows.map((w) => {
            if (w.id === resizing.windowId) {
              const newWindow = { ...w };

              // Redimensionar según la dirección
              if (resizing.direction.includes('e')) {
                newWindow.width = Math.max(300, resizing.startWidth + deltaX);
              }
              if (resizing.direction.includes('w')) {
                const newWidth = Math.max(300, resizing.startWidth - deltaX);
                if (newWidth > 300) {
                  newWindow.x = w.x + deltaX;
                  newWindow.width = newWidth;
                }
              }
              if (resizing.direction.includes('s')) {
                newWindow.height = Math.max(200, resizing.startHeight + deltaY);
              }
              if (resizing.direction.includes('n')) {
                const newHeight = Math.max(200, resizing.startHeight - deltaY);
                if (newHeight > 200) {
                  newWindow.y = w.y + deltaY;
                  newWindow.height = newHeight;
                }
              }

              return newWindow;
            }
            return w;
          })
        );
      }
    };

    const handleMouseUp = () => {
      setDragging(null);
      setResizing(null);
    };

    if (dragging || resizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [dragging, resizing, windows]);

  const AboutContent = () => (
    <div className={`p-6 ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>
      <h2 className="mb-4 text-2xl font-bold">Sobre mí</h2>
      <p className="mb-3">
        Desarrollador especializado en aplicaciones móviles con tecnologías hibridas. (Flutter &
        React Native)
      </p>
      <p className="mb-3">Experiencia en desarrollo FrontEnd con React y TypeScript.</p>
      <p className="mb-3">Experiencia en desarrollo backend con Python y FastAPI.</p>
      <p className="mb-3">Integraciones de arquitectura con AWS.</p>
      <p className="mb-3">Inglés conversacional sin titulación.</p>
      <p className="mb-3">Apasionado del mundo de desarrollo de videojuegos.</p>
      <p>
        Always developing trust <Heart />
      </p>
    </div>
  );

  const ProjectsContent = () => (
    <div className={`p-6 ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>
      <h2 className="mb-4 text-2xl font-bold">Experiencia Laboral</h2>
      <ul className="divide-y rounded-xl border border-gray-200 bg-white/80 shadow">
        <li className="flex items-start gap-4 p-4 transition-colors hover:bg-gray-100">
          <div>
            <h3 className="text-lg font-semibold">
              CORBITAL{' '}
              <span className="text-xs font-normal text-gray-400">
                | Desarrollador Full Stack (2021-2024)
              </span>
            </h3>
            <p className="text-md text-black-900 ml-5 mt-2 dark:text-gray-400">
              En mi desarrollo en Corbital, he pasado de ser Junior a Lead Front End Developer,
              llegando a tener un Junior Developer a mi cargo.
            </p>
            <ul className="ml-5 mt-2 list-disc space-y-1 text-sm text-gray-600 dark:text-gray-400">
              <li>Aplicación móvil para tarjetas coorporativas</li>
              <li>Desarrollo de panel de administración web con React</li>
              <li>Desarrollo de APIs con REST Framework y FastAPI en Python</li>
              <li>Gestión de contenedores ECS y entornos Amplify en AWS</li>
              <li>Desarrollo de Aplicación web con Drupal 10</li>
              <li>
                Aplicación móvil de marketplace con +10000 productos y pasarela de pago con Stripe
              </li>
              <li>
                Aplicación web de portal de nutricionistas para gestionar los clientes (Chat en
                tiempo real, pasarela de pago, notificaciones)
              </li>
            </ul>
          </div>
        </li>
        <li className="flex items-start gap-4 p-4 transition-colors hover:bg-gray-100">
          <div>
            <h3 className="text-lg font-semibold">
              ExioHR{' '}
              <span className="text-xs font-normal text-gray-400">
                | Desarrollador Full Stack (2024-2026)
              </span>
            </h3>
            <p className="text-md text-black-900 ml-5 mt-2 dark:text-gray-400">
              En mi paso por ExioHR he desarrollado integramente la Aplicación móvil para su
              plataforma del sistema de empleados. También he desarrollado toda la parte del backend
              de la misma y he desarrollado parte de la Aplicación web en el FrontEnd con React y
              TypeScript.
            </p>
            <ul className="ml-5 mt-2 list-disc space-y-1 text-sm text-gray-600 dark:text-gray-400">
              <li>
                Aplicación móvil para gestión de empleados (Fichaje, Vacaciones, Ausencias,
                Notificaciones...)
              </li>
              <li>Desarrollo de Aplicación web con React Typescript</li>
              <li>Desarrollo de APIs con FastAPI en Python</li>
              <li>Integración con APIs externas</li>
              <li>Desarrollo de librería de componentes propia</li>
            </ul>
          </div>
        </li>
      </ul>
    </div>
  );

  const EmulatorContent: React.FC = () => (
    <div className="flex h-full items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200 p-4">
      <div
        className="relative overflow-hidden rounded-[3rem] bg-black shadow-2xl"
        style={{ width: '375px', height: '667px', maxWidth: '100%', maxHeight: '100%' }}
      >
        <div className="absolute left-1/2 top-2 z-10 h-7 w-32 -translate-x-1/2 transform rounded-3xl bg-black"></div>
        <div className="flex h-full w-full items-center justify-center overflow-hidden rounded-[2.8rem] bg-white text-gray-400">
          <div className="text-center">
            <div className="mb-2 text-6xl">📱</div>
            <p>iPhone 17</p>
            <p className="mt-2 text-sm">375 x 667 px</p>
          </div>
        </div>
      </div>
    </div>
  );

  const ContactContent = () => (
    <div className={`p-6 ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>
      <h2 className="mb-4 text-2xl font-bold">Contacto</h2>
      <div className="space-y-3">
        <div>
          <p className="font-semibold">Email</p>
          <a
            className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}
            href="mailto:llomen@outlook.es"
            target="_blank"
            rel="noopener noreferrer"
          >
            llomen@outlook.es
          </a>
        </div>
        <div>
          <p className="font-semibold">LinkedIn</p>
          <a
            className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}
            href="https://linkedin.com/in/antoniollm"
            target="_blank"
            rel="noopener noreferrer"
          >
            linkedin.com/in/antoniollm
          </a>
        </div>
        <div>
          <p className="font-semibold">GitHub</p>
          <a
            className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}
            href="https://github.com/LlomenYT"
            target="_blank"
            rel="noopener noreferrer"
          >
            github.com/LlomenYT
          </a>
        </div>
      </div>
    </div>
  );

  const dockIcons = [
    { name: 'Sobre mí', emoji: '👤', content: <AboutContent /> },
    { name: 'Proyectos', emoji: '💼', content: <ProjectsContent /> },
    { name: 'iOS Emulator', emoji: '📱', content: <EmulatorContent />, width: 450, height: 750 },
    { name: 'Contacto', emoji: '✉️', content: <ContactContent /> },
  ];

  const desktopIcons = [
    { name: 'Navegador', emoji: '🌍', x: 50, y: 60 },
    { name: 'Documentos', emoji: '📄', x: 50, y: 170 },
    { name: 'Fotos', emoji: '🖼️', x: 50, y: 280 },
  ];

  // Loading Animation Logic
  const [loading, setLoading] = useState(true);
  const [fadeOut, setFadeOut] = useState(false);
  const lottieRef = React.useRef<any>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      setFadeOut(true);
      setTimeout(() => setLoading(false), 600); // Match the duration of the fade-out
    }, 3000); // Show loading for 3 seconds
    return () => clearTimeout(timer);
  }, []);

  // Funciones para selección de área
  const handleDesktopMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    // Solo si se hace click en el fondo, no en iconos ni ventanas
    if (
      (e.target as HTMLElement).closest('.desktop-icon') ||
      (e.target as HTMLElement).closest('.window')
    )
      return;
    setSelectStart({ x: e.clientX, y: e.clientY });
    setSelectRect({ x: e.clientX, y: e.clientY, w: 0, h: 0 });
    setSelectedIcons([]);
  };

  useEffect(() => {
    if (!selectStart) return;
    const handleMouseMove = (e: MouseEvent) => {
      const x1 = selectStart.x;
      const y1 = selectStart.y;
      const x2 = e.clientX;
      const y2 = e.clientY;
      setSelectRect({
        x: Math.min(x1, x2),
        y: Math.min(y1, y2),
        w: Math.abs(x2 - x1),
        h: Math.abs(y2 - y1),
      });
    };
    const handleMouseUp = () => {
      setSelectStart(null);
      setSelectRect(null);
    };
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [selectStart]);

  useEffect(() => {
    if (!selectRect) return;
    // Seleccionar iconos dentro del área
    const selected: number[] = [];
    desktopIcons.forEach((icon, idx) => {
      // Icon bounds
      const iconX = icon.x;
      const iconY = icon.y;
      const iconW = 80; // aprox ancho icono
      const iconH = 80; // aprox alto icono
      if (
        selectRect.x < iconX + iconW &&
        selectRect.x + selectRect.w > iconX &&
        selectRect.y < iconY + iconH &&
        selectRect.y + selectRect.h > iconY
      ) {
        selected.push(idx);
      }
    });
    setSelectedIcons(selected);
  }, [selectRect, desktopIcons]);

  type MenuKey = keyof typeof menuOptions;
  const [openDropdown, setOpenDropdown] = useState<MenuKey | null>(null);

  return (
    <div className="relative h-screen w-screen select-none overflow-hidden font-sans">
      {loading && (
        <div
          className={`duration-600 fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-black transition-opacity ${fadeOut ? 'pointer-events-none opacity-0' : 'opacity-100'}`}
        >
          <div className="flex h-40 w-40 items-center justify-center">
            <Lottie
              lottieRef={lottieRef}
              animationData={loadingAnimation}
              loop
              autoplay
              style={{ width: '30%', height: '30%' }}
            />
          </div>
        </div>
      )}
      {/* Wallpaper Background */}
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage: `url(${wallpaperUrl})`,
          filter: isDarkMode ? 'brightness(0.7)' : 'brightness(0.9)',
        }}
      />

      {/* Overlay for better readability */}
      <div className={`absolute inset-0 ${isDarkMode ? 'bg-black/20' : 'bg-black/10'}`} />

      {/* Menu Bar */}
      <div
        className={`relative z-50 flex h-7 items-center border-b px-4 text-sm font-medium backdrop-blur-xl ${
          isDarkMode
            ? 'border-white/10 bg-gray-900/70 text-white'
            : 'border-white/30 bg-white/20 text-white'
        }`}
      >
        <div className="flex items-center space-x-2">
          <img src="../../public/icon.png" alt="Logo llomen" className="h-5 w-5" />
          {(Object.keys(menuOptions) as MenuKey[]).map((menu) => (
            <div key={menu} className="relative">
              <button
                className={`rounded px-2 py-0.5 ${
                  isDarkMode ? 'hover:bg-white/10' : 'hover:bg-white/20'
                }`}
                onClick={() => setOpenDropdown(openDropdown === menu ? null : menu)}
              >
                {menu}
              </button>
              {openDropdown === menu && (
                <div
                  className={`absolute left-0 top-full z-50 mt-1 min-w-[120px] rounded-lg border shadow-lg ${
                    isDarkMode
                      ? 'border-gray-700 bg-gray-900 text-white'
                      : 'border-gray-200 bg-white text-gray-800'
                  }`}
                  onMouseLeave={() => setOpenDropdown(null)}
                >
                  {menuOptions[menu].map((option) => (
                    <button
                      key={option}
                      className={`block w-full px-4 py-2 text-left text-sm hover:bg-gray-800 dark:hover:bg-gray-100`}
                      onClick={() => {
                        setOpenDropdown(null);
                        // Aquí puedes añadir la acción de cada opción si lo deseas
                      }}
                    >
                      {option}
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="ml-auto flex items-center space-x-4">
          {/* Dark Mode Toggle */}
          <button
            onClick={() => setIsDarkMode(!isDarkMode)}
            className={`flex items-center space-x-1 rounded px-2 py-0.5 transition-colors ${
              isDarkMode ? 'hover:bg-white/10' : 'hover:bg-white/20'
            }`}
            title={isDarkMode ? 'Modo claro' : 'Modo oscuro'}
          >
            {isDarkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </button>

          {/* Clock */}
          <div>
            {currentTime.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}
          </div>
        </div>
      </div>

      {/* Desktop Icons y selección */}
      <div
        className="relative h-full w-full"
        style={{ position: 'absolute', inset: 0, zIndex: 10 }}
        onMouseDown={handleDesktopMouseDown}
      >
        {desktopIcons.map((icon, idx) => (
          <div
            key={idx}
            className={`desktop-icon group absolute flex w-20 cursor-pointer flex-col items-center ${selectedIcons.includes(idx) ? 'bg-white/60 ring-2' : ''}`}
            style={{ left: icon.x, top: icon.y, borderRadius: 12 }}
            onDoubleClick={() =>
              openWindow(
                icon.name,
                <div className={`p-6 ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>
                  <p>Contenido de {icon.name}</p>
                </div>
              )
            }
          >
            <div className="mb-1 text-5xl transition-transform group-hover:scale-110">
              {icon.emoji}
            </div>
            <span
              className={`rounded px-2 py-0.5 text-center text-xs backdrop-blur-sm ${
                isDarkMode ? 'bg-black/50 text-white' : 'bg-black/30 text-white'
              }`}
            >
              {icon.name}
            </span>
          </div>
        ))}
        {/* Área de selección tipo macOS */}
        {selectRect && (
          <div
            style={{
              position: 'absolute',
              left: selectRect.x,
              top: selectRect.y,
              width: selectRect.w,
              height: selectRect.h,
              background: 'rgba(255,255,255,0.25)',
              border: '1.5px solid rgba(177, 177, 193, 0.25)',
              borderRadius: 4,
              boxShadow: '0 0 8px 0 rgba(180,180,200,0.15)',
              pointerEvents: 'none',
            }}
          />
        )}
      </div>

      {/* Windows */}
      {windows
        .filter((w) => !w.isMinimized)
        .map((window) => (
          <div
            key={window.id}
            className={`absolute overflow-hidden rounded-xl border shadow-2xl backdrop-blur-xl ${
              isDarkMode ? 'border-gray-700/50 bg-gray-800/95' : 'border-gray-200/50 bg-white/95'
            }`}
            style={{
              left: window.x,
              top: window.y,
              width: window.width,
              height: window.height,
              zIndex: window.zIndex,
              minWidth: '300px',
              minHeight: '200px',
            }}
            onMouseDown={() => bringToFront(window.id)}
          >
            {/* Window Title Bar */}
            <div
              className={`flex h-10 cursor-move items-center border-b px-4 ${
                isDarkMode
                  ? 'border-gray-700 bg-gradient-to-b from-gray-700 to-gray-800'
                  : 'border-gray-200 bg-gradient-to-b from-gray-100 to-gray-50'
              }`}
              onMouseDown={(e) => handleMouseDown(e, window.id)}
            >
              <div className="window-controls flex space-x-2">
                <button
                  onClick={() => closeWindow(window.id)}
                  className="h-3 w-3 rounded-full bg-red-500 hover:bg-red-600"
                />
                <button
                  onClick={() => minimizeWindow(window.id)}
                  className="h-3 w-3 rounded-full bg-yellow-500 hover:bg-yellow-600"
                />
                <button
                  onClick={() => maximizeWindow(window.id)}
                  className="h-3 w-3 rounded-full bg-green-500 hover:bg-green-600"
                />
              </div>
              <div
                className={`flex-1 text-center text-sm font-medium ${
                  isDarkMode ? 'text-gray-200' : 'text-gray-700'
                }`}
                style={{ position: 'relative', left: '-3%', zIndex: 1, pointerEvents: 'none' }}
              >
                {window.title}
              </div>
            </div>

            {/* Window Content */}
            <div className="overflow-auto" style={{ height: window.height - 40 }}>
              {window.component}
            </div>

            {/* Resize Handles - All 8 directions */}
            {/* Corners */}
            <div
              className="resize-handle absolute bottom-0 right-0 h-3 w-3 cursor-se-resize"
              onMouseDown={(e) => handleResizeMouseDown(e, window.id, 'se')}
            />
            <div
              className="resize-handle absolute bottom-0 left-0 h-3 w-3 cursor-sw-resize"
              onMouseDown={(e) => handleResizeMouseDown(e, window.id, 'sw')}
            />
            <div
              className="resize-handle absolute right-0 top-10 h-3 w-3 cursor-ne-resize"
              onMouseDown={(e) => handleResizeMouseDown(e, window.id, 'ne')}
            />
            <div
              className="resize-handle absolute left-0 top-10 h-3 w-3 cursor-nw-resize"
              onMouseDown={(e) => handleResizeMouseDown(e, window.id, 'nw')}
            />

            {/* Edges */}
            <div
              className="resize-handle absolute bottom-0 left-3 right-3 h-1 cursor-s-resize"
              onMouseDown={(e) => handleResizeMouseDown(e, window.id, 's')}
            />
            <div
              className="resize-handle top-13 absolute bottom-3 left-0 w-1 cursor-w-resize"
              onMouseDown={(e) => handleResizeMouseDown(e, window.id, 'w')}
            />
            <div
              className="resize-handle top-13 absolute bottom-3 right-0 w-1 cursor-e-resize"
              onMouseDown={(e) => handleResizeMouseDown(e, window.id, 'e')}
            />
            <div
              className="resize-handle absolute left-3 right-3 top-10 h-1 cursor-n-resize"
              onMouseDown={(e) => handleResizeMouseDown(e, window.id, 'n')}
            />
          </div>
        ))}

      {/* Dock */}
      <div
        className={`absolute bottom-2 left-1/2 flex -translate-x-1/2 transform items-end space-x-2 rounded-2xl border px-3 py-2 backdrop-blur-xl ${
          isDarkMode ? 'border-white/20 bg-gray-900/40' : 'border-white/30 bg-white/20'
        }`}
        style={{ zIndex: 9000 }}
      >
        {dockIcons.map((icon, idx) => (
          <button
            key={idx}
            onClick={() => openWindow(icon.name, icon.content, icon.width, icon.height)}
            className="group relative"
          >
            <div
              className={`flex h-14 w-14 items-center justify-center rounded-xl text-4xl shadow-lg backdrop-blur-sm transition-transform hover:-translate-y-2 hover:scale-110 ${
                isDarkMode ? 'bg-gray-800/70' : 'bg-white/50'
              }`}
            >
              {icon.emoji}
            </div>
            <div className="absolute -top-8 left-1/2 -translate-x-1/2 transform whitespace-nowrap rounded bg-gray-800/90 px-2 py-1 text-xs text-white opacity-0 transition-opacity group-hover:opacity-100">
              {icon.name}
            </div>
          </button>
        ))}

        {/* Minimized Windows */}
        {windows
          .filter((w) => w.isMinimized)
          .map((window) => (
            <button
              key={window.id}
              onClick={() => restoreWindow(window.id)}
              className="group relative"
            >
              <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-blue-500/70 text-2xl shadow-lg backdrop-blur-sm transition-transform hover:-translate-y-2 hover:scale-110">
                📄
              </div>
              <div className="absolute -top-8 left-1/2 -translate-x-1/2 transform whitespace-nowrap rounded bg-gray-800/90 px-2 py-1 text-xs text-white opacity-0 transition-opacity group-hover:opacity-100">
                {window.title}
              </div>
            </button>
          ))}
      </div>
    </div>
  );
};

export default MacOSPortfolio;

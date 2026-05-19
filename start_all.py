# start_all.py - Ejecuta backend y frontend juntos
import subprocess
import sys
import os
import time
import webbrowser
import platform

def main():
    print("=" * 60)
    print("🚀 INICIANDO PC HARDWARE MONITOR")
    print("=" * 60)
    
    # Detectar sistema operativo
    is_windows = platform.system() == "Windows"
    
    # Iniciar Backend
    print("\n📡 Iniciando Backend (Flask)...")
    if is_windows:
        backend = subprocess.Popen(
            [sys.executable, "backend/app.py"],
            creationflags=subprocess.CREATE_NEW_CONSOLE
        )
    else:
        backend = subprocess.Popen(
            [sys.executable, "backend/app.py"],
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE
        )
    
    print("✅ Backend iniciado en http://localhost:5000")
    
    # Esperar que el backend esté listo
    time.sleep(3)
    
    # Iniciar Frontend
    print("\n🎨 Iniciando Frontend (React + Vite)...")
    if is_windows:
        frontend = subprocess.Popen(
            ["npm", "run", "dev"],
            cwd="frontend",
            creationflags=subprocess.CREATE_NEW_CONSOLE,
            shell=True
        )
    else:
        frontend = subprocess.Popen(
            ["npm", "run", "dev"],
            cwd="frontend",
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE
        )
    
    print("✅ Frontend iniciado en http://localhost:3000")
    
    # Esperar que el frontend esté listo
    time.sleep(3)
    
    # Abrir navegador
    print("\n🌐 Abriendo navegador...")
    webbrowser.open("http://localhost:3000")
    
    print("\n" + "=" * 60)
    print("✅ SISTEMA EN EJECUCIÓN")
    print("=" * 60)
    print("Backend:  http://localhost:5000")
    print("Frontend: http://localhost:3000")
    print("\n💡 Presiona Ctrl+C para detener todo\n")
    
    try:
        # Mantener el script corriendo
        backend.wait()
        frontend.wait()
    except KeyboardInterrupt:
        print("\n\n🛑 Deteniendo servicios...")
        backend.terminate()
        frontend.terminate()
        print("✅ Servicios detenidos")

if __name__ == "__main__":
    main()
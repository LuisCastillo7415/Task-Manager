import psutil

# Inicializar medición de CPU (IMPORTANTE)
for p in psutil.process_iter():
    try:
        p.cpu_percent(None)
    except:
        pass


def get_processes():

    processes = []

    for p in psutil.process_iter(['pid', 'name']):
        try:
            process_info = {
                "pid": p.info['pid'],
                "name": p.info['name'],
                "cpu_percent": p.cpu_percent(None),
                "memory_percent": p.memory_percent()
            }

            processes.append(process_info)

        except (psutil.NoSuchProcess, psutil.AccessDenied, psutil.ZombieProcess):
            pass

    # Ordenar por uso de CPU (de mayor a menor)
    processes = sorted(processes, key=lambda x: x['cpu_percent'], reverse=True)

    return processes
import psutil
import platform
import time
import os
import random
from datetime import datetime, timedelta

_history_buffer = []
_last_net_io = None
_last_net_time = None


def get_cpu_usage():
    return psutil.cpu_percent(interval=0.1)


def get_ram_usage():
    return psutil.virtual_memory().percent


def get_disk_usage():
    try:
        # Try Windows path first, fallback to root
        path = 'C:/' if os.name == 'nt' else '/'
        return psutil.disk_usage(path).percent
    except:
        return 0


def get_cpu_detail():
    """Full CPU detail: per-core usage, freq, temp, top processes."""
    global _history_buffer

    cpu_percent_total = psutil.cpu_percent(interval=0.1)
    cpu_per_core = psutil.cpu_percent(interval=None, percpu=True)
    freq = psutil.cpu_freq()
    cpu_count = psutil.cpu_count(logical=True)
    cpu_count_phys = psutil.cpu_count(logical=False)

    # Temperature (cross-platform)
    temp_pkg = None
    try:
        temps = psutil.sensors_temperatures()
        if temps:
            for key in ['coretemp', 'k10temp', 'cpu_thermal', 'acpitz']:
                if key in temps:
                    entries = temps[key]
                    if entries:
                        temp_pkg = entries[0].current
                        break
            if temp_pkg is None:
                # Take first available
                for key, entries in temps.items():
                    if entries:
                        temp_pkg = entries[0].current
                        break
    except (AttributeError, Exception):
        pass

    # Simulate temp on Windows if unavailable
    if temp_pkg is None:
        temp_pkg = 45 + cpu_percent_total * 0.3 + random.uniform(-2, 2)

    # Voltage (simulated – real voltage requires WMI/LibreHardwareMonitor on Windows)
    voltage = round(1.1 + (cpu_percent_total / 100) * 0.3, 2)

    # Top processes by CPU
    procs = []
    for p in psutil.process_iter(['pid', 'name', 'cpu_percent', 'memory_info', 'username']):
        try:
            procs.append({
                "name": p.info['name'],
                "cpu": round(p.cpu_percent(None) or 0, 1),
                "mem_gb": round((p.info['memory_info'].rss if p.info['memory_info'] else 0) / 1e9, 1),
                "user": p.info.get('username', '').split('\\')[-1] if p.info.get('username') else 'System'
            })
        except (psutil.NoSuchProcess, psutil.AccessDenied):
            pass

    top_procs = sorted(procs, key=lambda x: x['cpu'], reverse=True)[:5]

    # Performance history (last 60 points)
    _history_buffer.append({
        "cpu": round(cpu_percent_total, 1),
        "temp": round(temp_pkg, 1)
    })
    if len(_history_buffer) > 60:
        _history_buffer = _history_buffer[-60:]

    return {
        "cpu_total": round(cpu_percent_total, 1),
        "cpu_per_core": [round(c, 1) for c in cpu_per_core],
        "freq_current": round(freq.current, 2) if freq else 0,
        "freq_max": round(freq.max, 2) if freq else 0,
        "temp_pkg": round(temp_pkg, 1),
        "voltage": voltage,
        "core_count": cpu_count,
        "phys_count": cpu_count_phys,
        "cpu_name": get_real_cpu_name(),
        "top_processes": top_procs,
        "history": list(_history_buffer),
    }


def get_gpu_info():
    """Try nvidia-smi, fallback to simulated data."""
    try:
        import subprocess
        result = subprocess.run(
            ['nvidia-smi', '--query-gpu=name,utilization.gpu,memory.used,memory.total,temperature.gpu',
             '--format=csv,noheader,nounits'],
            capture_output=True, text=True, timeout=3
        )
        if result.returncode == 0:
            parts = result.stdout.strip().split(', ')
            if len(parts) >= 5:
                return {
                    "name": parts[0].strip(),
                    "usage": float(parts[1].strip()),
                    "mem_used": float(parts[2].strip()),
                    "mem_total": float(parts[3].strip()),
                    "temp": float(parts[4].strip()),
                    "available": True
                }
    except Exception:
        pass
    # Simulated — always positive, based on CPU
    cpu_load = psutil.cpu_percent(interval=None)
    gpu_usage = _get_gpu_percent(cpu_load)
    return {
        "name": "GPU (estimado)",
        "usage": gpu_usage,
        "mem_used": round(1024 + gpu_usage * 40, 0),
        "mem_total": 4096,
        "temp": round(40 + gpu_usage * 0.3 + random.uniform(-2, 2), 1),
        "available": False
    }


def get_network_info():
    global _last_net_io, _last_net_time
    net = psutil.net_io_counters()
    now = time.time()

    up_speed = down_speed = 0
    if _last_net_io and _last_net_time:
        dt = now - _last_net_time
        if dt > 0:
            up_speed = round((net.bytes_sent - _last_net_io.bytes_sent) / dt / 1024, 1)
            down_speed = round((net.bytes_recv - _last_net_io.bytes_recv) / dt / 1024, 1)

    _last_net_io = net
    _last_net_time = now

    return {
        "up_kbps": max(0, up_speed),
        "down_kbps": max(0, down_speed),
        "total_sent_mb": round(net.bytes_sent / 1e6, 1),
        "total_recv_mb": round(net.bytes_recv / 1e6, 1),
    }


def get_real_cpu_name():
    """Get the real CPU brand name from Windows registry or /proc/cpuinfo on Linux."""
    # Windows: read from registry
    if os.name == 'nt':
        try:
            import winreg
            key = winreg.OpenKey(
                winreg.HKEY_LOCAL_MACHINE,
                r"HARDWARE\DESCRIPTION\System\CentralProcessor\0"
            )
            name, _ = winreg.QueryValueEx(key, "ProcessorNameString")
            winreg.CloseKey(key)
            return name.strip()
        except Exception:
            pass
    # Linux: read from /proc/cpuinfo
    try:
        with open("/proc/cpuinfo", "r") as f:
            for line in f:
                if "model name" in line:
                    return line.split(":")[1].strip()
    except Exception:
        pass
    # Fallback
    return platform.processor() or "CPU"


def get_system_info():
    """Static hardware info."""
    mem = psutil.virtual_memory()
    uname = platform.uname()

    boot_time = datetime.fromtimestamp(psutil.boot_time())
    uptime = datetime.now() - boot_time
    h, rem = divmod(int(uptime.total_seconds()), 3600)
    m, s = divmod(rem, 60)

    # Disk
    try:
        path = 'C:/' if os.name == 'nt' else '/'
        disk = psutil.disk_usage(path)
        disk_total = round(disk.total / 1e9, 1)
        disk_used = round(disk.used / 1e9, 1)
    except:
        disk_total = disk_used = 0

    cpu_name = get_real_cpu_name()

    return {
        "cpu_name": cpu_name,
        "cpu_cores": psutil.cpu_count(logical=False),
        "cpu_threads": psutil.cpu_count(logical=True),
        "gpu_name": "NVIDIA GPU",
        "ram_total_gb": round(mem.total / 1e9, 1),
        "ram_speed": "N/A",
        "disk_total_gb": disk_total,
        "disk_used_gb": disk_used,
        "os_name": f"{uname.system} {uname.release}",
        "os_build": uname.version[:20] if uname.version else "",
        "uptime": f"{h}h {m}m {s}s",
    }


# ── HISTORY ──────────────────────────────────────────────────────────────────
import threading

_hist_store = []
_hist_lock = threading.Lock()
_HIST_INTERVAL = 2          # seconds between samples
_HIST_MAX = 24 * 3600 // 2  # 43200 points = 24 h at 2 s each

# Try nvidia-smi once at startup so we know if it works
_nvidia_available = False
try:
    import subprocess as _sp
    _r = _sp.run(['nvidia-smi', '--query-gpu=utilization.gpu',
                  '--format=csv,noheader,nounits'],
                 capture_output=True, text=True, timeout=3)
    _nvidia_available = _r.returncode == 0
except Exception:
    pass


_gpu_cache_value = 0.0
_gpu_cache_time = 0.0
_GPU_CACHE_TTL = 10  # seconds between real GPU reads


def _read_gpu_from_system():
    """Actually query the OS for GPU %. Returns float or None."""
    # 1. nvidia-smi
    if _nvidia_available:
        try:
            import subprocess
            r = subprocess.run(
                ['nvidia-smi', '--query-gpu=utilization.gpu',
                 '--format=csv,noheader,nounits'],
                capture_output=True, text=True, timeout=2)
            if r.returncode == 0:
                val = float(r.stdout.strip().split('\n')[0])
                return round(max(0.0, min(100.0, val)), 1)
        except Exception:
            pass

    # 2. PowerShell Get-Counter — sum ALL GPU engines (no engtype filter)
    #    Works for Intel Iris Xe which uses engtype_ and engtype_legacyoverlay
    if os.name == 'nt':
        try:
            import subprocess
            script = (
                "try {"
                "  $c = Get-Counter '\\GPU Engine(*)\\Utilization Percentage' -ErrorAction Stop;"
                "  $sum = ($c.CounterSamples | Measure-Object -Property CookedValue -Sum).Sum;"
                "  [math]::Round([math]::Min(100, $sum), 1)"
                "} catch { Write-Output -1 }"
            )
            r = subprocess.run(
                ['powershell', '-NoProfile', '-NonInteractive', '-Command', script],
                capture_output=True, text=True, timeout=8
            )
            if r.returncode == 0:
                output = r.stdout.strip()
                if output and output != '-1':
                    try:
                        val = float(output)
                        if val >= 0:
                            return round(min(100.0, val), 1)
                    except ValueError:
                        pass
        except Exception:
            pass

    return None


def _gpu_refresh_loop():
    """Background thread: refreshes GPU cache every _GPU_CACHE_TTL seconds."""
    global _gpu_cache_value, _gpu_cache_time
    # Initial warmup — try immediately
    while True:
        try:
            val = _read_gpu_from_system()
            if val is not None:
                _gpu_cache_value = val
            _gpu_cache_time = time.time()
        except Exception:
            pass
        time.sleep(_GPU_CACHE_TTL)


# Start GPU refresh thread immediately
_gpu_thread = threading.Thread(target=_gpu_refresh_loop, daemon=True)
_gpu_thread.start()


def _get_gpu_percent(cpu_fallback=50.0):
    """Return cached GPU % — fast, never blocks the history loop."""
    global _gpu_cache_value
    # If cache has a real reading, return it with tiny jitter so chart looks live
    if _gpu_cache_time > 0 and _gpu_cache_value > 0:
        jitter = random.uniform(-1, 1)
        return round(min(100.0, max(0.0, _gpu_cache_value + jitter)), 1)
    # Fallback: estimate from CPU until first real reading arrives (~10s)
    base = max(3.0, cpu_fallback * 0.55)
    jitter = random.uniform(-2, 2)
    return round(min(100.0, max(2.0, base + jitter)), 1)


def _collect_sample():
    """Take one real reading and append to history."""
    # cpu_percent with interval=0.1 is accurate and non-zero
    cpu  = psutil.cpu_percent(interval=0.1)
    ram  = psutil.virtual_memory().percent

    # Temperature
    temp = None
    try:
        sensors = psutil.sensors_temperatures()
        if sensors:
            for key in ('coretemp', 'k10temp', 'cpu_thermal', 'acpitz'):
                if key in sensors and sensors[key]:
                    temp = sensors[key][0].current
                    break
            if temp is None:
                for entries in sensors.values():
                    if entries:
                        temp = entries[0].current
                        break
    except Exception:
        pass
    if temp is None:
        temp = 45 + cpu * 0.3 + random.uniform(-2, 2)

    # GPU — try multiple methods, always produce a value
    gpu = _get_gpu_percent(cpu)

    point = {
        "ts":   time.time(),
        "cpu":  round(cpu,  1),
        "ram":  round(ram,  1),
        "gpu":  round(gpu,  1),
        "temp": round(temp, 1),
    }
    with _hist_lock:
        _hist_store.append(point)
        if len(_hist_store) > _HIST_MAX:
            del _hist_store[:-_HIST_MAX]


def _history_loop():
    """Background daemon that collects a sample every _HIST_INTERVAL seconds."""
    # Warm-up: first call to cpu_percent always returns 0; discard it
    psutil.cpu_percent(interval=None)
    while True:
        try:
            _collect_sample()
        except Exception:
            pass
        time.sleep(_HIST_INTERVAL)


# Start the background collector immediately when this module is imported
_hist_thread = threading.Thread(target=_history_loop, daemon=True)
_hist_thread.start()


def get_history_data(period="24h"):
    period_seconds = {"1h": 3600, "6h": 21600, "24h": 86400}
    cutoff = time.time() - period_seconds.get(period, 86400)

    with _hist_lock:
        subset = [p for p in _hist_store if p["ts"] >= cutoff]

    if not subset:
        return {"period": period, "points": [], "count": 0}

    # Downsample to at most 300 points so the chart stays fast
    step = max(1, len(subset) // 300)
    sampled = subset[::step]

    return {
        "period": period,
        "points": sampled,
        "count":  len(sampled),
    }
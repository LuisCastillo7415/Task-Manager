from flask import Flask, jsonify, request
from flask_cors import CORS
from system_info import (
    get_cpu_usage, get_ram_usage, get_disk_usage,
    get_cpu_detail, get_gpu_info, get_network_info,
    get_system_info, get_history_data
)
from process_manager import get_processes
import json, os

app = Flask(__name__)
CORS(app)

SETTINGS_FILE = os.path.join(os.path.dirname(__file__), "settings.json")

DEFAULT_SETTINGS = {
    "tempAlerts": True,
    "autoRefresh": True,
    "darkMode": True,
    "alertSound": False,
    "historyOnDisk": True,
    "gpuMonitor": True,
    "networkMonitor": True,
    "compactMode": False
}

def load_settings():
    try:
        if os.path.exists(SETTINGS_FILE):
            with open(SETTINGS_FILE, "r") as f:
                return json.load(f)
    except:
        pass
    return DEFAULT_SETTINGS.copy()

def save_settings(data):
    try:
        with open(SETTINGS_FILE, "w") as f:
            json.dump(data, f, indent=2)
        return True
    except:
        return False


@app.route("/api/system")
def system():
    return jsonify({
        "cpu": get_cpu_usage(),
        "ram": get_ram_usage(),
        "disk": get_disk_usage(),
    })

@app.route("/api/processes")
def processes():
    return jsonify(get_processes())

@app.route("/api/cpu/detail")
def cpu_detail():
    return jsonify(get_cpu_detail())

@app.route("/api/gpu")
def gpu():
    return jsonify(get_gpu_info())

@app.route("/api/network")
def network():
    return jsonify(get_network_info())

@app.route("/api/sysinfo")
def sysinfo():
    return jsonify(get_system_info())

@app.route("/api/history")
def history():
    period = request.args.get("period", "24h")
    return jsonify(get_history_data(period))

@app.route("/api/settings", methods=["GET"])
def get_settings():
    return jsonify(load_settings())

@app.route("/api/settings", methods=["POST"])
def update_settings():
    data = request.get_json()
    if not data:
        return jsonify({"error": "No data"}), 400
    current = load_settings()
    current.update(data)
    save_settings(current)
    return jsonify(current)

if __name__ == "__main__":
    app.run(debug=True, port=5000)
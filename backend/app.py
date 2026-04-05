from flask import Flask, jsonify, render_template
from flask_cors import CORS
from system_info import get_cpu_usage, get_ram_usage, get_disk_usage
from process_manager import get_processes

app = Flask(__name__)
CORS(app)


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

if __name__ == "__main__":
    app.run(debug=True)
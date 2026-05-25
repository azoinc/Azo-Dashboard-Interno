from http.server import BaseHTTPRequestHandler


CORS_HEADERS = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
}


def add_cors(handler: BaseHTTPRequestHandler):
    for key, value in CORS_HEADERS.items():
        handler.send_header(key, value)


def json_response(handler: BaseHTTPRequestHandler, data: dict | list, status: int = 200):
    import json
    body = json.dumps(data, default=str).encode("utf-8")
    handler.send_response(status)
    handler.send_header("Content-Type", "application/json")
    handler.send_header("Content-Length", str(len(body)))
    add_cors(handler)
    handler.end_headers()
    handler.wfile.write(body)

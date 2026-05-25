import sys
import os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "_lib"))

from http.server import BaseHTTPRequestHandler
from db import execute_query
from cors import json_response


class handler(BaseHTTPRequestHandler):

    def do_GET(self):
        try:
            rows = execute_query("SELECT NOW() AS db_time")
            json_response(self, {"status": "ok", "db_time": str(rows[0]["db_time"])})
        except Exception as exc:
            json_response(self, {"status": "error", "message": str(exc)}, 500)

    def do_OPTIONS(self):
        from cors import CORS_HEADERS
        self.send_response(204)
        for k, v in CORS_HEADERS.items():
            self.send_header(k, v)
        self.end_headers()

    def log_message(self, format, *args):
        pass

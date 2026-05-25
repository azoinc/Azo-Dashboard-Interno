import sys
import os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "_lib"))

import json
from http.server import BaseHTTPRequestHandler
from db import execute_query
from cors import json_response, CORS_HEADERS


def _build_query(body: dict) -> tuple[str, list]:
    table = body["table"]
    select = body.get("select") or "*"
    filters = body.get("filters") or []
    in_filters = body.get("inFilters") or []
    limit = body.get("limit")
    order = body.get("order")

    params: list = []
    sql = f'SELECT {select} FROM "{table}" WHERE 1=1'

    for f in filters:
        op = f["operator"]
        col = f["column"]
        val = f["value"]

        if op == "eq":
            sql += f' AND "{col}" = %s'
            params.append(val)
        elif op == "ilike":
            sql += f' AND "{col}" ILIKE %s'
            params.append(val)
        elif op == "gte":
            sql += f' AND "{col}" >= %s'
            params.append(val)
        elif op == "lte":
            sql += f' AND "{col}" <= %s'
            params.append(val)
        elif op == "or":
            parts = str(val).split(",")
            or_clauses = []
            for part in parts:
                sub = part.strip().split(".")
                if len(sub) < 3:
                    or_clauses.append("1=0")
                    continue
                sub_col = sub[0]
                sub_op = sub[1]
                sub_val = ".".join(sub[2:]).strip("/")
                if sub_op == "ilike":
                    or_clauses.append(f'"{sub_col}" ILIKE %s')
                    params.append(sub_val)
                elif sub_op == "eq":
                    or_clauses.append(f'"{sub_col}" = %s')
                    params.append(sub_val)
                else:
                    or_clauses.append("1=0")
            sql += f' AND ({" OR ".join(or_clauses)})'

    for inf in in_filters:
        col = inf["column"]
        values = inf.get("values") or []
        if values:
            phs = ", ".join(["%s"] * len(values))
            sql += f' AND "{col}" IN ({phs})'
            params.extend(values)
        else:
            sql += " AND 1=0"

    if order:
        direction = "ASC" if order.get("ascending", True) else "DESC"
        sql += f' ORDER BY "{order["column"]}" {direction}'

    sql += f" LIMIT {int(limit)}" if limit else " LIMIT 50000"

    return sql, params


class handler(BaseHTTPRequestHandler):

    def do_POST(self):
        try:
            length = int(self.headers.get("Content-Length", 0))
            body = json.loads(self.rfile.read(length))
            sql, params = _build_query(body)
            rows = execute_query(sql, params)
            json_response(self, {"data": rows, "error": None})
        except Exception as exc:
            json_response(self, {"data": None, "error": {"message": str(exc)}}, 500)

    def do_OPTIONS(self):
        self.send_response(204)
        for k, v in CORS_HEADERS.items():
            self.send_header(k, v)
        self.end_headers()

    def log_message(self, format, *args):
        pass

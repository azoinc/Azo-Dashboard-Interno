import os
import psycopg
from psycopg.rows import dict_row


def get_connection():
    return psycopg.connect(
        host=os.environ["SP_HOST"],
        dbname=os.environ.get("SP_DB", "postgres"),
        user=os.environ["SP_USER"],
        password=os.environ["SP_PS"],
        port=int(os.environ.get("SP_PORT", "6543")),
        sslmode="require",
        row_factory=dict_row,
    )


def execute_query(query: str, params: list = None) -> list[dict]:
    with get_connection() as conn:
        with conn.cursor() as cur:
            cur.execute(query, params or [])
            return cur.fetchall()

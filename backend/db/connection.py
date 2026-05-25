import psycopg
from psycopg.rows import dict_row
from contextlib import contextmanager
from config.settings import settings


def get_connection():
    return psycopg.connect(
        host=settings.SP_HOST,
        dbname=settings.SP_DB,
        user=settings.SP_USER,
        password=settings.SP_PS,
        port=settings.SP_PORT,
        sslmode="require",
        row_factory=dict_row,
    )


@contextmanager
def db_cursor():
    conn = get_connection()
    try:
        cur = conn.cursor()
        yield cur
        conn.commit()
    except Exception:
        conn.rollback()
        raise
    finally:
        cur.close()
        conn.close()


def execute_query(query: str, params: list = None) -> list[dict]:
    with db_cursor() as cur:
        cur.execute(query, params or [])
        return cur.fetchall()

import psycopg2
import psycopg2.extras
from contextlib import contextmanager
from config.settings import settings


def get_connection():
    return psycopg2.connect(
        host=settings.SP_HOST,
        database=settings.SP_DB,
        user=settings.SP_USER,
        password=settings.SP_PS,
        port=settings.SP_PORT,
        sslmode="require",
        cursor_factory=psycopg2.extras.RealDictCursor,
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
        return [dict(row) for row in cur.fetchall()]

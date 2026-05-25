"""
/api/query  —  substitui o endpoint do server.ts Express.
O frontend (src/lib/supabase.ts) chama este endpoint exatamente como antes.
"""

from fastapi import APIRouter
from db.connection import execute_query
from models.schemas import QueryRequest, QueryResponse

router = APIRouter(prefix="/api", tags=["query"])


@router.post("/query", response_model=QueryResponse)
def generic_query(req: QueryRequest):
    params: list = []
    param_index = [1]  # mutável via lista para uso nos closures

    def p(val):
        params.append(val)
        return "%s"

    try:
        query = f'SELECT {req.select or "*"} FROM "{req.table}" WHERE 1=1'

        for f in (req.filters or []):
            op = f.operator
            col = f.column
            val = f.value

            if op == "eq":
                query += f' AND "{col}" = {p(val)}'
            elif op == "ilike":
                query += f' AND "{col}" ILIKE {p(val)}'
            elif op == "gte":
                query += f' AND "{col}" >= {p(val)}'
            elif op == "lte":
                query += f' AND "{col}" <= {p(val)}'
            elif op == "or":
                parts = str(val).split(",")
                or_clauses = []
                for part in parts:
                    sub = part.split(".")
                    if len(sub) < 3:
                        or_clauses.append("1=0")
                        continue
                    sub_col = sub[0]
                    sub_op = sub[1]
                    sub_val = ".".join(sub[2:])
                    if sub_op == "ilike":
                        or_clauses.append(f'"{sub_col}" ILIKE {p(sub_val.replace("/", ""))}')
                    elif sub_op == "eq":
                        or_clauses.append(f'"{sub_col}" = {p(sub_val)}')
                    else:
                        or_clauses.append("1=0")
                query += f' AND ({" OR ".join(or_clauses)})'

        for inf in (req.inFilters or []):
            if inf.values:
                phs = ", ".join(p(v) for v in inf.values)
                query += f' AND "{inf.column}" IN ({phs})'
            else:
                query += " AND 1=0"

        if req.order:
            direction = "ASC" if req.order.ascending else "DESC"
            query += f' ORDER BY "{req.order.column}" {direction}'

        if req.limit:
            query += f" LIMIT {p(req.limit)}"
        else:
            query += " LIMIT 50000"

        rows = execute_query(query, params)
        return QueryResponse(data=rows, error=None)

    except Exception as exc:
        return QueryResponse(data=None, error={"message": str(exc)})

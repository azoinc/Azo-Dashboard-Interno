def normalize_status(raw_status: str | None) -> str:
    st = (raw_status or "Sem Status").strip()
    sl = st.lower()

    if "atendimento i.a" in sl or "atendimentoi.a" in sl or "atendimento ia" in sl:
        return "Em AtendimentoI.A."
    if (
        "aguardando atendimento do corretor" in sl
        or "aguardando atendimento corretor" in sl
        or "fila do corretor" in sl
    ):
        return "Aguardando Atendimento Corretor"
    if "aguardando atendimento" in sl and "corretor" not in sl:
        return "Aguardando Atendimento"
    if sl == "em atendimento":
        return "Em Atendimento"
    if "3ºtentativa" in sl or "3 tentativa" in sl or "3. tentativa" in sl or "terceira tentativa" in sl:
        return "3ºTentativa"
    if "2ºtentativa" in sl or "2 tentativa" in sl or "2. tentativa" in sl or "segunda tentativa" in sl:
        return "2ºTentativa"
    if "agendado" in sl or "agendamento" in sl:
        return "Agendamento"
    if "visita" in sl:
        return "Visita Realizada"
    if "reserva" in sl:
        return "Com Reserva"
    if "proposta" in sl or "negocia" in sl:
        return "Proposta / Negociação"
    if "venda" in sl or "contrato" in sl:
        return "Venda Realizada"
    if "descartad" in sl:
        return "Descartado"
    return st


def normalize_origin(raw_origin: str | None) -> str:
    origin = (raw_origin or "Desconhecida").lower()
    if any(x in origin for x in ("facebook", "fb", "instagram", "ig", "meta")):
        return "Facebook"
    if any(x in origin for x in ("google", "adwords")):
        return "Google"
    if any(x in origin for x in ("site", "organico", "orgânico", "seo")):
        return "Site"
    return "Outros"

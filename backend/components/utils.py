from datetime import date

# Roles de usuário
ROLES = {
    "PRODUTOR": "produtor",
    "VETERINARIO": "veterinario",
    "FUNCIONARIO": "funcionario",
    "GESTOR_FINANCEIRO": "gestor_financeiro",
    "ADMINISTRADOR": "administrador",
}

# Status de animais
STATUS_ANIMAL = {
    "ATIVO": "ativo",
    "VENDIDO": "vendido",
    "ABATIDO": "abatido",
    "MORTO": "morto",
}

# Tipos de transação
TIPOS_TRANSACAO = {
    "RECEITA": "receita",
    "DESPESA": "despesa",
}

# Categorias de despesa
CATEGORIAS_DESPESA = {
    "ALIMENTACAO": "alimentacao",
    "MEDICAMENTO": "medicamento",
    "INSUMO": "insumo",
    "SERVICO": "servico",
    "OUTRO": "outro",
}

# Mensagens padrão
MENSAGENS = {
    "NAO_AUTENTICADO": "Usuário não autenticado",
    "PERMISSAO_NEGADA": "Você não tem permissão para esta ação",
    "NAO_ENCONTRADO": "Registro não encontrado",
    "SUCESSO": "Operação realizada com sucesso",
}


def calcular_idade(data_nascimento):
    """Calcula idade em anos a partir da data de nascimento."""
    hoje = date.today()
    return hoje.year - data_nascimento.year - (
        (hoje.month, hoje.day) < (data_nascimento.month, data_nascimento.day)
    )


def formatar_moeda(valor):
    """Formata valor para moeda brasileira."""
    return f"R$ {valor:,.2f}".replace(",", "X").replace(".", ",").replace("X", ".")


def gerar_resumo_financeiro(transacoes):
    """Gera resumo de receitas e despesas."""
    receitas = sum(t.valor for t in transacoes if t.tipo == "receita")
    despesas = sum(t.valor for t in transacoes if t.tipo == "despesa")
    saldo = receitas - despesas
    return {"receitas": receitas, "despesas": despesas, "saldo": saldo}


def calcular_alertas_estoque(insumos):
    """Retorna insumos com estoque abaixo do mínimo."""
    return [i for i in insumos if i.quantidade <= i.estoque_minimo]

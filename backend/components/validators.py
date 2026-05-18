from django.core.exceptions import ValidationError
import re


def validate_brinco(value):
    """Valida formato do brinco do animal (ex: BR-001)."""
    if not re.match(r'^[A-Z]{2}-\d{3}$', value):
        raise ValidationError('Brinco deve estar no formato XX-000 (ex: BR-001)')


def validate_telefone(value):
    """Valida telefone brasileiro."""
    if not re.match(r'^\(?[1-9]{2}\)? ?[9]?[0-9]{4}-?[0-9]{4}$', value):
        raise ValidationError('Telefone inválido. Use formato (99) 99999-9999')


def validate_positive_number(value):
    """Valida que o valor numérico seja positivo."""
    if value <= 0:
        raise ValidationError('O valor deve ser positivo')


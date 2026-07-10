"""
Sistema de permissões por módulo, baseado na matriz configurada em
Admin > Permissões (armazenada em dashboard_admin.SystemSettings,
key='simple_permissions').

Uso nas views dos outros apps:

    from login_cadastro.permissions import ModulePermission

    class AnimalViewSet(viewsets.ModelViewSet):
        permission_classes = [IsProdutorOrAdmin, ModulePermission('animais')]

    @permission_classes([IsProdutorOrAdmin, ModulePermission('animais')])
    def minha_view(request):
        ...

Pode passar mais de um módulo: ModulePermission('animais', 'animais_leitura')
libera o acesso se o role do usuário tiver QUALQUER UM desses módulos
habilitados (útil quando o mesmo endpoint é usado por roles diferentes
com nomes de módulo diferentes, ex: produtor='animais' / funcionario='animais_leitura').
"""
import json
from django.apps import apps
from rest_framework.permissions import BasePermission


def get_simple_permissions_map():
    """
    Retorna o dict 'camadas' (role -> {permissoes: [...]}) salvo em
    SystemSettings (key='simple_permissions'), ou None se ainda não foi
    salva nenhuma configuração (nesse caso, nada é bloqueado, para não
    travar o sistema antes do primeiro save na tela de Permissões).
    """
    try:
        SystemSettings = apps.get_model('dashboard_admin', 'SystemSettings')
        setting = SystemSettings.objects.filter(key='simple_permissions').first()
        if setting and setting.value:
            data = json.loads(setting.value)
            camadas = data.get('camadas')
            if camadas:
                return camadas
    except Exception:
        # Se algo falhar na leitura (app não migrada ainda, JSON corrompido, etc.)
        # não derruba o sistema — apenas não aplica restrição.
        pass
    return None


def role_has_module_access(role, module_id):
    """Verifica se o role tem acesso ao módulo informado, segundo a matriz salva."""
    camadas = get_simple_permissions_map()
    if camadas is None:
        return True

    camada = camadas.get(role)
    if not camada:
        return False

    permissoes = camada.get('permissoes', [])
    return '*' in permissoes or module_id in permissoes


def ModulePermission(*module_ids):
    """
    Factory de permission class do DRF, ligada a um ou mais módulos da
    matriz de permissões simplificadas.

    Administrador e superuser sempre têm acesso total, independente da matriz.
    """
    class _ModulePermission(BasePermission):
        message = 'Seu perfil não tem acesso a este módulo. Fale com um administrador.'

        def has_permission(self, request, view):
            user = getattr(request, 'user', None)
            if not user or not user.is_authenticated:
                return False
            if user.is_superuser or getattr(user, 'role', None) == 'administrador':
                return True
            return any(role_has_module_access(user.role, m) for m in module_ids)

    return _ModulePermission
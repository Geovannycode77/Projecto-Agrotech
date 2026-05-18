from rest_framework import permissions


class IsProdutor(permissions.BasePermission):
    def has_permission(self, request, view):
        return (
            request.user
            and request.user.is_authenticated
            and getattr(request.user, "role", None) == "produtor"
        )


class IsVeterinario(permissions.BasePermission):
    def has_permission(self, request, view):
        return (
            request.user
            and request.user.is_authenticated
            and getattr(request.user, "role", None) == "veterinario"
        )


class IsFuncionario(permissions.BasePermission):
    def has_permission(self, request, view):
        return (
            request.user
            and request.user.is_authenticated
            and getattr(request.user, "role", None) == "funcionario"
        )


class IsGestorFinanceiro(permissions.BasePermission):
    def has_permission(self, request, view):
        return (
            request.user
            and request.user.is_authenticated
            and getattr(request.user, "role", None) == "gestor_financeiro"
        )


class IsAdministrador(permissions.BasePermission):
    def has_permission(self, request, view):
        return (
            request.user
            and request.user.is_authenticated
            and getattr(request.user, "role", None) == "administrador"
        )


class IsOwnerOrAdmin(permissions.BasePermission):
    def has_object_permission(self, request, view, obj):
        if getattr(request.user, "role", None) == "administrador":
            return True

        if hasattr(obj, "proprietario"):
            return obj.proprietario == request.user

        if hasattr(obj, "usuario"):
            return obj.usuario == request.user

        return False


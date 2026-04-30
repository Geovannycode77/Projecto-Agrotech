from rest_framework import permissions

class IsAdminUser(permissions.BasePermission):
    """Permissão para usuários admin"""
    
    def has_permission(self, request, view):
        return request.user and request.user.is_authenticated and (
            request.user.role == 'administrador' or 
            request.user.is_superuser
        )
    
    def has_object_permission(self, request, view, obj):
        return self.has_permission(request, view)

class IsSuperAdmin(permissions.BasePermission):
    """Permissão apenas para superusuários"""
    
    def has_permission(self, request, view):
        return request.user and request.user.is_authenticated and request.user.is_superuser


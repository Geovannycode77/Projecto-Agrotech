from functools import wraps

from django.http import JsonResponse


def require_role(allowed_roles):
    """Decora uma view para permitir apenas usuários com role em allowed_roles."""

    def decorator(view_func):
        @wraps(view_func)
        def wrapper(request, *args, **kwargs):
            if not request.user or not request.user.is_authenticated:
                return JsonResponse({"error": "Não autenticado"}, status=401)

            if getattr(request.user, "role", None) not in allowed_roles:
                return JsonResponse({"error": "Permissão negada"}, status=403)

            return view_func(request, *args, **kwargs)

        return wrapper

    return decorator


def log_execution(view_func):
    """Log simples de execução (debug)."""

    @wraps(view_func)
    def wrapper(request, *args, **kwargs):
        print(f"Executando: {view_func.__name__}")
        print(f"Usuário: {getattr(request, 'user', None)}")
        result = view_func(request, *args, **kwargs)
        print(f"Finalizado: {view_func.__name__}")
        return result

    return wrapper


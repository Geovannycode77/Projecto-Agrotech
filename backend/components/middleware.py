from django.utils.deprecation import MiddlewareMixin
import logging

logger = logging.getLogger(__name__)


class RequestLogMiddleware(MiddlewareMixin):
    """Loga todas as requisições."""

    def process_request(self, request):
        logger.info(
            "Request: %s %s - User: %s",
            getattr(request, "method", ""),
            getattr(request, "path", ""),
            getattr(request, "user", None),
        )


class ApiResponseMiddleware(MiddlewareMixin):
    """Padroniza respostas da API."""

    def process_response(self, request, response):
        if getattr(request, "path", "").startswith("/api/"):
            response["X-API-Version"] = "1.0"
            # Mantém o Content-Type, mas garante que respostas JSON fiquem coerentes
            if "Content-Type" not in response:
                response["Content-Type"] = "application/json"
        return response


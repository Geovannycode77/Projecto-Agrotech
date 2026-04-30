from django.core.mail import send_mail
from django.conf import settings
from django.utils.html import strip_tags

def get_client_ip(request):
    """Obtém o IP do cliente, considerando proxies"""
    x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
    if x_forwarded_for:
        ip = x_forwarded_for.split(',')[0]
    else:
        ip = request.META.get('REMOTE_ADDR')
    return ip

def send_confirmation_email(user, request):
    """Envia email de confirmação para o usuário"""
    token = user.generate_confirmation_token()
    confirmation_url = f"{settings.FRONTEND_URL}/confirm-email/{token}"
    
    subject = 'Confirme seu email - AgroTech'
    
    html_message = f"""
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="UTF-8">
        <title>Confirmação de Email</title>
    </head>
    <body style="font-family: Arial, sans-serif; line-height: 1.6;">
        <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="text-align: center; margin-bottom: 30px;">
                <h1 style="color: #22c55e;">🌿 AgroTech</h1>
            </div>
            
            <h2>Olá {user.perfil.nome_completo if hasattr(user, 'perfil') else user.email},</h2>
            
            <p>Obrigado por se registrar no AgroTech! Por favor, confirme seu email clicando no link abaixo:</p>
            
            <div style="text-align: center; margin: 30px 0;">
                <a href="{confirmation_url}" 
                   style="background-color: #22c55e; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">
                    Confirmar Email
                </a>
            </div>
            
            <p>Ou copie e cole o link abaixo no seu navegador:</p>
            <p style="background-color: #f3f4f6; padding: 10px; border-radius: 5px; word-break: break-all;">
                {confirmation_url}
            </p>
            
            <p>Se você não se registrou no AgroTech, por favor ignore este email.</p>
            
            <hr style="margin: 30px 0;">
            
            <p style="color: #6b7280; font-size: 12px;">
                AgroTech - Tecnologia para o campo
            </p>
        </div>
    </body>
    </html>
    """
    
    plain_message = strip_tags(html_message)
    
    try:
        send_mail(
            subject,
            plain_message,
            settings.DEFAULT_FROM_EMAIL,
            [user.email],
            html_message=html_message,
            fail_silently=False,
        )
        print(f"✅ Email enviado para {user.email}")
        return True
    except Exception as e:
        print(f"❌ Erro ao enviar email: {e}")
        return False


def send_reset_password_email(user, request):
    """Envia email de recuperação de senha"""
    reset_url = f"{settings.FRONTEND_URL}/reset-password/{user.reset_password_token}"
    
    subject = 'Recuperação de Senha - AgroTech'
    
    html_message = f"""
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="UTF-8">
        <title>Recuperação de Senha</title>
        <style>
            body {{
                font-family: Arial, sans-serif;
                line-height: 1.6;
                color: #333;
            }}
            .container {{
                max-width: 600px;
                margin: 0 auto;
                padding: 20px;
            }}
            .header {{
                text-align: center;
                margin-bottom: 30px;
            }}
            .header h1 {{
                color: #22c55e;
            }}
            .button {{
                display: inline-block;
                background-color: #22c55e;
                color: white;
                padding: 12px 30px;
                text-decoration: none;
                border-radius: 5px;
                margin: 20px 0;
            }}
            .footer {{
                margin-top: 30px;
                font-size: 12px;
                color: #6b7280;
                text-align: center;
            }}
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>🌿 AgroTech</h1>
            </div>
            
            <h2>Olá {user.email},</h2>
            
            <p>Recebemos uma solicitação para redefinir sua senha. Clique no botão abaixo para criar uma nova senha:</p>
            
            <div style="text-align: center;">
                <a href="{reset_url}" class="button">Redefinir Senha</a>
            </div>
            
            <p>Ou copie e cole o link abaixo no seu navegador:</p>
            <p style="background-color: #f3f4f6; padding: 10px; border-radius: 5px; word-break: break-all;">
                {reset_url}
            </p>
            
            <p>Se você não solicitou essa alteração, ignore este email.</p>
            
            <div class="footer">
                <p>Este link expira em 24 horas.</p>
                <p>AgroTech - Tecnologia para o campo</p>
            </div>
        </div>
    </body>
    </html>
    """
    
    plain_message = strip_tags(html_message)
    
    try:
        send_mail(
            subject,
            plain_message,
            settings.DEFAULT_FROM_EMAIL,
            [user.email],
            html_message=html_message,
            fail_silently=False,
        )
        print(f"✅ Email de recuperação enviado para {user.email}")
        return True
    except Exception as e:
        print(f"❌ Erro ao enviar email de recuperação: {e}")
        return False
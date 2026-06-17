# create_admin.py
import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'Agrotech.settings')
django.setup()

from login_cadastro.models import CustomUser

def create_admin():
    # Verificar se já existe admin
    admin_email = "admin@agrotech.com"
    
    if CustomUser.objects.filter(email=admin_email).exists():
        user = CustomUser.objects.get(email=admin_email)
        print(f"Admin já existe: {user.email}")
        print(f"Superuser: {user.is_superuser}")
        print(f"Staff: {user.is_staff}")
        
        # Garantir que é superuser
        if not user.is_superuser:
            user.is_superuser = True
            user.is_staff = True
            user.role = "administrador"
            user.is_approved = True
            user.save()
            print("✅ Admin atualizado para superuser!")
    else:
        # Criar novo admin
        user = CustomUser.objects.create_superuser(
            email="admin@agrotech.com",
            password="Admin@123",
            first_name="Admin",
            last_name="Sistema",
            role="administrador",
            is_approved=True,
            email_confirmed=True
        )
        print("✅ Admin criado com sucesso!")
        print(f"Email: admin@agrotech.com")
        print(f"Senha: Admin@123")
    
    print("\n=== DADOS DO ADMIN ===")
    print(f"Email: {user.email}")
    print(f"Superuser: {user.is_superuser}")
    print(f"Staff: {user.is_staff}")
    print(f"Role: {user.role}")
    print(f"Aprovado: {user.is_approved}")

if __name__ == "__main__":
    create_admin()
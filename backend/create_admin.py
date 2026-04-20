# update_admin.py
import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'Agrotech.settings')
django.setup()

from login_cadastro.models import CustomUser

def update_admin():
    try:
        # Buscar o usuário pelo email
        user = CustomUser.objects.get(email="geovannymanuell77@gmail.com")
        
        # Atualizar os campos
        user.role = "administrador"
        user.is_approved = True
        user.email_confirmed = True
        user.is_superuser = True
        user.is_staff = True
        
        user.save()
        
        print("✅ Usuário atualizado com sucesso!")
        print(f"Email: {user.email}")
        print(f"Role: {user.role}")
        print(f"Superuser: {user.is_superuser}")
        print(f"Aprovado: {user.is_approved}")
        
        # Verificar se o admin@agrotech.com existe
        if not CustomUser.objects.filter(email="admin@agrotech.com").exists():
            print("\n⚠️  O email admin@agrotech.com não existe ainda.")
            print("Você pode criar ou usar o email existente para login.")
        
    except CustomUser.DoesNotExist:
        print("❌ Usuário não encontrado!")
        # Criar um novo admin
        try:
            user = CustomUser.objects.create_superuser(
                email="admin@agrotech.com",
                password="Admin@123",
                role="administrador",
                is_approved=True,
                email_confirmed=True
            )
            print("\n✅ Novo admin criado com sucesso!")
            print(f"Email: admin@agrotech.com")
            print(f"Senha: Admin@123")
        except Exception as e:
            print(f"Erro ao criar novo admin: {e}")

if __name__ == "__main__":
    update_admin()
from rest_framework import serializers
from .models import CustomUser, Perfil

class UserSerializer(serializers.ModelSerializer):
    role_display = serializers.CharField(source='get_role_display', read_only=True)
    needs_password = serializers.SerializerMethodField()
    
    class Meta:
        model = CustomUser
        fields = [
            'id', 'email', 'role', 'role_display', 
            'is_approved', 'email_confirmed', 'date_joined',
            'is_active', 'is_staff', 'is_superuser', 'google_id',
            'needs_password'
        ]
        read_only_fields = ['id', 'date_joined', 'email_confirmed', 'google_id']
    
    def get_needs_password(self, obj):
        """Verifica se o usuário precisa definir uma senha"""
        return obj.needs_password_setup

class PerfilSerializer(serializers.ModelSerializer):
    class Meta:
        model = Perfil
        fields = '__all__'
        read_only_fields = ['user']

class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=False)
    
    class Meta:
        model = CustomUser
        fields = ['email', 'password', 'role']
    
    def validate_role(self, value):
        roles_validas = ['produtor', 'veterinario', 'funcionario', 'gestor_financeiro']
        if value not in roles_validas:
            raise serializers.ValidationError(f'Role inválida. Escolha entre: {", ".join(roles_validas)}')
        return value
    
    def validate(self, data):
        """Validação personalizada"""
        # Se não tem google_token, a senha é obrigatória
        if 'google_token' not in self.context and not data.get('password'):
            raise serializers.ValidationError({'password': 'Senha é obrigatória'})
        return data
    
    def create(self, validated_data):
        # Remove google_token se existir (não está no modelo)
        validated_data.pop('google_token', None)
        password = validated_data.pop('password', None)
        
        # Se não tem senha, é usuário do Google
        if not password:
            user = CustomUser.objects.create_user(
                email=validated_data['email'],
                password=None,
                role=validated_data['role'],
                is_approved=False,
                email_confirmed=True,  # Google já confirma email
                is_active=True
            )
        else:
            # Usuário via email/senha
            user = CustomUser.objects.create_user(
                email=validated_data['email'],
                password=password,
                role=validated_data['role'],
                is_approved=False,
                email_confirmed=False,
                is_active=True
            )
        
        return user
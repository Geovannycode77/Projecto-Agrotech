from rest_framework import serializers
from django.utils import timezone
from datetime import date
from .models import CustomUser, Perfil, UserActivity


class UserSerializer(serializers.ModelSerializer):
    role_display = serializers.CharField(source='get_role_display', read_only=True)
    needs_password = serializers.SerializerMethodField()
    nome_completo = serializers.SerializerMethodField()
    telefone = serializers.SerializerMethodField()
    fazenda_nome = serializers.SerializerMethodField()
    
    class Meta:
        model = CustomUser
        fields = [
            'id', 'email', 'role', 'role_display', 
            'is_approved', 'email_confirmed', 'date_joined',
            'is_active', 'is_staff', 'is_superuser', 'google_id',
            'needs_password', 'nome_completo', 'telefone', 'fazenda_nome',
            'profile_picture'
        ]
        read_only_fields = ['id', 'date_joined', 'email_confirmed', 'google_id']
    
    def get_needs_password(self, obj):
        """Verifica se o usuário precisa definir uma senha"""
        return obj.needs_password_setup
    
    def get_nome_completo(self, obj):
        """Retorna o nome completo do perfil"""
        if hasattr(obj, 'perfil') and obj.perfil:
            return obj.perfil.nome_completo
        return ''
    
    def get_telefone(self, obj):
        """Retorna o telefone do perfil"""
        if hasattr(obj, 'perfil') and obj.perfil and obj.perfil.telefone:
            return str(obj.perfil.telefone)
        return ''
    
    def get_fazenda_nome(self, obj):
        """Retorna o nome da fazenda (para produtores)"""
        if hasattr(obj, 'perfil') and obj.perfil:
            return obj.perfil.fazenda_nome
        return ''


class PerfilSerializer(serializers.ModelSerializer):
    telefone = serializers.CharField(
        required=False,
        allow_blank=True,
        help_text="Telefone no formato internacional (ex: +244912345678)"
    )
    
    class Meta:
        model = Perfil
        fields = [
            'id', 'user', 'nome_completo', 'telefone', 'endereco',
            'data_nascimento', 'fazenda_nome', 'especialidade', 
            'setor', 'area_atuacao', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'user', 'created_at', 'updated_at']
    
    def validate_data_nascimento(self, value):
        """Valida que a data de nascimento não é futura"""
        if value and value > date.today():
            raise serializers.ValidationError('A data de nascimento não pode ser futura.')
        return value
    
    def validate_nome_completo(self, value):
        """Valida que o nome completo tem pelo menos 3 caracteres"""
        if value and len(value.strip()) < 3:
            raise serializers.ValidationError('O nome completo deve ter pelo menos 3 caracteres.')
        return value
    
    def validate_telefone(self, value):
        """Valida o formato do telefone"""
        if value:
            # Remove caracteres não numéricos para verificação
            import re
            numeros = re.sub(r'\D', '', str(value))
            if len(numeros) < 9:
                raise serializers.ValidationError('O telefone deve ter pelo menos 9 dígitos.')
            if not str(value).startswith('+'):
                raise serializers.ValidationError('O telefone deve incluir o código do país (ex: +244...)')
        return value


class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=False, min_length=6)
    confirm_password = serializers.CharField(write_only=True, required=False)
    
    class Meta:
        model = CustomUser
        fields = ['email', 'password', 'confirm_password', 'role']
    
    def validate_email(self, value):
        """Valida se o email já não está em uso"""
        if CustomUser.objects.filter(email=value).exists():
            raise serializers.ValidationError('Este email já está cadastrado.')
        return value
    
    def validate_role(self, value):
        roles_validas = ['produtor', 'veterinario', 'funcionario', 'gestor_financeiro']
        if value not in roles_validas:
            raise serializers.ValidationError(f'Role inválida. Escolha entre: {", ".join(roles_validas)}')
        return value
    
    def validate(self, data):
        """Validação personalizada"""
        # Verifica se é registro normal (não é Google)
        if 'google_token' not in self.context:
            password = data.get('password')
            confirm_password = data.get('confirm_password')
            
            if not password:
                raise serializers.ValidationError({'password': 'Senha é obrigatória'})
            
            if password != confirm_password:
                raise serializers.ValidationError({'confirm_password': 'As senhas não coincidem'})
            
            if len(password) < 6:
                raise serializers.ValidationError({'password': 'A senha deve ter no mínimo 6 caracteres'})
        
        return data
    
    def create(self, validated_data):
        # Remove campos auxiliares
        validated_data.pop('confirm_password', None)
        google_token = self.context.pop('google_token', None)
        password = validated_data.pop('password', None)
        
        # Se tem google_token, é usuário do Google
        if google_token:
            user = CustomUser.objects.create_user(
                email=validated_data['email'],
                password=None,
                role=validated_data['role'],
                is_approved=False,
                email_confirmed=True,  # Google já confirma email
                is_active=True,
                needs_password_setup=False
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


class UserActivitySerializer(serializers.ModelSerializer):
    user_email = serializers.CharField(source='user.email', read_only=True)
    activity_display = serializers.CharField(source='get_activity_type_display', read_only=True)
    
    class Meta:
        model = UserActivity
        fields = [
            'id', 'user', 'user_email', 'activity_type', 'activity_display',
            'ip_address', 'description', 'created_at'
        ]
        read_only_fields = ['id', 'created_at']


class ChangePasswordSerializer(serializers.Serializer):
    current_password = serializers.CharField(required=True)
    new_password = serializers.CharField(required=True, min_length=6)
    confirm_new_password = serializers.CharField(required=True)
    
    def validate(self, data):
        if data['new_password'] != data['confirm_new_password']:
            raise serializers.ValidationError({'confirm_new_password': 'As senhas não coincidem'})
        return data


class ForgotPasswordSerializer(serializers.Serializer):
    email = serializers.EmailField(required=True)


class ResetPasswordSerializer(serializers.Serializer):
    token = serializers.CharField(required=True)
    new_password = serializers.CharField(required=True, min_length=6)
    confirm_new_password = serializers.CharField(required=True)
    
    def validate(self, data):
        if data['new_password'] != data['confirm_new_password']:
            raise serializers.ValidationError({'confirm_new_password': 'As senhas não coincidem'})
        return data
from rest_framework import serializers
from .models import CustomUser, Perfil
from django.contrib.auth.password_validation import validate_password

class RegisterSerializer(serializers.ModelSerializer):
    # Campos adicionais do front
    nome_completo = serializers.CharField(write_only=True)
    data_nascimento = serializers.DateField(write_only=True)
    contacto = serializers.CharField(write_only=True, required=False, allow_blank=True)
    fazenda = serializers.CharField(write_only=True, required=False, allow_blank=True)
    tipo_gado = serializers.CharField(write_only=True, required=False, allow_blank=True)
    tamanho_gado = serializers.CharField(write_only=True, required=False, allow_blank=True)
    senha = serializers.CharField(write_only=True, required=True, validators=[validate_password])

    class Meta:
        model = CustomUser
        fields = ['email', 'senha', 'nome_completo', 'data_nascimento', 'contacto', 'fazenda', 'tipo_gado', 'tamanho_gado']

    def create(self, validated_data):
        # Criar o usuário
        senha = validated_data.pop('senha')
        nome_completo = validated_data.pop('nome_completo')
        data_nascimento = validated_data.pop('data_nascimento')
        contacto = validated_data.pop('contacto', None)
        fazenda = validated_data.pop('fazenda', None)
        tipo_gado = validated_data.pop('tipo_gado', None)
        tamanho_gado = validated_data.pop('tamanho_gado', None)

        user = CustomUser.objects.create(
            email=validated_data['email'],
            papel='fazendeiro',  # Padrão
        )
        user.set_password(senha)
        user.save()

        # Criar perfil
        Perfil.objects.create(
            user=user,
            nome_completo=nome_completo,
            data_nascimento=data_nascimento,
            telefone=contacto,
            endereco=fazenda,
        )

        # Se quiser, aqui podemos enviar email de boas-vindas usando send_mail()

        return user
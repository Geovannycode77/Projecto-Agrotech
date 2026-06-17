import os
import json
import base64
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework import status
from rest_framework import status, permissions
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import authenticate
from .models import CustomUser, Perfil
from .serializers import UserSerializer, RegisterSerializer, PerfilSerializer
from .utils import send_confirmation_email
from django.utils import timezone
from datetime import timedelta

# ========== AUTENTICAÇÃO ==========

@api_view(['POST'])
@permission_classes([permissions.AllowAny])
def register(request):
    """Registro de novo usuário"""
    print(f"🔵 Dados recebidos: {request.data}")
    
    serializer = RegisterSerializer(data=request.data, context={'request': request})
    
    if serializer.is_valid():
        user = serializer.save()
        print(f"✅ Usuário criado: {user.email}")
        return Response({
            'message': 'Usuário registrado. Aguardando aprovação do administrador.',
            'user': UserSerializer(user).data
        }, status=status.HTTP_201_CREATED)
    
    print(f"❌ Erros: {serializer.errors}")
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['POST'])
@permission_classes([permissions.AllowAny])
def login(request):
    """Login com email e senha"""
    email = request.data.get('email')
    password = request.data.get('password')
    
    user = authenticate(request, email=email, password=password)
    
    if not user:
        return Response({
            'error': 'Email ou senha inválidos'
        }, status=status.HTTP_401_UNAUTHORIZED)
    
    if not user.email_confirmed:
        return Response({
            'error': 'Email não confirmado. Verifique sua caixa de entrada.',
            'requires_confirmation': True,
            'email': user.email
        }, status=status.HTTP_403_FORBIDDEN)
    
    if not user.is_active:
        return Response({
            'error': 'Conta desativada. Contacte o administrador.'
        }, status=status.HTTP_403_FORBIDDEN)
    
    # Garante que o perfil existe
    Perfil.objects.get_or_create(
        user=user,
        defaults={'nome_completo': ''}
    )
    
    refresh = RefreshToken.for_user(user)
    return Response({
        'refresh': str(refresh),
        'access': str(refresh.access_token),
        'user': UserSerializer(user).data
    })

@api_view(['GET'])
def get_current_user(request):
    """Obter dados do usuário atual"""
    if request.user.is_authenticated:
        serializer = UserSerializer(request.user)
        return Response(serializer.data)
    return Response({'error': 'Não autenticado'}, status=status.HTTP_401_UNAUTHORIZED)

@api_view(['POST'])
def logout(request):
    """Logout - invalidar token"""
    try:
        refresh_token = request.data.get('refresh')
        if refresh_token:
            token = RefreshToken(refresh_token)
            token.blacklist()
        return Response({'message': 'Logout realizado com sucesso'})
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def change_password(request):
    """Alterar senha do usuário"""
    user = request.user
    current_password = request.data.get('current_password')
    new_password = request.data.get('new_password')
    
    if not user.check_password(current_password):
        return Response(
            {'error': 'Senha atual incorreta'},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    user.set_password(new_password)
    user.save()
    
    return Response({'message': 'Senha alterada com sucesso'})

# ========== GOOGLE LOGIN ==========

@api_view(['POST'])
@permission_classes([permissions.AllowAny])
def google_login(request):
    """Login com Google OAuth - Apenas para usuários existentes"""
    try:
        credential = request.data.get('credential')
        
        if not credential:
            return Response({
                'error': 'Token do Google não fornecido'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Decodifica o token
        try:
            parts = credential.split('.')
            if len(parts) != 3:
                raise ValueError("Token inválido")
            
            payload = parts[1]
            payload += '=' * (4 - len(payload) % 4)
            decoded_payload = base64.b64decode(payload)
            payload_json = json.loads(decoded_payload)
            
            email = payload_json.get('email')
            name = payload_json.get('name', '')
            picture = payload_json.get('picture', '')
            google_id = payload_json.get('sub')
            
        except Exception as e:
            print(f"Erro ao decodificar token: {e}")
            return Response({
                'error': 'Erro ao processar token do Google'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        if not email:
            return Response({
                'error': 'Email não encontrado no token'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Verifica se usuário já existe
        user = CustomUser.objects.filter(email=email).first()
        
        if not user:
            return Response({
                'success': False,
                'error': 'Conta não encontrada. Por favor, cadastre-se primeiro.',
                'requires_registration': True,
                'email': email,
                'name': name,
                'picture': picture,
                'google_id': google_id
            }, status=status.HTTP_404_NOT_FOUND)
        
        # Usuário existe - verifica se email está confirmado
        if not user.email_confirmed:
            return Response({
                'success': False,
                'error': 'Email não confirmado. Verifique sua caixa de entrada.',
                'requires_confirmation': True,
                'email': user.email
            }, status=status.HTTP_403_FORBIDDEN)
        
        if not user.is_active:
            return Response({
                'error': 'Conta desativada. Contacte o administrador.'
            }, status=status.HTTP_403_FORBIDDEN)
        
        # Garante que o perfil existe e atualiza o nome se necessário
        perfil, created = Perfil.objects.get_or_create(
            user=user,
            defaults={'nome_completo': name or user.email.split('@')[0]}
        )
        
        # Se o perfil já existia mas está sem nome, atualiza com o nome do Google
        if not created and not perfil.nome_completo and name:
            perfil.nome_completo = name
            perfil.save()
            print(f"✅ Nome do perfil atualizado para: {name}")
        
        refresh = RefreshToken.for_user(user)
        
        return Response({
            'success': True,
            'refresh': str(refresh),
            'access': str(refresh.access_token),
            'user': UserSerializer(user).data
        })
        
    except Exception as e:
        print(f"Google login error: {str(e)}")
        return Response({
            'error': 'Erro ao processar login com Google'
        }, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
@permission_classes([permissions.AllowAny])
def google_register(request):
    """Registro com Google - Cria usuário com senha definida"""
    try:
        data = request.data
        email = data.get('email')
        password = data.get('password')
        role = data.get('role')
        name = data.get('name', '')
        picture = data.get('picture', '')
        google_id = data.get('google_id')
        
        print(f"🔵 Google Register - Email: {email}, Role: {role}, Name: {name}")
        
        # Validações
        if not email:
            return Response({
                'error': 'Email é obrigatório'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        if not password:
            return Response({
                'error': 'Senha é obrigatória'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        if not role:
            return Response({
                'error': 'Tipo de usuário é obrigatório'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Verifica se usuário já existe
        user = CustomUser.objects.filter(email=email).first()
        
        if user:
            return Response({
                'error': 'Usuário já existe. Faça login.'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Cria o usuário com senha
        user = CustomUser.objects.create_user(
            email=email,
            password=password,
            role=role,
            is_approved=False,
            email_confirmed=False,
            is_active=True,
            google_id=google_id,
            profile_picture=picture,
            needs_password_setup=False
        )
        
        print(f"✅ Usuário Google criado: {user.email}")
        
        # Cria o perfil com o nome do Google
        Perfil.objects.create(
            user=user,
            nome_completo=name or email.split('@')[0]  # Usa o nome ou primeira parte do email
        )
        
        return Response({
            'success': True,
            'message': 'Usuário criado com sucesso! Complete seu perfil.'
        }, status=status.HTTP_201_CREATED)
        
    except Exception as e:
        print(f"❌ Google register error: {str(e)}")
        import traceback
        traceback.print_exc()
        return Response({
            'error': f'Erro ao criar conta: {str(e)}'
        }, status=status.HTTP_400_BAD_REQUEST)


# ========== CONFIRMAÇÃO DE EMAIL ==========

@api_view(['POST'])
@permission_classes([permissions.AllowAny])
def confirm_email(request):
    """Confirma o email do usuário através do token"""
    try:
        token = request.data.get('token')
        
        if not token:
            return Response({
                'success': False,
                'error': 'Link de confirmação inválido.'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        user = CustomUser.objects.filter(email_confirmation_token=token).first()
        
        if not user:
            return Response({
                'success': False,
                'error': 'Link de confirmação inválido ou expirado. Solicite um novo email.'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        if user.email_confirmed:
            refresh = RefreshToken.for_user(user)
            return Response({
                'success': True,
                'message': 'Email já estava confirmado.',
                'already_confirmed': True,
                'refresh': str(refresh),
                'access': str(refresh.access_token),
                'user': UserSerializer(user).data
            }, status=status.HTTP_200_OK)
        
        user.email_confirmed = True
        user.email_confirmation_token = None
        user.is_approved = True
        user.save()
        
        # Garante que o perfil existe
        Perfil.objects.get_or_create(
            user=user,
            defaults={'nome_completo': ''}
        )
        
        refresh = RefreshToken.for_user(user)
        
        return Response({
            'success': True,
            'message': 'Email confirmado com sucesso!',
            'refresh': str(refresh),
            'access': str(refresh.access_token),
            'user': UserSerializer(user).data
        }, status=status.HTTP_200_OK)
        
    except Exception as e:
        print(f"Confirm email error: {str(e)}")
        return Response({
            'success': False,
            'error': 'Erro ao confirmar email. Tente novamente.'
        }, status=status.HTTP_400_BAD_REQUEST)

@api_view(['POST'])
@permission_classes([permissions.AllowAny])
def resend_confirmation_email(request):
    """Reenvia email de confirmação"""
    try:
        email = request.data.get('email')
        
        if not email:
            return Response({
                'error': 'Email não fornecido'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        user = CustomUser.objects.filter(email=email).first()
        
        if not user:
            return Response({
                'error': 'Usuário não encontrado'
            }, status=status.HTTP_404_NOT_FOUND)
        
        if user.email_confirmed:
            return Response({
                'message': 'Email já está confirmado.'
            }, status=status.HTTP_200_OK)
        
        send_confirmation_email(user, request)
        
        return Response({
            'message': 'Email de confirmação reenviado! Verifique sua caixa de entrada.'
        }, status=status.HTTP_200_OK)
        
    except Exception as e:
        print(f"Resend confirmation error: {str(e)}")
        return Response({
            'error': f'Erro ao reenviar email: {str(e)}'
        }, status=status.HTTP_400_BAD_REQUEST)


# ========== COMPLETAR PERFIL ==========

@api_view(['POST'])
@permission_classes([permissions.AllowAny])
def complete_profile(request):
    """Completa o perfil do usuário após registro"""
    try:
        data = request.data
        email = data.get('email')
        role = data.get('role')
        profile = data.get('profile', {})
        is_google = data.get('isGoogle', False)
        google_credential = data.get('credential')
        password = data.get('password')
        google_id = data.get('google_id')
        name = data.get('name', '')
        
        print(f"🔵 Complete Profile - Email: {email}, Role: {role}, IsGoogle: {is_google}")
        print(f"📝 Profile data: {profile}")
        
        if not email:
            return Response({
                'success': False,
                'error': 'O email é obrigatório.'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        if not role:
            return Response({
                'success': False,
                'error': 'Selecione um tipo de usuário.'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Verifica se usuário já existe
        user = CustomUser.objects.filter(email=email).first()
        
        if user:
            # ✅ CORREÇÃO: Se o usuário já existe e tem perfil, atualiza os dados
            if user.email_confirmed:
                # Tenta obter ou criar o perfil
                perfil, created = Perfil.objects.get_or_create(
                    user=user,
                    defaults={'nome_completo': profile.get('nome_completo', name)}
                )
                
                # Se o perfil já existe, atualiza os campos se estiverem vazios
                if not created:
                    # Atualiza o nome completo se estiver vazio
                    if not perfil.nome_completo and profile.get('nome_completo'):
                        perfil.nome_completo = profile.get('nome_completo')
                    
                    # Atualiza outros campos se fornecidos
                    if profile.get('telefone'):
                        perfil.telefone = profile.get('telefone')
                    if profile.get('endereco'):
                        perfil.endereco = profile.get('endereco')
                    if profile.get('data_nascimento'):
                        perfil.data_nascimento = profile.get('data_nascimento')
                    
                    # Campos específicos por role
                    if role == 'produtor' and profile.get('fazenda_nome'):
                        perfil.fazenda_nome = profile.get('fazenda_nome')
                    elif role == 'veterinario' and profile.get('especialidade'):
                        perfil.especialidade = profile.get('especialidade')
                    elif role == 'funcionario' and profile.get('setor'):
                        perfil.setor = profile.get('setor')
                    elif role == 'gestor_financeiro' and profile.get('area_atuacao'):
                        perfil.area_atuacao = profile.get('area_atuacao')
                    
                    perfil.save()
                    print(f"✅ Perfil atualizado para {user.email}: {perfil.nome_completo}")
                
                return Response({
                    'success': True,
                    'message': 'Perfil atualizado com sucesso!',
                    'user': UserSerializer(user).data
                }, status=status.HTTP_200_OK)
            
            # Usuário existe mas não confirmou email
            if not user.email_confirmed:
                send_confirmation_email(user, request)
                return Response({
                    'success': True,
                    'message': 'Usuário já existe. Um novo email de confirmação foi enviado.',
                    'requires_confirmation': True
                }, status=status.HTTP_200_OK)
            
            return Response({
                'success': False,
                'error': 'Este email já está cadastrado. Faça login.'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Cria novo usuário
        if is_google and google_credential:
            # Usuário do Google - cria sem senha
            user = CustomUser.objects.create_user(
                email=email,
                password=None,
                role=role,
                is_approved=False,
                email_confirmed=False,
                is_active=True,
                google_id=google_id,
                profile_picture=data.get('picture', ''),
                needs_password_setup=False
            )
            
            # Pega o nome do perfil ou do Google
            nome_para_perfil = profile.get('nome_completo') or name or email.split('@')[0]
            
            # Cria o perfil com todos os dados
            Perfil.objects.create(
                user=user,
                nome_completo=nome_para_perfil,
                telefone=profile.get('telefone', ''),
                endereco=profile.get('endereco', ''),
                data_nascimento=profile.get('data_nascimento') or None,
                fazenda_nome=profile.get('fazenda_nome', ''),
                especialidade=profile.get('especialidade', ''),
                setor=profile.get('setor', ''),
                area_atuacao=profile.get('area_atuacao', '')
            )
            print(f"✅ Usuário Google criado com perfil: {nome_para_perfil}")
        else:
            # Usuário normal
            if not password:
                return Response({
                    'success': False,
                    'error': 'A senha é obrigatória.'
                }, status=status.HTTP_400_BAD_REQUEST)
            
            user = CustomUser.objects.create_user(
                email=email,
                password=password,
                role=role,
                is_approved=False,
                email_confirmed=False,
                is_active=True
            )
            
            # Cria o perfil
            Perfil.objects.create(
                user=user,
                nome_completo=profile.get('nome_completo', ''),
                telefone=profile.get('telefone', ''),
                endereco=profile.get('endereco', ''),
                data_nascimento=profile.get('data_nascimento') or None,
                fazenda_nome=profile.get('fazenda_nome', ''),
                especialidade=profile.get('especialidade', ''),
                setor=profile.get('setor', ''),
                area_atuacao=profile.get('area_atuacao', '')
            )
        
        # Envia email de confirmação
        send_confirmation_email(user, request)
        
        return Response({
            'success': True,
            'message': 'Cadastro realizado! Verifique seu email para confirmar a conta.',
            'requires_confirmation': True
        }, status=status.HTTP_201_CREATED)
        
    except Exception as e:
        print(f"❌ Complete profile error: {str(e)}")
        import traceback
        traceback.print_exc()
        return Response({
            'success': False,
            'error': 'Ocorreu um erro ao processar seu cadastro. Tente novamente.'
        }, status=status.HTTP_400_BAD_REQUEST)


# ========== RECUPERAÇÃO DE SENHA ==========

@api_view(['POST'])
@permission_classes([permissions.AllowAny])
def forgot_password(request):
    """Envia email de recuperação de senha"""
    try:
        email = request.data.get('email')
        
        if not email:
            return Response({
                'error': 'Email é obrigatório'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        user = CustomUser.objects.filter(email=email).first()
        
        # Por segurança, não revelamos se o usuário existe ou não
        if not user:
            return Response({
                'message': 'Se o email estiver cadastrado, você receberá um link de recuperação.'
            }, status=status.HTTP_200_OK)
        
        # Gera token de recuperação
        import secrets
        reset_token = secrets.token_urlsafe(32)
        user.reset_password_token = reset_token
        user.reset_password_token_created_at = timezone.now()
        user.save()
        
        # Envia email de recuperação
        from .utils import send_reset_password_email
        send_reset_password_email(user, request)
        
        return Response({
            'message': 'Email de recuperação enviado! Verifique sua caixa de entrada.'
        }, status=status.HTTP_200_OK)
        
    except Exception as e:
        print(f"Forgot password error: {str(e)}")
        return Response({
            'error': 'Erro ao processar solicitação'
        }, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
@permission_classes([permissions.AllowAny])
def reset_password(request):
    """Redefine a senha do usuário"""
    try:
        token = request.data.get('token')
        new_password = request.data.get('new_password')
        
        if not token or not new_password:
            return Response({
                'error': 'Token e nova senha são obrigatórios'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        if len(new_password) < 6:
            return Response({
                'error': 'A senha deve ter no mínimo 6 caracteres'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        user = CustomUser.objects.filter(reset_password_token=token).first()
        
        if not user:
            return Response({
                'error': 'Token inválido ou expirado'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Verifica se token expirou (24 horas)
        if user.reset_password_token_created_at:
            from django.utils import timezone
            from datetime import timedelta
            expiration_time = user.reset_password_token_created_at + timedelta(hours=24)
            if timezone.now() > expiration_time:
                return Response({
                    'error': 'Token expirado. Solicite um novo link de recuperação.'
                }, status=status.HTTP_400_BAD_REQUEST)
        
        # Define nova senha
        user.set_password(new_password)
        user.reset_password_token = None
        user.reset_password_token_created_at = None
        user.save()
        
        return Response({
            'message': 'Senha redefinida com sucesso! Faça login com sua nova senha.'
        }, status=status.HTTP_200_OK)
        
    except Exception as e:
        print(f"Reset password error: {str(e)}")
        return Response({
            'error': 'Erro ao redefinir senha'
        }, status=status.HTTP_400_BAD_REQUEST)


# ========== ADMIN - GESTÃO DE UTILIZADORES ==========

@api_view(['GET'])
@permission_classes([permissions.IsAdminUser])
def list_users(request):
    """Listar todos os usuários (apenas admin)"""
    users = CustomUser.objects.all().order_by('-date_joined')
    serializer = UserSerializer(users, many=True)
    return Response(serializer.data)

@api_view(['GET'])
@permission_classes([permissions.IsAdminUser])
def get_pending_users(request):
    """Listar usuários pendentes de aprovação"""
    users = CustomUser.objects.filter(is_approved=False, is_superuser=False)
    serializer = UserSerializer(users, many=True)
    return Response(serializer.data)

@api_view(['POST'])
@permission_classes([permissions.IsAdminUser])
def approve_user(request, user_id):
    """Aprovar um usuário"""
    try:
        user = CustomUser.objects.get(id=user_id)
        user.is_approved = True
        user.save()
        return Response({
            'message': f'Usuário {user.email} aprovado com sucesso',
            'user': UserSerializer(user).data
        })
    except CustomUser.DoesNotExist:
        return Response({'error': 'Usuário não encontrado'}, status=status.HTTP_404_NOT_FOUND)

@api_view(['PUT'])
@permission_classes([permissions.IsAdminUser])
def update_user_role(request, user_id):
    """Atualizar role de um usuário"""
    try:
        user = CustomUser.objects.get(id=user_id)
        new_role = request.data.get('role')
        
        roles_validas = ['administrador', 'produtor', 'veterinario', 'funcionario', 'gestor_financeiro']
        
        if new_role not in roles_validas:
            return Response({
                'error': f'Role inválida. Escolha entre: {", ".join(roles_validas)}'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        user.role = new_role
        user.save()
        
        return Response({
            'message': f'Role atualizada para {new_role}',
            'user': UserSerializer(user).data
        })
    except CustomUser.DoesNotExist:
        return Response({'error': 'Usuário não encontrado'}, status=status.HTTP_404_NOT_FOUND)

@api_view(['DELETE'])
@permission_classes([permissions.IsAdminUser])
def delete_user(request, user_id):
    """Deletar um usuário"""
    try:
        user = CustomUser.objects.get(id=user_id)
        if user.is_superuser:
            return Response({'error': 'Não é possível deletar o superusuário'}, 
                          status=status.HTTP_403_FORBIDDEN)
        
        user.delete()
        return Response({'message': 'Usuário deletado com sucesso'})
    except CustomUser.DoesNotExist:
        return Response({'error': 'Usuário não encontrado'}, status=status.HTTP_404_NOT_FOUND)


# ========== PERFIL ==========

@api_view(['GET', 'PUT'])
@permission_classes([IsAuthenticated])
def get_update_profile(request):
    """Obter ou atualizar perfil do usuário"""
    if request.method == 'GET':
        try:
            # Tenta buscar o perfil existente
            try:
                perfil = Perfil.objects.get(user=request.user)
            except Perfil.DoesNotExist:
                # Se não existir, cria um novo
                nome_padrao = request.user.email.split('@')[0]
                perfil = Perfil.objects.create(
                    user=request.user,
                    nome_completo=nome_padrao
                )
                print(f"✅ Perfil criado automaticamente para {request.user.email} com nome: {nome_padrao}")
            
            serializer = PerfilSerializer(perfil)
            return Response(serializer.data)
            
        except Exception as e:
            print(f"❌ Erro ao obter perfil: {str(e)}")
            import traceback
            traceback.print_exc()
            return Response(
                {'error': f'Erro ao obter perfil: {str(e)}'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    elif request.method == 'PUT':
        try:
            # Tenta buscar o perfil existente
            try:
                perfil = Perfil.objects.get(user=request.user)
            except Perfil.DoesNotExist:
                # Se não existir, cria um novo
                perfil = Perfil.objects.create(
                    user=request.user,
                    nome_completo=''
                )
            
            serializer = PerfilSerializer(perfil, data=request.data, partial=True)
            if serializer.is_valid():
                serializer.save()
                print(f"✅ Perfil atualizado para {request.user.email}")
                return Response(serializer.data)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
            
        except Exception as e:
            print(f"❌ Erro ao atualizar perfil: {str(e)}")
            import traceback
            traceback.print_exc()
            return Response(
                {'error': f'Erro ao atualizar perfil: {str(e)}'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

# ========== DASHBOARD STATS ==========

@api_view(['GET'])
@permission_classes([permissions.IsAdminUser])
def get_admin_stats(request):
    """Estatísticas para o painel do admin"""
    stats = {
        'total_users': CustomUser.objects.count(),
        'pending_users': CustomUser.objects.filter(is_approved=False, is_superuser=False).count(),
        'approved_users': CustomUser.objects.filter(is_approved=True).count(),
        'users_by_role': {
            role: CustomUser.objects.filter(role=role).count()
            for role, _ in CustomUser.ROLE_CHOICES
        }
    }
    return Response(stats)
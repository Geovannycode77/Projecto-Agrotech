import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, XCircle, Loader2 } from 'lucide-react';

export default function ConfirmEmail() {
  const [status, setStatus] = useState('loading');
  const [message, setMessage] = useState('');
  const navigate = useNavigate();
  const { token } = useParams();
  const { confirmEmail: confirmEmailFromHook } = useAuth(); // Renomeado para evitar conflito

  useEffect(() => {
    handleConfirmEmail();
  }, []);

  const handleConfirmEmail = async () => {
    try {
      const result = await confirmEmailFromHook(token);

      if (result.success) {
        setStatus('success');
        setMessage(result.message);

        // Redireciona após 3 segundos (como antes: usar a rota '/' que redireciona pelo papel)
        setTimeout(() => {
          navigate('/');
        }, 3000);
      } else {
        setStatus('error');
        setMessage(result.error || 'Erro ao confirmar email');
        setTimeout(() => {
          navigate('/login');
        }, 3000);
      }
    } catch (error) {
      console.error('Confirm email error:', error);
      setStatus('error');
      setMessage('Erro ao confirmar email. Tente novamente.');
      setTimeout(() => {
        navigate('/login');
      }, 3000);
    }
  };

  const handleLogin = () => {
    navigate('/login');
  };

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-green-100">
        <Card className="w-full max-w-md text-center">
          <CardContent className="pt-6">
            <Loader2 className="h-12 w-12 animate-spin text-green-600 mx-auto mb-4" />
            <p className="text-gray-600">Confirmando seu email...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-green-100">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          {status === 'success' ? (
            <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
          ) : (
            <XCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          )}
          <CardTitle>
            {status === 'success' ? 'Email Confirmado!' : 'Falha na Confirmação'}
          </CardTitle>
          <p className="text-gray-600 mt-2">{message}</p>
        </CardHeader>
        <CardFooter>
          <Button onClick={handleLogin} className="w-full">
            Ir para o Login
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
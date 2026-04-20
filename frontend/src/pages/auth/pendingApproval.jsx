import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Clock, Mail } from 'lucide-react';

export default function PendingApproval() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-green-100">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <Clock className="h-16 w-16 text-yellow-500" />
          </div>
          <CardTitle className="text-2xl">Aguardando Aprovação</CardTitle>
          <CardDescription>
            Sua conta está aguardando aprovação do administrador
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-4">
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex items-start space-x-3">
              <Mail className="h-5 w-5 text-yellow-600 mt-0.5" />
              <div>
                <p className="text-sm text-yellow-800">
                  Um email de confirmação foi enviado para:
                </p>
                <p className="text-sm font-medium text-yellow-900 mt-1">
                  {user?.email}
                </p>
              </div>
            </div>
          </div>
          
          <div className="text-sm text-gray-600 space-y-2">
            <p>O que acontece agora?</p>
            <ul className="list-disc list-inside space-y-1 ml-2">
              <li>O administrador irá analisar sua solicitação</li>
              <li>Você receberá um email quando for aprovado</li>
              <li>Após a aprovação, você poderá acessar o sistema</li>
              <li>O processo pode levar até 24 horas úteis</li>
            </ul>
          </div>
        </CardContent>
        
        <CardFooter className="flex flex-col space-y-2">
          <Button 
            variant="outline" 
            className="w-full"
            onClick={handleLogout}
          >
            Sair
          </Button>
          <p className="text-xs text-gray-500 text-center">
            Precisa de ajuda? Contacte o suporte: suporte@agrotech.com
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
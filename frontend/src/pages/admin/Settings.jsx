// frontend/src/pages/admin/Settings.jsx
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function Settings() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Configurações do Sistema</h1>
      <Card>
        <CardHeader>
          <CardTitle>Configurações Gerais</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600">Módulo em desenvolvimento...</p>
        </CardContent>
      </Card>
    </div>
  );
}
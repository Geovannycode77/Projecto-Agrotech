// frontend/src/pages/admin/Reports.jsx
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function Reports() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Relatórios Gerais</h1>
      <Card>
        <CardHeader>
          <CardTitle>Relatórios do Sistema</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600">Módulo em desenvolvimento...</p>
        </CardContent>
      </Card>
    </div>
  );
}
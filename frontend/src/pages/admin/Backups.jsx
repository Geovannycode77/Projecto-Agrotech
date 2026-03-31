// frontend/src/pages/admin/Backups.jsx
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function Backups() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Backups</h1>
      <Card>
        <CardHeader>
          <CardTitle>Gerenciamento de Backups</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600">Módulo em desenvolvimento...</p>
        </CardContent>
      </Card>
    </div>
  );
}
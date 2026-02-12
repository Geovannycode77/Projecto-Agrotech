import { useEffect, useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { confirmEmail } from "@/services/api";
import { useNavigate, useParams } from "react-router-dom";

export default function ConfirmEmail() {
  const { token } = useParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState("Verificando...");

  useEffect(() => {
    async function verify() {
      try {
        await confirmEmail(token);
        setStatus("Email confirmado com sucesso! Redirecionando...");
        setTimeout(() => navigate("/dashboard"), 2000);
      } catch {
        setStatus("Token inválido ou expirado.");
      }
    }
    verify();
  }, [token, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      <Card className="w-full max-w-md p-6 text-center">
        <CardHeader>
          <CardTitle className="text-center text-2xl font-bold">
            Confirmação de Email
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-700">{status}</p>
        </CardContent>
      </Card>
    </div>
  );
}

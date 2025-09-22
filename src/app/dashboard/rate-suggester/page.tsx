'use client';
import RateSuggesterForm from "@/components/rate-suggester/rate-suggester-form";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/contexts/auth-context";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function RateSuggesterPage() {
    const { user, loading } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!loading && !user) {
            router.push('/');
        }
    }, [user, loading, router]);

    if (loading || !user) {
        return <div className="text-center">Cargando...</div>;
    }

    return (
        <div className="w-full space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>Sugeridor de Tarifas con IA</CardTitle>
                    <CardDescription>
                        Usa nuestra herramienta de IA para obtener sugerencias de precios óptimos basados en la hora de entrada, duración y patrones históricos.
                    </CardDescription>
                </CardHeader>
            </Card>
            <RateSuggesterForm />
        </div>
    );
}


'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/auth-context';

const formSchema = z.object({
    username: z.string().min(2, { message: 'El nombre de usuario debe tener al menos 2 caracteres.' }),
    parkingLotName: z.string().min(3, { message: 'El nombre del estacionamiento debe tener al menos 3 caracteres.' }),
    maxCapacity: z.coerce.number().min(1, { message: 'La capacidad debe ser de al menos 1.' }),
    hourlyCost: z.coerce.number().min(0.1, { message: 'El costo por hora debe ser positivo.' }),
    address: z.string().min(5, { message: 'La dirección es requerida.' }),
    city: z.string().min(2, { message: 'La ciudad es requerida.' }),
});

export default function ProfileForm() {
    const router = useRouter();
    const { toast } = useToast();
    const { user, userData, loading, forceReloadUserData } = useAuth();
    const [isLoading, setIsLoading] = useState(false);

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        values: {
            username: userData?.username || '',
            parkingLotName: userData?.parkingLotName || '',
            maxCapacity: userData?.maxCapacity || 0,
            hourlyCost: userData?.hourlyCost || 0,
            address: userData?.address || '',
            city: userData?.city || '',
        },
    });
    
    async function onSubmit(values: z.infer<typeof formSchema>) {
        if (!user) {
             toast({
                variant: "destructive",
                title: "Error",
                description: "Debes estar autenticado para actualizar tu información.",
            });
            return;
        }

        setIsLoading(true);
        try {
            const userDocRef = doc(db, "users", user.uid);
            await updateDoc(userDocRef, {
                ...values
            });

            await forceReloadUserData();

            toast({
                title: 'Perfil Actualizado',
                description: 'La información de tu sucursal ha sido guardada exitosamente.',
            });
            
        } catch (error: any) {
            console.error("Error updating profile:", error);
            toast({
                variant: "destructive",
                title: "Falló la Actualización",
                description: 'Ocurrió un error inesperado. Revisa la consola para más detalles.',
            });
        } finally {
            setIsLoading(false);
        }
    }

    if (loading) {
        return <p>Cargando formulario...</p>
    }

    return (
        <Card className="w-full">
            <CardHeader>
                <CardTitle>Editar Perfil de Sucursal</CardTitle>
                <CardDescription>Actualiza los detalles de tu estacionamiento.</CardDescription>
            </CardHeader>
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)}>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                             <FormField control={form.control} name="username" render={({ field }) => (
                                <FormItem><FormLabel>Nombre del Gerente</FormLabel><FormControl><Input placeholder="Ej., Juan Pérez" {...field} /></FormControl><FormMessage /></FormItem>
                            )} />
                            <FormField control={form.control} name="parkingLotName" render={({ field }) => (
                                <FormItem><FormLabel>Nombre del Estacionamiento</FormLabel><FormControl><Input placeholder="Ej., Estacionamiento Central" {...field} /></FormControl><FormMessage /></FormItem>
                            )} />
                            <FormField control={form.control} name="maxCapacity" render={({ field }) => (
                                <FormItem><FormLabel>Capacidad Máxima de Vehículos</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>
                            )} />
                            <FormField control={form.control} name="hourlyCost" render={({ field }) => (
                                <FormItem><FormLabel>Costo por Hora</FormLabel><FormControl><Input type="number" step="0.01" {...field} /></FormControl><FormMessage /></FormItem>
                            )} />
                            <FormField control={form.control} name="address" render={({ field }) => (
                                <FormItem><FormLabel>Dirección</FormLabel><FormControl><Input placeholder="Ej., Av. Principal 123" {...field} /></FormControl><FormMessage /></FormItem>
                            )} />
                            <FormField control={form.control} name="city" render={({ field }) => (
                                <FormItem><FormLabel>Ciudad</FormLabel><FormControl><Input placeholder="Ej., Metrópolis" {...field} /></FormControl><FormMessage /></FormItem>
                            )} />
                        </div>
                    </CardContent>
                    <CardFooter className="flex justify-end gap-2">
                        <Button variant="outline" type="button" onClick={() => router.back()}>
                            Cancelar
                        </Button>
                        <Button type="submit" disabled={isLoading || loading}>
                            {isLoading ? 'Guardando Cambios...' : 'Guardar Cambios'}
                        </Button>
                    </CardFooter>
                </form>
            </Form>
        </Card>
    );
}

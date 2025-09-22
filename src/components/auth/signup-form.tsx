
"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { Car, Eye, EyeOff, Copy } from 'lucide-react';
import { AlertDialog, AlertDialogAction, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { useAuth } from '@/contexts/auth-context';

const formSchema = z.object({
    username: z.string().min(2, { message: 'El nombre de usuario debe tener al menos 2 caracteres.' }),
    parkingLotName: z.string().min(3, { message: 'El nombre del estacionamiento debe tener al menos 3 caracteres.' }),
    maxCapacity: z.coerce.number().min(1, { message: 'La capacidad debe ser de al menos 1.' }),
    hourlyCost: z.coerce.number().min(0.1, { message: 'El costo por hora debe ser positivo.' }),
    address: z.string().min(5, { message: 'La dirección es requerida.' }),
    city: z.string().min(2, { message: 'La ciudad es requerida.' }),
    password: z.string().min(8, { message: 'La contraseña debe tener al menos 8 caracteres.' }),
    confirmPassword: z.string(),
}).refine(data => data.password === data.confirmPassword, {
    message: "Las contraseñas no coinciden",
    path: ["confirmPassword"],
});

export default function SignUpForm() {
    const router = useRouter();
    const { toast } = useToast();
    const { forceReloadUserData } = useAuth();
    const [isLoading, setIsLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showSuccessDialog, setShowSuccessDialog] = useState(false);
    const [generatedEmail, setGeneratedEmail] = useState('');

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            username: '',
            parkingLotName: '',
            maxCapacity: 100,
            hourlyCost: 2.50,
            address: '',
            city: '',
            password: '',
            confirmPassword: '',
        },
    });

    const sanitizeName = (name: string) => {
        return name.toLowerCase().replace(/[^a-z0-9]/g, '');
    };

    const handleCopyToClipboard = () => {
        navigator.clipboard.writeText(generatedEmail);
        toast({
            title: "¡Copiado!",
            description: "Tu email de acceso ha sido copiado al portapapeles.",
        });
    };

    const handleContinueToDashboard = async () => {
        // Force the auth context to reload the user data
        // before navigating away.
        await forceReloadUserData();
        router.push('/dashboard');
    }

    async function onSubmit(values: z.infer<typeof formSchema>) {
        setIsLoading(true);
        const sanitizedName = sanitizeName(values.parkingLotName);
        const email = `${sanitizedName}@parkease.com`;
        setGeneratedEmail(email);

        try {
            const userCredential = await createUserWithEmailAndPassword(auth, email, values.password);
            
            const user = userCredential.user;

            await setDoc(doc(db, "users", user.uid), {
                uid: user.uid,
                username: values.username,
                parkingLotName: values.parkingLotName,
                maxCapacity: values.maxCapacity,
                hourlyCost: values.hourlyCost,
                address: values.address,
                city: values.city,
                email: email,
                createdAt: new Date(),
            });

            setShowSuccessDialog(true);
            
        } catch (error: any) {
            console.error("Error during sign up:", error);
            toast({
                variant: "destructive",
                title: "Registro Fallido",
                description: error.code === 'auth/email-already-in-use'
                    ? `El email ${email} ya está en uso. Por favor, elige un nombre de estacionamiento diferente.`
                    : 'Ocurrió un error inesperado.',
            });
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <>
            <Card className="w-full max-w-lg">
                <CardHeader className="text-center">
                    <div className="flex justify-center items-center gap-2 mb-4">
                        <Car className="h-8 w-8 text-primary" />
                        <h1 className="text-3xl font-bold font-headline">ParkEase</h1>
                    </div>
                    <CardTitle>Crear una Cuenta</CardTitle>
                    <CardDescription>Ingresa los detalles de tu negocio para comenzar.</CardDescription>
                </CardHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)}>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <FormField control={form.control} name="username" render={({ field }) => (
                                    <FormItem><FormLabel>Tu Nombre</FormLabel><FormControl><Input placeholder="Ej., Juan Pérez" {...field} /></FormControl><FormMessage /></FormItem>
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
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <FormField control={form.control} name="password" render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Contraseña</FormLabel>
                                        <FormControl>
                                            <div className="relative">
                                                <Input type={showPassword ? "text" : "password"} placeholder="••••••••" {...field} />
                                                <Button type="button" variant="ghost" size="icon" className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7" onClick={() => setShowPassword(!showPassword)}>
                                                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                                </Button>
                                            </div>
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )} />
                                <FormField control={form.control} name="confirmPassword" render={({ field }) => (
                                    <FormItem><FormLabel>Confirmar Contraseña</FormLabel><FormControl><Input type={showPassword ? "text" : "password"} placeholder="••••••••" {...field} /></FormControl><FormMessage /></FormItem>
                                )} />
                            </div>
                        </CardContent>
                        <CardFooter>
                            <Button type="submit" className="w-full" disabled={isLoading}>
                                {isLoading ? 'Creando Cuenta...' : 'Registrarse'}
                            </Button>
                        </CardFooter>
                    </form>
                </Form>
            </Card>

            <AlertDialog open={showSuccessDialog} onOpenChange={setShowSuccessDialog}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                    <AlertDialogTitle>¡Cuenta Creada Exitosamente!</AlertDialogTitle>
                    <AlertDialogDescription>
                        Este es tu email para iniciar sesión. Por favor, guárdalo.
                    </AlertDialogDescription>
                    </AlertDialogHeader>
                    <div className="flex items-center space-x-2">
                        <Input value={generatedEmail} readOnly className="font-mono"/>
                        <Button variant="outline" size="icon" onClick={handleCopyToClipboard}>
                            <Copy className="h-4 w-4" />
                        </Button>
                    </div>
                    <AlertDialogFooter>
                        <AlertDialogAction onClick={handleContinueToDashboard}>Continuar al Dashboard</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
}

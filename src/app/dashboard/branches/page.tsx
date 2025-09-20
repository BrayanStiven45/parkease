
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { collection, getDocs, query, onSnapshot, where, doc, deleteDoc } from 'firebase/firestore';
import { User as LucideUser, DollarSign, ParkingCircle, PlusCircle, Trash2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useAuth } from '@/contexts/auth-context';
import { db } from '@/lib/firebase';
import { Terminal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { useToast } from '@/hooks/use-toast';


interface BranchInfo {
    uid: string;
    parkingLotName: string | null;
    occupiedSpots: number;
    maxCapacity: number;
    revenue: number;
}

export default function BranchesPage() {
    const { user, isAdmin, loading } = useAuth();
    const router = useRouter();
    const { toast } = useToast();
    const [branches, setBranches] = useState<BranchInfo[]>([]);
    const [isLoadingBranches, setIsLoadingBranches] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [branchToDelete, setBranchToDelete] = useState<BranchInfo | null>(null);


    useEffect(() => {
        if (!loading && !isAdmin) {
            router.push('/dashboard');
        }
    }, [isAdmin, loading, router]);

    useEffect(() => {
        if (isAdmin && user) {
            setIsLoadingBranches(true);
            setError(null);
            
            const usersCollection = collection(db, 'users');
            const q = query(usersCollection, where('email', '!=', user.email));

            const unsubscribe = onSnapshot(q, (usersSnapshot) => {
                const promises = usersSnapshot.docs.map(async (doc) => {
                    const userData = doc.data();
                    const userId = doc.id;
                    
                    const parkingRecordsRef = collection(db, 'users', userId, 'parkingRecords');
                    const parkedQuery = query(parkingRecordsRef, where('status', '==', 'parked'));
                    const parkedSnapshot = await getDocs(parkedQuery);
                    const occupiedSpots = parkedSnapshot.size;

                    const completedQuery = query(parkingRecordsRef, where('status', '==', 'completed'));
                    const completedSnapshot = await getDocs(completedQuery);
                    const revenue = completedSnapshot.docs.reduce((acc, doc) => acc + (doc.data().totalCost || 0), 0);

                    return {
                        uid: userId,
                        parkingLotName: userData.parkingLotName || userData.email,
                        occupiedSpots,
                        maxCapacity: userData.maxCapacity || 0,
                        revenue,
                    };
                });

                Promise.all(promises).then(usersList => {
                    setBranches(usersList);
                    setIsLoadingBranches(false);
                }).catch(e => {
                     console.error("Error fetching branch details:", e);
                     setError("Failed to load branch details.");
                     setIsLoadingBranches(false);
                });

            }, (e) => {
                console.error("Error fetching branches:", e);
                setError("Failed to load branches. Please check the console for more details.");
                setIsLoadingBranches(false);
            });

            return () => unsubscribe();
        }
    }, [isAdmin, user]);

    const handleDeleteBranch = async () => {
        if (!branchToDelete) return;
        
        try {
            // This will delete the user's document from the 'users' collection in Firestore.
            await deleteDoc(doc(db, "users", branchToDelete.uid));
            
            toast({
                title: "Success",
                description: `Branch "${branchToDelete.parkingLotName}" data has been deleted from Firestore.`,
            });
        } catch (e) {
            console.error("Error deleting branch document: ", e);
            toast({
                variant: "destructive",
                title: "Error",
                description: "Failed to delete the branch's database record.",
            });
        } finally {
            setBranchToDelete(null); // Close the dialog
        }
    };

    const handleViewDetails = (branchId: string) => {
        router.push(`/dashboard/branches/${branchId}`);
    };

    if (loading || isLoadingBranches) {
        return <div className="text-center">Loading...</div>;
    }

    if (!isAdmin) {
        return null;
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold">Gestión de Sucursales</h1>
                <Button onClick={() => router.push('/dashboard/branches/new')}>
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Crear Nueva Sucursal
                </Button>
            </div>
             {error && (
                <Alert variant="destructive">
                    <Terminal className="h-4 w-4" />
                    <AlertTitle>Error</AlertTitle>
                    <AlertDescription>{error}</AlertDescription>
                </Alert>
            )}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {branches.length > 0 ? (
                    branches.map(branch => (
                        <Card 
                            key={branch.uid} 
                            onClick={() => handleViewDetails(branch.uid)}
                            className="cursor-pointer hover:border-primary transition-all relative"
                        >
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <LucideUser className="h-5 w-5" />
                                    {branch.parkingLotName}
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                               <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                                    <div>
                                        <p className="text-sm text-muted-foreground flex items-center gap-1"><DollarSign className="h-4 w-4" /> Ingresos Totales</p>
                                        <p className="text-xl font-bold">${branch.revenue.toFixed(2)}</p>
                                    </div>
                                </div>
                                 <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                                    <div>
                                        <p className="text-sm text-muted-foreground flex items-center gap-1"><ParkingCircle className="h-4 w-4" /> Ocupación</p>
                                        <p className="text-xl font-bold">{branch.occupiedSpots} / {branch.maxCapacity}</p>
                                    </div>
                                </div>
                                <div className="absolute bottom-2 right-2">
                                    <Button 
                                        variant="ghost" 
                                        size="icon" 
                                        onClick={(e) => {
                                            e.stopPropagation(); // Evita que el click se propague a la tarjeta
                                            setBranchToDelete(branch);
                                        }}
                                        className="text-destructive hover:bg-destructive/10"
                                        aria-label="Delete branch"
                                    >
                                        <Trash2 className="h-5 w-5" />
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    ))
                ) : (
                     !error && (
                        <Card className="md:col-span-2 lg:col-span-3">
                            <CardContent className="pt-6">
                                <p className="text-center text-muted-foreground">No se han encontrado otras sucursales registradas.</p>
                            </CardContent>
                        </Card>
                    )
                )}
            </div>
            <AlertDialog open={!!branchToDelete} onOpenChange={(isOpen) => !isOpen && setBranchToDelete(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                    <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                        This action will permanently delete the branch's data from Firestore. 
                        This does NOT delete the user account from Firebase Authentication. 
                        To fully remove the user, you must do so from the Firebase Console.
                    </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={handleDeleteBranch}>
                        Continue
                    </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}

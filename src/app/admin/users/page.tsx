
"use client";

import { useState, useEffect } from 'react';
import { useFirebase } from '@/firebase';
import { getAllUsers, updateUserRole } from '@/lib/data';
import type { User } from '@/lib/types';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { MoreHorizontal, ShieldCheck, User as UserIcon, Loader2 } from "lucide-react";
import { useToast } from '@/hooks/use-toast';

export default function AdminUsersPage() {
    const { firestore } = useFirebase();
    const { toast } = useToast();
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchUsers = async () => {
        if (!firestore) return;
        setLoading(true);
        try {
            const allUsers = await getAllUsers(firestore);
            setUsers(allUsers);
        } catch (error) {
            console.error("Error fetching users:", error);
            toast({
                variant: 'destructive',
                title: 'Error al cargar usuarios',
                description: 'No se pudieron obtener los datos de los usuarios.',
            });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, [firestore]);

    const handleUpdateRole = async (userId: string, role: 'admin' | 'user') => {
        if (!firestore) return;
        try {
            await updateUserRole(firestore, userId, role);
            toast({
                title: 'Rol actualizado',
                description: `El usuario ahora tiene el rol de ${role}.`,
            });
            fetchUsers(); // Refresh the user list
        } catch (error) {
            console.error("Error updating role:", error);
            toast({
                variant: 'destructive',
                title: 'Error al actualizar rol',
                description: 'No se pudo cambiar el rol del usuario.',
            });
        }
    };
    
    // Hardcoded Admin UID from admin/layout. Should be in a config.
    const ADMIN_UID = "s0O2t5yTLYh4VnSgxjS13iK1xay1";

    return (
        <Card>
            <CardHeader>
                <CardTitle>Gestión de Usuarios</CardTitle>
                <CardDescription>
                    Ve y gestiona los roles de todos los usuarios registrados en la plataforma.
                </CardDescription>
            </CardHeader>
            <CardContent>
                {loading ? (
                    <div className="flex justify-center items-center h-48">
                        <Loader2 className="h-8 w-8 animate-spin" />
                    </div>
                ) : (
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="hidden w-[100px] sm:table-cell">
                                    <span className="sr-only">Avatar</span>
                                </TableHead>
                                <TableHead>Nombre</TableHead>
                                <TableHead>Rol</TableHead>
                                <TableHead className="hidden md:table-cell">Registrado</TableHead>
                                <TableHead>
                                    <span className="sr-only">Acciones</span>
                                </TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {users.map((user) => (
                                <TableRow key={user.id}>
                                    <TableCell className="hidden sm:table-cell">
                                        <Avatar className="h-10 w-10">
                                            <AvatarImage src={user.profilePicture} alt={user.name} />
                                            <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                                        </Avatar>
                                    </TableCell>
                                    <TableCell className="font-medium">
                                        <div className="font-bold">{user.name}</div>
                                        <div className="text-sm text-muted-foreground">{user.email}</div>
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant={user.role === 'admin' ? 'default' : 'secondary'}>
                                            {user.role === 'admin' ? 'Admin' : 'Usuario'}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="hidden md:table-cell">
                                        {user.createdAt ? new Date(user.createdAt.toDate()).toLocaleDateString() : 'N/A'}
                                    </TableCell>
                                    <TableCell>
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button aria-haspopup="true" size="icon" variant="ghost" disabled={user.uid === ADMIN_UID}>
                                                    <MoreHorizontal className="h-4 w-4" />
                                                    <span className="sr-only">Toggle menu</span>
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                {user.role !== 'admin' ? (
                                                    <DropdownMenuItem onClick={() => handleUpdateRole(user.id, 'admin')}>
                                                        <ShieldCheck className="mr-2 h-4 w-4" />
                                                        Promover a Admin
                                                    </DropdownMenuItem>
                                                ) : (
                                                    <DropdownMenuItem onClick={() => handleUpdateRole(user.id, 'user')}>
                                                        <UserIcon className="mr-2 h-4 w-4" />
                                                        Quitar rol de Admin
                                                    </DropdownMenuItem>
                                                )}
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                )}
            </CardContent>
        </Card>
    );
}

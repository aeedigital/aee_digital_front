'use client';

import { useState } from 'react';
import { User, UserGroup } from '@/interfaces/user.interface';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog';

interface UsersListComponentProps {
    users: User[];
    groups: UserGroup[];
    onEdit: (user: User) => void;
    onDelete: (userId: string) => void;
    isLoading?: boolean;
    searchTerm?: string;
    groupFilter?: string;
}

export default function UsersListComponent({
    users,
    groups,
    onEdit,
    onDelete,
    isLoading = false,
    searchTerm = "",
    groupFilter = "all",
}: UsersListComponentProps) {
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [userToDelete, setUserToDelete] = useState<string | null>(null);
    const [sortKey, setSortKey] = useState<"user" | "scope" | "groups" | "lastLogged">("user");
    const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");

    const getGroupNames = (groupIds: string[]): string => {
        return groupIds
            .map(id => groups.find(g => g._id === id)?.name)
            .filter(Boolean)
            .join(', ') || '-';
    };

    const handleDeleteClick = (userId: string) => {
        setUserToDelete(userId);
        setDeleteDialogOpen(true);
    };

    const handleConfirmDelete = async () => {
        if (userToDelete) {
            await onDelete(userToDelete);
            setDeleteDialogOpen(false);
            setUserToDelete(null);
        }
    };

    const filtered = users.filter((u) => {
        const matchesName = u.user.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesGroup = groupFilter === "all" ? true : u.groups.includes(groupFilter);
        return matchesName && matchesGroup;
    });

    const sorted = [...filtered].sort((a, b) => {
        const dir = sortDir === "asc" ? 1 : -1;
        const groupA = getGroupNames(a.groups);
        const groupB = getGroupNames(b.groups);

        if (sortKey === "user") {
            return a.user.localeCompare(b.user) * dir;
        }
        if (sortKey === "scope") {
            return (a.scope_id || "").localeCompare(b.scope_id || "") * dir;
        }
        if (sortKey === "lastLogged") {
            const aDate = a.lastLogged ? new Date(a.lastLogged).getTime() : 0;
            const bDate = b.lastLogged ? new Date(b.lastLogged).getTime() : 0;
            return (aDate - bDate) * dir;
        }
        return groupA.localeCompare(groupB) * dir;
    });

    const toggleSort = (key: "user" | "scope" | "groups" | "lastLogged") => {
        if (sortKey === key) {
            setSortDir((prev) => (prev === "asc" ? "desc" : "asc"));
        } else {
            setSortKey(key);
            setSortDir("asc");
        }
    };

    const sortLabel = (key: "user" | "scope" | "groups" | "lastLogged") =>
        sortKey === key ? (sortDir === "asc" ? "↑" : "↓") : "";

    if (users.length === 0) {
        return (
            <div className="text-center py-8 text-slate-600">
                Nenhum usuário encontrado
            </div>
        );
    }

    return (
        <>
            <div className="w-full overflow-x-auto rounded-lg border border-slate-200 shadow-sm">
                <Table>
                    <TableHeader>
                        <TableRow className="bg-slate-50">
                            <TableHead className="text-slate-900 cursor-pointer" onClick={() => toggleSort("user")}>
                                Usuário {sortLabel("user")}
                            </TableHead>
                            <TableHead className="text-slate-900 cursor-pointer" onClick={() => toggleSort("scope")}>
                                Scope {sortLabel("scope")}
                            </TableHead>
                            <TableHead className="text-slate-900 cursor-pointer" onClick={() => toggleSort("groups")}>
                                Grupos {sortLabel("groups")}
                            </TableHead>
                            <TableHead className="text-slate-900 cursor-pointer" onClick={() => toggleSort("lastLogged")}>
                                Último acesso {sortLabel("lastLogged")}
                            </TableHead>
                            <TableHead className="text-slate-900">Criado em</TableHead>
                            <TableHead className="text-slate-900">Ações</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {sorted.map((user) => (
                            <TableRow key={user._id} className="hover:bg-slate-50">
                                <TableCell className="font-medium text-slate-900">
                                    {user.user}
                                </TableCell>
                                <TableCell className="text-slate-700">
                                    <span className="text-xs px-2 py-1 rounded-full bg-slate-100 text-slate-700">
                                        {user.scope_id || '-'}
                                    </span>
                                </TableCell>
                                <TableCell className="text-slate-700">
                                    <div className="flex flex-wrap gap-2">
                                        {getGroupNames(user.groups).split(', ').map((group, idx) => (
                                            group !== '-' && (
                                                <span
                                                    key={idx}
                                                    className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                                                >
                                                    {group}
                                                </span>
                                            )
                                        ))}
                                        {getGroupNames(user.groups) === '-' && (
                                            <span className="text-slate-500">-</span>
                                        )}
                                    </div>
                                </TableCell>
                                <TableCell className="text-slate-700">
                                    {user.lastLogged
                                        ? new Date(user.lastLogged).toLocaleString('pt-BR', {
                                            day: '2-digit',
                                            month: '2-digit',
                                            year: '2-digit',
                                            hour: '2-digit',
                                            minute: '2-digit',
                                            second: '2-digit',
                                        })
                                        : '-'}
                                </TableCell>
                                <TableCell className="text-slate-700">
                                    {user.createdAt
                                        ? new Date(user.createdAt).toLocaleString('pt-BR', {
                                            day: '2-digit',
                                            month: '2-digit',
                                            year: '2-digit',
                                            hour: '2-digit',
                                            minute: '2-digit',
                                            second: '2-digit',
                                        })
                                        : '-'}
                                </TableCell>
                                <TableCell className="text-slate-700">
                                    <div className="flex gap-2">
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            onClick={() => onEdit(user)}
                                            disabled={isLoading}
                                        >
                                            Editar
                                        </Button>
                                        <Button
                                            size="sm"
                                            variant="destructive"
                                            onClick={() => handleDeleteClick(user._id)}
                                            disabled={isLoading}
                                        >
                                            Deletar
                                        </Button>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>

            {/* Delete Confirmation Dialog */}
            <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogTitle>Deletar usuário</AlertDialogTitle>
                    <AlertDialogDescription>
                        Tem certeza que deseja deletar este usuário? Esta ação não pode ser desfeita.
                    </AlertDialogDescription>
                    <div className="flex gap-3 justify-end">
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction onClick={handleConfirmDelete} className="bg-red-600 hover:bg-red-700">
                            Deletar
                        </AlertDialogAction>
                    </div>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
}

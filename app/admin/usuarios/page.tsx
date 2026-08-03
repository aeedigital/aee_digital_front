'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { User } from '@/interfaces/user.interface';
import { apiFetch } from '@/lib/api';
import { useUser } from '@/context/UserContext';
import { Button } from '@/components/ui/button';
import UsersListComponent from '@/components/UsersListComponent';
import UserFormComponent from '@/components/UserFormComponent';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Tooltip,
    Legend,
} from "chart.js";
import { Bar } from "react-chartjs-2";
import { LoadingPlaceholder } from "@/components/LoadingPlaceholder";

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);

const GROUP_OPTIONS = [
    { _id: 'admin', name: 'admin' },
    { _id: 'coord_geral', name: 'coord_geral' },
    { _id: 'coord_regional', name: 'coord_regional' },
    { _id: 'presidente', name: 'presidente' },
];

export default function AdminUsersPage() {
    const router = useRouter();
    const { user } = useUser();
    const [users, setUsers] = useState<User[]>([]);
    const [groups] = useState(GROUP_OPTIONS);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [selectedUser, setSelectedUser] = useState<User | null>(null);
    const [isSaving, setIsSaving] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [groupFilter, setGroupFilter] = useState<string>("all");

    // Proteção: Apenas admin pode acessar
    useEffect(() => {
        if (!loading && user?.role !== 'admin') {
            router.push('/');
        }
    }, [user, loading, router]);

    // Buscar usuários e grupos
    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                setError(null);

                const usersResponse = await apiFetch('/passes');

                if (!usersResponse.ok) {
                    throw new Error(`Erro ao buscar usuários: ${usersResponse.status}`);
                }

                const usersData = await usersResponse.json();

                setUsers(Array.isArray(usersData) ? usersData : usersData.data || []);
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Erro ao buscar dados');
                console.error('Erro ao buscar dados:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    const lastLoggedChart = useMemo(() => {
        const counts: Record<string, number> = {};
        users.forEach((u) => {
            if (!u.lastLogged) return;
            const dateLabel = new Date(u.lastLogged).toLocaleDateString('pt-BR');
            counts[dateLabel] = (counts[dateLabel] || 0) + 1;
        });
        const labels = Object.keys(counts).sort((a, b) => {
            const [da, ma, ya] = a.split('/').map(Number);
            const [db, mb, yb] = b.split('/').map(Number);
            return new Date(2000 + ya, ma - 1, da).getTime() - new Date(2000 + yb, mb - 1, db).getTime();
        });
        const data = labels.map((lbl) => counts[lbl] || 0);
        return { labels, data };
    }, [users]);

    const handleCreateUser = () => {
        setSelectedUser(null);
        setDialogOpen(true);
    };

    const handleEditUser = (user: User) => {
        setSelectedUser(user);
        setDialogOpen(true);
    };

    const handleSaveUser = async (userData: Omit<User, '_id'> & { _id?: string }) => {
        try {
            setIsSaving(true);

            if (userData._id) {
                // Editar usuário existente
                const response = await apiFetch(`/passes/${userData._id}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        user: userData.user,
                        pass: userData.pass,
                        groups: userData.groups,
                        scope_id: userData.scope_id,
                    }),
                });

                if (!response.ok) {
                    throw new Error(`Erro ao atualizar usuário: ${response.status}`);
                }

                // Atualizar lista local
                setUsers(users.map(u => u._id === userData._id ? { ...u, user: userData.user, pass: userData.pass, groups: userData.groups, scope_id: userData.scope_id } : u));
            } else {
                // Criar novo usuário
                const response = await apiFetch('/passes', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        user: userData.user,
                        pass: userData.pass,
                        groups: userData.groups,
                        scope_id: userData.scope_id,
                    }),
                });

                if (!response.ok) {
                    throw new Error(`Erro ao criar usuário: ${response.status}`);
                }

                const newUser = await response.json();
                setUsers([...users, newUser]);
            }
        } catch (err) {
            const errorMsg = err instanceof Error ? err.message : 'Erro ao salvar usuário';
            setError(errorMsg);
            throw err;
        } finally {
            setIsSaving(false);
        }
    };

    const handleDeleteUser = async (userId: string) => {
        try {
            setIsSaving(true);

            const response = await apiFetch(`/passes/${userId}`, {
                method: 'DELETE',
            });

            if (!response.ok) {
                throw new Error(`Erro ao deletar usuário: ${response.status}`);
            }

            setUsers(users.filter(u => u._id !== userId));
        } catch (err) {
            const errorMsg = err instanceof Error ? err.message : 'Erro ao deletar usuário';
            setError(errorMsg);
            throw err;
        } finally {
            setIsSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <LoadingPlaceholder message="Carregando usuários..." lines={4} />
            </div>
        );
    }

    if (user?.role !== 'admin') {
        return null;
    }

    return (
        <div className="container mx-auto py-8 px-4">
            <div className="flex justify-between items-center mb-4 flex-wrap gap-4">
                <h1 className="text-3xl font-bold">Administração de Usuários</h1>
                <Button onClick={handleCreateUser} disabled={isSaving}>
                    + Criar Novo Usuário
                </Button>
            </div>

            {error && (
                <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
                    {error}
                </div>
            )}

            <div className="mb-8">
                <h2 className="text-xl font-semibold mb-4">Acessos (último login por dia)</h2>
                {lastLoggedChart.labels.length === 0 ? (
                    <div className="text-slate-600 text-sm">Nenhum acesso registrado ainda.</div>
                ) : (
                    <div className="w-full max-w-3xl">
                        <Bar
                            data={{
                                labels: lastLoggedChart.labels,
                                datasets: [
                                    {
                                        label: "Usuários com lastLogged no dia",
                                        data: lastLoggedChart.data,
                                        backgroundColor: "rgba(99, 169, 191, 0.6)",
                                        borderColor: "rgba(99, 169, 191, 1)",
                                        borderWidth: 1,
                                    },
                                ],
                            }}
                            options={{
                                responsive: true,
                                plugins: {
                                    legend: {
                                        display: true,
                                    },
                                },
                                scales: {
                                    y: {
                                        beginAtZero: true,
                                        ticks: {
                                            stepSize: 1,
                                        },
                                    },
                                },
                            }}
                        />
                    </div>
                )}
            </div>

            <div className="flex flex-wrap gap-3 items-center mb-4">
                <input
                    type="text"
                    placeholder="Buscar por usuário"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="h-10 rounded-md border border-slate-200 px-3 text-sm"
                />
                <select
                    value={groupFilter}
                    onChange={(e) => setGroupFilter(e.target.value)}
                    className="h-10 rounded-md border border-slate-200 px-3 text-sm"
                >
                    <option value="all">Todos os grupos</option>
                    {groups.map((g) => (
                        <option key={g._id} value={g._id}>
                            {g.name}
                        </option>
                    ))}
                </select>
            </div>

            <UsersListComponent
                users={users}
                groups={groups}
                onEdit={handleEditUser}
                onDelete={handleDeleteUser}
                isLoading={isSaving}
                searchTerm={searchTerm}
                groupFilter={groupFilter}
            />

            <UserFormComponent
                open={dialogOpen}
                user={selectedUser}
                groups={groups}
                onClose={() => {
                    setDialogOpen(false);
                    setSelectedUser(null);
                }}
                onSave={handleSaveUser}
                isLoading={isSaving}
            />
        </div>
    );
}

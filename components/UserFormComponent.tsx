'use client';

import { useState, useEffect } from 'react';
import { User, UserGroup } from '@/interfaces/user.interface';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { generateRandomPassword, generateRandomUsername } from '@/helpers/generateUserData';

interface UserFormComponentProps {
    open: boolean;
    user: User | null;
    groups: UserGroup[];
    onClose: () => void;
    onSave: (user: Omit<User, '_id'> & { _id?: string }) => Promise<void>;
    isLoading?: boolean;
}

export default function UserFormComponent({
    open,
    user,
    groups,
    onClose,
    onSave,
    isLoading = false,
}: UserFormComponentProps) {
    const [formData, setFormData] = useState({
        username: '',
        password: '',
        selectedGroups: [] as string[],
        scopeId: '',
    });

    useEffect(() => {
        if (user) {
            setFormData({
                username: user.user,
                password: user.pass,
                selectedGroups: user.groups || [],
                scopeId: user.scope_id || '',
            });
        } else {
            setFormData({
                username: '',
                password: '',
                selectedGroups: [],
                scopeId: '',
            });
        }
    }, [user, open]);

    const handleGenerateUsername = () => {
        setFormData({
            ...formData,
            username: generateRandomUsername(),
        });
    };

    const handleGeneratePassword = () => {
        setFormData({
            ...formData,
            password: generateRandomPassword(),
        });
    };

    const handleToggleGroup = (groupId: string) => {
        setFormData((prev) => ({
            ...prev,
            selectedGroups: prev.selectedGroups.includes(groupId)
                ? prev.selectedGroups.filter(g => g !== groupId)
                : [...prev.selectedGroups, groupId],
        }));
    };

    const handleSave = async () => {
        if (!formData.username.trim()) {
            alert('Informe o nome de usuário');
            return;
        }
        if (!formData.password.trim()) {
            alert('Informe a senha');
            return;
        }
        if (formData.selectedGroups.length === 0) {
            alert('Selecione pelo menos um grupo');
            return;
        }

        try {
            await onSave({
                ...(user && { _id: user._id }),
                user: formData.username,
                pass: formData.password,
                groups: formData.selectedGroups,
                scope_id: formData.scopeId.trim(),
            });
            onClose();
        } catch (error) {
            console.error('Erro ao salvar usuário:', error);
        }
    };

    const isEditing = !!user;

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>
                        {isEditing ? 'Editar Usuário' : 'Criar Novo Usuário'}
                    </DialogTitle>
                    <DialogDescription>
                        {isEditing
                            ? 'Modifique as informações do usuário'
                            : 'Preencha as informações para criar um novo usuário'}
                    </DialogDescription>
                </DialogHeader>

                <div className="grid gap-4 py-4">
                    {/* Username */}
                    <div className="grid grid-cols-1 gap-2">
                        <label className="text-sm font-medium text-slate-700">
                            Nome de Usuário
                        </label>
                        <div className="flex gap-2">
                            <Input
                                placeholder="Informe o nome de usuário"
                                value={formData.username}
                                onChange={(e) =>
                                    setFormData({ ...formData, username: e.target.value })
                                }
                                disabled={isLoading}
                            />
                            {!isEditing && (
                                <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={handleGenerateUsername}
                                    disabled={isLoading}
                                >
                                    Gerar
                                </Button>
                            )}
                        </div>
                    </div>

                    {/* Password */}
                    <div className="grid grid-cols-1 gap-2">
                        <label className="text-sm font-medium text-slate-700">
                            Senha
                        </label>
                        <div className="flex gap-2">
                            <Input
                                type="text"
                                placeholder="Informe a senha"
                                value={formData.password}
                                onChange={(e) =>
                                    setFormData({ ...formData, password: e.target.value })
                                }
                                disabled={isLoading}
                            />
                            <Button
                                size="sm"
                                variant="outline"
                                onClick={handleGeneratePassword}
                                disabled={isLoading}
                            >
                                Gerar
                            </Button>
                        </div>
                    </div>

                    {/* Groups */}
                    <div className="grid grid-cols-1 gap-2">
                        <label className="text-sm font-medium text-slate-700">
                            Grupos
                        </label>
                        <div className="grid grid-cols-2 gap-3">
                            {groups.map((group) => (
                                <label
                                    key={group._id}
                                    className="flex items-center gap-2 cursor-pointer"
                                >
                                    <input
                                        type="checkbox"
                                        checked={formData.selectedGroups.includes(group._id)}
                                        onChange={() => handleToggleGroup(group._id)}
                                        disabled={isLoading}
                                        className="w-4 h-4"
                                    />
                                    <span className="text-sm text-slate-700">{group.name}</span>
                                </label>
                            ))}
                        </div>
                    </div>

                    {/* Scope */}
                    <div className="grid grid-cols-1 gap-2">
                        <label className="text-sm font-medium text-slate-700">
                            Scope (opcional)
                        </label>
                        <Input
                            placeholder="Ex.: * ou id da regional/centro"
                            value={formData.scopeId}
                            onChange={(e) =>
                                setFormData({ ...formData, scopeId: e.target.value })
                            }
                            disabled={isLoading}
                        />
                        <p className="text-xs text-slate-500">
                            Use * para acesso amplo ou defina o id de regional/centro para escopo restrito.
                        </p>
                    </div>
                </div>

                <DialogFooter>
                    <Button
                        variant="outline"
                        onClick={onClose}
                        disabled={isLoading}
                    >
                        Cancelar
                    </Button>
                    <Button onClick={handleSave} disabled={isLoading}>
                        {isLoading ? 'Salvando...' : 'Salvar'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

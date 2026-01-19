'use client';

import { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Regional } from '@/interfaces/centro.interface';

export interface FilterCriteria {
    nome: string;
    nomeCurto: string;
    cidade: string;
    regionalId: string;
    status: string;
}

interface CentrosFilterComponentProps {
    regionais: Regional[];
    onFilterChange: (filters: FilterCriteria) => void;
    isLoading?: boolean;
}

const STATUS_OPTIONS = ['Integrada', 'Pendente', 'Inativa'];

export default function CentrosFilterComponent({
    regionais,
    onFilterChange,
    isLoading = false,
}: CentrosFilterComponentProps) {
    const [filters, setFilters] = useState<FilterCriteria>({
        nome: '',
        nomeCurto: '',
        cidade: '',
        regionalId: '',
        status: '',
    });

    useEffect(() => {
        onFilterChange(filters);
    }, [filters, onFilterChange]);

    const handleClearFilters = () => {
        setFilters({
            nome: '',
            nomeCurto: '',
            cidade: '',
            regionalId: '',
            status: '',
        });
    };

    return (
        <div className="mb-6 p-4 bg-slate-50 rounded-lg border border-slate-200">
            <h3 className="text-sm font-semibold text-slate-900 mb-4">Filtros</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {/* Nome */}
                <div>
                    <label className="block text-xs font-medium text-slate-700 mb-2">
                        Nome do Centro
                    </label>
                    <Input
                        placeholder="Pesquisar por nome..."
                        value={filters.nome}
                        onChange={(e) => setFilters({ ...filters, nome: e.target.value })}
                        disabled={isLoading}
                        className="h-9"
                    />
                </div>

                {/* Nome Curto */}
                <div>
                    <label className="block text-xs font-medium text-slate-700 mb-2">
                        Nome Curto
                    </label>
                    <Input
                        placeholder="Pesquisar por nome curto..."
                        value={filters.nomeCurto}
                        onChange={(e) => setFilters({ ...filters, nomeCurto: e.target.value })}
                        disabled={isLoading}
                        className="h-9"
                    />
                </div>

                {/* Cidade */}
                <div>
                    <label className="block text-xs font-medium text-slate-700 mb-2">
                        Cidade
                    </label>
                    <Input
                        placeholder="Pesquisar por cidade..."
                        value={filters.cidade}
                        onChange={(e) => setFilters({ ...filters, cidade: e.target.value })}
                        disabled={isLoading}
                        className="h-9"
                    />
                </div>

                {/* Regional */}
                <div>
                    <label className="block text-xs font-medium text-slate-700 mb-2">
                        Regional
                    </label>
                    <Select
                        value={filters.regionalId}
                        onValueChange={(value) =>
                            setFilters({ ...filters, regionalId: value })
                        }
                        disabled={isLoading}
                    >
                        <SelectTrigger className="h-9">
                            <SelectValue placeholder="Selecione uma regional..." />
                        </SelectTrigger>
                        <SelectContent>
                            {regionais.map((regional) => (
                                <SelectItem key={regional._id} value={regional._id}>
                                    {regional.NOME_REGIONAL}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                {/* Status */}
                <div>
                    <label className="block text-xs font-medium text-slate-700 mb-2">
                        Status
                    </label>
                    <Select
                        value={filters.status}
                        onValueChange={(value) => setFilters({ ...filters, status: value })}
                        disabled={isLoading}
                    >
                        <SelectTrigger className="h-9">
                            <SelectValue placeholder="Selecione um status..." />
                        </SelectTrigger>
                        <SelectContent>
                            {STATUS_OPTIONS.map((status) => (
                                <SelectItem key={status} value={status}>
                                    {status}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                {/* Botão Limpar */}
                <div className="flex items-end">
                    <Button
                        onClick={handleClearFilters}
                        variant="outline"
                        size="sm"
                        disabled={isLoading}
                        className="w-full h-9"
                    >
                        Limpar Filtros
                    </Button>
                </div>
            </div>
        </div>
    );
}

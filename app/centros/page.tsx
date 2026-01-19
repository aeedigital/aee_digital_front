'use client';

import { useEffect, useState, useMemo } from 'react';
import { Centro, Regional } from '@/interfaces/centro.interface';
import { apiFetch } from '@/lib/api';
import CentrosListComponent from '@/components/CentrosListComponent';
import CentrosFilterComponent, { FilterCriteria } from '@/components/CentrosFilterComponent';

type SortField = 'NOME_CENTRO' | 'NOME_CURTO' | 'REGIONAL' | 'CNPJ_CENTRO' | 'ENDERECO' | 'CIDADE' | 'DATA_FUNDACAO' | 'STATUS';
type SortDirection = 'asc' | 'desc';

export default function CentrosPage() {
    const [centros, setCentros] = useState<Centro[]>([]);
    const [regionais, setRegionais] = useState<Regional[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [sortField, setSortField] = useState<SortField>('REGIONAL');
    const [sortDirection, setSortDirection] = useState<SortDirection>('asc');
    const [filters, setFilters] = useState<FilterCriteria>({
        nome: '',
        nomeCurto: '',
        cidade: '',
        regionalId: '',
        status: '',
    });

    // Buscar centros e regionais
    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                setError(null);

                // Buscar centros
                const centrosResponse = await apiFetch('/centros');
                if (!centrosResponse.ok) {
                    throw new Error(`Erro ao buscar centros: ${centrosResponse.status}`);
                }
                const centrosData = await centrosResponse.json();
                setCentros(Array.isArray(centrosData) ? centrosData : centrosData.data || []);

                // Buscar regionais
                const regionaisResponse = await apiFetch('/regionais');
                if (!regionaisResponse.ok) {
                    throw new Error(`Erro ao buscar regionais: ${regionaisResponse.status}`);
                }
                const regionaisData = await regionaisResponse.json();
                setRegionais(Array.isArray(regionaisData) ? regionaisData : regionaisData.data || []);
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Erro ao buscar dados');
                console.error('Erro ao buscar dados:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    // Criar mapa de regionais para acesso rápido
    const regionaisMap = useMemo(() => {
        return regionais.reduce((map, regional) => {
            map[regional._id] = regional.NOME_REGIONAL;
            return map;
        }, {} as Record<string, string>);
    }, [regionais]);

    // Filtrar centros baseado nos critérios
    const centrosFiltrados = useMemo(() => {
        return centros.filter((centro) => {
            const matchNome = centro.NOME_CENTRO?.toLowerCase().includes(
                filters.nome.toLowerCase()
            );
            const matchNomeCurto = centro.NOME_CURTO?.toLowerCase().includes(
                filters.nomeCurto.toLowerCase()
            );
            const matchCidade = centro.CIDADE?.toLowerCase().includes(
                filters.cidade.toLowerCase()
            );
            const matchRegional = !filters.regionalId || centro.REGIONAL === filters.regionalId;
            const matchStatus = !filters.status || centro.STATUS === filters.status;

            return matchNome && matchNomeCurto && matchCidade && matchRegional && matchStatus;
        });
    }, [centros, filters]);

    // Ordenar centros
    const centrosOrdenados = useMemo(() => {
        const sorted = [...centrosFiltrados].sort((a, b) => {
            let aValue: any = a[sortField];
            let bValue: any = b[sortField];

            // Tratamento especial para REGIONAL - usar nome da regional
            if (sortField === 'REGIONAL') {
                aValue = regionaisMap[a.REGIONAL || ''] || '';
                bValue = regionaisMap[b.REGIONAL || ''] || '';
            }

            // Tratar valores null/undefined
            if (aValue == null) aValue = '';
            if (bValue == null) bValue = '';

            // Comparação
            if (typeof aValue === 'string') {
                aValue = aValue.toLowerCase();
                bValue = bValue.toLowerCase();
            }

            if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
            if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
            return 0;
        });

        return sorted;
    }, [centrosFiltrados, sortField, sortDirection, regionaisMap]);

    const handleSort = (field: SortField) => {
        if (sortField === field) {
            // Se clicar na mesma coluna, inverte a direção
            setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
        } else {
            // Se clicar em outra coluna, define como asc
            setSortField(field);
            setSortDirection('asc');
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-lg text-slate-600">Carregando centros...</div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-lg text-red-600">Erro: {error}</div>
            </div>
        );
    }

    return (
        <div className="container mx-auto py-8 px-4">
            <h1 className="text-3xl font-bold mb-8">Centros</h1>

            <CentrosFilterComponent
                regionais={regionais}
                onFilterChange={setFilters}
                isLoading={loading}
            />

            <div className="text-sm text-slate-600 mb-4">
                Exibindo {centrosOrdenados.length} de {centros.length} centro(s)
            </div>

            <CentrosListComponent
                centros={centrosOrdenados}
                regionais={regionais}
                sortField={sortField}
                sortDirection={sortDirection}
                onSort={handleSort}
            />
        </div>
    );
}

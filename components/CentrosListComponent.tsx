'use client';

import { Centro, Regional } from '@/interfaces/centro.interface';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { ChevronUp, ChevronDown } from 'lucide-react';

interface CentrosListComponentProps {
    centros: Centro[];
    regionais: Regional[];
    sortField: string;
    sortDirection: 'asc' | 'desc';
    onSort: (field: any) => void;
}

const diasSemana = ['segunda', 'terca', 'quarta', 'quinta', 'sexta', 'sabado', 'domingo'] as const;

function formatarHorarios(funcionamento?: Record<string, string[]>): string {
    if (!funcionamento) return '-';

    const horariosFormatados = diasSemana
        .filter(dia => funcionamento[dia]?.length > 0)
        .map(dia => `${dia.charAt(0).toUpperCase() + dia.slice(1)}: ${funcionamento[dia].join(', ')}`)
        .join(' | ');

    return horariosFormatados || '-';
}

function SortHeader({
    label,
    field,
    currentField,
    sortDirection,
    onSort
}: {
    label: string;
    field: string;
    currentField: string;
    sortDirection: 'asc' | 'desc';
    onSort: (field: any) => void;
}) {
    const isActive = currentField === field;

    return (
        <TableHead
            className="text-slate-900 cursor-pointer hover:bg-slate-100 select-none"
            onClick={() => onSort(field)}
        >
            <div className="flex items-center gap-2">
                {label}
                {isActive && (
                    sortDirection === 'asc' ?
                        <ChevronUp className="w-4 h-4" /> :
                        <ChevronDown className="w-4 h-4" />
                )}
            </div>
        </TableHead>
    );
}

export default function CentrosListComponent({
    centros,
    regionais,
    sortField,
    sortDirection,
    onSort
}: CentrosListComponentProps) {
    // Criar mapa de regionais
    const regionaisMap = regionais.reduce((map, regional) => {
        map[regional._id] = regional.NOME_REGIONAL;
        return map;
    }, {} as Record<string, string>);

    if (centros.length === 0) {
        return (
            <div className="text-center py-8 text-slate-600">
                Nenhum centro encontrado
            </div>
        );
    }

    return (
        <div className="w-full overflow-x-auto rounded-lg border border-slate-200 shadow-sm">
            <Table>
                <TableHeader>
                    <TableRow className="bg-slate-50">
                        <SortHeader
                            label="Nome do Centro"
                            field="NOME_CENTRO"
                            currentField={sortField}
                            sortDirection={sortDirection}
                            onSort={onSort}
                        />
                        <SortHeader
                            label="Nome Curto"
                            field="NOME_CURTO"
                            currentField={sortField}
                            sortDirection={sortDirection}
                            onSort={onSort}
                        />
                        <SortHeader
                            label="Regional"
                            field="REGIONAL"
                            currentField={sortField}
                            sortDirection={sortDirection}
                            onSort={onSort}
                        />
                        <SortHeader
                            label="CNPJ"
                            field="CNPJ_CENTRO"
                            currentField={sortField}
                            sortDirection={sortDirection}
                            onSort={onSort}
                        />
                        <SortHeader
                            label="Endereço"
                            field="ENDERECO"
                            currentField={sortField}
                            sortDirection={sortDirection}
                            onSort={onSort}
                        />
                        <SortHeader
                            label="Cidade/Estado"
                            field="CIDADE"
                            currentField={sortField}
                            sortDirection={sortDirection}
                            onSort={onSort}
                        />
                        <SortHeader
                            label="Data Fundação"
                            field="DATA_FUNDACAO"
                            currentField={sortField}
                            sortDirection={sortDirection}
                            onSort={onSort}
                        />
                        <SortHeader
                            label="Status"
                            field="STATUS"
                            currentField={sortField}
                            sortDirection={sortDirection}
                            onSort={onSort}
                        />
                        <TableHead className="text-slate-900">Funcionamento</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {centros.map((centro) => (
                        <TableRow key={centro._id} className="hover:bg-slate-50">
                            <TableCell className="font-medium">
                                {centro.NOME_CENTRO}
                            </TableCell>
                            <TableCell className="text-slate-700">
                                {centro.NOME_CURTO || '-'}
                            </TableCell>
                            <TableCell className="text-slate-700">
                                {regionaisMap[centro.REGIONAL || ''] || '-'}
                            </TableCell>
                            <TableCell className="text-slate-700">
                                {centro.CNPJ_CENTRO || '-'}
                            </TableCell>
                            <TableCell className="text-slate-700">
                                <div>
                                    <p>{centro.ENDERECO || '-'}</p>
                                    <p className="text-xs text-slate-500">
                                        {centro.BAIRRO && `${centro.BAIRRO}, `}
                                        {centro.CEP || '-'}
                                    </p>
                                </div>
                            </TableCell>
                            <TableCell className="text-slate-700">
                                <p>{centro.CIDADE || '-'}</p>
                                <p className="text-xs text-slate-500">{centro.ESTADO || ''}</p>
                            </TableCell>
                            <TableCell className="text-slate-700">
                                {centro.DATA_FUNDACAO || '-'}
                            </TableCell>
                            <TableCell>
                                <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${centro.STATUS === 'Integrada'
                                    ? 'bg-green-100 text-green-800'
                                    : centro.STATUS === 'Pendente'
                                        ? 'bg-yellow-100 text-yellow-800'
                                        : 'bg-slate-100 text-slate-800'
                                    }`}>
                                    {centro.STATUS || '-'}
                                </span>
                            </TableCell>
                            <TableCell className="text-slate-700 text-sm">
                                {formatarHorarios(centro.FUNCIONAMENTO as any)}
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    );
}

'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useReactTable, getCoreRowModel, getSortedRowModel, flexRender, SortingState } from '@tanstack/react-table';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { FiEdit2, FiTrash2, FiPlus } from 'react-icons/fi';
import { Pessoa } from '@/interfaces/pessoas.interface';
import { apiUrl } from '@/lib/api';

export default function ContactsPage() {
  const [contacts, setContacts] = useState<Pessoa[]>([]);
  const [filteredContacts, setFilteredContacts] = useState<Pessoa[]>([]);
  const [filter, setFilter] = useState('');
  const [open, setOpen] = useState(false);
  const [currentContact, setCurrentContact] = useState<Pessoa | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [contactToDelete, setContactToDelete] = useState<Pessoa | null>(null);
  const [sorting, setSorting] = useState<SortingState>([]);

  useEffect(() => {
    fetch(apiUrl('/pessoas'))
      .then((res) => res.json())
      .then((data) => {
        setContacts(data);
        setFilteredContacts(data);
      })
      .catch((error) => console.error('Erro ao buscar contatos:', error));
  }, []);

  useEffect(() => {
    setFilteredContacts(
      contacts.filter((contact) => contact?.NOME?.toLowerCase().includes(filter.toLowerCase()))
    );
  }, [filter, contacts]);

  const handleSave = async () => {
    if (!currentContact?.NOME?.trim()) {
      alert('Informe o nome');
      return;
    }
    const payload = {
      NOME: currentContact.NOME?.trim(),
      'E-MAIL': currentContact['E-MAIL']?.trim() || '',
      CELULAR: currentContact.CELULAR?.trim() || '',
    };

    if (currentContact && currentContact._id) {
      await fetch(apiUrl(`/pessoas/${currentContact._id}`), {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      setContacts(contacts.map((c) => (c._id === currentContact._id ? { ...currentContact, ...payload } : c)));
    } else {
      const response = await fetch(apiUrl('/pessoas'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const newContact = await response.json();
      setContacts([...contacts, newContact]);
    }
    setOpen(false);
    setCurrentContact(null);
  };

  const handleDelete = async () => {
    if (!contactToDelete?._id) {
      setDeleteDialogOpen(false);
      return;
    }
    try {
      await fetch(apiUrl(`/pessoas/${contactToDelete._id}`), { method: 'DELETE' });
      setContacts((prev) => prev.filter((c) => c._id !== contactToDelete._id));
      setFilteredContacts((prev) => prev.filter((c) => c._id !== contactToDelete._id));
    } catch (error) {
      console.error('Erro ao deletar contato:', error);
    } finally {
      setDeleteDialogOpen(false);
      setContactToDelete(null);
    }
  };

  const columns = [
    { accessorKey: '_id', header: '_id', enableSorting: true },
    { accessorKey: 'NOME', header: 'Nome', enableSorting: true },
    { accessorKey: 'E-MAIL', header: 'Email', enableSorting: true },
    { accessorKey: 'CELULAR', header: 'Celular', enableSorting: true },
    { accessorKey: 'actions', header: 'Ações', enableSorting: false, cell: ({ row }: { row: any }) => (
        <div className="flex gap-2">
          <Button size="icon" variant="outline" onClick={() => { setCurrentContact(row.original); setOpen(true); }} aria-label="Editar pessoa">
            <FiEdit2 className="h-4 w-4" />
          </Button>
          <Button
            size="icon"
            variant="destructive"
            onClick={() => { setContactToDelete(row.original); setDeleteDialogOpen(true); }}
            aria-label="Remover pessoa"
          >
            <FiTrash2 className="h-4 w-4" />
          </Button>
        </div>
      )
    }
  ];

  const table = useReactTable({
    data: filteredContacts,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    onSortingChange: setSorting,
    state: { sorting },
  });

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Lista de Contatos</h1>
      <div className="flex gap-4 mb-4">
        <Input
          placeholder="Filtrar por nome..."
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
        />
        <Button onClick={() => { setCurrentContact({ _id: '', NOME: '', 'E-MAIL': '', CELULAR: '' }); setOpen(true); }}>
          <FiPlus className="mr-2 h-4 w-4" />
          Adicionar Contato
        </Button>
      </div>
      <Table className="mt-4">
        <TableHeader>
          {table.getHeaderGroups().map(headerGroup => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map(header => (
                <TableHead
                  key={header.id}
                  onClick={header.column.getToggleSortingHandler?.()}
                  className={header.column.getCanSort() ? "cursor-pointer select-none" : ""}
                >
                  {flexRender(header.column.columnDef.header, header.getContext())}
                  {header.column.getIsSorted() === "asc" && " ▲"}
                  {header.column.getIsSorted() === "desc" && " ▼"}
                </TableHead>
              ))}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {table.getRowModel().rows.map(row => (
            <TableRow key={row.id}>
              {row.getVisibleCells().map(cell => (
                <TableCell key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {open && (
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{currentContact?._id ? 'Editar Contato' : 'Adicionar Contato'}</DialogTitle>
            </DialogHeader>
            <Input
              placeholder="Nome"
              value={currentContact?.NOME || ''}
              onChange={(e) =>
                setCurrentContact((prev) => ({
                  _id: prev?._id || '',
                  NOME: e.target.value,
                  'E-MAIL': prev?.['E-MAIL'] || '',
                  CELULAR: prev?.CELULAR || '',
                }))
              }
            />
            <Input
              placeholder="Email"
              value={currentContact?.['E-MAIL'] || ''}
              onChange={(e) =>
                setCurrentContact((prev) => ({
                  _id: prev?._id || '',
                  NOME: prev?.NOME || '',
                  'E-MAIL': e.target.value,
                  CELULAR: prev?.CELULAR || '',
                }))
              }
            />
            <Input
              placeholder="Celular"
              value={currentContact?.CELULAR || ''}
              onChange={(e) =>
                setCurrentContact((prev) => ({
                  _id: prev?._id || '',
                  NOME: prev?.NOME || '',
                  'E-MAIL': prev?.['E-MAIL'] || '',
                  CELULAR: e.target.value,
                }))
              }
            />
            <Button onClick={handleSave}>Salvar</Button>
          </DialogContent>
        </Dialog>
      )}

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remover pessoa</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja remover {contactToDelete?.NOME || 'este contato'}?
              Essa ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction className="bg-red-600 hover:bg-red-700" onClick={handleDelete}>
              Remover
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

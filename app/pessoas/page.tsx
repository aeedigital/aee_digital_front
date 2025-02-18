'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useReactTable, getCoreRowModel, flexRender } from '@tanstack/react-table';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Pessoa } from '@/interfaces/pessoas.interface';

const API_URL = '/api/pessoas';

export default function ContactsPage() {
  const [contacts, setContacts] = useState<Pessoa[]>([]);
  const [filteredContacts, setFilteredContacts] = useState<Pessoa[]>([]);
  const [filter, setFilter] = useState('');
  const [open, setOpen] = useState(false);
  const [currentContact, setCurrentContact] = useState<Pessoa | null>(null);

  useEffect(() => {
    fetch(API_URL)
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
      console.log("currentContact", currentContact);
    if (currentContact && currentContact._id) {
      await fetch(`${API_URL}/${currentContact._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(currentContact),
      });
      setContacts(contacts.map((c) => (c._id === currentContact._id ? currentContact : c)));
    } else {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(currentContact),
      });
      const newContact = await response.json();
      setContacts([...contacts, newContact]);
    }
    setOpen(false);
    setCurrentContact(null);
  };

  const columns = [
    { accessorKey: '_id', header: '_id' },
    { accessorKey: 'NOME', header: 'Nome' },
    { accessorKey: 'E-MAIL', header: 'Email' },
    { accessorKey: 'CELULAR', header: 'Celular' },
    { accessorKey: 'actions', header: 'Ações', cell: ({ row }: { row: any }) => (
        <Button size="sm" onClick={() => { setCurrentContact(row.original); setOpen(true); }}>Editar</Button>
      )
    }
  ];

  const table = useReactTable({
    data: filteredContacts,
    columns,
    getCoreRowModel: getCoreRowModel(),
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
        <Button onClick={() => { setCurrentContact({ _id: '', NOME: '', 'E-MAIL': '', CELULAR: '' }); setOpen(true); }}>Adicionar Contato</Button>
      </div>
      <Table className="mt-4">
        <TableHeader>
          {table.getHeaderGroups().map(headerGroup => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map(header => (
                <TableHead key={header.id}>{flexRender(header.column.columnDef.header, header.getContext())}</TableHead>
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
            <Input placeholder="Nome" value={currentContact?.NOME || ''} onChange={(e) => setCurrentContact({ ...currentContact, NOME: e.target.value, 'E-MAIL': currentContact?.['E-MAIL'] || '', CELULAR: currentContact?.CELULAR || '', _id: currentContact?._id || '' })} />
            <Input placeholder="Email" value={currentContact?.['E-MAIL'] || ''} onChange={(e) => setCurrentContact({ ...currentContact, 'E-MAIL': e.target.value, NOME: currentContact?.NOME || '', CELULAR: currentContact?.CELULAR || '', _id: currentContact?._id || '' })} />
            <Input placeholder="Celular" value={currentContact?.CELULAR || ''} onChange={(e) => setCurrentContact({ ...currentContact, CELULAR: e.target.value, NOME: currentContact?.NOME || '', 'E-MAIL': currentContact?.['E-MAIL'] || '', _id: currentContact?._id || '' })} />
            <Button onClick={handleSave}>Salvar</Button>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}

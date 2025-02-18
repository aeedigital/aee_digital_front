"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { createRandomPass } from "@/app/helpers/createRandonPass";
import { getRandomFakeName } from "@/app/helpers/getRandomFakeName";

interface CentroDialogProps {
  regionalId: string;
  onCentroCreated: (newCentro: any) => void;
}


export default function CentroDialog({ regionalId, onCentroCreated }: CentroDialogProps) {
  const [open, setOpen] = useState(false);
  const [novoCentro, setNovoCentro] = useState({
    NOME_CENTRO: "",
    NOME_CURTO: "",
  });
  
  const baseCentro = {
    "FUNCIONAMENTO": {
        "segunda": [],
        "terca": [],
        "quarta": [],
        "quinta": [],
        "sexta": [],
        "sabado": [],
        "domingo": []
    },
    "NOME_CENTRO": "Casa do Caminho Luz e Esperança",
    "NOME_CURTO": "Luz e Esperança",
    "CNPJ_CENTRO": " ",
    "DATA_FUNDACAO": " ",
    "REGIONAL": "61b0bc0371572500128b86a0",
    "ENDERECO": " ",
    "CEP": " ",
    "BAIRRO": " ",
    "CIDADE": " ",
    "ESTADO": " ",
    "PAIS": "Brasil"
}

  async function createNewCentro() {
    try {
      const newCentroData = { ...baseCentro, ...novoCentro, REGIONAL: regionalId };

        console.log("CENTRO DATA",newCentroData)

      const response = await fetch("/api/centros", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newCentroData),
      });

      if (!response.ok) throw new Error("Erro ao criar novo centro");

      const createdCentro = await response.json();
      await createLogin(createdCentro._id);

      onCentroCreated(createdCentro); // Atualiza a lista de centros
      setOpen(false); // Fecha o modal
      setNovoCentro({ NOME_CENTRO: "", NOME_CURTO: "" }); // Reseta os valores
    } catch (error) {
      console.error("Erro ao criar centro:", error);
    }
  }

  async function createLogin(centroId: string){
    const user = getRandomFakeName(novoCentro.NOME_CENTRO);
    const pass = createRandomPass(6);

    const response = await fetch("/api/passes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            user,
            pass,
            "scope_id": centroId,
            "groups":[
                "presidente"
            ]
        }),
        });

  }

  return (
    <>
      <Button onClick={() => setOpen(true)}>Criar Novo Centro</Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Criar Novo Centro</DialogTitle>
          </DialogHeader>
          <Input
            placeholder="Nome do Centro"
            value={novoCentro.NOME_CENTRO}
            onChange={(e) => setNovoCentro({ ...novoCentro, NOME_CENTRO: e.target.value })}
          />
          <Input
            placeholder="Nome Curto"
            value={novoCentro.NOME_CURTO}
            onChange={(e) => setNovoCentro({ ...novoCentro, NOME_CURTO: e.target.value })}
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Cancelar</Button>
            <Button onClick={createNewCentro}>Salvar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
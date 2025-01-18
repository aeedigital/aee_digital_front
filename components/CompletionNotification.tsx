import { useState } from "react";

export function CompletionNotification() {
  const [showNotification, setShowNotification] = useState(true);

  if (!showNotification) return null;

  return (
    <div className="fixed inset-0 bg-gray-800 bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg w-96 text-center">
        <h2 className="text-lg font-semibold mb-4">Obrigado por preencher o formulário!</h2>
        <p className="text-gray-600 mb-4">
          Seus dados foram enviados com sucesso e estão sendo processados pela equipe da Aliança Digital.
        </p>
        <div className="flex justify-center">
          <button
            onClick={() => setShowNotification(false)}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
}
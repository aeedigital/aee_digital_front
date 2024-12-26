import { useState } from "react";

export function CompletionNotification({ onSendEmail }: { onSendEmail: () => void }) {
  const [showNotification, setShowNotification] = useState(true);

  if (!showNotification) return null;

  return (
    <div className="fixed inset-0 bg-gray-800 bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg w-96 text-center">
        <h2 className="text-lg font-semibold mb-4">Obrigado por preencher o formulário!</h2>
        <p className="text-gray-600 mb-4">
          Gostaria de receber um e-mail com o resumo das questões preenchidas?
        </p>
        <div className="flex justify-center space-x-4">
          <button
            onClick={() => {
              onSendEmail();
              setShowNotification(false);
            }}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition"
          >
            Enviar por e-mail
          </button>
          <button
            onClick={() => setShowNotification(false)}
            className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400 transition"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
}

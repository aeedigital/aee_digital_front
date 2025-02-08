export default function Agradecimento() {
    return (
      <div className="min-h-screen flex flex-col justify-center items-center bg-gray-100">
        <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-lg text-center">
          <h2 className="text-2xl font-semibold mb-4">Obrigado por preencher o formulário!</h2>
          <p className="text-gray-600 mb-4">
            Seus dados foram enviados com sucesso e estão sendo processados pela equipe da Aliança Digital.
          </p>
        </div>
      </div>
    );
  }
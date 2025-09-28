import React, { useState } from 'react';
import Modal from './Modal';
import { FiUser, FiUsers } from 'react-icons/fi';

const PaymentModal = ({ isOpen, onClose, onConfirm, transaction }) => {
  const [selectedPayer, setSelectedPayer] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (selectedPayer) {
      onConfirm(selectedPayer);
      setSelectedPayer('');
      onClose();
    }
  };

  const handleClose = () => {
    setSelectedPayer('');
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Quem pagou esta transação?"
      size="md"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Selecione quem pagou: <strong>{transaction?.name}</strong>
          </p>
          <p className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-6">
            Valor: R$ {transaction?.amount?.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </p>

          <div className="space-y-3">
            <div className="flex items-center space-x-3 p-4 border border-gray-200 dark:border-gray-600 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
              <input
                type="radio"
                id="current-user"
                name="payer"
                value="eu"
                checked={selectedPayer === 'eu'}
                onChange={(e) => setSelectedPayer(e.target.value)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500"
              />
              <FiUser className="text-blue-600" size={20} />
              <label htmlFor="current-user" className="flex-1 cursor-pointer text-gray-900 dark:text-gray-100">
                Eu paguei
              </label>
            </div>

            <div className="flex items-center space-x-3 p-4 border border-gray-200 dark:border-gray-600 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
              <input
                type="radio"
                id="partner"
                name="payer"
                value="parceiro"
                checked={selectedPayer === 'parceiro'}
                onChange={(e) => setSelectedPayer(e.target.value)}
                className="h-4 w-4 text-purple-600 focus:ring-purple-500"
              />
              <FiUsers className="text-purple-600" size={20} />
              <label htmlFor="partner" className="flex-1 cursor-pointer text-gray-900 dark:text-gray-100">
                Meu parceiro pagou
              </label>
            </div>

            <div className="flex items-center space-x-3 p-4 border border-gray-200 dark:border-gray-600 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
              <input
                type="radio"
                id="other"
                name="payer"
                value="outro"
                checked={selectedPayer === 'outro'}
                onChange={(e) => setSelectedPayer(e.target.value)}
                className="h-4 w-4 text-green-600 focus:ring-green-500"
              />
              <FiUser className="text-green-600" size={20} />
              <label htmlFor="other" className="flex-1 cursor-pointer text-gray-900 dark:text-gray-100">
                Outra pessoa pagou
              </label>
            </div>
          </div>
        </div>

        <div className="flex space-x-3 pt-4">
          <button
            type="button"
            onClick={handleClose}
            className="flex-1 px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-600 hover:bg-gray-200 dark:hover:bg-gray-500 rounded-lg font-medium transition-colors"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={!selectedPayer}
            className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-colors"
          >
            Confirmar Pagamento
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default PaymentModal;
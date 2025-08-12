"use client";

import { useState } from "react";
import { ethers } from "ethers";
import { CONTRACT_ABI, CONTRACT_ADDRESS } from "./utils/abi";

export default function Home() {
  const [account, setAccount] = useState(null);
  const [contract, setContract] = useState(null);
  const [beneficiary, setBeneficiary] = useState("");
  const [unlockTime, setUnlockTime] = useState("");
  const [amount, setAmount] = useState("");
  const [vaultId, setVaultId] = useState("");
  const [vaultInfo, setVaultInfo] = useState(null);
  const [txHash, setTxHash] = useState(null); // estado para o hash da tx

  // Conectar carteira
  async function connectWallet() {
    if (!window.ethereum) return alert("Instale o Metamask!");
    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();
    const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
    const contractInstance = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);
    setAccount(accounts[0]);
    setContract(contractInstance);
  }

  // Criar Vault ETH
  async function createVaultETH() {
    if (!contract) return alert("Conecte a carteira!");
    try {
      const tx = await contract.createVault(
        beneficiary,
        Math.floor(new Date(unlockTime).getTime() / 1000), // timestamp
        ethers.ZeroAddress,
        0,
        { value: ethers.parseEther(amount) }
      );
      setTxHash(tx.hash); // salva hash para mostrar modal
      await tx.wait();
      alert("Vault criado com sucesso!");
    } catch (error) {
      alert("Erro: " + error.message);
    }
  }

  // Buscar informações do Vault
  async function fetchVault() {
    if (!contract) return;
    const info = await contract.getVaultInfo(Number(vaultId));
    setVaultInfo(info);
  }

  // Sacar do Vault
  async function withdrawVault() {
    if (!contract) return;
    const tx = await contract.withdraw(Number(vaultId));
    await tx.wait();
    alert("Saque realizado!");
  }

  // Fechar modal do tx hash
  function closeModal() {
    setTxHash(null);
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white p-8">
      <div className="max-w-4xl mx-auto">
        {/* Título */}
        <h1 className="text-4xl font-extrabold mb-10 text-center">
          💎 Cofre Cripto <span className="text-blue-400">@lucashenz</span>
        </h1>

        {/* Carteira */}
        <div className="flex justify-center mb-8">
          {!account ? (
            <button
              onClick={connectWallet}
              className="bg-blue-600 hover:bg-blue-500 px-6 py-3 rounded-xl shadow-lg transition-all duration-200"
            >
              Conectar Carteira
            </button>
          ) : (
            <p className="text-lg bg-gray-700 px-4 py-2 rounded-lg">
              ✅ Conectado: <span className="text-green-400">{account}</span>
            </p>
          )}
        </div>

        {/* Criar Vault */}
        <div className="bg-gray-800/60 backdrop-blur-lg p-6 rounded-2xl shadow-lg mb-6">
          <h2 className="text-2xl font-bold mb-4 border-b border-gray-700 pb-2">📦 Criar Vault (ETH)</h2>
          <div className="space-y-3">
            <input
              type="text"
              placeholder="Beneficiário (endereço)"
              className="bg-gray-900 border border-gray-700 p-3 w-full rounded-lg focus:ring-2 focus:ring-blue-400 outline-none"
              value={beneficiary}
              onChange={(e) => setBeneficiary(e.target.value)}
            />
            <input
              type="datetime-local"
              className="bg-gray-900 border border-gray-700 p-3 w-full rounded-lg focus:ring-2 focus:ring-blue-400 outline-none"
              value={unlockTime}
              onChange={(e) => setUnlockTime(e.target.value)}
            />
            <input
              type="text"
              placeholder="Valor em ETH"
              className="bg-gray-900 border border-gray-700 p-3 w-full rounded-lg focus:ring-2 focus:ring-blue-400 outline-none"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />
            <button
              onClick={createVaultETH}
              className="w-full bg-green-600 hover:bg-green-500 px-6 py-3 rounded-xl shadow-lg transition-all duration-200"
            >
              Criar Vault 🚀
            </button>
          </div>
        </div>

        {/* Buscar Vault */}
        <div className="bg-gray-800/60 backdrop-blur-lg p-6 rounded-2xl shadow-lg mb-6">
          <h2 className="text-2xl font-bold mb-4 border-b border-gray-700 pb-2">🔍 Buscar Vault</h2>
          <div className="space-y-3">
            <input
              type="text"
              placeholder="Vault ID"
              className="bg-gray-900 border border-gray-700 p-3 w-full rounded-lg focus:ring-2 focus:ring-yellow-400 outline-none"
              value={vaultId}
              onChange={(e) => setVaultId(e.target.value)}
            />
            <button
              onClick={fetchVault}
              className="w-full bg-yellow-500 hover:bg-yellow-400 text-black px-6 py-3 rounded-xl shadow-lg transition-all duration-200"
            >
              Buscar 📂
            </button>

            {vaultInfo && (
              <div className="mt-4 bg-gray-900 p-4 rounded-lg border border-gray-700">
                <p><strong>Owner:</strong> {vaultInfo.owner}</p>
                <p><strong>Beneficiário:</strong> {vaultInfo.beneficiary}</p>
                <p><strong>Valor:</strong> {ethers.formatEther(vaultInfo.amount)} ETH</p>
                <p><strong>Desbloqueio:</strong> {new Date(Number(vaultInfo.unlockTime) * 1000).toLocaleString()}</p>
                <p><strong>Token:</strong> {vaultInfo.tokenAddress}</p>
                <p><strong>Retirado:</strong> {vaultInfo.withdrawn ? "Sim ✅" : "Não ❌"}</p>
              </div>
            )}
          </div>
        </div>

        {/* Sacar Vault */}
        <div className="bg-gray-800/60 backdrop-blur-lg p-6 rounded-2xl shadow-lg">
          <h2 className="text-2xl font-bold mb-4 border-b border-gray-700 pb-2">💰 Sacar Vault</h2>
          <div className="space-y-3">
            <input
              type="text"
              placeholder="Vault ID"
              className="bg-gray-900 border border-gray-700 p-3 w-full rounded-lg focus:ring-2 focus:ring-red-400 outline-none"
              value={vaultId}
              onChange={(e) => setVaultId(e.target.value)}
            />
            <button
              onClick={withdrawVault}
              className="w-full bg-red-600 hover:bg-red-500 px-6 py-3 rounded-xl shadow-lg transition-all duration-200"
            >
              Sacar 💸
            </button>
          </div>
        </div>
      </div>

      {/* Modal de tx hash */}
      {txHash && (
        <div
          className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50"
          onClick={closeModal}
        >
          <div
            className="bg-gray-900 p-6 rounded-lg max-w-md w-full text-white"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-2xl mb-4">Transação enviada!</h2>
            <p className="break-words">
              Tx Hash:{" "}
              <a
                href={`https://sepolia.etherscan.io/tx/${txHash}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-green-400 underline"
              >
                {txHash}
              </a>
            </p>
            <button
              onClick={closeModal}
              className="mt-6 bg-green-600 hover:bg-green-500 px-5 py-2 rounded-lg"
            >
              Fechar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

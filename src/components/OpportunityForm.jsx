// En el formulario de edición
<div>
  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
    Tokens Vendidos
  </label>
  <input
    type="number"
    value={formData.sold}
    className="w-full px-3 py-2 bg-gray-100 dark:bg-gray-600 border border-gray-300 dark:border-gray-700 rounded-lg"
    disabled={true}
  />
  <p className="mt-1 text-xs text-gray-500">
    Los tokens vendidos no se pueden editar manualmente
  </p>
</div>

{/* Contract Address Field */}
<div>
  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
    Smart Contract
  </label>
  <select
    name="contractAddress"
    value={formData.contractAddress}
    onChange={handleInputChange}
    disabled={!!editingAsset?.contractAddress}
    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg"
  >
    <option value="">Seleccionar Smart Contract</option>
    {availableContracts.map(contract => (
      <option key={contract.value} value={contract.value}>
        {contract.label}
      </option>
    ))}
  </select>
  {editingAsset?.contractAddress && (
    <p className="mt-1 text-xs text-gray-500">
      El smart contract no se puede cambiar una vez asignado
    </p>
  )}
</div>
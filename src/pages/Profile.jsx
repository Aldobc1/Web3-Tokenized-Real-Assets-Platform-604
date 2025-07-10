// ... (importaciones existentes permanecen igual)

const loadUserHoldings = async () => {
  try {
    if (!account) return;

    // Obtener todos los holdings del usuario
    const holdings = await getHoldingsByWallet(account);
    
    // Transformar los datos incluyendo la información del asset y contrato
    const holdingsWithDetails = await Promise.all(
      holdings.map(async (holding) => {
        const matchedAsset = assets.find(asset => asset.id === holding.asset_id);
        if (!matchedAsset) return null;

        return {
          asset: matchedAsset,
          tokens: holding.tokens,
          value: holding.tokens * matchedAsset.tokenPrice,
          contractAddress: holding.contract_address,
          contractInfo: holding.smart_contracts_mt2024,
        };
      })
    );

    // Filtrar holdings nulos y ordenar por valor
    const validHoldings = holdingsWithDetails
      .filter(h => h !== null)
      .sort((a, b) => b.value - a.value);

    setUserHoldings(validHoldings);

    // Calcular el total invertido
    const total = validHoldings.reduce((sum, holding) => sum + holding.value, 0);
    setTotalInvested(total);
  } catch (error) {
    console.error('Error loading user holdings:', error);
    setUserHoldings([]);
    setTotalInvested(0);
  }
};

// ... (resto del código permanece igual)
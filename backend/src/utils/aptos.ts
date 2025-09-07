import { Aptos, AptosConfig, Network } from '@aptos-labs/ts-sdk';

// Initialize Aptos client
const config = new AptosConfig({
  network: (process.env.APTOS_NETWORK as Network) || Network.TESTNET
});
export const aptos = new Aptos(config);

// Mock blockchain interactions (replace with real contract calls)
export const mockMintAIModel = async (name: string, creatorAddress: string) => {
  // Simulate blockchain delay
  await new Promise(resolve => setTimeout(resolve, 2000));

  return {
    transactionHash: `0x${Date.now().toString(16)}`,
    onChainAddress: `0x${Date.now().toString(16)}${Math.random().toString(16).substr(2, 8)}`
  };
};

export const mockPurchaseLicense = async (aiModelAddress: string, buyerAddress: string) => {
  // Simulate blockchain delay
  await new Promise(resolve => setTimeout(resolve, 1500));

  return {
    transactionHash: `0x${Date.now().toString(16)}`,
    licenseAddress: `0x${Date.now().toString(16)}${Math.random().toString(16).substr(2, 8)}`
  };
};

export const mockUpgradeLicense = async (licenseAddress: string) => {
  // Simulate blockchain delay
  await new Promise(resolve => setTimeout(resolve, 1000));

  return {
    transactionHash: `0x${Date.now().toString(16)}`,
    newLicenseAddress: `0x${Date.now().toString(16)}${Math.random().toString(16).substr(2, 8)}`
  };
};

export const mockStartSession = async (licenseAddress: string) => {
  // Simulate blockchain delay
  await new Promise(resolve => setTimeout(resolve, 800));

  return {
    transactionHash: `0x${Date.now().toString(16)}`,
    sessionId: `session_${Date.now()}`
  };
};

export const mockEndSession = async (sessionId: string) => {
  // Simulate blockchain delay
  await new Promise(resolve => setTimeout(resolve, 1200));

  return {
    transactionHash: `0x${Date.now().toString(16)}`,
    finalCost: Math.random() * 10 // Mock cost calculation
  };
};



export interface Product {
  id: string;
  serverId: string;
  name: string;
}

let mockProducts: Product[] = [
  // Server 1-4 (IVR only)
  { id: "prod-1", serverId: "192.168.10.11", name: "PJSIP IVR" },
  { id: "prod-2", serverId: "192.168.10.12", name: "PJSIP IVR" },
  { id: "prod-3", serverId: "192.168.10.13", name: "PJSIP IVR" },
  { id: "prod-4", serverId: "192.168.10.14", name: "PJSIP IVR" },

  // Server 5
  { id: "prod-5-ctd", serverId: "10.0.0.50", name: "Call-to-Dial" },
  { id: "prod-5-desk", serverId: "10.0.0.50", name: "DeskCall" },
  { id: "prod-5-pred", serverId: "10.0.0.50", name: "Predictive" },
];

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const productApi = {
  getProducts: async (serverId: string): Promise<Product[]> => {
    await delay(300);
    return mockProducts.filter(p => p.serverId === serverId);
  },

  createProduct: async (serverId: string, name: string): Promise<Product> => {
    await delay(500);
    const newProduct = { id: `prod-${Date.now()}`, serverId, name };
    mockProducts.push(newProduct);
    return newProduct;
  },

  deleteProduct: async (id: string): Promise<void> => {
    await delay(500);
    mockProducts = mockProducts.filter(p => p.id !== id);
  },
};

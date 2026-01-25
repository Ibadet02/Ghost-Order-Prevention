const PaymentProvider = {
  charge: async (amount: number, idempotencyKey: string): Promise<string> => {
    console.log(`[Payment] Attempting charge: $${amount}...`);
    await new Promise((resolve) => setTimeout(resolve, 500));
    const transaction_id = `txn_${Math.random().toString(36).substring(2, 9)}`;

    return transaction_id;
  },

  refund: async (transaction_id: string) => {
    console.log(`[Payment] REFUNDING transaction: ${transaction_id}`);
  },
};

const OrderService = {
  saveOrder: async (data: any): Promise<string> => {
    await new Promise((resolve) => setTimeout(resolve, 300));

    if (Math.random() <= 0.2) {
      throw new Error("DATABASE_CONNECTION_FAILURE");
    }

    const order_id = `order_${Math.random().toString(36).substring(2, 9)}`;
    console.log(`[DB] Order saved: ${order_id}`);

    return order_id;
  },
};

class CheckoutService {
  private processedKeys = new Set<string>();

  async processCheckout(
    userId: string,
    cartTotal: number,
    idempotencyKey: string
  ) {
    let transaction_id: string | null = null;
    let order_id: string | null = null;
    try {
      if (this.processedKeys.has(idempotencyKey)) {
        return;
      }

      transaction_id = await PaymentProvider.charge(cartTotal, idempotencyKey);

      order_id = await OrderService.saveOrder({
        userId,
        transaction_id,
        cartTotal,
      });
    } catch (err) {
      if (transaction_id) {
        PaymentProvider.refund(transaction_id!);
      } else {
        console.error("No transaction took place");
      }
    }
  }
}

const checkout = new CheckoutService();

checkout.processCheckout("uid", 124, "idem");

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
  private transactionCache = new Map<
    string,
    { status: "processing" | "completed"; data?: any }
  >();

  async processCheckout(
    userId: string,
    cartTotal: number,
    idempotencyKey: string
  ) {
    const cached = this.transactionCache.get(idempotencyKey);

    if (cached) {
      if (cached.status === "processing") {
        throw new Error("Please wait, request in progress.");
      }

      return cached.data;
    }

    this.transactionCache.set(idempotencyKey, { status: "processing" });

    let transaction_id: string | null = null;
    let order_id: string | null = null;

    try {
      transaction_id = await PaymentProvider.charge(cartTotal, idempotencyKey);

      order_id = await OrderService.saveOrder({
        userId,
        transaction_id,
        cartTotal,
      });

      const response = {
        success: true,
        order_id,
      };

      this.transactionCache.set(idempotencyKey, {
        status: "completed",
        data: response,
      });
    } catch (err) {
      try {
        if (transaction_id) {
          await PaymentProvider.refund(transaction_id!);
        }
      } catch (refundErr) {
        console.error(
          "CRITICAL: Refund failed. Manual intervention needed for txn:",
          transaction_id
        );
      }

      this.transactionCache.delete(idempotencyKey);
      throw new Error("Checkout failed. No charges were made.");
    }
  }
}

const checkout = new CheckoutService();

checkout.processCheckout("uid", 124, "idem");
checkout.processCheckout("uid", 124, "idem");
checkout.processCheckout("uid", 124, "idem");
checkout.processCheckout("uid", 124, "idem");
checkout.processCheckout("uid", 124, "idem");
checkout.processCheckout("uid", 124, "idem");
checkout.processCheckout("uid", 124, "idem");
checkout.processCheckout("uid", 124, "idem");
checkout.processCheckout("uid", 124, "idem");
checkout.processCheckout("uid", 124, "idem");
checkout.processCheckout("uid", 124, "idem");
checkout.processCheckout("uid", 124, "idem");
checkout.processCheckout("uid", 124, "idem");
checkout.processCheckout("uid", 124, "idem");
checkout.processCheckout("uid", 124, "idem");
checkout.processCheckout("uid", 124, "idem");
checkout.processCheckout("uid", 124, "idem");
checkout.processCheckout("uid", 124, "idem");
checkout.processCheckout("uid", 124, "idem");
checkout.processCheckout("uid", 124, "idem");


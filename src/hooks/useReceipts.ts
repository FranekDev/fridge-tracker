import { useState, useEffect, useCallback } from 'react';
import { ReceiptScan } from '../types';
import * as ReceiptsApi from '../api/receipts';

export function useReceipts() {
  const [receipts, setReceipts] = useState<ReceiptScan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchReceipts = useCallback(async () => {
    setLoading(true);
    setError(null);

    const response = await ReceiptsApi.getReceiptScans();

    if (response.success) {
      setReceipts(response.data);
    } else {
      setError(response.error || 'Failed to fetch receipts');
    }

    setLoading(false);
  }, []);

  useEffect(() => {
    fetchReceipts();
  }, [fetchReceipts]);

  const deleteReceipt = useCallback(async (receiptId: string) => {
    const response = await ReceiptsApi.deleteReceiptScan(receiptId);
    if (response.success) {
      setReceipts((prev) => prev.filter((r) => r.id !== receiptId));
    }
    return response;
  }, []);

  return {
    receipts,
    loading,
    error,
    refetch: fetchReceipts,
    deleteReceipt,
  };
}

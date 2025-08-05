export interface SimplifiedDebt {
  from: string;
  to: string;
  amount: number;
}

export function calculateOptimalSettlements(balances: Array<{ id: string; name: string; balance: number }>): SimplifiedDebt[] {
  // Create copies to avoid mutating original data
  const creditors = balances.filter(b => b.balance > 0).map(b => ({ ...b }));
  const debtors = balances.filter(b => b.balance < 0).map(b => ({ ...b, balance: Math.abs(b.balance) }));
  
  const settlements: SimplifiedDebt[] = [];

  // Sort creditors by balance (descending) and debtors by balance (descending)
  creditors.sort((a, b) => b.balance - a.balance);
  debtors.sort((a, b) => b.balance - a.balance);

  let creditorIndex = 0;
  let debtorIndex = 0;

  while (creditorIndex < creditors.length && debtorIndex < debtors.length) {
    const creditor = creditors[creditorIndex];
    const debtor = debtors[debtorIndex];

    const settlementAmount = Math.min(creditor.balance, debtor.balance);

    if (settlementAmount > 0.01) { // Avoid tiny settlements
      settlements.push({
        from: debtor.name,
        to: creditor.name,
        amount: settlementAmount
      });

      creditor.balance -= settlementAmount;
      debtor.balance -= settlementAmount;
    }

    if (creditor.balance < 0.01) {
      creditorIndex++;
    }
    if (debtor.balance < 0.01) {
      debtorIndex++;
    }
  }

  return settlements;
}

export function calculateMemberShare(totalAmount: number, memberCount: number, splitType: 'equal' | 'custom' | 'percentage' = 'equal'): number {
  switch (splitType) {
    case 'equal':
      return totalAmount / memberCount;
    case 'custom':
    case 'percentage':
      // For now, default to equal split - in real implementation, you'd handle custom splits
      return totalAmount / memberCount;
    default:
      return totalAmount / memberCount;
  }
}

export function formatCurrency(amount: number): string {
  return `₹${amount.toFixed(2)}`;
}

export function calculateGroupTotals(expenses: Array<{ amount: string | number }>): number {
  return expenses.reduce((total, expense) => {
    const amount = typeof expense.amount === 'string' ? parseFloat(expense.amount) : expense.amount;
    return total + (isNaN(amount) ? 0 : amount);
  }, 0);
}

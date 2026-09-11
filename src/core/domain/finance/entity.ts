/**
 * Pure Domain Entities and Invariants for Group Expense Allocation
 * Graph-based debt simplification algorithm.
 */

export interface GroupMember {
  readonly id: string;
  readonly name: string;
}

export interface GroupExpense {
  readonly id: string;
  readonly description: string;
  readonly amount: number;
  readonly currency: string;
  readonly paidById: string;
  readonly splitAmongIds: readonly string[];
}

export interface DebtTransaction {
  readonly fromMemberId: string;
  readonly toMemberId: string;
  readonly amount: number;
}

export class DebtSimplifier {
  /**
   * Greedy minimum transaction settlement algorithm for group travel expenses.
   */
  static simplify(members: readonly GroupMember[], expenses: readonly GroupExpense[]): DebtTransaction[] {
    const balances = new Map<string, number>();
    for (const m of members) balances.set(m.id, 0);

    for (const exp of expenses) {
      if (!exp.splitAmongIds || exp.splitAmongIds.length === 0) continue;
      const splitShare = exp.amount / exp.splitAmongIds.length;

      // Payer gets credited
      const currentPayerBalance = balances.get(exp.paidById) || 0;
      balances.set(exp.paidById, currentPayerBalance + exp.amount);

      // Participants get debited
      for (const participantId of exp.splitAmongIds) {
        const curr = balances.get(participantId) || 0;
        balances.set(participantId, curr - splitShare);
      }
    }

    const debtors: Array<{ id: string; amount: number }> = [];
    const creditors: Array<{ id: string; amount: number }> = [];

    for (const [id, balance] of balances.entries()) {
      const rounded = Math.round(balance * 100) / 100;
      if (rounded < -0.01) debtors.push({ id, amount: -rounded });
      else if (rounded > 0.01) creditors.push({ id, amount: rounded });
    }

    debtors.sort((a, b) => b.amount - a.amount);
    creditors.sort((a, b) => b.amount - a.amount);

    const settlements: DebtTransaction[] = [];
    let dIdx = 0;
    let cIdx = 0;

    while (dIdx < debtors.length && cIdx < creditors.length) {
      const debtor = debtors[dIdx];
      const creditor = creditors[cIdx];
      const settlementAmount = Math.min(debtor.amount, creditor.amount);

      if (settlementAmount > 0.01) {
        settlements.push({
          fromMemberId: debtor.id,
          toMemberId: creditor.id,
          amount: Math.round(settlementAmount * 100) / 100,
        });
      }

      debtor.amount -= settlementAmount;
      creditor.amount -= settlementAmount;

      if (debtor.amount <= 0.01) dIdx++;
      if (creditor.amount <= 0.01) cIdx++;
    }

    return settlements;
  }
}

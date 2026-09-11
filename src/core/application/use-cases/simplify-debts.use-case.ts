import {
  DebtSimplifier,
  type GroupMember,
  type GroupExpense,
  type DebtTransaction,
} from '../../domain/finance/entity';

export class SimplifyDebtsUseCase {
  execute(members: readonly GroupMember[], expenses: readonly GroupExpense[]): readonly DebtTransaction[] {
    return DebtSimplifier.simplify(members, expenses);
  }
}

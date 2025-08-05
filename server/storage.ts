import { 
  type Group, 
  type Member, 
  type Expense, 
  type Settlement,
  type InsertGroup, 
  type InsertMember, 
  type InsertExpense, 
  type InsertSettlement,
  type GroupWithStats,
  type MemberBalance,
  type ExpenseWithDetails
} from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  // Groups
  getGroups(userId: string): Promise<GroupWithStats[]>;
  getGroup(id: string): Promise<Group | undefined>;
  createGroup(group: InsertGroup): Promise<Group>;
  updateGroup(id: string, updates: Partial<Group>): Promise<Group | undefined>;
  deleteGroup(id: string): Promise<boolean>;

  // Members
  getGroupMembers(groupId: string): Promise<Member[]>;
  getMember(id: string): Promise<Member | undefined>;
  createMember(member: InsertMember): Promise<Member>;
  updateMember(id: string, updates: Partial<Member>): Promise<Member | undefined>;
  deleteMember(id: string): Promise<boolean>;

  // Expenses
  getGroupExpenses(groupId: string): Promise<ExpenseWithDetails[]>;
  getExpense(id: string): Promise<Expense | undefined>;
  createExpense(expense: InsertExpense): Promise<Expense>;
  updateExpense(id: string, updates: Partial<Expense>): Promise<Expense | undefined>;
  deleteExpense(id: string): Promise<boolean>;

  // Settlements
  getGroupSettlements(groupId: string): Promise<Settlement[]>;
  createSettlement(settlement: InsertSettlement): Promise<Settlement>;
  markSettlementPaid(id: string): Promise<Settlement | undefined>;

  // Analytics
  getGroupBalances(groupId: string): Promise<MemberBalance[]>;
  getExpensesByCategory(groupId: string): Promise<Array<{ category: string; total: number }>>;
  getUserStats(userId: string): Promise<{
    totalGroups: number;
    totalExpenses: string;
    youOwe: string;
    youreOwed: string;
  }>;
}

export class MemStorage implements IStorage {
  private groups: Map<string, Group>;
  private members: Map<string, Member>;
  private expenses: Map<string, Expense>;
  private settlements: Map<string, Settlement>;

  constructor() {
    this.groups = new Map();
    this.members = new Map();
    this.expenses = new Map();
    this.settlements = new Map();
  }

  async getGroups(userId: string): Promise<GroupWithStats[]> {
    const userGroups = Array.from(this.groups.values()).filter(
      group => group.createdBy === userId || 
      Array.from(this.members.values()).some(m => m.groupId === group.id && m.email === userId)
    );

    return userGroups.map(group => {
      const groupExpenses = Array.from(this.expenses.values()).filter(e => e.groupId === group.id);
      const groupMembers = Array.from(this.members.values()).filter(m => m.groupId === group.id);
      const totalExpenses = groupExpenses.reduce((sum, exp) => sum + parseFloat(exp.amount), 0);
      
      const recentExpense = groupExpenses
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0];
      
      let recentExpenseWithPaidBy;
      if (recentExpense) {
        const paidByMember = this.members.get(recentExpense.paidBy);
        recentExpenseWithPaidBy = {
          ...recentExpense,
          paidByName: paidByMember?.name || 'Unknown'
        };
      }

      return {
        ...group,
        totalExpenses: totalExpenses.toFixed(2),
        memberCount: groupMembers.length,
        recentExpense: recentExpenseWithPaidBy,
      };
    });
  }

  async getGroup(id: string): Promise<Group | undefined> {
    return this.groups.get(id);
  }

  async createGroup(insertGroup: InsertGroup): Promise<Group> {
    const id = randomUUID();
    const group: Group = {
      ...insertGroup,
      icon: insertGroup.icon || "🏠",
      id,
      createdAt: new Date(),
    };
    this.groups.set(id, group);
    return group;
  }

  async updateGroup(id: string, updates: Partial<Group>): Promise<Group | undefined> {
    const group = this.groups.get(id);
    if (!group) return undefined;
    
    const updatedGroup = { ...group, ...updates };
    this.groups.set(id, updatedGroup);
    return updatedGroup;
  }

  async deleteGroup(id: string): Promise<boolean> {
    return this.groups.delete(id);
  }

  async getGroupMembers(groupId: string): Promise<Member[]> {
    return Array.from(this.members.values()).filter(m => m.groupId === groupId);
  }

  async getMember(id: string): Promise<Member | undefined> {
    return this.members.get(id);
  }

  async createMember(insertMember: InsertMember): Promise<Member> {
    const id = randomUUID();
    const member: Member = {
      ...insertMember,
      email: insertMember.email || null,
      avatar: insertMember.avatar || null,
      id,
      joinedAt: new Date(),
    };
    this.members.set(id, member);
    return member;
  }

  async updateMember(id: string, updates: Partial<Member>): Promise<Member | undefined> {
    const member = this.members.get(id);
    if (!member) return undefined;
    
    const updatedMember = { ...member, ...updates };
    this.members.set(id, updatedMember);
    return updatedMember;
  }

  async deleteMember(id: string): Promise<boolean> {
    return this.members.delete(id);
  }

  async getGroupExpenses(groupId: string): Promise<ExpenseWithDetails[]> {
    const groupExpenses = Array.from(this.expenses.values()).filter(e => e.groupId === groupId);
    const group = this.groups.get(groupId);
    
    return groupExpenses.map(expense => {
      const paidByMember = this.members.get(expense.paidBy);
      const groupMembers = Array.from(this.members.values()).filter(m => m.groupId === groupId);
      
      // Calculate splits based on split type
      let splits;
      if (expense.splitType === 'equal') {
        const splitAmount = parseFloat(expense.amount) / groupMembers.length;
        splits = groupMembers.map(member => ({
          memberId: member.id,
          memberName: member.name,
          amount: splitAmount
        }));
      } else {
        splits = expense.splitData as Array<{ memberId: string; memberName: string; amount: number }> || [];
      }

      return {
        ...expense,
        paidByName: paidByMember?.name || 'Unknown',
        groupName: group?.name || 'Unknown Group',
        splits
      };
    }).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }

  async getExpense(id: string): Promise<Expense | undefined> {
    return this.expenses.get(id);
  }

  async createExpense(insertExpense: InsertExpense): Promise<Expense> {
    const id = randomUUID();
    const expense: Expense = {
      ...insertExpense,
      splitType: insertExpense.splitType || "equal",
      splitData: insertExpense.splitData || {},
      id,
      date: insertExpense.date || new Date(),
      createdAt: new Date(),
    };
    this.expenses.set(id, expense);
    return expense;
  }

  async updateExpense(id: string, updates: Partial<Expense>): Promise<Expense | undefined> {
    const expense = this.expenses.get(id);
    if (!expense) return undefined;
    
    const updatedExpense = { ...expense, ...updates };
    this.expenses.set(id, updatedExpense);
    return updatedExpense;
  }

  async deleteExpense(id: string): Promise<boolean> {
    return this.expenses.delete(id);
  }

  async getGroupSettlements(groupId: string): Promise<Settlement[]> {
    return Array.from(this.settlements.values()).filter(s => s.groupId === groupId);
  }

  async createSettlement(insertSettlement: InsertSettlement): Promise<Settlement> {
    const id = randomUUID();
    const settlement: Settlement = {
      ...insertSettlement,
      isSettled: insertSettlement.isSettled || false,
      settledAt: null,
      id,
      createdAt: new Date(),
    };
    this.settlements.set(id, settlement);
    return settlement;
  }

  async markSettlementPaid(id: string): Promise<Settlement | undefined> {
    const settlement = this.settlements.get(id);
    if (!settlement) return undefined;
    
    const updatedSettlement = { 
      ...settlement, 
      isSettled: true, 
      settledAt: new Date() 
    };
    this.settlements.set(id, updatedSettlement);
    return updatedSettlement;
  }

  async getGroupBalances(groupId: string): Promise<MemberBalance[]> {
    const expenses = await this.getGroupExpenses(groupId);
    const members = await this.getGroupMembers(groupId);
    
    const memberBalances: Map<string, MemberBalance> = new Map();
    
    // Initialize balances
    members.forEach(member => {
      memberBalances.set(member.id, {
        memberId: member.id,
        memberName: member.name,
        balance: 0,
        owes: [],
        owed: []
      });
    });

    // Calculate balances from expenses
    expenses.forEach(expense => {
      const paidAmount = parseFloat(expense.amount);
      const paidByBalance = memberBalances.get(expense.paidBy);
      if (paidByBalance) {
        paidByBalance.balance += paidAmount;
      }

      expense.splits.forEach(split => {
        const memberBalance = memberBalances.get(split.memberId);
        if (memberBalance) {
          memberBalance.balance -= split.amount;
        }
      });
    });

    // Convert to array and calculate who owes whom
    return Array.from(memberBalances.values());
  }

  async getExpensesByCategory(groupId: string): Promise<Array<{ category: string; total: number }>> {
    const expenses = Array.from(this.expenses.values()).filter(e => e.groupId === groupId);
    const categoryTotals = new Map<string, number>();

    expenses.forEach(expense => {
      const current = categoryTotals.get(expense.category) || 0;
      categoryTotals.set(expense.category, current + parseFloat(expense.amount));
    });

    return Array.from(categoryTotals.entries()).map(([category, total]) => ({
      category,
      total
    }));
  }

  async getUserStats(userId: string): Promise<{
    totalGroups: number;
    totalExpenses: string;
    youOwe: string;
    youreOwed: string;
  }> {
    const userGroups = await this.getGroups(userId);
    const totalExpenses = userGroups.reduce((sum, group) => sum + parseFloat(group.totalExpenses), 0);

    // Calculate balances across all groups
    let totalOwed = 0;
    let totalOwing = 0;

    for (const group of userGroups) {
      const balances = await this.getGroupBalances(group.id);
      const userBalance = balances.find(b => 
        this.members.get(b.memberId)?.email === userId || 
        this.members.get(b.memberId)?.name === userId
      );
      
      if (userBalance) {
        if (userBalance.balance < 0) {
          totalOwing += Math.abs(userBalance.balance);
        } else {
          totalOwed += userBalance.balance;
        }
      }
    }

    return {
      totalGroups: userGroups.length,
      totalExpenses: totalExpenses.toFixed(2),
      youOwe: totalOwing.toFixed(2),
      youreOwed: totalOwed.toFixed(2)
    };
  }
}

export const storage = new MemStorage();

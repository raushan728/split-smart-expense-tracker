import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertGroupSchema, insertMemberSchema, insertExpenseSchema, insertSettlementSchema } from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // Groups
  app.get("/api/groups", async (req, res) => {
    try {
      const userId = req.headers["x-user-id"] as string || "default-user";
      const groups = await storage.getGroups(userId);
      res.json(groups);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch groups" });
    }
  });

  app.get("/api/groups/:id", async (req, res) => {
    try {
      const group = await storage.getGroup(req.params.id);
      if (!group) {
        return res.status(404).json({ message: "Group not found" });
      }
      res.json(group);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch group" });
    }
  });

  app.post("/api/groups", async (req, res) => {
    try {
      const userId = req.headers["x-user-id"] as string || "default-user";
      const validatedData = insertGroupSchema.parse({ ...req.body, createdBy: userId });
      const group = await storage.createGroup(validatedData);
      res.status(201).json(group);
    } catch (error) {
      res.status(400).json({ message: "Invalid group data" });
    }
  });

  app.put("/api/groups/:id", async (req, res) => {
    try {
      const updates = req.body;
      const group = await storage.updateGroup(req.params.id, updates);
      if (!group) {
        return res.status(404).json({ message: "Group not found" });
      }
      res.json(group);
    } catch (error) {
      res.status(400).json({ message: "Failed to update group" });
    }
  });

  app.delete("/api/groups/:id", async (req, res) => {
    try {
      const success = await storage.deleteGroup(req.params.id);
      if (!success) {
        return res.status(404).json({ message: "Group not found" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete group" });
    }
  });

  // Members
  app.get("/api/groups/:groupId/members", async (req, res) => {
    try {
      const members = await storage.getGroupMembers(req.params.groupId);
      res.json(members);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch members" });
    }
  });

  app.post("/api/groups/:groupId/members", async (req, res) => {
    try {
      const validatedData = insertMemberSchema.parse({ 
        ...req.body, 
        groupId: req.params.groupId 
      });
      const member = await storage.createMember(validatedData);
      res.status(201).json(member);
    } catch (error) {
      res.status(400).json({ message: "Invalid member data" });
    }
  });

  app.delete("/api/members/:id", async (req, res) => {
    try {
      const success = await storage.deleteMember(req.params.id);
      if (!success) {
        return res.status(404).json({ message: "Member not found" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete member" });
    }
  });

  // Expenses
  app.get("/api/groups/:groupId/expenses", async (req, res) => {
    try {
      const expenses = await storage.getGroupExpenses(req.params.groupId);
      res.json(expenses);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch expenses" });
    }
  });

  app.post("/api/groups/:groupId/expenses", async (req, res) => {
    try {
      const validatedData = insertExpenseSchema.parse({ 
        ...req.body, 
        groupId: req.params.groupId 
      });
      const expense = await storage.createExpense(validatedData);
      res.status(201).json(expense);
    } catch (error) {
      res.status(400).json({ message: "Invalid expense data" });
    }
  });

  app.put("/api/expenses/:id", async (req, res) => {
    try {
      const updates = req.body;
      const expense = await storage.updateExpense(req.params.id, updates);
      if (!expense) {
        return res.status(404).json({ message: "Expense not found" });
      }
      res.json(expense);
    } catch (error) {
      res.status(400).json({ message: "Failed to update expense" });
    }
  });

  app.delete("/api/expenses/:id", async (req, res) => {
    try {
      const success = await storage.deleteExpense(req.params.id);
      if (!success) {
        return res.status(404).json({ message: "Expense not found" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete expense" });
    }
  });

  // Analytics
  app.get("/api/groups/:groupId/balances", async (req, res) => {
    try {
      const balances = await storage.getGroupBalances(req.params.groupId);
      res.json(balances);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch balances" });
    }
  });

  app.get("/api/groups/:groupId/analytics", async (req, res) => {
    try {
      const categoryData = await storage.getExpensesByCategory(req.params.groupId);
      res.json({ categories: categoryData });
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch analytics" });
    }
  });

  app.get("/api/user/stats", async (req, res) => {
    try {
      const userId = req.headers["x-user-id"] as string || "default-user";
      const stats = await storage.getUserStats(userId);
      res.json(stats);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch user stats" });
    }
  });

  // Settlements
  app.get("/api/groups/:groupId/settlements", async (req, res) => {
    try {
      const settlements = await storage.getGroupSettlements(req.params.groupId);
      res.json(settlements);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch settlements" });
    }
  });

  app.post("/api/groups/:groupId/settlements", async (req, res) => {
    try {
      const validatedData = insertSettlementSchema.parse({ 
        ...req.body, 
        groupId: req.params.groupId 
      });
      const settlement = await storage.createSettlement(validatedData);
      res.status(201).json(settlement);
    } catch (error) {
      res.status(400).json({ message: "Invalid settlement data" });
    }
  });

  app.put("/api/settlements/:id/settle", async (req, res) => {
    try {
      const settlement = await storage.markSettlementPaid(req.params.id);
      if (!settlement) {
        return res.status(404).json({ message: "Settlement not found" });
      }
      res.json(settlement);
    } catch (error) {
      res.status(500).json({ message: "Failed to mark settlement as paid" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}

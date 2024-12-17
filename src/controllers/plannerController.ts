import { Request, Response } from "express";
import pool from "../config/db";

export class PlannerController {
  public async saveMonthPlan(req: Request, res: Response) {
    const userId = req.params.userId;
    const plannerData = req.body;

    if (!userId) {
      return res.status(400).json({ success: false, message: "Missing user ID" });
    }

    const client = await pool.connect();

    try {
      let subExpenses: any = [];

      // Prepare mainExpenses and subExpenses
      const mainExpenses = plannerData.map((expense: { sub_expenses: any[] }, index: number) => {
        if (expense.sub_expenses && expense.sub_expenses.length > 0) {
          expense.sub_expenses.forEach((subExpense: any) => {
            subExpenses.push({ ...subExpense, user_id: userId, index: index });
          });
        }

        const { sub_expenses, ...remainingExpense } = expense;
        return { ...remainingExpense, user_id: userId };
      });

      // 1. Insert Main Expenses with RETURNING id
      const mainExpenseTable = "kuberan_user.main_expense";
      const mainExpenseColumns = ["user_id", "main_expense", "main_expense_amount", "month", "year"];

      const mainExpensePlaceholders = mainExpenses
        .map((_: any, i: number) => `(${mainExpenseColumns.map((__, j) => `$${i * mainExpenseColumns.length + j + 1}`).join(",")})`)
        .join(",");

      const mainExpenseValues = mainExpenses.flatMap(
        (mainExpense: { user_id: any; main_expense: any; main_expense_amount: any; month: any; year: any }) => [
          mainExpense.user_id,
          mainExpense.main_expense,
          mainExpense.main_expense_amount,
          mainExpense.month,
          mainExpense.year,
        ]
      );

      // Insert query with RETURNING id to get the inserted row's ID
      const mainExpenseQuery = `INSERT INTO ${mainExpenseTable} (${mainExpenseColumns.join(",")}) 
                                VALUES ${mainExpensePlaceholders} 
                                RETURNING id`;

      // Execute main expense insert query and get ids of inserted rows
      const mainExpenseResult = await client.query(mainExpenseQuery, mainExpenseValues);

      // Check if we have any rows in the result
      if (mainExpenseResult.rows.length > 0) {

        const insertedMainExpenses = mainExpenseResult.rows;
        const insertedMainExpenseIds = insertedMainExpenses.map((row: { id: number }) => row.id);

        // Map the `main_expense_id` to `sub_expenses`
        subExpenses.forEach((subExpense: {index: any; main_expense_id: number; })=>{
          subExpense.main_expense_id = insertedMainExpenseIds[subExpense.index]
        })

        // 2. Insert Sub Expenses
        const subExpenseTable = "kuberan_user.sub_expense";
        const subExpenseColumns = ["user_id", "main_expense_id", "sub_expense", "sub_expense_amount", "date", "month", "year", "full_date"];

        const subExpensePlaceholders = subExpenses
          .map((_: any, i: number) => `(${subExpenseColumns.map((__, j) => `$${i * subExpenseColumns.length + j + 1}`).join(",")})`)
          .join(",");

        const subExpenseValues = subExpenses.flatMap(
          (subExpense: { user_id: any; main_expense_id: any; sub_expense: any; sub_expense_amount: any; date: any; month: any; year: any; full_date: any }) => [
            subExpense.user_id,
            subExpense.main_expense_id,
            subExpense.sub_expense,
            subExpense.sub_expense_amount,
            subExpense.date,
            subExpense.month,
            subExpense.year,
            subExpense.full_date,
          ]
        );

        const subExpenseQuery = `INSERT INTO ${subExpenseTable} (${subExpenseColumns.join(",")}) VALUES ${subExpensePlaceholders}`;

        // Execute sub expense insert query
        const subExpenseResult = await client.query(subExpenseQuery, subExpenseValues);
        return res.status(200).json({ success: true, message: 'Main and Sub Expenses inserted successfully' });
        
      } else {
        console.log("No main expenses were inserted.");
        return res.status(500).json({ success: false, message: "Failed to insert main expenses." });
      }
    } catch (error: any) {
      console.error("Error inserting multiple rows:", error.message);
      await client.query('ROLLBACK'); // Rollback in case of error
      return res.status(500).json({ success: false, message: 'Internal Server Error', error: error.message });
    } finally {
      client.release();
    }
  }
}

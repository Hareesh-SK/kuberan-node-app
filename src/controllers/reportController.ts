import { Request, Response } from "express";
import pool from "../config/db";

export class ReportController {

    public async getReport(req: Request, res: Response) {
        const userId = req.params.userId;
        const { month, year } = req.body;

        const client = await pool.connect();
        try {
            // Query to fetch data with JOIN
            const query = `
                SELECT 
                    me.id AS main_expense_id,
                    me.main_expense,
                    me.main_expense_amount,
                    me.month,
                    me.year,
                    se.id AS sub_expense_id,
                    se.sub_expense,
                    se.sub_expense_amount,
                    se.full_date
                FROM 
                    kuberan_user.main_expense me
                LEFT JOIN 
                    kuberan_user.sub_expense se
                ON 
                    me.id = se.main_expense_id
                WHERE 
                    me.user_id = $1 AND me.month = $2 AND me.year = $3
                ORDER BY 
                    me.id, se.date;
                `;
      
        const values = [userId,month,year];
        const result = await client.query(query, values);
    
        // Return fetched data
        return res.status(200).json(result.rows);
        } catch (error: any) {
        console.error("Error fetching data:", error.message);
        return res.status(500).json({ success: false, message: "Internal Server Error", error: error.message });
        } finally {
        client.release();
        }
    }
}

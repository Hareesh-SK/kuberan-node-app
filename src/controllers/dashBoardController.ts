import { Request, Response } from 'express';
import pool from '../config/db';


export class DashBoardController {

    public async currentDayData(req: Request, res: Response){
        const userId = req.params.userId;
        try {
        const client = await pool.connect();
        let currentDate: any = new Date();
        currentDate = currentDate.toISOString().split('T')[0];
        const query = `
        SELECT se.*, me.main_expense 
        FROM kuberan_user.sub_expense se
        JOIN kuberan_user.main_expense me 
            ON se.main_expense_id = me.id
        WHERE se.user_id = $1 AND se.full_date = $2
        `;
        
        const result = await client.query(query, [userId, currentDate]);
        return res.status(200).json(result.rows);
        } catch (error) {
            console.error('Error fetching data:', error);
            throw error;
        }
    }
}
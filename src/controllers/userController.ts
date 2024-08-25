import { Request, Response } from 'express';
import pool from '../config/db';

export class UserController {
  public async saveUserDetails(req: Request, res: Response) {
    const { firstName, lastName, age, phoneNumber, emailId, city, profession, password } = req.body;

    if (!firstName || !lastName || !age || !phoneNumber || !emailId || !city || !profession || !password) {
      return res.status(400).json({ success: false, message: 'Missing required fields' });
    }

    try {
      await this.saveUser(req.body);
      res.json({ success: true, message: 'User saved successfully' });
    } catch (error) {
      console.error('Error saving user:', error);
      res.status(500).json({ success: false, message: 'Internal server error' });
    }
  }

  private async saveUser(userData: any) {
    const client = await pool.connect();
    const { firstName, lastName, age, phoneNumber, emailId, city, profession, password } = userData;
    try {
      const query = {
        text: 'INSERT INTO kuberan_user.user_details (first_name, last_name, age, phone_number, email_id, city, profession, password) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)',
        values: [firstName, lastName, age, phoneNumber, emailId, city, profession, password],
      };
      await client.query(query);
    } finally {
      client.release();
    }
  }
}


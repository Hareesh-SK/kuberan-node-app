import { Request, Response } from 'express';
import pool from '../config/db';

export class AuthController {
  public async authenticate(req: Request, res: Response): Promise<Response> {
    const { phoneNumber, password } = req.body;

    if (!phoneNumber || !password) {
      return res.status(200).json({ success: false, message: 'Missing phone number or password' });
    }

    try {
      const userExists = await this.checkUserExists(phoneNumber);
      if (!userExists) {
        return res.status(200).json({ success: false, message: 'User not found' });
      }

      const userId = await this.validatePassword(phoneNumber, password);
      if (userId) {
        return res.json({ success: true, loggedInUser: userId });
      } else {
        return res.status(200).json({ success: false, message: 'Invalid password' });
      }
    } catch (error) {
      return res.status(500).json({ success: false, message: 'Internal server error' });
    }
  }

  private async checkUserExists(phoneNumber: string): Promise<boolean> {
    const client = await pool.connect();
    try {
      const query = {
        text: 'SELECT 1 FROM kuberan_user.user_details WHERE phone_number = $1',
        values: [phoneNumber],
      };
      const result = await client.query(query);
      return (result.rowCount ?? 0) > 0;
    } finally {
      client.release();
    }
  }

  private async validatePassword(phoneNumber: string, password: string): Promise<number | null> {
    const client = await pool.connect();
    try {
      const query = {
        text: 'SELECT id FROM kuberan_user.user_details WHERE phone_number = $1 AND password = $2',
        values: [phoneNumber, password],
      };
      const result = await client.query(query);
      if ((result.rowCount ?? 0) > 0) {
        return result.rows[0].id;
      } else {
        return null;
      }
    } finally {
      client.release();
    }
  }

}


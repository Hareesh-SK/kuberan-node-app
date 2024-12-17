import { Request, Response, NextFunction } from 'express';
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
  public async fetchUserData(req: Request, res: Response, next: NextFunction): Promise<void> {
    const { userId } = req.params;

    try {
      const client = await pool.connect();
      try {
        const query = {
          text: 'SELECT first_name, last_name, age, phone_number, email_id, city, profession FROM kuberan_user.user_details WHERE id = $1',
          values: [userId],
        };
        const result = await client.query(query);
        if ((result.rowCount ?? 0) > 0) {
          res.locals.userData = result.rows[0];
          next();
        } else {
          res.status(404).json({ success: false, message: 'User not found' });
        }
      } finally {
        client.release();
      }
    } catch (error) {
      res.status(500).json({ success: false, message: 'Internal server error' });
    }
  }
  public async updateUserDetails(req: Request, res: Response): Promise<Response> {
    const { userId, first_name, last_name, age, phone_number, email_id, city, profession, password } = req.body;

  if (!userId) {
    return res.status(400).json({ success: false, message: 'Missing user ID' });
  }

  const fields: { [key: string]: any } = { first_name, last_name, age, phone_number, email_id, city, profession, password };
  const updates = Object.keys(fields).filter(key => fields[key] !== undefined);

  if (updates.length === 0) {
    return res.status(200).json({ success: false, message: 'No fields to update' });
  }

  const setClause = updates.map((key, index) => `${key} = $${index + 1}`).join(', ');
  const values = updates.map(key => fields[key]);

  const query = {
    text: `UPDATE kuberan_user.user_details SET ${setClause} WHERE id = $${updates.length + 1}`,
    values: [...values, userId],
  };

  await pool.query(query);
  return res.json({ success: true, message: 'User details updated successfully' });
  }
}


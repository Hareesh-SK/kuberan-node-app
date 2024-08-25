import { Request, Response, NextFunction } from 'express';
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

  public async saveUserDetails(req: Request, res: Response): Promise<Response> {
    const { userId, first_name, last_name, age, phone_number, email_id, city, profession, password } = req.body;

  if (!userId) {
    return res.status(400).json({ success: false, message: 'Missing user ID' });
  }

  const fields: { [key: string]: any } = { first_name, last_name, age, phone_number, email_id, city, profession, password };
  const updates = Object.keys(fields).filter(key => fields[key] !== undefined);

  if (updates.length === 0) {
    return res.status(400).json({ success: false, message: 'No fields to update' });
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


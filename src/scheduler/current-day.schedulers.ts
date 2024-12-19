import { Client, LocalAuth } from 'whatsapp-web.js';
import qrcode from 'qrcode-terminal';

export class currentDayScheduler {
  private client: Client;

  constructor() {
    // Initialize WhatsApp client
    this.client = new Client({
      authStrategy: new LocalAuth(), // Keeps the session for later use
    });

    // Set up event listeners for WhatsApp client
    this.client.on('qr', this.generateQRCode);
    this.client.on('ready', () => this.scheduleNextRun()); // Start scheduling after client is ready
    this.client.initialize();
  }

  // Method to generate the QR code for WhatsApp Web authentication
  private generateQRCode(qr: string): void {
    qrcode.generate(qr, { small: true });
    console.log('Scan the QR code with WhatsApp to authenticate!');
  }

  // Method to schedule the next run at 12 AM
  public scheduleNextRun(): void {
    const now = new Date();
    const nextMidnight = new Date(now);
    nextMidnight.setHours(4, 0, 0, 0); // Set to the next day's 12:00 AM
    const delay = nextMidnight.getTime() - now.getTime();

    setTimeout(() => {
      this.executeTask(); // Run the scheduled task at midnight
      this.scheduleNextRun(); // Reschedule for the next 12 AM
    }, delay);
  }

  // Method containing the task to execute at 12 AM
  private async executeTask(): Promise<void> {
    console.log('Running scheduled task at 12 AM');

    try {
      const recipient = '918248836394@c.us'; 
      const message = 'Hello from Node.js via WhatsApp!';
  
      // Validate client readiness
      if (!this.client.info) {
        console.error('WhatsApp client is not initialized.');
        return;
      }
  
      // Send message
      const response = await this.client.sendMessage(recipient, message);
      console.log('Message sent successfully:', response);
    } catch (error:any) {
      console.error('Error sending message:', error.message);
    }
  }
}

// Usage
const scheduler = new currentDayScheduler();
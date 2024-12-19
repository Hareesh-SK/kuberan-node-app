export class currentDayScheduler {
    public scheduleNextRun(): void {
      const now = new Date();
      const nextMidnight = new Date(now);
      nextMidnight.setHours(24, 0, 0, 0); // Set to the next day's 12:00 AM
      const delay = nextMidnight.getTime() - now.getTime();
  
      setTimeout(() => {
        this.executeTask(); // Run the scheduled task at midnight
        this.scheduleNextRun(); // Reschedule for the next 12 AM
      }, delay);
    }
  
    // Method containing the task to execute at 12 AM
    private executeTask(): void {
      console.log("Running scheduled task at 12 AM");
      // Add additional logic here as needed
    }
  }
  
import app from './app';
import { currentDayScheduler } from './scheduler/current-day.schedulers';

const PORT = process.env.PORT || 3000;

// Create an instance of the scheduler
// const scheduler = new currentDayScheduler();

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

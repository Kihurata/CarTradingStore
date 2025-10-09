import 'dotenv/config';  // Load early
import app from './app';

const PORT = process.env.PORT || 4000;  // Default 4000 cho consistency

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
}).on('error', (err) => {
  console.error('Server listen error:', err);
  process.exit(1);
});
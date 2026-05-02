import app from './app.js';
import { env } from './lib/env.js';

const PORT = env.PORT;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

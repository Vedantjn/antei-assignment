const express = require('express');
const cors = require('cors');
const uploadRouter = require('./routes/upload');

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.use('/upload', uploadRouter);

app.listen(port, () => {
  console.log(`Server is running on port: ${port}`);
});
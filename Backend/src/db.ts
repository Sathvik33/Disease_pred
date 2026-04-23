import { Pool } from "pg";

const pool = new Pool({
    host: process.env.DB_HOST || "localhost",
    port: parseInt(process.env.DB_PORT || "5432"),
    user: process.env.DB_USER || "postgres",
    password: process.env.DB_PASS || "",
    database: process.env.DB_NAME || "Disease_Prediction",
});
pool.query("SELECT NOW()")
.then(()=>console.log("DB connected"))
.catch(err=>console.error("DB failed", err));

console.log({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  db: process.env.DB_NAME
});
export default pool;

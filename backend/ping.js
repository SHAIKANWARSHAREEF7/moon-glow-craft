const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    console.log("Attempting to connect to Neon Database...");
    await prisma.$connect();
    console.log("Database successfully awakened and connected!");
    
    // Test a basic query
    const count = await prisma.user.count();
    console.log(`Found ${count} users in the database.`);
    
    // Now try to hit the live backend API
    console.log("Fetching live backend endpoint...");
    try {
      const response = await fetch("https://moonglow-backend.onrender.com/api/auth/send-otp", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: "shaikanwar7204@gmail.com" })
      });
      const data = await response.json();
      console.log("Backend OTP Response:", response.status, data);
    } catch(e) {
      console.error("Backend fetch failed:", e.message);
    }
}

main().catch(console.error).finally(() => prisma.$disconnect());

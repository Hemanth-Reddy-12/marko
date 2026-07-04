import "dotenv/config";
import { sendNotification } from "../modules/notification/notification.service.js";

async function main() {
    const userId = process.argv[2];
    if (!userId) {
        console.error("Please provide a user ID");
        process.exit(1);
    }
    
    console.log(`Sending notification to user ${userId}...`);
    
    await sendNotification(userId, "System Alert", "This is a real-time sonner notification!");
    
    console.log("Done");
    process.exit(0);
}

main();

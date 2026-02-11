import { logCall } from "./callLogger.js";
import { isDuplicate } from "./duplicateGuard.js";

export function simulateOutbound(type, customer) {

    if (isDuplicate(customer.customerId, type)) {
        return { result: "Duplicate prevented." };
    }

    logCall({
        customerId: customer.customerId,
        type,
        status: "initiated"
    });

    let message = "";

    switch (type) {
        case "declined":
            message = `Payment of $${customer.pastDue} declined.`;
            break;
        case "collections":
            message = `Past due balance $${customer.pastDue}. Account on hold.`;
            break;
        case "reminder":
            message = `Reminder: delivery on ${customer.nextDelivery}.`;
            break;
    }

    return { result: message };
}

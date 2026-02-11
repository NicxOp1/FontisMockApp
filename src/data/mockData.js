export const customers = [
    {
        customerId: "002864",
        name: "Jamie Carroll",
        phone: "7705957594",
        address: "592 Shannon Drive",
        city: "Marietta",
        state: "GA",
        postalCode: "30066",
        balance: 0,
        pastDue: 0,
        autopay: true,
        paymentMethod: { type: "VISA", last4: "3758" },
        standingOrder: [
            { product: "5 Gallon Spring Water", quantity: 4, unitPrice: 7.99, lineTotal: 31.96 },
            { product: "Cooler Rental", quantity: 1, unitPrice: 9.99, lineTotal: 9.99 }
        ],
        invoices: [
            {
                key: "INV001",
                date: "2027-11-10",
                total: 42.15,
                items: [
                    { product: "5 Gallon Spring Water", quantity: 4 },
                    { product: "Cooler Rental", quantity: 1 }
                ]
            }
        ],
        nextDelivery: "2027-11-24",
        contract: {
            type: "Water Only",
            monthToMonth: true,
            signedDate: "2027-06-01"
        },
        workOrders: [
            {
                id: "WO1001",
                status: "Scheduled",
                date: "2027-11-22",
                type: "Cooler Pickup"
            }
        ],
        orders: [
            {
                id: "ORD001",
                status: "Pending",
                changeRequested: true,
                date: "2027-11-15",
                items: [
                    { product: "5 Gallon Spring Water", quantity: 6 }
                ]
            }
        ],
        cardExpiry: {
            month: "12",
            year: "2027"
        },
        deliverySchedule: {
            frequency: "Bi-weekly",
            dayOfWeek: "Monday",
            timeWindow: "8:00 AM - 12:00 PM",
            routeId: "RT-101"
        },
        deliveryHistory: [
            { date: "2027-11-10", status: "Delivered", items: "4x 5 Gallon Spring Water, 1x Cooler Rental" },
            { date: "2027-10-27", status: "Delivered", items: "4x 5 Gallon Spring Water" }
        ],
        deliveryStops: [
            {
                deliveryId: "DEL-2864-01",
                address: "592 Shannon Drive",
                city: "Marietta",
                state: "GA",
                postalCode: "30066",
                type: "Residential"
            }
        ],
        routeStops: [
            { stop: 1, address: "592 Shannon Drive", timeEstimate: "8:30 AM" },
            { stop: 2, address: "600 Shannon Drive", timeEstimate: "8:45 AM" }
        ]
    },
    {
        customerId: "002302",
        name: "Edward Carroll",
        phone: "7701112222",
        address: "12 Lake Road",
        city: "Marietta",
        state: "GA",
        postalCode: "30066",
        balance: 84.32,
        pastDue: 84.32,
        autopay: false,
        paymentMethod: { type: "Mastercard", last4: "9912" },
        standingOrder: [],
        invoices: [],
        nextDelivery: "2027-11-25",
        contract: {
            type: "Equipment",
            startDate: "2027-01-01",
            endDate: "2028-01-01",
            signedDate: "2028-12-15"
        },
        workOrders: [],
        orders: [],
        cardExpiry: {
            month: "03",
            year: "2028"
        },
        deliverySchedule: {
            frequency: "Weekly",
            dayOfWeek: "Tuesday",
            timeWindow: "1:00 PM - 5:00 PM",
            routeId: "RT-205"
        },
        deliveryHistory: [],
        deliveryStops: [
            {
                deliveryId: "DEL-2302-01",
                address: "12 Lake Road",
                city: "Marietta",
                state: "GA",
                postalCode: "30066",
                type: "Residential"
            }
        ],
        routeStops: [
            { stop: 1, address: "12 Lake Road", timeEstimate: "1:15 PM" }
        ]
    }
];

export const products = [
    { id: "PROD001", name: "5 Gallon Spring Water", price: 7.99, unit: "bottle", category: "Water" },
    { id: "PROD002", name: "3 Gallon Spring Water", price: 5.49, unit: "bottle", category: "Water" },
    { id: "PROD003", name: "Cooler Rental", price: 9.99, unit: "month", category: "Equipment" },
    { id: "PROD004", name: "Hot & Cold Dispenser", price: 14.99, unit: "month", category: "Equipment" },
    { id: "PROD005", name: "Cup Service (200 ct)", price: 12.50, unit: "box", category: "Accessories" }
];

export const flaggedCalls = [];

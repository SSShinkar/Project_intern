// Required modules
const express = require("express");
const mongoose = require("mongoose");
const path = require("path");
const Listing = require("./models/schema.js");
const axios = require("axios");
const app = express();
const MONGO_URL = "mongodb://127.0.0.1:27017/transaction";

// Setting up view engine and static files
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));

// Connect to MongoDB
async function main() {
    try {
        await mongoose.connect(MONGO_URL);
        console.log("Connection established with database successfully");
    } catch (err) {
        console.error("Database connection error:", err);
    }
}

// Serve the index.html file
app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "index.html"));
});

// API endpoint for bar chart data
app.get("/api/bar-chart", async (req, res) => {
    const { month } = req.query;
    
    try {
        // Fetch all listings
        const allLists = await Listing.find();

        // Initialize counts for each price range
        const priceRanges = {
            '0-100': 0,
            '101-200': 0,
            '201-300': 0,
            '301-400': 0,
            '401-500': 0,
            '501-600': 0,
            '601-700': 0,
            '701-800': 0,
            '801-900': 0,
            '901-above': 0,
        };

        // Loop through each listing
        allLists.forEach(list => {
            const saleMonth = new Date(list.dateOfSale).getMonth() + 1; // getMonth() is zero-based

            if (parseInt(month) === saleMonth) {
                if (list.price <= 100) {
                    priceRanges['0-100'] += 1;
                } else if (list.price <= 200) {
                    priceRanges['101-200'] += 1;
                } else if (list.price <= 300) {
                    priceRanges['201-300'] += 1;
                } else if (list.price <= 400) {
                    priceRanges['301-400'] += 1;
                } else if (list.price <= 500) {
                    priceRanges['401-500'] += 1;
                } else if (list.price <= 600) {
                    priceRanges['501-600'] += 1;
                } else if (list.price <= 700) {
                    priceRanges['601-700'] += 1;
                } else if (list.price <= 800) {
                    priceRanges['701-800'] += 1;
                } else if (list.price <= 900) {
                    priceRanges['801-900'] += 1;
                } else {
                    priceRanges['901-above'] += 1;
                }
            }
        });

        // Send the price ranges data as a JSON response
        res.json(priceRanges);
    } catch (error) {
        console.error("Error fetching data:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});
app.get('/api/pie-chart', async (req, res) => {
    const { month } = req.query; // e.g., '01' for January

    if (!month) {
        return res.status(400).json({ message: 'Month is required' });
    }

    try {
        const categories = await Listing.aggregate([
            {
                $addFields: {
                    dateOfSaleDate: {
                        $dateFromString: {
                            dateString: '$dateOfSale'
                        }
                    }
                }
            },
            {
                $match: {
                    $expr: {
                        $eq: [{ $month: '$dateOfSaleDate' }, parseInt(month)]
                    }
                }
            },
            {
                $group: {
                    _id: '$category', // Group by category
                    itemCount: { $sum: 1 } // Count items in each category
                }
            },
            {
                $project: {
                    _id: 0, // Exclude the default _id field
                    category: '$_id', // Rename _id to category
                    itemCount: 1 // Include the item count
                }
            }
        ]);

        res.json(categories);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});
app.get('/api/combined-data', async (req, res) => {
    const { month } = req.query;
  
    if (!month) {
        return res.status(400).json({ message: 'Month is required' });
    }
  
    try {
        // Fetch data from the three APIs
        const [barChartData, pieChartData, categoriesData] = await Promise.all([
            axios.get(`http://localhost:8080/api/bar-chart?month=${month}`),
            axios.get(`http://localhost:8080/api/pie-chart?month=${month}`),
        ]);
  
        // Combine the responses
        const combinedData = {
            barChart: barChartData.data,
            pieChart: pieChartData.data,
            
        };
  
        // Send the combined data as a JSON response
        res.json(combinedData);
    } catch (error) {
        console.error("Error fetching combined data:", error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
  });
// Start the server
app.listen(8080, () => {
    console.log("Server is listening on port 8080");
});

// Connect to MongoDB
main();

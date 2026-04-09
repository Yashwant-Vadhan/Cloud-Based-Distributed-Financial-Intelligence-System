const axios = require("axios");

const ML_SERVICE_URL = process.env.ML_SERVICE_URL;

const getPrediction = async (data) => {
    try {
        const response = await axios.post(
            `${ML_SERVICE_URL}/predict`,
            data
        );
        return response.data;
    } catch (error) {
        console.error("ML Service Error:", error.message);
        throw error;
    }
};

module.exports = { getPrediction };
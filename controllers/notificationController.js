const twilio = require("twilio");

const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

exports.sendWhatsApp = async (req, res) => {
    try {
        const { phoneNumber, message } = req.body;

        const response = await client.messages.create({
            body: message,
            from: `whatsapp:+${process.env.TWILIO_WHATSAPP_NUMBER}`,
            to: `whatsapp:+62${phoneNumber.replace(/^0/, "62")}`,
        });

        res.status(200).json({
            status: { code: 200, description: "OK" },
            data: {
                sid: response.sid,
                timestamp: response.dateCreated.toISOString(),
            },
        });
    } catch (error) {
        res.status(500).json({
            status: { code: 500, description: "Internal Server Error" },
            error: {
                message: "Failed to send WhatsApp message",
                detail: error.message,
            },
        });
    }
};

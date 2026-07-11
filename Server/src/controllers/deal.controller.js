import Deal from "../models/deal.model.js";

export const createDeal = async (req, res) => {
    try {
        const userId = req.id;
        const { startupName, logoUrl, industry, amount, equity, status, stage } = req.body;

        const deal = new Deal({
            userId,
            startupName,
            logoUrl: logoUrl || "https://images.pexels.com/photos/3184291/pexels-photo-3184291.jpeg",
            industry,
            amount,
            equity,
            status: status || 'Due Diligence',
            stage
        });

        await deal.save();
        return res.status(201).json({ success: true, deal });
    } catch (error) {
        console.error("Error creating deal:", error);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
};

export const getDeals = async (req, res) => {
    try {
        const userId = req.id;
        let deals = await Deal.find({ userId }).sort({ updatedAt: -1 });

        if (deals.length === 0) {
            const defaultDeals = [
                {
                    userId,
                    startupName: 'TechWave AI',
                    logoUrl: 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg',
                    industry: 'FinTech',
                    amount: '$1.5M',
                    equity: '15%',
                    status: 'Due Diligence',
                    stage: 'Series A'
                },
                {
                    userId,
                    startupName: 'GreenLife Solutions',
                    logoUrl: 'https://images.pexels.com/photos/614810/pexels-photo-614810.jpeg',
                    industry: 'CleanTech',
                    amount: '$2M',
                    equity: '20%',
                    status: 'Term Sheet',
                    stage: 'Seed'
                },
                {
                    userId,
                    startupName: 'HealthPulse',
                    logoUrl: 'https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg',
                    industry: 'HealthTech',
                    amount: '$800K',
                    equity: '12%',
                    status: 'Negotiation',
                    stage: 'Pre-seed'
                }
            ];

            await Deal.insertMany(defaultDeals);
            deals = await Deal.find({ userId }).sort({ updatedAt: -1 });
        }

        const formatted = deals.map(d => ({
            id: d._id.toString(),
            startup: {
                name: d.startupName,
                logo: d.logoUrl,
                industry: d.industry
            },
            amount: d.amount,
            equity: d.equity,
            status: d.status,
            stage: d.stage,
            lastActivity: d.updatedAt.toISOString()
        }));

        return res.status(200).json({ success: true, deals: formatted });
    } catch (error) {
        console.error("Error fetching deals:", error);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
};

export const updateDealStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;
        const userId = req.id;

        const deal = await Deal.findOneAndUpdate(
            { _id: id, userId },
            { $set: { status } },
            { new: true }
        );

        if (!deal) {
            return res.status(404).json({ success: false, message: "Deal not found or access denied" });
        }

        return res.status(200).json({ success: true, deal });
    } catch (error) {
        res.status(500).json({ success: false, message: "Internal server error" });
    }
};

export const deleteDeal = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.id;

        const deal = await Deal.findOneAndDelete({ _id: id, userId });
        if (!deal) {
            return res.status(404).json({ success: false, message: "Deal not found or access denied" });
        }

        return res.status(200).json({ success: true, message: "Deal deleted successfully" });
    } catch (error) {
        res.status(500).json({ success: false, message: "Internal server error" });
    }
};

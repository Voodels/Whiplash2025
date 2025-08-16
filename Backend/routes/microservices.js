import express from 'express';
import axios from 'axios';
import { authMiddleware } from '../middleware/auth.js';
import User from '../models/User.js';

const router = express.Router();

// Base URLs for microservices (override via env if needed)
const MCP_BASE_URL = process.env.MCP_BASE_URL || 'http://localhost:5101';

// Ensure all routes require auth
router.use(authMiddleware);

// Proxy: Generate plan via MCP server, injecting user's AI API key
router.post('/generate-plan', async (req, res) => {
	try {
		const userId = req.user.id;
		const user = await User.findById(userId);
		if (!user) return res.status(404).json({ success: false, message: 'User not found' });

		const apiKey = user.aiConfig?.apiKey;
		const provider = user.aiConfig?.provider || 'gemini';
		const model = user.aiConfig?.model || 'gemini-1.5-pro-latest';

		if (!apiKey) {
			return res.status(400).json({ success: false, message: 'No API key configured for this user' });
		}

		// Forward payload and inject api_key + provider/model for downstream services
		const payload = {
			...req.body,
			api_key: apiKey,
			provider,
			model,
		};

		const { data } = await axios.post(`${MCP_BASE_URL}/generate_plan`, payload, {
			headers: { 'Content-Type': 'application/json' },
			timeout: 300000,
		});
		res.json(data);
	} catch (err) {
		const status = err.response?.status || 500;
		const details = err.response?.data || err.message;
		res.status(status).json({ success: false, message: 'Failed to generate plan', details });
	}
});

export default router;

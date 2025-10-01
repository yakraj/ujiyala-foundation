import app from '../src/server.js';
import { connectDB } from '../src/configs/db.js';

let isConnected = false;

const ensureDB = async () => {
	if (!isConnected) {
		await connectDB();
		isConnected = true;
	}
};

export default async function handler(req, res) {
	await ensureDB();
	return app(req, res);
}
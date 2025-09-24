import { Response, Request } from "express";
import { register } from '../metrics';

export const getPromMetrics = async (req: Request, res: Response) => {
    try {
        res.set('Content-Type', register.contentType);
        res.end(await register.metrics());
    } catch (error: any) {
        return res.json({
            status: 500,
            message: error.message,
        });
    }
};
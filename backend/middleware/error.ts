import { Request, Response, NextFunction } from 'express';

const errorHandler = (err: Error, req: Request, res: Response, next: NextFunction) => {
    res.status(500).json({ msg: err.message });
    return;
};

export default errorHandler;
import { Response } from "express";

const successResponse = ({
    res,
    message,
    data,
    statusCode,
}: {
    res: Response;
    message?: string;
    data?: any;
    statusCode?: number;
}) => {
    return res.status(statusCode || 200).json({
        success: true,
        message: message || `Success`,
        data: data || null,
    });
};

const errorResponse = ({
    res,
    message,
    statusCode,
}: {
    res: Response;
    message?: string;
    statusCode?: number;
}) => {
    return res.status(statusCode || 500).json({
        success: false,
        message: message || `Internal Server Error`,
    });
};

export { errorResponse, successResponse };

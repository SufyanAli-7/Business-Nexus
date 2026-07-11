import jwt from 'jsonwebtoken';
import config from '../config/config.js';


 const authMiddleware = (req, res, next) => {

    try {
        const { token } = req.cookies;

        if (!token) {
            return res.status(401).json({message: 'Not Authorized Login again'});
        }

        const decoded = jwt.verify(token, config.JWT_SECRET);

        if (decoded.id) {
            req.id = decoded.id;
            req.role = decoded.role;
        } else {
            return res.status(401).json({message: 'Not Authorized Login again'});
        }

        next();

    }
        catch (error) {
        res.status(500).json({message: error.message});
    }

}    


export default authMiddleware;
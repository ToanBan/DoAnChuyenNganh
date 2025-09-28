const jwt = require("jsonwebtoken")
const {User} = require("../models");
const { where } = require("sequelize");
const VerifyAdmin = async(req, res, next) => {
    try {
        const token = req.cookies.token;
        const decoded = jwt.verify(token, process.env.ACCESS_TOKEN)
        if(!decoded){
            return res.json({
                message:"Xác thực không thành công"
            })
        }
        const userId = decoded.id;
        const userAdmin = await User.findOne({where:{id:userId}})
        if(userAdmin.role !== "admin"){
            return res.status(404).json({
                message:"Không tìm thấy trang"
            })
        }

        next();


    } catch (error) {
        console.error(error)
        return res.json({
            message:"internal server error"
        })
    }
}

module.exports = VerifyAdmin
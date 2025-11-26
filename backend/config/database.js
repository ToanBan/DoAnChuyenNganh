const { Sequelize } = require("sequelize");

const sequelize = new Sequelize(
  "smartlearn",  
  "root",        
  "0393146946",  
  {
    host: "localhost",
    dialect: "mysql",
    port: 3306,
    logging: false,

    define: {
      freezeTableName: true,  
      timestamps: false        
    }
  }
);

sequelize.authenticate()
  .then(() => console.log("Kết nối MySQL thành công!"))
  .catch(err => console.error("Lỗi kết nối MySQL:", err));

module.exports = sequelize;

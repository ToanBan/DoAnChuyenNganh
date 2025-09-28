const { User } = require("../models");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const sendMail = require("../lib/mail");
const redisClient = require("../lib/redis");
const { where } = require("sequelize");
const RegisterController = async (req, res) => {
  try {
    const { username, email, password, cfnpassword } = req.body;

    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    if (password != cfnpassword) {
      return res.status(400).json({ message: "Passwords do not match" });
    }

    const hassPassword = await bcrypt.hash(password, 10);

    const newUser = await User.create({
      username,
      email,
      password: hassPassword,
    });
    return res.status(200).json({ message: "User registered successfully" });
  } catch (error) {
    console.error("Error during registration:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

const LoginController = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return  res.status(400).json({ message: "Invalid credentials" });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(400).json({ message: "Invalid credentials" });
    }
    const token = jwt.sign(
      { id: user.id, username: user.username, email: user.email, role:user.role},
      process.env.ACCESS_TOKEN,
      { expiresIn: "1d" }
    );
    const refreshToken = jwt.sign(
      { id: user.id, username: user.username, email: user.email, role:user.role},
      process.env.REFRESH_TOKEN,
      { expiresIn: "7d" }
    );
    res.cookie("token", token, {
      httpOnly: true,
      secure: false,
      sameSite: "Lax",
      path: "/",
    });
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: false,
      sameSite: "Lax",
      path: "/",
    });
    return res.status(200).json({ message: user.role });
  } catch (error) {
    console.error("Error during login:", error);
    return res.status(401).json({ message: "Internal server error" });
  }
};

const GetAuthencationUser = async (req, res) => {
  try {
    const token = req.cookies.token;
    if (!token) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN);
    const user = await User.findOne({ where: { id: decoded.id } });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    return res.status(200).json({
      message: user,
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

const LogoutController = async (req, res) => {
  try {
    res.clearCookie("token");
    res.clearCookie("refreshToken");
    return res.status(200).json({ message: "Logout successful" });
  } catch (error) {
    console.error("Error during logout:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

const RefreshTokenController = async (req, res) => {
  try {
    const refreshToken = req.cookies.refreshToken;
    if (!refreshToken) return res.sendStatus(401);
    const decodedeToken = jwt.verify(refreshToken, process.env.REFRESH_TOKEN);
    if (!decodedeToken) return res.sendStatus(403);
    const newAccessToken = jwt.sign(
      {
        id: decodedeToken.id,
        username: decodedeToken.username,
        email: decodedeToken.email,
        role:decodedeToken.role
      },
      process.env.ACCESS_TOKEN,
      { expiresIn: "30m" }
    );
    res.cookie("token", newAccessToken, {
      httpOnly: true,
      secure: false,
      sameSite: "Lax",
      path: "/",
    });
    return res.status(200).json({ message: newAccessToken });
  } catch (err) {
    return res.status(500).json({ message: "Token Expired" });
  }
};

const ForgotAccountController = async (req, res) => {
  const { email } = req.body;
  const user = await User.findOne({ where: { email } });
  if (!email) {
    return res.status(400).json({ message: "Email không được để trống" });

  }

  if (user.length < 1) {
    return res.status(400).json({ message: "Không Tìm Thấy Người Dùng" });
  }
  const token = jwt.sign(
    { id: user.id, username: user.username, email: user.email },
    process.env.ACCESS_TOKEN,
    { expiresIn: "30m" }
  );
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  await redisClient.set("email", email);
  await redisClient.set(`otp:${email}`, otp, {
    EX: 300,
  });
  await redisClient.set("step", "forgot", { EX: 300 });
  await sendMail(
    email,
    "Mã OTP của bạn",
    `Ma OTP để đặt lại mật khẩu là ${otp}`
  );

  return res.status(200).json({
    message: "Gửi OTP thành công",
    otp,
  });
};

const VerifyOTPController = async (req, res) => {
  try {
    const { otp } = req.body;
    const email = await redisClient.get("email");
    const storedOtp = await redisClient.get(`otp:${email}`);
    if (otp !== storedOtp) {
      return  res.status(400).json({ message: "Invalid OTP" });
    }
    await redisClient.set("step", "verified", { EX: 300 });
    await redisClient.del(`otp:${email}`);
    return res.status(200).json({ message: "Successfully verified OTP" });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

const ResetPasswordController = async (req, res) => {
  try {
    const email = await redisClient.get("email");
    const user = await User.findOne({ where: { email } });
    const { password, confirmPassword } = req.body;
    if (password != confirmPassword) {
      return res.status(500).json({
        message: "Password is not match",
      });
    }

    const hashPassword = await bcrypt.hash(password, 10);
    await User.update({ password: hashPassword }, { where: { email } });
    await redisClient.del("step");
    await redisClient.del("email");
    return res.status(200).json({
      message: "Updated successfully",
    });
  } catch (err) {
    console.error(err);
    return;
  }
};

const CheckStepForgotController = async (req, res) => {
  try {
    const step = await redisClient.get("step");
    return res.status(200).json({
      message: step,
    });
  } catch (error) {
    console.error(error);
    return;
  }
};

const RedirectGoogleLoginController = async (req, res) => {
  try {
    const redirectUri = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${process.env.GOOGLE_CLIENT_ID}&redirect_uri=${process.env.GOOGLE_REDIRECT_URI}&response_type=code&scope=openid%20email%20profile`;
    return res.status(200).json({
      message: redirectUri,
    });
  } catch (error) {
    console.error(error);
    return;
  }
};

const GetDataLoginGoogleController = async (req, res) => {
  const code = req.query.code;

  try {
    const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        code,
        client_id: process.env.GOOGLE_CLIENT_ID,
        client_secret: process.env.GOOGLE_CLIENT_SECRET,
        redirect_uri: process.env.GOOGLE_REDIRECT_URI,
        grant_type: "authorization_code",
      }),
    });

    if (!tokenRes.ok) throw new Error("Failed to fetch token");

    const tokenData = await tokenRes.json();
    const accessToken = tokenData.access_token;
    const userRes = await fetch(
      "https://www.googleapis.com/oauth2/v2/userinfo",
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    if (!userRes.ok) throw new Error("Failed to fetch user info");

    const userInfo = await userRes.json();
    const { name, email, picture } = userInfo;

    let user = await User.findOne({ where: { email } });

    if (!user) {
      const fakePassword = await bcrypt.hash(Date.now().toString(), 10); // dùng mật khẩu ảo
      user = await User.create({
        username: name,
        email: email,
        password: fakePassword,
      });
    }

    const token = jwt.sign(
      { id: user.id, username: user.username, email: user.email, role:user.role},
      process.env.ACCESS_TOKEN,
      { expiresIn: "30m" }
    );

    const refreshToken = jwt.sign(
      { id: user.id, username: user.username, email: user.email, role:user.role},
      process.env.REFRESH_TOKEN,
      { expiresIn: "7d" }
    );

    res.cookie("token", token, {
      httpOnly: true,
      secure: false,
      sameSite: "Lax",
      path: "/",
    });

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: false,
      sameSite: "Lax",
      path: "/",
    });

    res.redirect("http://localhost:3000");
  } catch (error) {
    console.error("Google OAuth error:", error.message);
    return res.status(500).send("Authentication failed");
  }
};

const EditProfileController = async (req, res) => {
  try {
    const token = req.cookies.token;
    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN);
    if (!decoded) {
      return res.status(401).json({
        message: "Xác thực không thành công",
      });
    }
    const userId = await decoded.id;
    const { username, address, description } = req.body;
    const profileImage = req.file;
    let avatar = null;
    if (profileImage) {
      avatar = profileImage.filename;
    }

    const user = await User.findOne({
      where: {
        id: userId,
      },
    });

    if (user) {
      await User.update(
        {
          username: username || user.username,
          address: address || user.address,
          description: description || user.description,
          avatar: avatar || user.avatar,
        },
        {
          where: { id: userId },
        }
      );
    }

    return res.status(200).json({
      message: "Chỉnh Sửa Thông Tin Thành Công",
      profileImage, avatar
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: "Lỗi Server",
    });
  }
};

const CheckRoleUser = async(req, res) => {
  try{
    const token = req.headers.authorization?.split(' ')[1];
    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN);
    const user = await User.findOne({where:{id:decoded.id}})
    return res.status(200).json({
      message:user.role
    })
  }catch(error){
    console.error(error)
  }
}


module.exports = {
  RedirectGoogleLoginController,
  RegisterController,
  LoginController,
  GetAuthencationUser,
  LogoutController,
  RefreshTokenController,
  ForgotAccountController,
  VerifyOTPController,
  ResetPasswordController,
  CheckStepForgotController,
  GetDataLoginGoogleController,
  EditProfileController,
  CheckRoleUser
};

import { Router } from "express";
import { signupController } from "../../controllers/auth/signup.controller";
import { loginController } from "../../controllers/auth/login.controller";
import { refreshController } from "../../controllers/auth/refreshToken.controller";
import { logoutController } from "../../controllers/auth/logout.controller";
import { verifyOtpController } from "../../controllers/auth/verifyOtp.controller";
import { forgetPasswordController } from "../../controllers/auth/forgetPassword.controller";
import { setNewPasswordController } from "../../controllers/auth/setNewPassword.controller";

const router = Router();

router.post("/signup", signupController);
router.post("/login", loginController);
router.post("/refresh", refreshController);   // body: { refreshToken }
router.post("/logout", logoutController);     // body: { refreshToken }
router.post("/verify", verifyOtpController);
router.post("/forget" , forgetPasswordController);
router.post("/set-new-password", setNewPasswordController);
export default router;

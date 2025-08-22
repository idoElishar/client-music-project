import * as React from "react";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";
import axios, { AxiosError } from "axios";
import { useNavigate } from "react-router-dom";
import { IconButton, InputAdornment } from "@mui/material";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import { validateEmail,validatePassword } from "../../utilities/Utilities";

const API_BASE = import.meta.env.VITE_API_URL



export default function LogIn() {
  const navigate = useNavigate();

  const [userData, setUserData] = React.useState({
    email: (() => {
      try {
        const ls = localStorage.getItem("email");
        return ls ? JSON.parse(ls) : "";
      } catch {
        return "";
      }
    })(),
    password: "",
  });

  const [showPassword, setShowPassword] = React.useState(false);
  const [status, setStatus] = React.useState("");
  const [loading, setLoading] = React.useState(false);

  const emailValid = validateEmail(userData.email);
  const passwordValid = validatePassword(userData.password);
  const formValid = emailValid && passwordValid;

  const setField = (key) => (e) => {
    const value = e.target.value;
    setUserData((prev) => ({ ...prev, [key]: key === "email" ? value.trim() : value }));
    if (status) setStatus(""); 
  };

  const submit = async () => {
    if (!formValid || loading) return;

    setLoading(true);
    setStatus("");

    try {
      const { data } = await axios.post(`${API_BASE}/users/login`, userData);

      localStorage.setItem("username", JSON.stringify(data.user.username));
      localStorage.setItem("token", JSON.stringify(data.token));
      localStorage.setItem("userId", JSON.stringify(data.user._id));
      localStorage.setItem("email", JSON.stringify(userData.email));

      navigate("/grid");
    } catch (error) {
      if (error instanceof AxiosError) {
        setStatus(error.response?.data?.message || "Login failed. Please try again.");
      } else {
        setStatus("Unexpected error. Please try again.");
      }
      console.error("Error during login:", error);
    } finally {
      setLoading(false);
    }
  };

  const goToRegistration = () => navigate("/signUp");

  const handleKeyDown = (e) => {
    if (e.key === "Enter") submit();
  };

  return (
    <Dialog
      open
      sx={{
        backgroundImage:
        "url(https://th-thumbnailer.cdn-si-edu.com/LnGaL4gm29hXr9b0zInWL7hvI-k=/1026x684/https://tf-cmsv2-smithsonianmag-media.s3.amazonaws.com/filer_public/f2/02/f202eca9-7743-4fd4-92fb-f1e3d9188e1e/gettyimages-157185630.jpg)",
        backgroundSize: "cover",
      }}
    >
      <DialogTitle>Log in</DialogTitle>

      <DialogContent>
        <DialogContentText>To log in, please enter your email and password.</DialogContentText>

        <TextField
          value={userData.email}
          onChange={setField("email")}
          margin="dense"
          id="email"
          label="Email Address"
          type="email"
          fullWidth
          variant="standard"
          required
          autoFocus
          error={!!userData.email && !emailValid}
          helperText={userData.email && !emailValid ? "מייל לא תקין" : " "}
        />

        <TextField
          value={userData.password}
          onChange={setField("password")}
          onKeyDown={handleKeyDown}
          margin="dense"
          id="password"
          label="Password"
          type={showPassword ? "text" : "password"}
          fullWidth
          variant="standard"
          required
          error={!!userData.password && !passwordValid}
          helperText={userData.password && !passwordValid ? "סיסמא לא תקינה" : " "}
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <IconButton
                  aria-label="toggle password visibility"
                  onClick={() => setShowPassword((s) => !s)}
                  edge="end"
                >
                  {showPassword ? <VisibilityOff /> : <Visibility />}
                </IconButton>
              </InputAdornment>
            ),
          }}
        />
      </DialogContent>

      {status && (
        <DialogContentText sx={{ color: "red", px: 3, pb: 0 }}>{status}</DialogContentText>
      )}

      <DialogActions>
        <Button onClick={goToRegistration} disabled={loading}>
          go to Sign Up
        </Button>
        <Button onClick={submit} disabled={!formValid || loading}>
          {loading ? "Signing in..." : "Sign in"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

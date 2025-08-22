import * as React from "react";
import {
  Button,
  TextField,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  IconButton,
  InputAdornment,
  Alert,
  Collapse,
} from "@mui/material";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { validateEmail, validatePassword } from "../../utilities/Utilities";

const API_BASE = import.meta.env.VITE_API_URL


export default function SignUp() {
  const navigate = useNavigate();

  const [user, setUser] = React.useState({
    username: "",
    email: "",
    password: "",
    isAdmin: false, 
  });
  const [passwordVerification, setPasswordVerification] = React.useState("");
  const [showPassword, setShowPassword] = React.useState(false);
  const [generalError, setGeneralError] = React.useState("");
  const [successMessage, setSuccessMessage] = React.useState("");
  const [isSuccess, setIsSuccess] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const [errorMessages, setErrorMessages] = React.useState({
    username: "",
    email: "",
    password: "",
    passwordVerification: "",
  });

  const emailValid = validateEmail(user.email);
  const passwordValid = validatePassword(user.password);
  const passwordsMatch = user.password === passwordVerification;
  const usernameValid = user.username.trim().length > 0;
  const formValid = emailValid && passwordValid && passwordsMatch && usernameValid;

  const setField =
    (key) =>
    (e) => {
      const value = e.target.value;
      setUser((prev) => ({ ...prev, [key]: key === "username" ? value : value.trim() }));
      if (generalError) setGeneralError("");
      setSuccessMessage("");
      setIsSuccess(false);
    };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") handleRegistration();
  };

  const handleRegistration = async () => {
    const newErrors = {
      username: usernameValid ? "" : "Username is required",
      email: emailValid ? "" : "Invalid email format",
      password: passwordValid
        ? ""
        : "Password must be at least 7 chars, include lower/upper case and a digit",
      passwordVerification: passwordsMatch ? "" : "Password verification does not match",
    };
    setErrorMessages(newErrors);
    setGeneralError("");
    setSuccessMessage("");
    setIsSuccess(false);

    if (!formValid || loading) return;

    try {
      setLoading(true);
      await axios.post(`${API_BASE}/users/register`, user);
      localStorage.setItem("email", JSON.stringify(user.email));
      setSuccessMessage("Sign-up successful!");
      setIsSuccess(true);
      navigate("/grid");
    } catch (err) {
      const message =
        (axios.isAxiosError(err) && err.response?.data?.message) ||
        "An error occurred during registration";
      setGeneralError(message);
    } finally {
      setLoading(false);
    }
  };

  const goToLogIn = () => navigate("/");

  return (
    <Dialog
      open
      sx={{
        backgroundImage:
          "url(https://th-thumbnailer.cdn-si-edu.com/LnGaL4gm29hXr9b0zInWL7hvI-k=/1026x684/https://tf-cmsv2-smithsonianmag-media.s3.amazonaws.com/filer_public/f2/02/f202eca9-7743-4fd4-92fb-f1e3d9188e1e/gettyimages-157185630.jpg)",
        backgroundSize: "cover",
      }}
    >
      <DialogTitle>Sign up</DialogTitle>
      <DialogContent>
        <DialogContentText>
          To register please enter email and password.
        </DialogContentText>

        <Collapse in={Boolean(generalError)} unmountOnExit>
          <Alert severity="error" sx={{ mt: 1, mb: 2 }}>
            {generalError}
          </Alert>
        </Collapse>

        <Collapse in={isSuccess && Boolean(successMessage)} unmountOnExit>
          <Alert severity="success" sx={{ mt: 1, mb: 2 }}>
            {successMessage}
          </Alert>
        </Collapse>

        <TextField
          value={user.username}
          onChange={setField("username")}
          autoFocus
          margin="dense"
          id="username"
          label="User name"
          type="text"
          fullWidth
          variant="standard"
          required
          error={Boolean(errorMessages.username)}
          helperText={errorMessages.username || " "}
          onKeyDown={handleKeyDown}
        />

        <TextField
          value={user.email}
          onChange={setField("email")}
          margin="dense"
          id="email"
          label="Email address"
          type="email"
          fullWidth
          variant="standard"
          required
          error={Boolean(errorMessages.email)}
          helperText={errorMessages.email || " "}
          onKeyDown={handleKeyDown}
        />

        <TextField
          value={user.password}
          onChange={setField("password")}
          margin="dense"
          id="password"
          label="Enter a password"
          type={showPassword ? "text" : "password"}
          fullWidth
          variant="standard"
          required
          error={Boolean(errorMessages.password)}
          helperText={errorMessages.password || " "}
          onKeyDown={handleKeyDown}
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <IconButton onClick={() => setShowPassword((s) => !s)} edge="end">
                  {showPassword ? <VisibilityOff /> : <Visibility />}
                </IconButton>
              </InputAdornment>
            ),
          }}
        />

        <TextField
          value={passwordVerification}
          onChange={(e) => {
            setPasswordVerification(e.target.value);
            if (generalError) setGeneralError("");
            setSuccessMessage("");
            setIsSuccess(false);
          }}
          margin="dense"
          id="passwordVerification"
          label="Confirm password"
          type={showPassword ? "text" : "password"}
          fullWidth
          variant="standard"
          required
          error={Boolean(errorMessages.passwordVerification)}
          helperText={errorMessages.passwordVerification || " "}
          onKeyDown={handleKeyDown}
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <IconButton onClick={() => setShowPassword((s) => !s)} edge="end">
                  {showPassword ? <VisibilityOff /> : <Visibility />}
                </IconButton>
              </InputAdornment>
            ),
          }}
        />
      </DialogContent>

      <DialogActions>
        <Button onClick={goToLogIn} disabled={loading}>
          Go to login
        </Button>
        <Button onClick={handleRegistration} disabled={!formValid || loading}>
          {loading ? "Signing up..." : "Sign Up"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

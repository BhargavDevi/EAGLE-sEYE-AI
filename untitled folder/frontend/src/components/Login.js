import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Paper,
  TextField,
  Button,
  Typography,
  Box,
  ToggleButtonGroup,
  ToggleButton,
  Alert,
  useTheme,
  alpha,
  InputAdornment,
} from '@mui/material';
import {
  School,
  Person,
  AccountCircle,
  Lock,
  Error as ErrorIcon,
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import axios from 'axios';


const Login = ({ setUser }) => {
  const theme = useTheme();
  const navigate = useNavigate();
  const [role, setRole] = useState('student');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [subject, setSubject] = useState('');
  const [error, setError] = useState('');

  const subjects = [
    'Mathematics',
    'Physics',
    'Chemistry',
    'Biology',
    'Computer Science',
    'History',
    'Geography',
    'Literature',
    'Economics'
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (role === 'student' && !subject) {
        setError('Please select a subject');
        return;
      }

      const response = await axios.post('http://localhost:5001/api/login', {
        username,
        password,
        role,
        subject: role === 'student' ? subject : undefined,
      });

      if (response.data.success) {
        setUser(response.data.user);
        navigate(`/${role}`);
      } else {
        setError(response.data.message);
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
    }
  };

  return (
    <Container component="main" maxWidth="sm">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Box
          sx={{
            marginTop: 4,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
          }}
        >

          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Typography 
              component="h1" 
              variant="h2" 
              sx={{ 
                mt: 2,
                mb: 4,
                fontWeight: 800,
                letterSpacing: 1,
                background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                color: 'transparent',
                textAlign: 'center',
                textTransform: 'uppercase',
                fontFamily: '"Montserrat", sans-serif',
                textShadow: `2px 2px 4px ${alpha(theme.palette.primary.main, 0.2)}`,
              }}
            >
              EagleEye
            </Typography>
          </motion.div>

          <Paper
            elevation={3}
            sx={{
              padding: 4,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              width: '100%',
              background: `linear-gradient(135deg, ${alpha(theme.palette.background.paper, 0.9)}, ${alpha(theme.palette.background.paper, 0.95)})`,
              backdropFilter: 'blur(10px)',
              border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
              borderRadius: 2,
            }}
          >
            <Typography component="h2" variant="h5" sx={{ mb: 3 }}>
              Sign In
            </Typography>

            {error && (
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                style={{ width: '100%' }}
              >
                <Alert 
                  severity="error" 
                  icon={<ErrorIcon />}
                  sx={{ 
                    mb: 2,
                    borderRadius: 2,
                    border: `1px solid ${alpha(theme.palette.error.main, 0.1)}`,
                    '& .MuiAlert-icon': {
                      color: theme.palette.error.main
                    }
                  }}
                >
                  {error}
                </Alert>
              </motion.div>
            )}

            <ToggleButtonGroup
              color="primary"
              value={role}
              exclusive
              onChange={(e, newRole) => {
                if (newRole) {
                  setRole(newRole);
                  setSubject(''); // Reset subject when role changes
                }
              }}
              sx={{ 
                mb: 3,
                '& .MuiToggleButton-root': {
                  px: 3,
                  py: 1,
                  borderRadius: '20px !important',
                  mx: 0.5,
                  '&.Mui-selected': {
                    background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.primary.dark})`,
                    color: 'white',
                    boxShadow: `0 4px 10px ${alpha(theme.palette.primary.main, 0.25)}`,
                  },
                },
              }}
            >
              <ToggleButton value="student">
                <Person sx={{ mr: 1 }} /> Student
              </ToggleButton>
              <ToggleButton value="teacher">
                <School sx={{ mr: 1 }} /> Teacher
              </ToggleButton>
            </ToggleButtonGroup>

            {role === 'student' && (
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                style={{ width: '100%', marginBottom: '24px' }}
              >
                <TextField
                  select
                  fullWidth
                  label="Subject"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  variant="outlined"
                  required
                  SelectProps={{
                    native: true,
                  }}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2,
                    }
                  }}
                >
                  <option value="">Select a subject</option>
                  {subjects.map((sub) => (
                    <option key={sub} value={sub}>
                      {sub}
                    </option>
                  ))}
                </TextField>
              </motion.div>
            )}

            <form onSubmit={handleSubmit} style={{ width: '100%' }}>
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: 0.2 }}
                style={{ width: '100%' }}
              >
                <TextField
                  variant="outlined"
                  margin="normal"
                  required
                  fullWidth
                  label="Username"
                  autoFocus
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <AccountCircle sx={{ color: alpha(theme.palette.primary.main, 0.7) }} />
                      </InputAdornment>
                    ),
                  }}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2,
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        backgroundColor: alpha(theme.palette.primary.main, 0.02),
                      },
                      '&.Mui-focused': {
                        backgroundColor: alpha(theme.palette.primary.main, 0.05),
                        '& .MuiInputAdornment-root': {
                          color: theme.palette.primary.main,
                        },
                      },
                    },
                  }}
                />
              </motion.div>
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: 0.3 }}
                style={{ width: '100%' }}
              >
                <TextField
                  variant="outlined"
                  margin="normal"
                  required
                  fullWidth
                  label="Password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Lock sx={{ color: alpha(theme.palette.primary.main, 0.7) }} />
                      </InputAdornment>
                    ),
                  }}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2,
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        backgroundColor: alpha(theme.palette.primary.main, 0.02),
                      },
                      '&.Mui-focused': {
                        backgroundColor: alpha(theme.palette.primary.main, 0.05),
                        '& .MuiInputAdornment-root': {
                          color: theme.palette.primary.main,
                        },
                      },
                    },
                  }}
                />
              </motion.div>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.4 }}
                style={{ width: '100%' }}
              >
                <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  color="primary"
                  sx={{ 
                    mt: 3, 
                    mb: 2,
                    py: 1.5,
                    background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                    borderRadius: '30px',
                    textTransform: 'none',
                    fontSize: '1.1rem',
                    fontWeight: 600,
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      background: `linear-gradient(45deg, ${theme.palette.primary.dark}, ${theme.palette.secondary.dark})`,
                      boxShadow: `0 6px 20px ${alpha(theme.palette.primary.main, 0.4)}`,
                      transform: 'translateY(-2px)',
                    },
                    '&:active': {
                      transform: 'translateY(0)',
                    },
                  }}
                >
                  Sign In
                </Button>
              </motion.div>
            </form>
          </Paper>
        </Box>
      </motion.div>
    </Container>
  );
};

export default Login;

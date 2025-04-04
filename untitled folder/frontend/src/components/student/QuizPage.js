import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container,
  Paper,
  Typography,
  Button,
  Box,
  Grid,
  LinearProgress,
  Radio,
  RadioGroup,
  FormControlLabel,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  alpha,
  useTheme,
} from '@mui/material';
import {
  Timer,
  NavigateNext,
  NavigateBefore,
  Send,
  Warning,
  Videocam,
} from '@mui/icons-material';
import Webcam from 'react-webcam';
import { motion } from 'framer-motion';
import axios from 'axios';

const QuizPage = () => {
  const theme = useTheme();
  const { id } = useParams();
  const navigate = useNavigate();
  const webcamRef = useRef(null);
  const [quiz, setQuiz] = useState(null);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState(null);
  const [warnings, setWarnings] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showWarningDialog, setShowWarningDialog] = useState(false);
  const [warningCount, setWarningCount] = useState(0);

  // Proctoring state
  const [isTabActive, setIsTabActive] = useState(true);
  const [mouseOutCount, setMouseOutCount] = useState(0);
  const [keyPressPattern, setKeyPressPattern] = useState([]);
  const lastKeyPress = useRef(Date.now());

  useEffect(() => {
    // Fetch quiz data
    const fetchQuiz = async () => {
      try {
        const response = await axios.get(`http://localhost:5001/api/quiz/${id}`);
        setQuiz(response.data);
        setTimeLeft(response.data.duration * 60); // Convert minutes to seconds
      } catch (error) {
        console.error('Error fetching quiz:', error);
      }
    };

    fetchQuiz();
  }, [id]);

  // Timer countdown
  useEffect(() => {
    if (timeLeft === null) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          handleSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft]);

  // Proctoring: Tab visibility
  useEffect(() => {
    const handleVisibilityChange = () => {
      const isVisible = !document.hidden;
      setIsTabActive(isVisible);
      if (!isVisible) {
        logProctorEvent('tab_switch');
        addWarning('Tab switch detected');
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, []);

  // Proctoring: Mouse tracking
  useEffect(() => {
    const handleMouseLeave = () => {
      setMouseOutCount((prev) => {
        const newCount = prev + 1;
        if (newCount % 3 === 0) {
          logProctorEvent('mouse_leave');
          addWarning('Suspicious mouse movement detected');
        }
        return newCount;
      });
    };

    document.addEventListener('mouseleave', handleMouseLeave);
    return () => document.removeEventListener('mouseleave', handleMouseLeave);
  }, []);

  // Proctoring: Keystroke analysis
  useEffect(() => {
    const handleKeyPress = (e) => {
      const now = Date.now();
      const timeSinceLastPress = now - lastKeyPress.current;
      lastKeyPress.current = now;

      setKeyPressPattern((prev) => {
        const newPattern = [...prev, timeSinceLastPress].slice(-10);
        
        // Detect irregular patterns
        if (newPattern.length === 10) {
          const avg = newPattern.reduce((a, b) => a + b) / newPattern.length;
          const irregular = newPattern.some(time => Math.abs(time - avg) > 1000);
          
          if (irregular) {
            logProctorEvent('irregular_keystrokes');
            addWarning('Irregular keystroke pattern detected');
          }
        }
        
        return newPattern;
      });
    };

    document.addEventListener('keypress', handleKeyPress);
    return () => document.removeEventListener('keypress', handleKeyPress);
  }, []);

  // Proctoring: Video monitoring
  const captureFrame = async () => {
    if (webcamRef.current) {
      const imageSrc = webcamRef.current.getScreenshot();
      // Send frame to backend for analysis
      try {
        const response = await axios.post('http://localhost:5000/api/proctor/analyze-frame', {
          frame: imageSrc,
          quizId: id,
        });
        
        if (response.data.suspicious) {
          logProctorEvent('suspicious_behavior');
          addWarning('Suspicious behavior detected');
        }
      } catch (error) {
        console.error('Error analyzing frame:', error);
      }
    }
  };

  useEffect(() => {
    const frameInterval = setInterval(captureFrame, 5000); // Capture frame every 5 seconds
    return () => clearInterval(frameInterval);
  }, []);

  const logProctorEvent = async (eventType, details = {}) => {
    try {
      await axios.post('http://localhost:5000/api/proctor/log', {
        quizId: id,
        eventType,
        details,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      console.error('Error logging proctor event:', error);
    }
  };

  const addWarning = (message) => {
    setWarnings((prev) => [...prev, { message, timestamp: new Date() }]);
    setWarningCount((prev) => {
      const newCount = prev + 1;
      if (newCount >= 3) {
        setShowWarningDialog(true);
      }
      return newCount;
    });
  };

  const handleAnswer = (value) => {
    setAnswers((prev) => ({
      ...prev,
      [currentQuestion]: value,
    }));
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const response = await axios.post(`http://localhost:5000/api/quiz/${id}/submit`, {
        answers,
        proctorLogs: warnings,
      });
      navigate(`/student/results/${id}`);
    } catch (error) {
      console.error('Error submitting quiz:', error);
    }
  };

  if (!quiz) return <Typography>Loading...</Typography>;

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <Grid container spacing={3}>
          {/* Quiz Content */}
          <Grid item xs={12} md={8}>
            <Paper
              elevation={3}
              sx={{
                p: 4,
                background: `linear-gradient(135deg, ${alpha(theme.palette.background.paper, 0.9)}, ${alpha(theme.palette.background.paper, 0.95)})`,
                backdropFilter: 'blur(10px)',
                border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
                borderRadius: 3,
              }}
              component={motion.div}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              {/* Timer */}
              <Box 
                sx={{ 
                  mb: 4,
                  p: 3,
                  background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.05)}, ${alpha(theme.palette.secondary.main, 0.05)})`,
                  borderRadius: 2,
                }}
              >
                <Typography 
                  variant="h6"
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1,
                    color: theme.palette.primary.main,
                    fontWeight: 600,
                  }}
                >
                  <Timer />
                  Time Remaining: {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}
                </Typography>
                <LinearProgress
                  variant="determinate"
                  value={(timeLeft / (quiz.duration * 60)) * 100}
                  sx={{ 
                    mt: 2,
                    height: 8,
                    borderRadius: 4,
                    backgroundColor: alpha(theme.palette.primary.main, 0.1),
                    '& .MuiLinearProgress-bar': {
                      borderRadius: 4,
                      background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                    }
                  }}
                />
              </Box>

              {/* Question */}
              <Typography 
                variant="h5" 
                sx={{ 
                  mb: 2,
                  fontWeight: 600,
                  color: theme.palette.primary.main,
                }}
              >
                Question {currentQuestion + 1} of {quiz.questions.length}
              </Typography>
              <Typography 
                variant="body1" 
                sx={{ 
                  mb: 4,
                  fontSize: '1.1rem',
                  lineHeight: 1.6,
                  color: theme.palette.text.primary,
                }}
              >
                {quiz.questions[currentQuestion].questionText}
              </Typography>

              {/* Options */}
              <RadioGroup
                value={answers[currentQuestion] || ''}
                onChange={(e) => handleAnswer(e.target.value)}
                sx={{
                  '& .MuiFormControlLabel-root': {
                    mb: 2,
                  },
                  '& .MuiRadio-root': {
                    color: alpha(theme.palette.primary.main, 0.6),
                    '&.Mui-checked': {
                      color: theme.palette.primary.main,
                    },
                  },
                }}
              >
                {quiz.questions[currentQuestion].options.map((option, index) => (
                  <FormControlLabel
                    key={index}
                    value={option}
                    control={<Radio />}
                    label={<Typography sx={{ fontSize: '1rem' }}>{option}</Typography>}
                  />
                ))}
              </RadioGroup>

              {/* Navigation */}
              <Box sx={{ mt: 4, display: 'flex', justifyContent: 'space-between', gap: 2 }}>
                <Button
                  variant="contained"
                  disabled={currentQuestion === 0}
                  onClick={() => setCurrentQuestion((prev) => prev - 1)}
                  startIcon={<NavigateBefore />}
                  sx={{
                    borderRadius: '20px',
                    px: 3,
                    py: 1,
                    background: currentQuestion === 0 ? 'none' : `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                    textTransform: 'none',
                    fontWeight: 600,
                    '&:hover': {
                      background: currentQuestion === 0 ? 'none' : `linear-gradient(45deg, ${theme.palette.primary.dark}, ${theme.palette.secondary.dark})`,
                      boxShadow: currentQuestion === 0 ? 'none' : `0 4px 12px ${alpha(theme.palette.primary.main, 0.3)}`,
                    },
                  }}
                >
                  Previous
                </Button>
                {currentQuestion === quiz.questions.length - 1 ? (
                  <Button
                    variant="contained"
                    onClick={handleSubmit}
                    disabled={isSubmitting}
                    endIcon={<Send />}
                    sx={{
                      borderRadius: '20px',
                      px: 3,
                      py: 1,
                      background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                      textTransform: 'none',
                      fontWeight: 600,
                      '&:hover': {
                        background: `linear-gradient(45deg, ${theme.palette.primary.dark}, ${theme.palette.secondary.dark})`,
                        boxShadow: `0 4px 12px ${alpha(theme.palette.primary.main, 0.3)}`,
                      },
                    }}
                  >
                    Submit Quiz
                  </Button>
                ) : (
                  <Button
                    variant="contained"
                    onClick={() => setCurrentQuestion((prev) => prev + 1)}
                    endIcon={<NavigateNext />}
                    sx={{
                      borderRadius: '20px',
                      px: 3,
                      py: 1,
                      background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                      textTransform: 'none',
                      fontWeight: 600,
                      '&:hover': {
                        background: `linear-gradient(45deg, ${theme.palette.primary.dark}, ${theme.palette.secondary.dark})`,
                        boxShadow: `0 4px 12px ${alpha(theme.palette.primary.main, 0.3)}`,
                      },
                    }}
                  >
                    Next
                  </Button>
                )}
              </Box>
            </Paper>
          </Grid>

          {/* Proctoring Panel */}
          <Grid item xs={12} md={4}>
            <Paper 
              elevation={3} 
              sx={{ 
                p: 3,
                background: `linear-gradient(135deg, ${alpha(theme.palette.background.paper, 0.9)}, ${alpha(theme.palette.background.paper, 0.95)})`,
                backdropFilter: 'blur(10px)',
                border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
                borderRadius: 3,
              }}
              component={motion.div}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <Typography 
                variant="h6" 
                gutterBottom
                sx={{
                  fontWeight: 600,
                  color: theme.palette.primary.main,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1,
                  mb: 3
                }}
              >
                <Videocam /> Proctoring Feed
              </Typography>
              <Box sx={{ mb: 2 }}>
                <Webcam
                  ref={webcamRef}
                  audio={false}
                  screenshotFormat="image/jpeg"
                  videoConstraints={{
                    width: 320,
                    height: 240,
                    facingMode: "user"
                  }}
                  style={{ width: '100%' }}
                />
              </Box>
              {warnings.length > 0 && (
                <Alert 
                  severity="warning" 
                  icon={<Warning />}
                  sx={{ 
                    mb: 2,
                    borderRadius: 2,
                    '& .MuiAlert-icon': {
                      color: theme.palette.warning.main
                    }
                  }}
                >
                  {warnings.length} warning(s) detected
                </Alert>
              )}
            </Paper>
          </Grid>
        </Grid>

        {/* Warning Dialog */}
        <Dialog 
          open={showWarningDialog}
          PaperProps={{
            sx: {
              borderRadius: 3,
              boxShadow: `0 8px 32px ${alpha(theme.palette.primary.main, 0.2)}`,
            }
          }}
        >
          <DialogTitle sx={{ 
            pb: 1,
            background: `linear-gradient(135deg, ${alpha(theme.palette.error.main, 0.05)}, ${alpha(theme.palette.error.light, 0.05)})`,
          }}>
            <Typography variant="h6" sx={{ 
              fontWeight: 600,
              color: theme.palette.error.main,
              display: 'flex',
              alignItems: 'center',
              gap: 1
            }}>
              <Warning /> Warning: Multiple Violations Detected
            </Typography>
          </DialogTitle>
          <DialogContent sx={{ 
            mt: 2,
            minWidth: 400,
            background: `linear-gradient(135deg, ${alpha(theme.palette.error.main, 0.02)}, ${alpha(theme.palette.error.light, 0.02)})`,
          }}>
            <Typography sx={{ fontSize: '1.1rem', lineHeight: 1.6 }}>
              Multiple violations have been detected. This incident will be reported.
              Further violations may result in automatic submission of your quiz.
            </Typography>
          </DialogContent>
          <DialogActions sx={{ 
            p: 3,
            background: `linear-gradient(135deg, ${alpha(theme.palette.error.main, 0.05)}, ${alpha(theme.palette.error.light, 0.05)})`,
          }}>
            <Button 
              onClick={() => setShowWarningDialog(false)}
              variant="contained"
              sx={{
                borderRadius: '20px',
                px: 3,
                py: 1,
                background: `linear-gradient(45deg, ${theme.palette.error.main}, ${theme.palette.error.dark})`,
                textTransform: 'none',
                fontWeight: 600,
                '&:hover': {
                  background: `linear-gradient(45deg, ${theme.palette.error.dark}, ${theme.palette.error.main})`,
                  boxShadow: `0 4px 12px ${alpha(theme.palette.error.main, 0.3)}`,
                },
              }}
            >
              I Understand
            </Button>
          </DialogActions>
        </Dialog>
      </motion.div>
    </Container>
  );
};

export default QuizPage;

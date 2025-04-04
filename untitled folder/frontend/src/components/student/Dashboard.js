import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Grid,
  Paper,
  Typography,
  Button,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Box,
  alpha,
  useTheme,
} from '@mui/material';
import {
  PlayArrow,
  Assessment,
  Person,
  Videocam,
  Mic,
  Speed,
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import axios from 'axios';

const Dashboard = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const [quizzes, setQuizzes] = useState([]);
  const [completedQuizzes, setCompletedQuizzes] = useState([]);

  useEffect(() => {
    // Fetch available quizzes and completed quizzes
    const fetchQuizzes = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/student/quizzes');
        setQuizzes(response.data.available || []);
        setCompletedQuizzes(response.data.completed || []);
      } catch (error) {
        console.error('Error fetching quizzes:', error);
      }
    };

    fetchQuizzes();
  }, []);

  const startQuiz = (quizId) => {
    navigate(`/student/quiz/${quizId}`);
  };

  const viewResults = (quizId) => {
    navigate(`/student/results/${quizId}`);
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Box sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          mb: 4,
          background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.05)}, ${alpha(theme.palette.secondary.main, 0.05)})`,
          p: 3,
          borderRadius: 3,
          boxShadow: `0 4px 20px ${alpha(theme.palette.primary.main, 0.1)}`
        }}>
          <Typography
            variant="h4"
            component="h1"
            sx={{
              fontWeight: 700,
              background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              color: 'transparent',
              display: 'flex',
              alignItems: 'center',
              gap: 2
            }}
          >
            <Person sx={{ fontSize: 40, color: theme.palette.primary.main }} />
            Student Dashboard
          </Typography>
        </Box>

        <Grid container spacing={3}>
          {/* Available Quizzes */}
          <Grid item xs={12} md={6}>
            <Paper
              elevation={3}
              sx={{
                p: 2,
                display: 'flex',
                flexDirection: 'column',
                height: 400,
              }}
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
                <PlayArrow /> Available Quizzes
              </Typography>
              <List sx={{ overflow: 'auto', flex: 1 }}>
                {quizzes.map((quiz) => (
                  <ListItem key={quiz.id}>
                    <ListItemText
                      primary={
                        <Typography variant="h6" sx={{ fontWeight: 600, color: theme.palette.primary.main }}>
                          {quiz.title}
                        </Typography>
                      }
                      secondary={
                        <Typography variant="body2" sx={{ color: theme.palette.text.secondary, mt: 0.5 }}>
                          Duration: {quiz.duration} minutes
                        </Typography>
                      }
                    />
                    <ListItemSecondaryAction>
                      <IconButton
                        edge="end"
                        color="primary"
                        onClick={() => startQuiz(quiz.id)}
                      >
                        <PlayArrow />
                      </IconButton>
                    </ListItemSecondaryAction>
                  </ListItem>
                ))}
              </List>
            </Paper>
          </Grid>

          {/* Completed Quizzes */}
          <Grid item xs={12} md={6}>
            <Paper
              elevation={3}
              sx={{
                p: 2,
                display: 'flex',
                flexDirection: 'column',
                height: 400,
              }}
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
                <Assessment /> Completed Quizzes
              </Typography>
              <List sx={{ overflow: 'auto', flex: 1 }}>
                {completedQuizzes.map((quiz) => (
                  <ListItem key={quiz.id}>
                    <ListItemText
                      primary={quiz.title}
                      secondary={`Score: ${quiz.score}%`}
                    />
                    <ListItemSecondaryAction>
                      <IconButton
                        edge="end"
                        color="secondary"
                        onClick={() => viewResults(quiz.id)}
                      >
                        <Assessment />
                      </IconButton>
                    </ListItemSecondaryAction>
                  </ListItem>
                ))}
              </List>
            </Paper>
          </Grid>

          {/* System Requirements Check */}
          <Grid item xs={12}>
            <Paper elevation={3} sx={{ p: 2, mt: 2 }}>
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
                <Speed /> System Requirements Check
              </Typography>
              <Box sx={{ display: 'flex', gap: 3, mt: 3 }}>
                <Button
                  variant="contained"
                  startIcon={<Videocam />}
                  onClick={() => {/* Implement system check */}}
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
                  Check Camera
                </Button>
                <Button
                  variant="contained"
                  startIcon={<Mic />}
                  onClick={() => {/* Implement system check */}}
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
                  Check Microphone
                </Button>
                <Button
                  variant="contained"
                  startIcon={<Speed />}
                  onClick={() => {/* Implement system check */}}
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
                  Check Internet Speed
                </Button>
              </Box>
            </Paper>
          </Grid>
        </Grid>
      </motion.div>
    </Container>
  );
};

export default Dashboard;

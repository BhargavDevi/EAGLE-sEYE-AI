import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import {
  Container,
  Paper,
  Typography,
  Box,
  CircularProgress,
  List,
  ListItem,
  ListItemText,
  Chip,
  Divider,
  Grid,
} from '@mui/material';
import {
  CheckCircle,
  Cancel,
  TrendingUp,
  School,
  Timer,
  Grade,
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import axios from 'axios';

const ResultsPage = () => {
  const { id } = useParams();
  const [results, setResults] = useState(null);
  const [aiAnalysis, setAiAnalysis] = useState(null);

  useEffect(() => {
    fetchResults();
  }, [id]);

  const fetchResults = async () => {
    try {
      const response = await axios.get(`http://localhost:5000/api/quiz/${id}/results`);
      setResults(response.data.results);
      setAiAnalysis(response.data.aiAnalysis);
    } catch (error) {
      console.error('Error fetching results:', error);
    }
  };

  if (!results) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100vh',
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* Score Overview */}
        <Paper
          elevation={3}
          sx={{
            p: 3,
            mb: 3,
            background: 'linear-gradient(45deg, #1A237E 30%, #3949AB 90%)',
            color: 'white',
          }}
        >
          <Grid container spacing={3} alignItems="center">
            <Grid item xs={12} md={6}>
              <Typography variant="h4" gutterBottom>
                Quiz Results
              </Typography>
              <Typography variant="h6">
                Score: {results.score}%
              </Typography>
              <Typography variant="subtitle1">
                Time Taken: {results.timeTaken} minutes
              </Typography>
            </Grid>
            <Grid item xs={12} md={6}>
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                }}
              >
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{
                    type: 'spring',
                    stiffness: 260,
                    damping: 20,
                  }}
                >
                  <CircularProgress
                    variant="determinate"
                    value={results.score}
                    size={120}
                    thickness={4}
                    sx={{
                      color: 'white',
                      '& .MuiCircularProgress-circle': {
                        strokeLinecap: 'round',
                      },
                    }}
                  />
                  <Typography
                    variant="h4"
                    component="div"
                    sx={{
                      position: 'absolute',
                      top: '50%',
                      left: '50%',
                      transform: 'translate(-50%, -50%)',
                    }}
                  >
                    {results.score}%
                  </Typography>
                </motion.div>
              </Box>
            </Grid>
          </Grid>
        </Paper>

        <Grid container spacing={3}>
          {/* Question Review */}
          <Grid item xs={12} md={8}>
            <Paper elevation={3} sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Question Review
              </Typography>
              <List>
                {results.questions.map((question, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <ListItem>
                      <ListItemText
                        primary={
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <Typography variant="subtitle1">
                              {index + 1}. {question.text}
                            </Typography>
                            {question.correct ? (
                              <CheckCircle
                                color="success"
                                sx={{ ml: 1 }}
                              />
                            ) : (
                              <Cancel color="error" sx={{ ml: 1 }} />
                            )}
                          </Box>
                        }
                        secondary={
                          <Box sx={{ mt: 1 }}>
                            <Typography
                              component="span"
                              variant="body2"
                              color="text.primary"
                            >
                              Your answer: {question.userAnswer}
                            </Typography>
                            {!question.correct && (
                              <Typography
                                component="span"
                                variant="body2"
                                color="success.main"
                                sx={{ display: 'block' }}
                              >
                                Correct answer: {question.correctAnswer}
                              </Typography>
                            )}
                          </Box>
                        }
                      />
                    </ListItem>
                    {index < results.questions.length - 1 && <Divider />}
                  </motion.div>
                ))}
              </List>
            </Paper>
          </Grid>

          {/* AI Analysis */}
          <Grid item xs={12} md={4}>
            <Paper elevation={3} sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                AI-Powered Analysis
              </Typography>
              <Box sx={{ mb: 3 }}>
                <Typography variant="subtitle1" gutterBottom>
                  Performance Metrics
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                  <Chip
                    icon={<Timer />}
                    label={`Avg. Time: ${aiAnalysis.avgTimePerQuestion}s`}
                    color="primary"
                  />
                  <Chip
                    icon={<Grade />}
                    label={`Accuracy: ${aiAnalysis.accuracy}%`}
                    color="secondary"
                  />
                  <Chip
                    icon={<School />}
                    label={`Difficulty: ${aiAnalysis.difficulty}`}
                    color="default"
                  />
                </Box>
              </Box>

              <Box sx={{ mb: 3 }}>
                <Typography variant="subtitle1" gutterBottom>
                  Strengths
                </Typography>
                <List dense>
                  {aiAnalysis.strengths.map((strength, index) => (
                    <ListItem key={index}>
                      <ListItemText
                        primary={strength}
                        primaryTypographyProps={{
                          variant: 'body2',
                          color: 'success.main',
                        }}
                      />
                    </ListItem>
                  ))}
                </List>
              </Box>

              <Box>
                <Typography variant="subtitle1" gutterBottom>
                  Areas for Improvement
                </Typography>
                <List dense>
                  {aiAnalysis.improvements.map((improvement, index) => (
                    <ListItem key={index}>
                      <ListItemText
                        primary={improvement}
                        primaryTypographyProps={{
                          variant: 'body2',
                          color: 'error.main',
                        }}
                      />
                    </ListItem>
                  ))}
                </List>
              </Box>

              <Box sx={{ mt: 3 }}>
                <Typography variant="subtitle1" gutterBottom>
                  Recommended Resources
                </Typography>
                <List dense>
                  {aiAnalysis.recommendations.map((rec, index) => (
                    <ListItem key={index}>
                      <ListItemText
                        primary={rec.title}
                        secondary={rec.description}
                        primaryTypographyProps={{
                          variant: 'body2',
                          color: 'primary.main',
                        }}
                      />
                    </ListItem>
                  ))}
                </List>
              </Box>
            </Paper>
          </Grid>
        </Grid>
      </motion.div>
    </Container>
  );
};

export default ResultsPage;

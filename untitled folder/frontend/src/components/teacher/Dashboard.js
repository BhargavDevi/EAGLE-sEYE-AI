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
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  alpha,
  useTheme,
} from '@mui/material';
import {
  Add,
  Edit,
  Delete,
  Warning,
  Assessment,
  School,
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import axios from 'axios';

const TeacherDashboard = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const [quizzes, setQuizzes] = useState([]);
  const [activeQuizzes, setActiveQuizzes] = useState([]);
  const [selectedQuiz, setSelectedQuiz] = useState(null);
  const [showQuizDialog, setShowQuizDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [newQuizTitle, setNewQuizTitle] = useState('');
  const [newQuizDuration, setNewQuizDuration] = useState('');
  const [subject, setSubject] = useState('');
  const [aiSuggestions, setAiSuggestions] = useState([]);
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);
  const [questions, setQuestions] = useState([]);
  const [difficulty, setDifficulty] = useState('medium');
  const [topic, setTopic] = useState('');
  const [questionType, setQuestionType] = useState('multiple-choice');
  const [questionMetadata, setQuestionMetadata] = useState(null);
  
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

  const getAiSuggestions = async () => {
    setIsLoadingSuggestions(true);
    try {
      const response = await axios.post('http://localhost:5001/api/generate-questions', {
        subject,
        numberOfQuestions: 5,
        difficulty,
        topic: topic || undefined,
        questionType
      });
      
      if (response.data.success) {
        setAiSuggestions(response.data.questions);
        setQuestions(response.data.questions);
        setQuestionMetadata(response.data.metadata);
      } else {
        console.error('Failed to generate questions:', response.data.message);
      }
    } catch (error) {
      console.error('Error getting AI suggestions:', error);
    } finally {
      setIsLoadingSuggestions(false);
    }
  };

  useEffect(() => {
    fetchQuizzes();
    const interval = setInterval(fetchActiveQuizzes, 5000); // Poll for active quizzes
    return () => clearInterval(interval);
  }, []);

  const fetchQuizzes = async () => {
    try {
      const response = await axios.get('http://localhost:5001/api/teacher/quizzes');
      setQuizzes(response.data);
    } catch (error) {
      console.error('Error fetching quizzes:', error);
    }
  };

  const fetchActiveQuizzes = async () => {
    try {
      const response = await axios.get('http://localhost:5001/api/teacher/active-quizzes');
      setActiveQuizzes(response.data);
    } catch (error) {
      console.error('Error fetching active quizzes:', error);
    }
  };

  const handleCreateQuiz = async () => {
    try {
      if (!subject || !newQuizTitle || !newQuizDuration) {
        console.error('Please fill in all required fields');
        return;
      }

      await axios.post('http://localhost:5001/api/teacher/quizzes', {
        title: newQuizTitle,
        subject: subject,
        duration: parseInt(newQuizDuration),
        questions: questions,
        teacher_id: 1 // Replace with actual teacher ID from login
      });

      setShowQuizDialog(false);
      setNewQuizTitle('');
      setNewQuizDuration('');
      setSubject('');
      setQuestions([]);
      setAiSuggestions([]);
      fetchQuizzes();
    } catch (error) {
      console.error('Error creating quiz:', error);
    }
  };

  const handleDeleteQuiz = async () => {
    try {
      await axios.delete(`http://localhost:5001/api/teacher/quizzes/${selectedQuiz.id}`);
      setShowDeleteDialog(false);
      setSelectedQuiz(null);
      fetchQuizzes();
    } catch (error) {
      console.error('Error deleting quiz:', error);
    }
  };

  const handleEditQuiz = (quiz) => {
    navigate(`/teacher/questions/${quiz.id}`);
  };

  const handleViewResults = (quiz) => {
    navigate(`/teacher/results/${quiz.id}`);
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
            <School sx={{ fontSize: 40, color: theme.palette.primary.main }} />
            Teacher Dashboard
          </Typography>
          <Button
            variant="contained"
            onClick={() => setShowQuizDialog(true)}
            sx={{
              background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
              px: 3,
              py: 1.5,
              borderRadius: '30px',
              fontSize: '1rem',
              fontWeight: 600,
              textTransform: 'none',
              boxShadow: `0 4px 10px ${alpha(theme.palette.primary.main, 0.3)}`,
              '&:hover': {
                background: `linear-gradient(45deg, ${theme.palette.primary.dark}, ${theme.palette.secondary.dark})`,
                boxShadow: `0 6px 15px ${alpha(theme.palette.primary.main, 0.4)}`,
              },
            }}
          >
            <Add sx={{ mr: 1 }} /> Create New Quiz
          </Button>
        </Box>

        <Grid container spacing={3}>
          {/* Active Quizzes */}
          <Grid item xs={12}>
            <Paper elevation={3} sx={{ p: 2 }}>
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
                <Assessment /> Active Quizzes
              </Typography>
              <List>
                {activeQuizzes.map((quiz) => (
                  <ListItem key={quiz.id}>
                    <ListItemText
                      primary={
                        <Typography variant="h6" sx={{ fontWeight: 600, color: theme.palette.primary.main }}>
                          {quiz.title}
                        </Typography>
                      }
                      secondary={
                        <Typography variant="body2" sx={{ color: theme.palette.text.secondary, mt: 0.5 }}>
                          {quiz.activeStudents} students currently taking quiz
                        </Typography>
                      }
                    />
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      {quiz.violations > 0 && (
                        <Chip
                          icon={<Warning />}
                          label={`${quiz.violations} violations`}
                          color="error"
                          sx={{ 
                            borderRadius: '20px',
                            '& .MuiChip-icon': {
                              color: theme.palette.error.main,
                            },
                          }}
                        />
                      )}
                      <Button
                        variant="contained"
                        onClick={() => navigate(`/teacher/monitor/${quiz.id}`)}
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
                        Monitor Live
                      </Button>
                    </Box>
                  </ListItem>
                ))}
              </List>
            </Paper>
          </Grid>

          {/* All Quizzes */}
          <Grid item xs={12}>
            <Paper elevation={3} sx={{ p: 2 }}>
              <Typography variant="h6" gutterBottom>
                All Quizzes
              </Typography>
              <List>
                {quizzes.map((quiz) => (
                  <ListItem key={quiz.id}>
                    <ListItemText
                      primary={quiz.title}
                      secondary={`Duration: ${quiz.duration} minutes | Questions: ${quiz.questionCount}`}
                    />
                    <ListItemSecondaryAction>
                      <IconButton
                        edge="end"
                        onClick={() => handleEditQuiz(quiz)}
                        sx={{ mr: 1 }}
                      >
                        <Edit />
                      </IconButton>
                      <IconButton
                        edge="end"
                        onClick={() => handleViewResults(quiz)}
                        sx={{ mr: 1 }}
                      >
                        <Assessment />
                      </IconButton>
                      <IconButton
                        edge="end"
                        onClick={() => {
                          setSelectedQuiz(quiz);
                          setShowDeleteDialog(true);
                        }}
                      >
                        <Delete />
                      </IconButton>
                    </ListItemSecondaryAction>
                  </ListItem>
                ))}
              </List>
            </Paper>
          </Grid>
        </Grid>

        {/* Create Quiz Dialog */}
        <Dialog 
          open={showQuizDialog} 
          onClose={() => setShowQuizDialog(false)}
          PaperProps={{
            sx: {
              borderRadius: 3,
              boxShadow: `0 8px 32px ${alpha(theme.palette.primary.main, 0.2)}`,
            }
          }}
        >
          <DialogTitle sx={{ 
            pb: 1,
            background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.05)}, ${alpha(theme.palette.secondary.main, 0.05)})`,
          }}>
            <Typography variant="h5" component="div" sx={{ 
              fontWeight: 600,
              color: theme.palette.primary.main,
              display: 'flex',
              alignItems: 'center',
              gap: 1
            }}>
              <Add /> Create New Quiz
            </Typography>
          </DialogTitle>
          <DialogContent sx={{ 
            mt: 2,
            minWidth: 600,
            maxHeight: 600,
            overflowY: 'auto',
            background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.02)}, ${alpha(theme.palette.secondary.main, 0.02)})`,
          }}>
            <Grid container spacing={2} sx={{ mb: 3 }}>
              <Grid item xs={12} sm={6}>
                <TextField
                  select
                  fullWidth
                  label="Subject"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  variant="outlined"
                  SelectProps={{
                    native: true,
                  }}
                >
                  <option value="">Select a subject</option>
                  {subjects.map((sub) => (
                    <option key={sub} value={sub}>
                      {sub}
                    </option>
                  ))}
                </TextField>
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Specific Topic (Optional)"
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  variant="outlined"
                  placeholder="e.g., World War II, Algebra"
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  select
                  fullWidth
                  label="Difficulty Level"
                  value={difficulty}
                  onChange={(e) => setDifficulty(e.target.value)}
                  variant="outlined"
                  SelectProps={{
                    native: true,
                  }}
                >
                  <option value="easy">Easy</option>
                  <option value="medium">Medium</option>
                  <option value="hard">Hard</option>
                </TextField>
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  select
                  fullWidth
                  label="Question Type"
                  value={questionType}
                  onChange={(e) => setQuestionType(e.target.value)}
                  variant="outlined"
                  SelectProps={{
                    native: true,
                  }}
                >
                  <option value="multiple-choice">Multiple Choice</option>
                  <option value="true-false">True/False</option>
                </TextField>
              </Grid>
            </Grid>

            <TextField
              autoFocus
              margin="dense"
              label="Quiz Title"
              fullWidth
              value={newQuizTitle}
              onChange={(e) => setNewQuizTitle(e.target.value)}
              variant="outlined"
              sx={{ 
                mb: 3,
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                }
              }}
            />

            <TextField
              margin="dense"
              label="Duration (minutes)"
              type="number"
              fullWidth
              value={newQuizDuration}
              onChange={(e) => setNewQuizDuration(e.target.value)}
              variant="outlined"
              sx={{ 
                mb: 3,
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                }
              }}
            />

            <Button
              variant="contained"
              onClick={getAiSuggestions}
              disabled={!subject || isLoadingSuggestions}
              sx={{
                mb: 3,
                borderRadius: '20px',
                px: 3,
                py: 1,
                background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                textTransform: 'none',
                fontWeight: 600,
              }}
            >
              {isLoadingSuggestions ? 'Generating Questions...' : 'Get AI Suggestions'}
            </Button>

            {aiSuggestions.length > 0 && (
              <Box sx={{ mb: 3 }}>
                {questionMetadata && (
                  <Box sx={{ 
                    mb: 3, 
                    p: 2, 
                    borderRadius: 2,
                    bgcolor: alpha(theme.palette.primary.main, 0.05),
                    border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`
                  }}>
                    <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 600 }}>
                      Question Set Information
                    </Typography>
                    <Grid container spacing={2}>
                      <Grid item xs={6} sm={3}>
                        <Typography variant="body2" color="textSecondary">Subject:</Typography>
                        <Typography variant="body1">{questionMetadata.subject}</Typography>
                      </Grid>
                      {questionMetadata.topic && (
                        <Grid item xs={6} sm={3}>
                          <Typography variant="body2" color="textSecondary">Topic:</Typography>
                          <Typography variant="body1">{questionMetadata.topic}</Typography>
                        </Grid>
                      )}
                      <Grid item xs={6} sm={3}>
                        <Typography variant="body2" color="textSecondary">Difficulty:</Typography>
                        <Chip 
                          label={questionMetadata.difficulty}
                          size="small"
                          color={{
                            easy: 'success',
                            medium: 'primary',
                            hard: 'error'
                          }[questionMetadata.difficulty]}
                          sx={{ mt: 0.5 }}
                        />
                      </Grid>
                      <Grid item xs={6} sm={3}>
                        <Typography variant="body2" color="textSecondary">Type:</Typography>
                        <Typography variant="body1">
                          {questionMetadata.questionType === 'multiple-choice' ? 'Multiple Choice' : 'True/False'}
                        </Typography>
                      </Grid>
                    </Grid>
                  </Box>
                )}
                <Typography variant="h6" sx={{ mb: 2 }}>
                  Suggested Questions
                </Typography>
                {questions.map((question, index) => (
                  <Box
                    key={index}
                    sx={{
                      mb: 2,
                      p: 2,
                      borderRadius: 2,
                      border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
                    }}
                  >
                    <Box sx={{ mb: 2 }}>
                      <TextField
                        fullWidth
                        multiline
                        rows={2}
                        value={question.questionText}
                        onChange={(e) => {
                          const newQuestions = [...questions];
                          newQuestions[index].questionText = e.target.value;
                          setQuestions(newQuestions);
                        }}
                        variant="outlined"
                        label={`Question ${index + 1}`}
                        sx={{ mb: 1 }}
                      />
                      <Box sx={{ 
                        display: 'flex', 
                        gap: 1, 
                        mb: 1,
                        alignItems: 'center'
                      }}>
                        <Chip 
                          label={`Difficulty: ${question.difficulty}`}
                          size="small"
                          color={{
                            easy: 'success',
                            medium: 'primary',
                            hard: 'error'
                          }[question.difficulty]}
                        />
                        <Chip 
                          label={`Level: ${question.cognitiveLevel}`}
                          size="small"
                          color="secondary"
                        />
                      </Box>
                    </Box>
                    {question.options.map((option, optionIndex) => (
                      <TextField
                        key={optionIndex}
                        fullWidth
                        value={option}
                        onChange={(e) => {
                          const newQuestions = [...questions];
                          newQuestions[index].options[optionIndex] = e.target.value;
                          setQuestions(newQuestions);
                        }}
                        variant="outlined"
                        label={`Option ${optionIndex + 1}`}
                        sx={{ mb: 1 }}
                      />
                    ))}
                    <Box>
                      <TextField
                        fullWidth
                        value={question.correctAnswer}
                        onChange={(e) => {
                          const newQuestions = [...questions];
                          newQuestions[index].correctAnswer = e.target.value;
                          setQuestions(newQuestions);
                        }}
                        variant="outlined"
                        label="Correct Answer"
                        sx={{ mb: 1 }}
                      />
                      <TextField
                        fullWidth
                        multiline
                        rows={2}
                        value={question.explanation}
                        onChange={(e) => {
                          const newQuestions = [...questions];
                          newQuestions[index].explanation = e.target.value;
                          setQuestions(newQuestions);
                        }}
                        variant="outlined"
                        label="Explanation"
                        helperText="Explain why this is the correct answer"
                      />
                    </Box>
                  </Box>
                ))}
              </Box>
            )}
          </DialogContent>
          <DialogActions sx={{ 
            p: 3,
            background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.05)}, ${alpha(theme.palette.secondary.main, 0.05)})`,
          }}>
            <Button 
              onClick={() => setShowQuizDialog(false)}
              sx={{ 
                borderRadius: '20px',
                px: 3,
                textTransform: 'none',
                fontWeight: 500
              }}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleCreateQuiz} 
              variant="contained"
              sx={{
                borderRadius: '20px',
                px: 3,
                background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                textTransform: 'none',
                fontWeight: 600,
                '&:hover': {
                  background: `linear-gradient(45deg, ${theme.palette.primary.dark}, ${theme.palette.secondary.dark})`,
                  boxShadow: `0 4px 12px ${alpha(theme.palette.primary.main, 0.3)}`,
                },
              }}
            >
              Create Quiz
            </Button>
          </DialogActions>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <Dialog open={showDeleteDialog} onClose={() => setShowDeleteDialog(false)}>
          <DialogTitle>Delete Quiz</DialogTitle>
          <DialogContent>
            <Typography>
              Are you sure you want to delete "{selectedQuiz?.title}"? This action cannot be undone.
            </Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setShowDeleteDialog(false)}>Cancel</Button>
            <Button onClick={handleDeleteQuiz} color="error">
              Delete
            </Button>
          </DialogActions>
        </Dialog>
      </motion.div>
    </Container>
  );
};

export default TeacherDashboard;

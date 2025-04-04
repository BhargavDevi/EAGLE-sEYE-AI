import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container,
  Paper,
  Typography,
  Button,
  TextField,
  Box,
  List,
  ListItem,
  ListItemText,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  FormControlLabel,
  Radio,
  RadioGroup,
  Snackbar,
  Alert,
} from '@mui/material';
import { Add, Edit, Delete, Save } from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';

const QuestionManager = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [quiz, setQuiz] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [showQuestionDialog, setShowQuestionDialog] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [selectedQuestion, setSelectedQuestion] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  // New question form state
  const [questionText, setQuestionText] = useState('');
  const [options, setOptions] = useState(['', '', '', '']);
  const [correctAnswer, setCorrectAnswer] = useState('');

  useEffect(() => {
    fetchQuizData();
  }, [id]);

  const fetchQuizData = async () => {
    try {
      const response = await axios.get(`http://localhost:5000/api/teacher/quizzes/${id}`);
      setQuiz(response.data.quiz);
      setQuestions(response.data.questions);
    } catch (error) {
      console.error('Error fetching quiz data:', error);
      showSnackbar('Error loading quiz data', 'error');
    }
  };

  const handleAddQuestion = () => {
    setEditingQuestion(null);
    setQuestionText('');
    setOptions(['', '', '', '']);
    setCorrectAnswer('');
    setShowQuestionDialog(true);
  };

  const handleEditQuestion = (question) => {
    setEditingQuestion(question);
    setQuestionText(question.questionText);
    setOptions(question.options);
    setCorrectAnswer(question.correctAnswer);
    setShowQuestionDialog(true);
  };

  const handleDeleteQuestion = async () => {
    try {
      await axios.delete(
        `http://localhost:5000/api/teacher/questions/${selectedQuestion.id}`
      );
      setShowDeleteDialog(false);
      setSelectedQuestion(null);
      fetchQuizData();
      showSnackbar('Question deleted successfully');
    } catch (error) {
      console.error('Error deleting question:', error);
      showSnackbar('Error deleting question', 'error');
    }
  };

  const handleSaveQuestion = async () => {
    try {
      const questionData = {
        questionText,
        options,
        correctAnswer,
        quizId: id,
      };

      if (editingQuestion) {
        await axios.put(
          `http://localhost:5000/api/teacher/questions/${editingQuestion.id}`,
          questionData
        );
      } else {
        await axios.post(
          'http://localhost:5000/api/teacher/questions',
          questionData
        );
      }

      setShowQuestionDialog(false);
      fetchQuizData();
      showSnackbar(
        `Question ${editingQuestion ? 'updated' : 'added'} successfully`
      );
    } catch (error) {
      console.error('Error saving question:', error);
      showSnackbar('Error saving question', 'error');
    }
  };

  const handleOptionChange = (index, value) => {
    const newOptions = [...options];
    newOptions[index] = value;
    setOptions(newOptions);
  };

  const showSnackbar = (message, severity = 'success') => {
    setSnackbar({ open: true, message, severity });
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 4 }}>
          <Typography variant="h4" component="h1">
            Question Manager
          </Typography>
          <Button
            variant="contained"
            color="primary"
            startIcon={<Add />}
            onClick={handleAddQuestion}
          >
            Add Question
          </Button>
        </Box>

        <Paper elevation={3} sx={{ p: 2 }}>
          <List>
            <AnimatePresence>
              {questions.map((question, index) => (
                <motion.div
                  key={question.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.2 }}
                >
                  <ListItem
                    divider={index < questions.length - 1}
                    sx={{ display: 'flex', alignItems: 'flex-start' }}
                  >
                    <ListItemText
                      primary={
                        <Typography variant="subtitle1">
                          {index + 1}. {question.questionText}
                        </Typography>
                      }
                      secondary={
                        <Box sx={{ mt: 1 }}>
                          {question.options.map((option, i) => (
                            <Typography
                              key={i}
                              variant="body2"
                              color={
                                option === question.correctAnswer
                                  ? 'success.main'
                                  : 'text.secondary'
                              }
                            >
                              {String.fromCharCode(65 + i)}. {option}
                            </Typography>
                          ))}
                        </Box>
                      }
                    />
                    <Box>
                      <IconButton
                        onClick={() => handleEditQuestion(question)}
                        sx={{ mr: 1 }}
                      >
                        <Edit />
                      </IconButton>
                      <IconButton
                        onClick={() => {
                          setSelectedQuestion(question);
                          setShowDeleteDialog(true);
                        }}
                      >
                        <Delete />
                      </IconButton>
                    </Box>
                  </ListItem>
                </motion.div>
              ))}
            </AnimatePresence>
          </List>
        </Paper>

        {/* Question Dialog */}
        <Dialog
          open={showQuestionDialog}
          onClose={() => setShowQuestionDialog(false)}
          maxWidth="md"
          fullWidth
        >
          <DialogTitle>
            {editingQuestion ? 'Edit Question' : 'Add New Question'}
          </DialogTitle>
          <DialogContent>
            <TextField
              autoFocus
              margin="dense"
              label="Question Text"
              fullWidth
              multiline
              rows={2}
              value={questionText}
              onChange={(e) => setQuestionText(e.target.value)}
              sx={{ mb: 3 }}
            />

            <Typography variant="subtitle1" gutterBottom>
              Options
            </Typography>
            {options.map((option, index) => (
              <TextField
                key={index}
                margin="dense"
                label={`Option ${String.fromCharCode(65 + index)}`}
                fullWidth
                value={option}
                onChange={(e) => handleOptionChange(index, e.target.value)}
                sx={{ mb: 2 }}
              />
            ))}

            <FormControl component="fieldset" sx={{ mt: 2 }}>
              <Typography variant="subtitle1" gutterBottom>
                Correct Answer
              </Typography>
              <RadioGroup
                value={correctAnswer}
                onChange={(e) => setCorrectAnswer(e.target.value)}
              >
                {options.map((option, index) => (
                  <FormControlLabel
                    key={index}
                    value={option}
                    control={<Radio />}
                    label={`Option ${String.fromCharCode(65 + index)}`}
                    disabled={!option}
                  />
                ))}
              </RadioGroup>
            </FormControl>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setShowQuestionDialog(false)}>Cancel</Button>
            <Button
              onClick={handleSaveQuestion}
              color="primary"
              startIcon={<Save />}
              disabled={
                !questionText ||
                options.some((opt) => !opt) ||
                !correctAnswer
              }
            >
              Save
            </Button>
          </DialogActions>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <Dialog
          open={showDeleteDialog}
          onClose={() => setShowDeleteDialog(false)}
        >
          <DialogTitle>Delete Question</DialogTitle>
          <DialogContent>
            <Typography>
              Are you sure you want to delete this question? This action cannot be
              undone.
            </Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setShowDeleteDialog(false)}>Cancel</Button>
            <Button onClick={handleDeleteQuestion} color="error">
              Delete
            </Button>
          </DialogActions>
        </Dialog>

        {/* Snackbar for notifications */}
        <Snackbar
          open={snackbar.open}
          autoHideDuration={6000}
          onClose={handleCloseSnackbar}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        >
          <Alert
            onClose={handleCloseSnackbar}
            severity={snackbar.severity}
            sx={{ width: '100%' }}
          >
            {snackbar.message}
          </Alert>
        </Snackbar>
      </motion.div>
    </Container>
  );
};

export default QuestionManager;

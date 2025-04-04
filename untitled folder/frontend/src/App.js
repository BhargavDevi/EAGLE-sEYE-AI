import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import theme from './styles/theme';

// Components
import Login from './components/Login';
import StudentDashboard from './components/student/Dashboard';
import TeacherDashboard from './components/teacher/Dashboard';
import QuizPage from './components/student/QuizPage';
import ResultsPage from './components/student/ResultsPage';
import QuestionManager from './components/teacher/QuestionManager';



function App() {
  const [user, setUser] = React.useState(null);

  const PrivateRoute = ({ children, role }) => {
    if (!user) {
      return <Navigate to="/login" />;
    }
    if (role && user.role !== role) {
      return <Navigate to={`/${user.role}`} />;
    }
    return children;
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <Routes>
          <Route path="/login" element={<Login setUser={setUser} />} />
          
          <Route
            path="/student"
            element={
              <PrivateRoute role="student">
                <StudentDashboard />
              </PrivateRoute>
            }
          />
          
          <Route
            path="/student/quiz/:id"
            element={
              <PrivateRoute role="student">
                <QuizPage />
              </PrivateRoute>
            }
          />
          
          <Route
            path="/student/results/:id"
            element={
              <PrivateRoute role="student">
                <ResultsPage />
              </PrivateRoute>
            }
          />
          
          <Route
            path="/teacher"
            element={
              <PrivateRoute role="teacher">
                <TeacherDashboard />
              </PrivateRoute>
            }
          />
          
          <Route
            path="/teacher/questions"
            element={
              <PrivateRoute role="teacher">
                <QuestionManager />
              </PrivateRoute>
            }
          />
          
          <Route path="/" element={<Navigate to="/login" />} />
        </Routes>
      </Router>
    </ThemeProvider>
  );
}

export default App;

from flask import Flask, request, jsonify
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
from flask_login import LoginManager, UserMixin, login_user, logout_user, login_required
from werkzeug.security import generate_password_hash, check_password_hash
import os
import openai
from datetime import datetime

app = Flask(__name__)
CORS(app)

# Configuration
app.config['SECRET_KEY'] = os.urandom(24)
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///eagleeye.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

# OpenAI Configuration
openai.api_key = os.getenv('OPENAI_API_KEY')  # Set your API key in environment variables

# Initialize extensions
db = SQLAlchemy(app)
login_manager = LoginManager()
login_manager.init_app(app)

# Models
class User(UserMixin, db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    password_hash = db.Column(db.String(120), nullable=False)
    role = db.Column(db.String(20), nullable=False)  # 'student' or 'teacher'

class Quiz(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(100), nullable=False)
    subject = db.Column(db.String(50), nullable=False)
    duration = db.Column(db.Integer, nullable=False)  # in minutes
    created_by = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    created_at = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)
    questions = db.relationship('Question', backref='quiz', lazy=True)

class Question(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    quiz_id = db.Column(db.Integer, db.ForeignKey('quiz.id'), nullable=False)
    question_text = db.Column(db.Text, nullable=False)
    options = db.Column(db.JSON)
    correct_answer = db.Column(db.String(200), nullable=False)

class ProctorLog(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    quiz_id = db.Column(db.Integer, db.ForeignKey('quiz.id'), nullable=False)
    timestamp = db.Column(db.DateTime, nullable=False)
    event_type = db.Column(db.String(50), nullable=False)
    details = db.Column(db.JSON)

@login_manager.user_loader
def load_user(user_id):
    return User.query.get(int(user_id))

# AI Question Generation
def generate_quiz_questions(subject, difficulty='medium', topic=None, num_questions=5, question_type='multiple-choice'):
    try:
        system_prompt = """
You are an expert quiz generator specializing in creating educational assessments.
Generate questions that are clear, engaging, and appropriate for the specified difficulty level.
Each question should test different cognitive skills (recall, understanding, application, analysis).
Format your response as a list of dictionaries with the following structure:
{
    'questionText': 'The question text',
    'options': ['option1', 'option2', 'option3', 'option4'],
    'correctAnswer': 'The correct option',
    'explanation': 'Brief explanation of why this is the correct answer',
    'difficulty': 'easy/medium/hard',
    'cognitiveLevel': 'recall/understanding/application/analysis'
}
"""

        user_prompt = f"Generate {num_questions} {question_type} questions about {subject}"
        if topic:
            user_prompt += f" focusing on {topic}"
        user_prompt += f". Make them {difficulty} difficulty level."

        if question_type == 'multiple-choice':
            user_prompt += " Include 4 options for each question, with one correct answer."
        elif question_type == 'true-false':
            user_prompt += " Each question should have a clear true/false answer."

        response = openai.ChatCompletion.create(
            model="gpt-3.5-turbo",
            messages=[{
                "role": "system",
                "content": system_prompt
            }, {
                "role": "user",
                "content": user_prompt
            }],
            temperature=0.7,  # Add some creativity but maintain consistency
            max_tokens=2000,  # Allow for longer responses
            presence_penalty=0.6  # Encourage diverse questions
        )

        # Parse the response and format questions
        questions_text = response.choices[0].message.content
        try:
            questions = eval(questions_text)  # Be careful with eval in production!
            
            # Validate question format
            for q in questions:
                required_fields = ['questionText', 'options', 'correctAnswer', 'explanation', 'difficulty', 'cognitiveLevel']
                if not all(field in q for field in required_fields):
                    raise ValueError(f"Question missing required fields: {required_fields}")
                
                if question_type == 'multiple-choice' and len(q['options']) != 4:
                    raise ValueError("Multiple choice questions must have exactly 4 options")
                elif question_type == 'true-false' and q['options'] not in [['True', 'False'], ['False', 'True']]:
                    raise ValueError("True/False questions must have exactly 2 options: True and False")

            return questions

        except Exception as e:
            print(f"Error parsing questions: {e}")
            return None

    except Exception as e:
        print(f"Error generating questions: {e}")
        return None

# Routes
@app.route('/api/generate-questions', methods=['POST'])
@login_required
def generate_questions():
    data = request.get_json()
    subject = data.get('subject')
    num_questions = data.get('numberOfQuestions', 5)
    difficulty = data.get('difficulty', 'medium')
    topic = data.get('topic')
    question_type = data.get('questionType', 'multiple-choice')

    if not subject:
        return jsonify({'success': False, 'message': 'Subject is required'})

    if difficulty not in ['easy', 'medium', 'hard']:
        return jsonify({'success': False, 'message': 'Invalid difficulty level'})

    if question_type not in ['multiple-choice', 'true-false']:
        return jsonify({'success': False, 'message': 'Invalid question type'})

    questions = generate_quiz_questions(
        subject=subject,
        difficulty=difficulty,
        topic=topic,
        num_questions=num_questions,
        question_type=question_type
    )

    if questions:
        return jsonify({
            'success': True,
            'questions': questions,
            'metadata': {
                'subject': subject,
                'difficulty': difficulty,
                'topic': topic,
                'questionType': question_type,
                'totalQuestions': len(questions)
            }
        })
    return jsonify({'success': False, 'message': 'Failed to generate questions'})

@app.route('/api/login', methods=['POST'])
def login():
    data = request.get_json()
    user = User.query.filter_by(username=data['username']).first()
    if user and check_password_hash(user.password_hash, data['password']):
        login_user(user)
        return jsonify({
            'success': True,
            'user': {
                'id': user.id,
                'username': user.username,
                'role': user.role
            }
        })
    return jsonify({'success': False, 'message': 'Invalid credentials'})

@app.route('/api/register', methods=['POST'])
def register():
    data = request.get_json()
    if User.query.filter_by(username=data['username']).first():
        return jsonify({'success': False, 'message': 'Username already exists'})
    
    user = User(
        username=data['username'],
        password_hash=generate_password_hash(data['password']),
        role=data['role']
    )
    db.session.add(user)
    db.session.commit()
    return jsonify({'success': True})

@app.route('/api/teacher/quizzes', methods=['POST'])
@login_required
def create_quiz():
    data = request.get_json()
    quiz = Quiz(
        title=data['title'],
        subject=data['subject'],
        duration=data['duration'],
        created_by=data['teacher_id']
    )
    db.session.add(quiz)

    # Add questions
    for q_data in data.get('questions', []):
        question = Question(
            quiz_id=quiz.id,
            question_text=q_data['questionText'],
            options=q_data['options'],
            correct_answer=q_data['correctAnswer']
        )
        db.session.add(question)

    db.session.commit()
    return jsonify({'success': True, 'quiz_id': quiz.id})

@app.route('/api/proctor/log', methods=['POST'])
@login_required
def log_proctor_event():
    data = request.get_json()
    log = ProctorLog(
        user_id=data['user_id'],
        quiz_id=data['quiz_id'],
        timestamp=data['timestamp'],
        event_type=data['event_type'],
        details=data['details']
    )
    db.session.add(log)
    db.session.commit()
    return jsonify({'success': True})

# Create database tables and default users
def create_default_users():
    # Create a student account
    if not User.query.filter_by(username='student').first():
        student = User(
            username='student',
            password_hash=generate_password_hash('student123'),
            role='student'
        )
        db.session.add(student)

    # Create a teacher account
    if not User.query.filter_by(username='teacher').first():
        teacher = User(
            username='teacher',
            password_hash=generate_password_hash('teacher123'),
            role='teacher'
        )
        db.session.add(teacher)
    
    db.session.commit()

with app.app_context():
    db.create_all()
    create_default_users()

if __name__ == '__main__':
    app.run(debug=True, port=5001)

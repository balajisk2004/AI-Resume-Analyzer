# 🎯 AI Resume Analyzer & Job Match System

A full-stack AI-powered web application that analyzes resumes using Natural Language Processing (NLP), calculates ATS (Applicant Tracking System) scores, and intelligently matches candidates with suitable job opportunities.
---

## ✨ Features

### 🔐 User Authentication
- Secure JWT-based authentication
- User registration and login
- Password-protected routes
- Session management with refresh tokens

### 📄 Resume Management
- Upload resumes in PDF and DOCX formats
- Automatic resume parsing using NLP
- Extract skills, education, experience, and keywords
- Delete resumes with confirmation popup
- Manage multiple resumes per user

### 🤖 AI-Powered Analysis
- ATS Score Calculation (0-100%)
- Resume Quality Analysis
- Skill Gap Identification
- Personalized Recommendations

### 🎯 Intelligent Job Matching
- Hybrid matching algorithm:
  - **60%** Skills-based matching
  - **30%** Text similarity (TF-IDF + Cosine Similarity)
  - **10%** Experience-based matching
- Real-time match percentage display
- Matched and missing skills highlighting
- Job recommendations based on resume

### 💼 Job Management
- 150+ unique job listings across 13 domains
- 55+ Fresher jobs (0 years experience)
- Job search and filter functionality
- Detailed job view with modal popups
- Admin panel for CRUD operations

### 📊 Interactive Dashboard
- Total resumes uploaded
- Average match score
- Average ATS score
- Top job matches
- Resume management interface

### 🎨 Modern UI/UX
- Responsive design with Bootstrap 5
- Clean and intuitive interface
- Progress bars and visual indicators
- Modal popups for detailed views
- Color-coded match percentages

---

## 🛠 Tech Stack

### Frontend
| Technology | Purpose |
|------------|---------|
| React 18 | UI Framework |
| Vite | Build Tool |
| React Router v6 | Routing |
| Bootstrap 5 | Styling |
| React-Bootstrap | UI Components |
| Axios | HTTP Client |
| Context API | State Management |

### Backend
| Technology | Purpose |
|------------|---------|
| Django 5.0 | Web Framework |
| Django REST Framework | API Development |
| Simple JWT | Authentication |
| MySQL | Database |
| Django CORS Headers | Cross-Origin Requests |

### AI / NLP
| Technology | Purpose |
|------------|---------|
| spaCy | NLP Processing |
| scikit-learn | Machine Learning |
| TF-IDF | Text Vectorization |
| Cosine Similarity | Document Matching |
| PyPDF2 | PDF Parsing |
| python-docx | DOCX Parsing |

---

## 🏗 Architecture

```text
┌─────────────────────────────────────────────────────────────┐
│                     FRONTEND (React + Vite)                 │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐     │
│  │  Login   │  │Dashboard │  │  Upload  │  │  Matches │     │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘     │
└──────────────────────────┬──────────────────────────────────┘
                           │ REST API (Axios + JWT)
                           │
┌──────────────────────────▼──────────────────────────────────┐
│              BACKEND (Django + DRF)                         │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐     │
│  │   Auth   │  │  Resume  │  │   Job    │  │Dashboard │     │
│  │   API    │  │   API    │  │   API    │  │   API    │     │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘     │
│                           │                                 │
│  ┌────────────────────────▼──────────────────────────────┐  │
│  │           NLP ENGINE (spaCy + scikit-learn)           │  │
│  │  • Resume Parser  • ATS Calculator  • Job Matcher     │  │
│  └────────────────────────┬──────────────────────────────┘  │
└───────────────────────────┼─────────────────────────────────┘
                            │
                    ┌───────▼───────┐
                    │     MySQL     │
                    │   Database    │
                    └───────────────┘
---

## 🚀 Installation

### Prerequisites

- Python 3.11 (recommended over 3.12+)
- Node.js 18+ and npm
- MySQL 8.0+
- Git

### Step 1: Clone the Repository

```bash
git clone https://github.com/yourusername/resume-analyzer.git
cd resume-analyzer
```

### Step 2: Setup MySQL Database

```sql
-- Login to MySQL
mysql -u root -p

-- Create database and user
CREATE DATABASE resume_analyzer_db;
CREATE USER 'resume_user'@'localhost' IDENTIFIED BY 'your_strong_password';
GRANT ALL PRIVILEGES ON resume_analyzer_db.* TO 'resume_user'@'localhost';
FLUSH PRIVILEGES;
EXIT;
```

### Step 3: Backend Setup (Django)

```bash
# Navigate to backend
cd backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
# Windows:
venv\Scripts\activate
# Mac/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Download spaCy model
python -m spacy download en_core_web_sm

# Run migrations
python manage.py makemigrations
python manage.py migrate

# Create superuser (for admin panel)
python manage.py createsuperuser

# Seed 150+ jobs (including 55+ fresher jobs)
python seed_jobs.py

# Run the backend server
python manage.py runserver
```

Backend will be running at: **http://localhost:8000**

### Step 4: Frontend Setup (React + Vite)

Open a new terminal:

```bash
# Navigate to frontend
cd frontend

# Install dependencies
npm install

# Run the frontend server
npm run dev
```

Frontend will be running at: **http://localhost:5173**

---

## 💻 Usage

1. **Register a New Account**
   - Navigate to `http://localhost:5173/register`
   - Fill in your details and create an account

2. **Login**
   - Use your credentials at `http://localhost:5173/login`
   - You'll be redirected to the dashboard

3. **Upload Resume**
   - Click **"📄 Upload Resume"** in the navbar
   - Select a PDF or DOCX file (max 10MB)
   - The AI will automatically:
     - Extract skills, education, and experience
     - Calculate ATS score
     - Match with available jobs
     - Show recommendations

4. **View Matches**
   - Navigate to **"Matches"** in the navbar
   - See all job matches with match percentage, ATS score, matched skills, missing skills, and personalized recommendations

5. **Browse Jobs**
   - Click **"Jobs"** in the navbar
   - Search and filter 150+ jobs
   - Click any job card to see full details

6. **Admin Panel**
   - Access `http://localhost:8000/admin`
   - Login with superuser credentials
   - Add, edit, or delete jobs

---

## 🔌 API Endpoints

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register/` | Register new user |
| POST | `/api/auth/login/` | Login and get JWT tokens |

### Resumes
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/resumes/` | List user's resumes |
| POST | `/api/resumes/` | Upload new resume |
| GET | `/api/resumes/{id}/` | Get resume details |
| DELETE | `/api/resumes/{id}/` | Delete resume |
| GET | `/api/resumes/{id}/matches/` | Get job matches for resume |

### Jobs
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/jobs/` | List all active jobs |
| GET | `/api/jobs/{id}/` | Get job details |
| POST | `/api/jobs/` | Create job (admin) |
| PUT | `/api/jobs/{id}/` | Update job (admin) |
| DELETE | `/api/jobs/{id}/` | Delete job (admin) |

### Dashboard
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/dashboard/stats/` | Get dashboard statistics |

### Sample API Response

```json
{
  "total_resumes": 3,
  "average_match_score": 72.5,
  "average_ats_score": 68.3,
  "latest_matches": [
    {
      "id": 1,
      "job_title": "Senior Python Developer",
      "company": "TechStack India",
      "location": "Bangalore, Karnataka",
      "match_score": 85.5,
      "ats_score": 78.2,
      "matched_skills": "python, django, postgresql",
      "missing_skills": "docker, kubernetes",
      "recommendations": "Add Docker and Kubernetes skills to improve match"
    }
  ]
}
```

---

## 📁 Project Structure

```text
resume-analyzer/
│
├── backend/
│   ├── api/
│   │   ├── __init__.py
│   │   ├── admin.py              # Django admin configuration
│   │   ├── models.py             # Database models (Job, Resume, JobMatch)
│   │   ├── serializers.py        # DRF serializers
│   │   ├── views.py              # API views
│   │   ├── urls.py               # API routes
│   │   └── resume_parser.py      # NLP parser & ATS calculator
│   ├── resume_analyzer/
│   │   ├── __init__.py
│   │   ├── settings.py           # Django settings
│   │   ├── urls.py               # Main URL configuration
│   │   └── wsgi.py
│   ├── media/                    # Uploaded resumes
│   ├── seed_jobs.py              # Job seeding script
│   ├── create_sample_data.py     # Initial data setup
│   ├── requirements.txt          # Python dependencies
│   └── manage.py
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Navbar.jsx        # Navigation bar
│   │   │   ├── Login.jsx         # Login page
│   │   │   ├── Register.jsx      # Registration page
│   │   │   ├── Dashboard.jsx     # Main dashboard
│   │   │   ├── ResumeUpload.jsx  # Resume upload
│   │   │   ├── JobList.jsx       # Job listings
│   │   │   └── Matches.jsx       # Job matches
│   │   ├── context/
│   │   │   └── AuthContext.jsx   # Authentication context
│   │   ├── App.jsx               # Main app component
│   │   ├── main.jsx              # Entry point
│   │   └── index.css
│   ├── index.html
│   ├── package.json
│   └── vite.config.js
│
├── screenshots/                  # Project screenshots
├── .gitignore
├── LICENSE
└── README.md
```

---

## 🧠 How It Works

### 1. Resume Parsing Pipeline

```text
Upload Resume (PDF/DOCX)
        │
        ▼
┌───────────────────┐
│  Text Extraction  │  ← PyPDF2 / python-docx
└────────┬──────────┘
         │
         ▼
┌───────────────────┐
│ Skill Extraction  │  ← Regex + Custom Dictionary
└────────┬──────────┘
         │
         ▼
┌───────────────────┐
│ Education Parsing │  ← Keyword Matching
└────────┬──────────┘
         │
         ▼
┌───────────────────┐
│Experience Parsing │  ← Pattern Recognition
└────────┬──────────┘
         │
         ▼
┌───────────────────┐
│   Data Storage    │  → MySQL Database
└───────────────────┘
```

### 2. ATS Score Algorithm

The ATS score (0-100%) is calculated based on:

| Factor | Weight | Description |
|--------|--------|-------------|
| Section Presence | 20% | Education, Experience, Skills, Summary |
| Keyword Matching | 50% | Match with job description |
| Resume Length | 30% | Optimal 400-800 words |
| Formatting Bonus | +10% | Bullet points usage |

### 3. Job Matching Algorithm

```text
Final Score = Skills Score + Text Score + Experience Score

Where:
  Skills Score     = (Matched Skills / Required Skills) × 60
  Text Score       = Cosine Similarity × 30
  Experience Score = Experience Fit × 10
```

**Example Calculation:**

- Job requires: Python, Django, SQL, Docker, AWS
- Resume has: Python, Django, SQL, React
- Matched Skills: 3/5 → **36 points**
- Text Similarity: 0.75 → **22.5 points**
- Experience: 4/3 years → **10 points**
- **Total Match Score: 68.5%**

---

## 🎯 Job Categories

The system includes 150+ jobs across these domains:

| Category | Total Jobs | Fresher Jobs |
|----------|-----------:|-------------:|
| Software Development | 25 | 10 |
| Data Science & AI/ML | 20 | 8 |
| Cybersecurity | 13 | 5 |
| UI/UX Design | 12 | 5 |
| Cloud & DevOps | 13 | 5 |
| Full Stack | 12 | 3 |
| Mobile Development | 12 | 3 |
| Digital Marketing | 12 | 6 |
| HR & Recruitment | 10 | 5 |
| Finance & Accounting | 12 | 6 |
| Business Analyst | 10 | 5 |
| Networking | 10 | 5 |
| Testing/QA | 12 | 5 |

### 📍 Locations Covered (India)

Bangalore, Karnataka · Hyderabad, Telangana · Pune, Maharashtra · Mumbai, Maharashtra · Gurgaon, Haryana · Chennai, Tamil Nadu · Jaipur, Rajasthan · Noida, Uttar Pradesh

---

## 🔒 Environment Variables

Create a `.env` file in the `backend/` directory (and make sure it is listed in `.gitignore` — never commit real credentials):

```env
SECRET_KEY=your-secret-key-here
DEBUG=True
DB_NAME=resume_analyzer_db
DB_USER=resume_user
DB_PASSWORD=your_strong_password
DB_HOST=localhost
DB_PORT=3306
```

---

## 🧪 Testing

### Backend Tests
```bash
cd backend
python manage.py test
```

### Frontend Tests
```bash
cd frontend
npm test
```

### Test API with cURL
```bash
# Register
curl -X POST http://localhost:8000/api/auth/register/ \
  -H "Content-Type: application/json" \
  -d '{"username":"testuser","password":"test123","email":"test@example.com"}'

# Login
curl -X POST http://localhost:8000/api/auth/login/ \
  -H "Content-Type: application/json" \
  -d '{"username":"testuser","password":"test123"}'

# Get Jobs (with token)
curl http://localhost:8000/api/jobs/ \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

---

## 🐛 Troubleshooting

**1. MySQL Connection Error**
```text
Error: Can't connect to MySQL server
```
Solution: Ensure MySQL is running and credentials in `.env` are correct.

**2. spaCy Model Not Found**
```bash
python -m spacy download en_core_web_sm
```

**3. CORS Error in Browser**

Ensure `CORS_ALLOWED_ORIGINS` includes your frontend URL in `settings.py`.

**4. Resume Parsing Returns Empty**
- Ensure the PDF is not scanned/image-based
- Try converting to a text-based PDF or DOCX

**5. Module Not Found**
```bash
# Backend
pip install -r requirements.txt

# Frontend
rm -rf node_modules package-lock.json
npm install
```

---

## 🚧 Future Enhancements

- [ ] LinkedIn profile integration
- [ ] Email notifications for new matches
- [ ] PDF report generation
- [ ] Interview question generator
- [ ] Resume template suggestions
- [ ] Multi-language support
- [ ] Advanced analytics dashboard
- [ ] Resume version comparison
- [ ] Company reviews integration
- [ ] Salary insights

---

## ⭐ Show Your Support

If this project helped you, please give it a ⭐!

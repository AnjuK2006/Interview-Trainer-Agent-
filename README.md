# 🤖 AI Interview Trainer Agent

AI Interview Trainer Agent is an AI-powered interview preparation platform that helps candidates practice interviews, generate role-specific questions, receive AI-based feedback, and simulate real interview experiences using IBM Granite and Retrieval-Augmented Generation (RAG).

## ✨ Features

* 📄 Resume-based interview question generation
* 🎯 Role-specific Technical, HR, Behavioral, and Project questions
* 🤖 AI-powered answer evaluation and scoring
* 💬 Interactive interview simulation mode
* 📚 RAG-based knowledge retrieval for industry-specific guidance
* 📈 Personalized improvement tips and preparation strategies
* 🔍 Resume PDF parsing and keyword extraction


HomeScreen.png


## 🛠️ Tech Stack

### Frontend

* HTML
* CSS
* JavaScript

### Backend

* Node.js
* Express.js

### AI & NLP

* IBM Granite LLM
* IBM watsonx.ai
* Retrieval-Augmented Generation (RAG)

### Libraries

* axios
* multer
* pdf-parse
* cors
* dotenv

## ⚡ Installation

### Clone Repository

```bash
git clone https://github.com/yourusername/Interview-Trainer-Agent.git
cd Interview-Trainer-Agent
```

### Install Dependencies

```bash
npm install
```

### Configure Environment Variables

Create a `.env` file:

```env
IBM_API_KEY=your_ibm_api_key
IBM_PROJECT_ID=your_project_id
```

### Run Application

```bash
node server.js
```

Open:

```text
http://localhost:5000
```

## 🚀 Usage

1. Enter candidate details and target role.
2. Upload a resume (optional).
3. Generate interview questions.
4. Answer questions and receive AI feedback.
5. Start Interview Simulation Mode.
6. Practice Technical, HR, Behavioral, and Project-based interviews.
7. Review improvement suggestions and preparation strategies.

## 📂 Project Structure

```text
Interview-Trainer-Agent/
├── rag/
│   ├── retriever.js
│   ├── contextBuilder.js
│   ├── resumeParser.js
│   └── knowledge.json
│
├── uploads/
├── index.html
├── script.js
├── style.css
├── server.js
├── package.json
├── package-lock.json
├── knowledge.json
└── .env
```

## 🔮 Future Enhancements

* Voice-based interview simulation
* Multi-round interview support
* Company-specific interview preparation
* Performance analytics dashboard
* Authentication and user profiles
* Cloud deployment

## 📄 License

MIT License

## 👨‍💻 Author

Anju K

Computer Science Engineering Student

Focused on Web Development, UI/UX Design, and AI-powered applications.


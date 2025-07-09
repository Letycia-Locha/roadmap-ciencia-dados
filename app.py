from flask import Flask, render_template, request, redirect, url_for, session, jsonify
import markdown
from pathlib import Path
import os
import json

app = Flask(__name__)
app.secret_key = os.environ.get('SECRET_KEY', 'dev_secret_key')

DATA_FILE = Path(__file__).parent / 'progress_data.json'

README_PATH = Path(__file__).parent / 'README.md'

# Simple JSON based storage for user progress
def load_data():
    if DATA_FILE.exists():
        with open(DATA_FILE, 'r', encoding='utf-8') as f:
            try:
                return json.load(f)
            except json.JSONDecodeError:
                return {}
    return {}


def save_data(data):
    with open(DATA_FILE, 'w', encoding='utf-8') as f:
        json.dump(data, f)

# Convert README markdown to HTML once at startup
def load_readme():
    try:
        text = README_PATH.read_text(encoding='utf-8')
        html = markdown.markdown(
            text,
            extensions=['fenced_code', 'tables']
        )
        return html
    except Exception as e:
        # Log the error (Vercel will capture stdout/stderr for logs)
        print(f"Error loading or parsing README.md: {e}")
        # Return a fallback HTML or raise the exception
        # For now, let's return a simple error message to be displayed on the page
        return "<p>Error loading content. Please check the server logs.</p>"

README_HTML = load_readme()

@app.route('/')
def index():
    username = session.get('username')
    return render_template('index.html', content=README_HTML, username=username)


@app.route('/login', methods=['GET', 'POST'])
def login():
    if request.method == 'POST':
        username = request.form.get('username', '').strip()
        if username:
            session['username'] = username
            data = load_data()
            if username not in data:
                data[username] = []
                save_data(data)
            return redirect(url_for('index'))
    return render_template('login.html')


@app.route('/logout')
def logout():
    session.pop('username', None)
    return redirect(url_for('login'))


@app.route('/progress', methods=['GET', 'POST'])
def progress():
    username = session.get('username')
    if not username:
        return jsonify({'error': 'Unauthorized'}), 401

    data = load_data()

    if request.method == 'POST':
        payload = request.get_json(silent=True) or {}
        progress = payload.get('progress', [])
        data[username] = progress
        save_data(data)
        return jsonify({'status': 'ok'})

    return jsonify({'progress': data.get(username, [])})

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port, debug=True)

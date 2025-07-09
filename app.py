from flask import Flask, render_template
import markdown
from pathlib import Path

app = Flask(__name__)

README_PATH = Path(__file__).parent / 'README.md'

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
    return render_template('index.html', content=README_HTML)

if __name__ == '__main__':
    app.run(debug=True)

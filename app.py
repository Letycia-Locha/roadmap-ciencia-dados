from flask import Flask, render_template
import markdown
from pathlib import Path

app = Flask(__name__)

README_PATH = Path(__file__).parent / 'README.md'

# Convert README markdown to HTML once at startup
def load_readme():
    text = README_PATH.read_text(encoding='utf-8')
    html = markdown.markdown(
        text,
        extensions=['fenced_code', 'tables']
    )
    return html

README_HTML = load_readme()

@app.route('/')
def index():
    return render_template('index.html', content=README_HTML)

if __name__ == '__main__':
    app.run(debug=True)

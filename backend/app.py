from flask import Flask, request
from sqlalchemy import insert
from db import db
from models.notes import Note
import os
from flask_cors import CORS

app = Flask(__name__)
CORS(app, origins=["http://localhost:5173", "http://127.0.0.1:5173"])

# DB Connection
app.config["SQLALCHEMY_DATABASE_URI"] = os.environ.get("DB_URI")
db.init_app(app)

with app.app_context():
    db.create_all()


# Helper Functions
def handle_note_submission(title, content):
    new_note = Note(title=title, content=content)
    db.session.add(new_note)
    db.session.commit()
    return {"id": new_note.id, "message": "Note successfully created"}


# Routes
@app.route("/notes", methods=["GET", "POST"])
def notes():
    if request.method == "POST":
        data = request.get_json()
        title = data.get("title")
        content = data.get("content")
        print(title, content)
        return handle_note_submission(title, content)
    else:
        pass


if __name__ == "__main__":
    app.run(debug=True)

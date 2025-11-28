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
# POST request handler for notes
def handle_note_submission(title, content):
    new_note = Note(title=title, content=content)
    db.session.add(new_note)
    db.session.commit()
    return {"id": new_note.id, "message": "Note successfully created"}


# GET request handler for notes
def get_notes():
    notes = db.session.execute(db.select(Note)).scalars().all()
    return [
        {
            "id": note.id,
            "title": note.title,
            "content": note.content,
        }
        for note in notes
    ]


# Get a specific note via ID
def get_note_by_id(id):
    note = db.session.execute(db.select(Note).filter_by(id=id)).scalars().one_or_none()
    return note


# Handles updating the note
def handle_note_edit(id, updates):
    updated_note = get_note_by_id(id)

    if updated_note is None:
        return {"error": "Note not found"}, 404

    if "title" in updates:
        updated_note.title = updates["title"]
    if "content" in updates:
        updated_note.content = updates["content"]
    db.session.commit()

    return {
        "id": updated_note.id,
        "title": updated_note.title,
        "content": updated_note.content,
    }


# Handle deletion of note
def handle_delete_note(id):
    note_to_delete = get_note_by_id(id)
    if note_to_delete is None:
        return {"error": "Note not found"}, 404
    db.session.delete(note_to_delete)
    db.session.commit()
    return {"message": "Note has been deleted successfully"}, 200


# API Routes
@app.route("/notes", methods=["GET", "POST"])
def notes():
    if request.method == "POST":
        data = request.get_json()
        title = data.get("title")
        content = data.get("content")
        print(title, content)
        return handle_note_submission(title, content)
    else:
        return get_notes()


@app.route("/notes/<int:id>", methods=["PATCH", "DELETE"])
def edit_notes(id):
    if request.method == "PATCH":
        updates = {}
        data = request.get_json()
        title = data.get("title")
        content = data.get("content")
        if title is not None:
            updates["title"] = title
        if content is not None:
            updates["content"] = content
        return handle_note_edit(id, updates)
    else:
        return handle_delete_note(id)


if __name__ == "__main__":
    app.run(debug=True)

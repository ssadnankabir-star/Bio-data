# Sadnan Kabir — Premium Biodata Portfolio

This package preserves the original `biodata.html` design as the public `index.html` and adds a Firebase-authenticated admin CMS.

## Setup

1. Create a Firebase project.
2. Enable Authentication → Email/Password.
3. Create the admin user with `ssadnankabir@gmail.com` and the password you chose. The password is never stored in this repository.
4. Create Firestore Database.
5. Register a Firebase Web App.
6. Copy its public Web App configuration into `config/firebase-config.js`.
7. Apply `firestore.rules`.
8. Upload the whole folder to a GitHub repository and enable GitHub Pages.
9. Open `/admin.html`, sign in, edit, and press **Save / Publish**.

## Important security note

A static GitHub Pages site cannot securely implement a secret password by itself. Firebase Authentication is therefore required for real password protection. Do not put the password in HTML, JavaScript, or Git.

## Editing

- Double-click text in the preview to edit.
- Select a card/section and use Remove.
- Add Field / Add Section are available.
- Replace image supports local preview/data embedding.
- Undo/Redo, local draft, JSON backup/restore, and cloud publishing are included.

## Public fallback

If Firebase is not configured or unavailable, the bundled original biodata remains visible. The public page can load the published Firestore HTML when Firebase is configured.

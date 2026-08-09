# Sadnan Kabir — Personal Profile

This project is the updated personal-profile version of the existing site. It preserves the original emerald, gold, and cream visual identity, card language, borders, shadows, spacing, profile-image treatment, responsive behavior, and Firebase-based editor while updating the presentation into a neutral personal profile.

## Public profile

The public `index.html` includes:

- Personal profile hero
- Personal information
- About Me
- Education
- Professional Life
- Skills & Tools
- Family
- Interests & Lifestyle
- Favourite Books
- Gallery
- Social Links
- Contact information
- Print, share, and copy-link tools
- SEO metadata, Open Graph, Twitter metadata, canonical URL, JSON-LD, sitemap, robots, and web manifest

The Gallery starts with the existing profile image. In the admin editor, duplicate the gallery card and replace its image to add more photos without using placeholders.

## Firebase setup

1. Create or open your Firebase project.
2. Enable Authentication > Email/Password.
3. Create the administrator account for `ssadnankabir@gmail.com` using a password stored only in Firebase Authentication.
4. Create a Firestore database and enable Firebase Storage.
5. Register a Firebase Web App.
6. Paste the Firebase Web App configuration into `config/firebase-config.js`.
7. Deploy `firestore.rules` and `storage.rules`.
8. Upload this folder to the GitHub repository used by GitHub Pages.
9. Open `/admin.html`, sign in, edit the profile, then click **Save** or **Publish to public page**.

No administrator password is stored in the repository.

## Admin editor

The editor supports:

- Firebase login, logout, persistent session, password reset
- Inline text editing
- Add section and add field
- Delete selected content
- Duplicate selected content
- Move selected content up or down
- Hide or show selected content
- Replace images with optimized WebP uploads to Firebase Storage
- Undo and redo
- Local draft backup
- JSON import and export
- Cloud publish to `publicContent/profile`
- Keyboard shortcuts: Ctrl/Cmd+S, Ctrl/Cmd+Z, Ctrl/Cmd+Shift+Z

For links, double-click a link inside the admin preview to update its destination URL.

## GitHub Pages URL

The project keeps the requested public URL structure:

`https://ssadnankabir-star.github.io/Bio-data/index.html`
